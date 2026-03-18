export interface DrugInfo {
  rxcui: string;
  name: string;
  drug_class: string | null;
  dosage_forms: string[];
}

export interface DrugLabel {
  indications: string | null;
  contraindications: string | null;
  warnings: string | null;
  adverse_reactions: string | null;
  dosage_administration: string | null;
}

export interface PatientInfo {
  title: string | null;
  url: string | null;
  snippet: string | null;
}

export interface MedicationRecommendation {
  drug: DrugInfo;
  label: DrugLabel | null;
  patient_info: PatientInfo | null;
}

export interface MedicationResponse {
  query: string;
  disease: string;
  medications: MedicationRecommendation[];
  disclaimer: string;
  sources: Array<{ name: string; url: string; description: string }>;
}

export interface SymptomSuggestion {
  name: string;
  class_id: string;
  class_type: string;
}

export interface SymptomSearchResponse {
  query: string;
  suggestions: SymptomSuggestion[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/server";

export async function searchSymptoms(
  query: string,
): Promise<SymptomSearchResponse> {
  const res = await fetch(
    `${API_BASE}/symptoms/search?q=${encodeURIComponent(query)}`,
  );
  if (!res.ok) {
    throw new Error(`Symptom search failed: ${res.status}`);
  }
  return res.json();
}

export async function searchMedications(
  disease: string,
  limit = 5,
): Promise<MedicationResponse> {
  const res = await fetch(
    `${API_BASE}/medications/search?disease=${encodeURIComponent(disease)}&limit=${limit}`,
  );
  if (!res.ok) {
    throw new Error(`Medication search failed: ${res.status}`);
  }
  return res.json();
}
