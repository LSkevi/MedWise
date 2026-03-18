from fastapi import APIRouter, Query

from models.symptom import SymptomSearchResponse, SymptomSuggestion
from services.rxclass_service import search_diseases

router = APIRouter()


@router.get("/search", response_model=SymptomSearchResponse)
async def search_symptoms(
    q: str = Query(..., min_length=2, description="Disease or symptom to search for"),
):
    """Search for diseases and conditions by name."""
    results = await search_diseases(q)
    suggestions = [
        SymptomSuggestion(
            name=r["className"],
            class_id=r["classId"],
            class_type=r["classType"],
        )
        for r in results
    ]
    return SymptomSearchResponse(query=q, suggestions=suggestions)
