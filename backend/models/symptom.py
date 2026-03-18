from pydantic import BaseModel


class SymptomSuggestion(BaseModel):
    name: str
    class_id: str
    class_type: str


class SymptomSearchResponse(BaseModel):
    query: str
    suggestions: list[SymptomSuggestion]
