import httpx

RXCLASS_BASE = "https://rxnav.nlm.nih.gov/REST/rxclass"


async def search_diseases(query: str) -> list[dict]:
    """Search for diseases/conditions in RxClass."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            f"{RXCLASS_BASE}/class/byName.json",
            params={"className": query, "classTypes": "DISEASE"},
        )
        if response.status_code != 200:
            return []

        data = response.json()
        class_list = (
            data.get("rxclassMinConceptList", {}).get("rxclassMinConcept", [])
        )
        return [
            {
                "classId": c.get("classId", ""),
                "className": c.get("className", ""),
                "classType": c.get("classType", ""),
            }
            for c in class_list
        ]


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
