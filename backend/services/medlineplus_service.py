import httpx

MEDLINEPLUS_BASE = "https://wsearch.nlm.nih.gov/ws/query"


async def get_health_info(query: str) -> dict | None:
    """Get patient-friendly health information from MedlinePlus."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            MEDLINEPLUS_BASE,
            params={
                "db": "healthTopics",
                "term": query,
                "retmax": 1,
            },
        )
        if response.status_code != 200:
            return None

        text = response.text

        title = _extract_xml_value(text, "content", "title")
        url = _extract_xml_attr(text, "document", "url")
        snippet = _extract_xml_value(text, "content", "FullSummary")

        if not title and not url:
            return None

        if snippet and len(snippet) > 500:
            snippet = snippet[:500] + "..."

        return {
            "title": title,
            "url": url,
            "snippet": snippet,
        }


def _extract_xml_value(xml: str, tag: str, name: str) -> str | None:
    """Extract a value from simple XML by tag and name attribute."""
    search = f'name="{name}"'
    idx = xml.find(search)
    if idx == -1:
        return None
    start = xml.find(">", idx)
    if start == -1:
        return None
    end = xml.find(f"</{tag}>", start)
    if end == -1:
        return None
    value = xml[start + 1 : end].strip()
    return value if value else None


def _extract_xml_attr(xml: str, tag: str, attr: str) -> str | None:
    """Extract an attribute value from the first occurrence of a tag."""
    tag_start = xml.find(f"<{tag} ")
    if tag_start == -1:
        return None
    attr_search = f'{attr}="'
    attr_idx = xml.find(attr_search, tag_start)
    if attr_idx == -1:
        return None
    value_start = attr_idx + len(attr_search)
    value_end = xml.find('"', value_start)
    if value_end == -1:
        return None
    return xml[value_start:value_end]
