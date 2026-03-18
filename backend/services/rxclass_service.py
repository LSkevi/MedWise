import httpx

RXCLASS_BASE = "https://rxnav.nlm.nih.gov/REST/rxclass"

# In-memory cache for disease list
_disease_cache: list[dict] = []


async def preload_disease_cache() -> None:
    """Preload the disease cache at startup."""
    global _disease_cache
    print("Loading disease cache from RxClass...")
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get(
            f"{RXCLASS_BASE}/allClasses.json",
            params={"classTypes": "DISEASE"},
        )
        if response.status_code != 200:
            print(f"Failed to load disease cache: {response.status_code}")
            return

        data = response.json()
        class_list = (
            data.get("rxclassMinConceptList", {}).get("rxclassMinConcept", [])
        )
        _disease_cache = [
            {
                "classId": c.get("classId", ""),
                "className": c.get("className", ""),
                "classType": c.get("classType", ""),
            }
            for c in class_list
        ]
        print(f"Loaded {len(_disease_cache)} diseases into cache")


async def search_diseases(query: str) -> list[dict]:
    """Search for diseases/conditions with partial matching."""
    if not _disease_cache:
        await preload_disease_cache()
    diseases = _disease_cache
    query_lower = query.lower()

    # Exact match first
    exact = [d for d in diseases if d["className"].lower() == query_lower]
    if exact:
        return exact

    # Starts-with match
    starts_with = [
        d for d in diseases if d["className"].lower().startswith(query_lower)
    ]

    # Contains match
    contains = [
        d
        for d in diseases
        if query_lower in d["className"].lower()
        and d not in starts_with
    ]

    results = starts_with + contains
    return results[:15]


async def get_drugs_for_disease(class_id: str) -> list[dict]:
    """Get drugs indicated for a disease using MED-RT may_treat relationship."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            f"{RXCLASS_BASE}/classMembers.json",
            params={
                "classId": class_id,
                "relaSource": "MEDRT",
                "rela": "may_treat",
            },
        )
        if response.status_code != 200:
            return []

        data = response.json()
        members = (
            data.get("drugMemberGroup", {}).get("drugMember", [])
        )

        seen_rxcuis: set[str] = set()
        drugs: list[dict] = []
        for member in members:
            node = member.get("minConcept", {})
            rxcui = node.get("rxcui", "")
            if rxcui and rxcui not in seen_rxcuis:
                seen_rxcuis.add(rxcui)
                drugs.append({
                    "rxcui": rxcui,
                    "name": node.get("name", ""),
                    "tty": node.get("tty", ""),
                })

        return drugs[:20]
