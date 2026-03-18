from pydantic import BaseModel


class DrugInfo(BaseModel):
    rxcui: str
    name: str
    drug_class: str | None = None
    dosage_forms: list[str] = []


class DrugLabel(BaseModel):
    indications: str | None = None
    contraindications: str | None = None
    warnings: str | None = None
    adverse_reactions: str | None = None
    dosage_administration: str | None = None


class PatientInfo(BaseModel):
    title: str | None = None
    url: str | None = None
    snippet: str | None = None


class MedicationRecommendation(BaseModel):
    drug: DrugInfo
    label: DrugLabel | None = None
    patient_info: PatientInfo | None = None


class MedicationResponse(BaseModel):
    query: str
    disease: str
    medications: list[MedicationRecommendation]
    disclaimer: str = (
        "This information is for educational purposes only and is NOT medical advice. "
        "Always consult a qualified healthcare professional before taking any medication."
    )
    sources: list[dict[str, str]] = []
