import httpx

RXNORM_BASE = "https://rxnav.nlm.nih.gov/REST"


async def get_drug_details(rxcui: str) -> dict:
    """Get detailed drug information from RxNorm."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            f"{RXNORM_BASE}/rxcui/{rxcui}/allProperties.json",
            params={"prop": "names+attributes"},
        )
        if response.status_code != 200:
            return {}

        data = response.json()
        props = data.get("propConceptGroup", {}).get("propConcept", [])

        result: dict[str, str | list[str]] = {"rxcui": rxcui}
        dosage_forms: list[str] = []

        for prop in props:
            prop_name = prop.get("propName", "")
            prop_value = prop.get("propValue", "")

            if prop_name == "RxNorm Name":
                result["name"] = prop_value
            elif prop_name == "DOSE_FORM":
                dosage_forms.append(prop_value)

        result["dosage_forms"] = dosage_forms
        return result


async def get_drug_class(rxcui: str) -> str | None:
    """Get the drug class for a given RxCUI."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            f"https://rxnav.nlm.nih.gov/REST/rxclass/class/byRxcui.json",
            params={"rxcui": rxcui, "relaSource": "ATC"},
        )
        if response.status_code != 200:
            return None

        data = response.json()
        concepts = (
            data.get("rxclassMinConceptList", {}).get("rxclassMinConcept", [])
        )
        if concepts:
            return concepts[0].get("className")
        return None


async def suggest_spelling(query: str) -> list[dict]:
    """Get spelling suggestions for drug/disease names."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            f"{RXNORM_BASE}/spellingsuggestions.json",
            params={"name": query},
        )
        if response.status_code != 200:
            return []

        data = response.json()
        suggestions = (
            data.get("suggestionGroup", {}).get("suggestionList", {}).get("suggestion", [])
        )
        return [{"name": s} for s in suggestions[:10]]
