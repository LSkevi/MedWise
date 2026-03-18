import re

import httpx

OPENFDA_BASE = "https://api.fda.gov/drug/label.json"

SALT_SUFFIXES = re.compile(
    r"\s+(hydrochloride|sodium|potassium|sulfate|phosphate|"
    r"acetate|besylate|fumarate|maleate|tartrate|mesylate|"
    r"citrate|succinate|bromide|chloride|calcium|disodium|"
    r"dihydrate|monohydrate|hcl)$",
    re.IGNORECASE,
)


def _truncate(text: str | None, max_length: int = 1500) -> str | None:
    """Truncate text to a reasonable length for API responses."""
    if not text:
        return None
    if len(text) <= max_length:
        return text
    return text[:max_length] + "..."


def _normalize_drug_name(name: str) -> str:
    """Strip common salt suffixes from drug names."""
    return SALT_SUFFIXES.sub("", name).strip()


async def get_drug_label(drug_name: str) -> dict | None:
    """Get FDA drug labeling information (indications, warnings, side effects)."""
    names_to_try = [drug_name]
    normalized = _normalize_drug_name(drug_name)
    if normalized.lower() != drug_name.lower():
        names_to_try.append(normalized)

    async with httpx.AsyncClient(timeout=15.0) as client:
        for name in names_to_try:
            # Search across generic_name and brand_name
            search_query = (
                f'openfda.generic_name:"{name}"+openfda.brand_name:"{name}"'
            )
            response = await client.get(
                OPENFDA_BASE,
                params={"search": search_query, "limit": 1},
            )
            if response.status_code != 200:
                continue

            data = response.json()
            results = data.get("results", [])
            if not results:
                continue

            label = results[0]

            def first_item(field: str) -> str | None:
                items = label.get(field, [])
                return items[0] if items else None

            return {
                "indications": _truncate(first_item("indications_and_usage")),
                "contraindications": _truncate(first_item("contraindications")),
                "warnings": _truncate(first_item("warnings")),
                "adverse_reactions": _truncate(first_item("adverse_reactions")),
                "dosage_administration": _truncate(
                    first_item("dosage_and_administration")
                ),
            }

    return None
