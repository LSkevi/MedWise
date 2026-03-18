import asyncio

from fastapi import APIRouter, Query

from models.medication import (
    DrugInfo,
    DrugLabel,
    MedicationRecommendation,
    MedicationResponse,
    PatientInfo,
)
from services.rxclass_service import get_drugs_for_disease, search_diseases
from services.rxnorm_service import get_drug_class
from services.openfda_service import get_drug_label
from services.medlineplus_service import get_health_info

router = APIRouter()

SOURCES = [
    {
        "name": "RxClass (NIH/NLM)",
        "url": "https://rxnav.nlm.nih.gov/RxClassIntro.html",
        "description": "Disease-to-drug indication mapping via MED-RT",
    },
    {
        "name": "OpenFDA",
        "url": "https://open.fda.gov/apis/drug/label/",
        "description": "FDA drug labeling — indications, warnings, side effects",
    },
    {
        "name": "RxNorm (NIH/NLM)",
        "url": "https://www.nlm.nih.gov/research/umls/rxnorm/index.html",
        "description": "Standardized drug names and classifications",
    },
    {
        "name": "MedlinePlus (NLM)",
        "url": "https://medlineplus.gov/",
        "description": "Patient-friendly health information",
    },
]


async def _enrich_drug(drug: dict) -> MedicationRecommendation:
    """Enrich a drug with label info, class, and patient info in parallel."""
    drug_name = drug.get("name", "")

    label_result, drug_class, patient_result = await asyncio.gather(
        get_drug_label(drug_name),
        get_drug_class(drug.get("rxcui", "")),
        get_health_info(drug_name),
        return_exceptions=True,
    )

    label = None
    if isinstance(label_result, dict):
        label = DrugLabel(**label_result)

    patient_info = None
    if isinstance(patient_result, dict):
        patient_info = PatientInfo(**patient_result)

    resolved_class = drug_class if isinstance(drug_class, str) else None

    return MedicationRecommendation(
        drug=DrugInfo(
            rxcui=drug.get("rxcui", ""),
            name=drug_name,
            drug_class=resolved_class,
            dosage_forms=[],
        ),
        label=label,
        patient_info=patient_info,
    )


@router.get("/search", response_model=MedicationResponse)
async def search_medications(
    disease: str = Query(
        ..., min_length=2, description="Disease or condition name"
    ),
    limit: int = Query(default=5, ge=1, le=20, description="Max results"),
):
    """Search for medications indicated for a disease or condition."""
    diseases = await search_diseases(disease)
    if not diseases:
        return MedicationResponse(
            query=disease,
            disease=disease,
            medications=[],
            sources=SOURCES,
        )

    target_disease = diseases[0]
    drugs = await get_drugs_for_disease(target_disease["classId"])
    drugs = drugs[:limit]

    if not drugs:
        return MedicationResponse(
            query=disease,
            disease=target_disease["className"],
            medications=[],
            sources=SOURCES,
        )

    enriched = await asyncio.gather(
        *[_enrich_drug(drug) for drug in drugs],
        return_exceptions=True,
    )

    medications = [m for m in enriched if isinstance(m, MedicationRecommendation)]

    return MedicationResponse(
        query=disease,
        disease=target_disease["className"],
        medications=medications,
        sources=SOURCES,
    )
