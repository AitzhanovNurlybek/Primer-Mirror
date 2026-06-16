"""Parse a raw Kaspi product (title/price/image/url) into a structured catalog item."""
import re

SIZE_RE = re.compile(r"(\d+(?:[.,]\d+)?)\s*[xхX×]\s*(\d+(?:[.,]\d+)?)")
TYPE_WORDS = ["умное", "настенное", "напольное", "настольное", "зеркало", "см"]


def parse_product(raw: dict) -> dict | None:
    """Turn {title, price, image, url} into the CatalogItem field dict.

    Returns None if the entry is unusable (no size or no link)."""
    title = (raw.get("title") or "").strip()
    url = (raw.get("url") or "").strip()
    image = (raw.get("image") or "").strip()
    price = raw.get("price")

    if not title or not url or "/shop/p/" not in url:
        return None

    low = title.lower()
    is_smart = "умное" in low
    is_led = is_smart or "led" in low or "подсвет" in low

    m = SIZE_RE.search(title)
    if not m:
        return None
    width_cm = round(float(m.group(1).replace(",", ".")))
    height_cm = round(float(m.group(2).replace(",", ".")))

    # Clean brand/model: strip the size and the generic type words
    name = SIZE_RE.sub(" ", title)
    for word in TYPE_WORDS:
        name = re.sub(word, " ", name, flags=re.IGNORECASE)
    name = re.sub(r",+", " ", name)
    brand = re.sub(r"\s+", " ", name).strip(" ,-") or None

    display = brand or "Зеркало"

    return {
        "name": display,
        "brand": brand,
        "width_cm": width_cm,
        "height_cm": height_cm,
        "is_smart": is_smart,
        "is_led": is_led,
        "price": float(price) if price else 0.0,
        "image": image,
        "kaspi_url": url,
    }
