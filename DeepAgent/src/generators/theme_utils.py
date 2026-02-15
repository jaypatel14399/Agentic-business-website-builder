"""Design theme presets, premium theme selection, and image URL resolution for generated websites."""

import hashlib
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# 5 premium theme template IDs (match folders under generators/themes/)
PREMIUM_THEME_IDS: List[str] = ["aurora", "midnight", "horizon", "mono", "gradient"]


def select_theme(generation_seed: Optional[str] = None, business_name: str = "") -> str:
    """
    Select one of the 5 premium themes deterministically by seed.
    Use when generating a website so each site gets a consistent theme.
    """
    seed_str = (generation_seed or "") + (business_name or "")
    seed = hashlib.md5(seed_str.encode()).hexdigest()
    idx = int(seed[:8], 16) % len(PREMIUM_THEME_IDS)
    return PREMIUM_THEME_IDS[idx]


def get_theme_css_variables(theme_id: str) -> Dict[str, Dict[str, str]]:
    """
    Return CSS variable values for :root (light) and .dark for the given theme.
    Used by globals.css.j2 to inject theme variables.
    """
    # Maps theme_id -> light/dark CSS vars (--theme-*)
    vars_by_theme = {
        "aurora": {
            "light": {
                "primary": "rgb(49 46 129)",
                "secondary": "rgb(67 56 202)",
                "accent": "rgb(99 102 241)",
                "background": "rgb(255 255 255)",
                "backgroundAlt": "rgb(248 250 252)",
                "text": "rgb(15 23 42)",
                "textMuted": "rgb(100 116 139)",
                "border": "rgb(226 232 240)",
                "gradientFrom": "rgb(79 70 229)",
                "gradientTo": "rgb(99 102 241)",
                "maxWidth": "72rem",
                "sectionPaddingX": "1.5rem",
                "sectionPaddingY": "5rem",
                "borderRadius": "1rem",
                "onPrimary": "rgb(255 255 255)",
            },
            "dark": {
                "primary": "rgb(165 180 252)",
                "secondary": "rgb(129 140 248)",
                "accent": "rgb(129 140 248)",
                "background": "rgb(15 23 42)",
                "backgroundAlt": "rgb(30 41 59)",
                "text": "rgb(248 250 252)",
                "textMuted": "rgb(148 163 184)",
                "border": "rgb(51 65 85)",
                "gradientFrom": "rgb(129 140 248)",
                "gradientTo": "rgb(165 180 252)",
                "onPrimary": "rgb(15 23 42)",
            },
        },
        "midnight": {
            "light": {
                "primary": "rgb(139 92 246)",
                "secondary": "rgb(124 58 237)",
                "accent": "rgb(167 139 250)",
                "background": "rgb(15 23 42)",
                "backgroundAlt": "rgb(30 41 59)",
                "text": "rgb(248 250 252)",
                "textMuted": "rgb(148 163 184)",
                "border": "rgba(148 163 184 / 0.2)",
                "gradientFrom": "rgb(79 70 229)",
                "gradientTo": "rgb(139 92 246)",
                "maxWidth": "72rem",
                "sectionPaddingX": "1.5rem",
                "sectionPaddingY": "5rem",
                "borderRadius": "1.25rem",
                "onPrimary": "rgb(255 255 255)",
            },
            "dark": {},
        },
        "horizon": {
            "light": {
                "primary": "rgb(41 37 36)",
                "secondary": "rgb(68 64 60)",
                "accent": "rgb(120 113 108)",
                "background": "rgb(245 245 244)",
                "backgroundAlt": "rgb(255 255 255)",
                "text": "rgb(28 25 23)",
                "textMuted": "rgb(87 83 78)",
                "border": "rgb(214 211 209)",
                "gradientFrom": "rgb(41 37 36)",
                "gradientTo": "rgb(68 64 60)",
                "maxWidth": "80rem",
                "sectionPaddingX": "2rem",
                "sectionPaddingY": "6rem",
                "borderRadius": "0.5rem",
                "onPrimary": "rgb(255 255 255)",
            },
            "dark": {
                "primary": "rgb(250 250 249)",
                "secondary": "rgb(231 229 228)",
                "accent": "rgb(168 162 158)",
                "background": "rgb(28 25 23)",
                "backgroundAlt": "rgb(41 37 36)",
                "text": "rgb(250 250 249)",
                "textMuted": "rgb(168 162 158)",
                "border": "rgb(64 61 59)",
                "gradientFrom": "rgb(250 250 249)",
                "gradientTo": "rgb(214 211 209)",
                "onPrimary": "rgb(28 25 23)",
            },
        },
        "mono": {
            "light": {
                "primary": "rgb(0 0 0)",
                "secondary": "rgb(38 38 38)",
                "accent": "rgb(115 115 115)",
                "background": "rgb(255 255 255)",
                "backgroundAlt": "rgb(250 250 250)",
                "text": "rgb(0 0 0)",
                "textMuted": "rgb(82 82 82)",
                "border": "rgb(229 229 229)",
                "gradientFrom": "rgb(0 0 0)",
                "gradientTo": "rgb(64 64 64)",
                "maxWidth": "64rem",
                "sectionPaddingX": "2rem",
                "sectionPaddingY": "6rem",
                "borderRadius": "0",
                "onPrimary": "rgb(255 255 255)",
            },
            "dark": {
                "primary": "rgb(255 255 255)",
                "secondary": "rgb(245 245 245)",
                "accent": "rgb(163 163 163)",
                "background": "rgb(0 0 0)",
                "backgroundAlt": "rgb(10 10 10)",
                "text": "rgb(255 255 255)",
                "textMuted": "rgb(163 163 163)",
                "border": "rgb(38 38 38)",
                "gradientFrom": "rgb(255 255 255)",
                "gradientTo": "rgb(212 212 212)",
                "onPrimary": "rgb(0 0 0)",
            },
        },
        "gradient": {
            "light": {
                "primary": "rgb(99 102 241)",
                "secondary": "rgb(139 92 246)",
                "accent": "rgb(236 72 153)",
                "background": "rgb(250 250 252)",
                "backgroundAlt": "rgb(255 255 255)",
                "text": "rgb(30 27 75)",
                "textMuted": "rgb(100 100 120)",
                "border": "rgb(230 230 240)",
                "gradientFrom": "rgb(99 102 241)",
                "gradientTo": "rgb(236 72 153)",
                "maxWidth": "72rem",
                "sectionPaddingX": "1.5rem",
                "sectionPaddingY": "5rem",
                "borderRadius": "1.5rem",
                "onPrimary": "rgb(255 255 255)",
            },
            "dark": {
                "primary": "rgb(165 180 252)",
                "secondary": "rgb(196 181 253)",
                "accent": "rgb(251 207 232)",
                "background": "rgb(15 15 25)",
                "backgroundAlt": "rgb(30 27 75)",
                "text": "rgb(250 250 255)",
                "textMuted": "rgb(180 180 200)",
                "border": "rgb(60 60 90)",
                "gradientFrom": "rgb(99 102 241)",
                "gradientTo": "rgb(236 72 153)",
                "onPrimary": "rgb(15 15 25)",
            },
        },
    }
    return vars_by_theme.get(theme_id, vars_by_theme["aurora"])

# Exactly 5 premium Apple-style themes. Each site gets one at random (by generation_seed).
# All use Apple-style fonts (Inter / system), gradient-friendly colors, full-page layout.
PREMIUM_APPLE_PRESETS = [
    {
        "theme_name": "Apple Light",
        "color_palette": {
            "primary": "#1d1d1f",
            "secondary": "#424245",
            "accent": "#0071e3",
            "background": "#ffffff",
            "text": "#1d1d1f",
            "text_muted": "#86868b",
            "gradient_from": "#1d1d1f",
            "gradient_to": "#424245",
        },
        "font_heading": "Inter",
        "font_body": "Inter",
        "layout_style": "hero-centered",
    },
    {
        "theme_name": "Apple Blue",
        "color_palette": {
            "primary": "#0071e3",
            "secondary": "#0077ed",
            "accent": "#00c7be",
            "background": "#f5f5f7",
            "text": "#1d1d1f",
            "text_muted": "#6e6e73",
            "gradient_from": "#0071e3",
            "gradient_to": "#00c7be",
        },
        "font_heading": "Inter",
        "font_body": "Inter",
        "layout_style": "hero-split",
    },
    {
        "theme_name": "Apple Dark",
        "color_palette": {
            "primary": "#f5f5f7",
            "secondary": "#d2d2d7",
            "accent": "#0a84ff",
            "background": "#000000",
            "text": "#f5f5f7",
            "text_muted": "#86868b",
            "gradient_from": "#f5f5f7",
            "gradient_to": "#0a84ff",
        },
        "font_heading": "Inter",
        "font_body": "Inter",
        "layout_style": "hero-full-image",
    },
    {
        "theme_name": "Apple Warm",
        "color_palette": {
            "primary": "#bf4800",
            "secondary": "#d97706",
            "accent": "#0071e3",
            "background": "#fafafa",
            "text": "#1d1d1f",
            "text_muted": "#6e6e73",
            "gradient_from": "#bf4800",
            "gradient_to": "#d97706",
        },
        "font_heading": "Inter",
        "font_body": "Inter",
        "layout_style": "hero-centered",
    },
    {
        "theme_name": "Apple Green",
        "color_palette": {
            "primary": "#248a3d",
            "secondary": "#30d158",
            "accent": "#0071e3",
            "background": "#f5f5f7",
            "text": "#1d1d1f",
            "text_muted": "#6e6e73",
            "gradient_from": "#248a3d",
            "gradient_to": "#30d158",
        },
        "font_heading": "Inter",
        "font_body": "Inter",
        "layout_style": "card-heavy",
    },
]
# Keep DESIGN_PRESETS as alias for code that uses it
DESIGN_PRESETS = PREMIUM_APPLE_PRESETS


def resolve_design_theme(
    content: Dict[str, Any], business_name: str, generation_seed: Optional[str] = None
) -> Dict[str, Any]:
    """
    Resolve final design theme: always pick one of the 5 premium presets at random (by seed)
    so each site gets a different theme. generation_seed (e.g. site slug) ensures variety.
    """
    # Always use one of the 5 premium themes (by seed) so sites get different themes
    seed_str = (generation_seed or "") + business_name
    seed = hashlib.md5(seed_str.encode()).hexdigest()
    idx = int(seed[:8], 16) % len(PREMIUM_APPLE_PRESETS)
    chosen = PREMIUM_APPLE_PRESETS[idx].copy()
    chosen["color_palette"] = chosen["color_palette"].copy()
    return chosen


def _norm_hex(s: Optional[str]) -> str:
    if not s or not isinstance(s, str):
        return "#0f766e"
    s = s.strip()
    if s.startswith("#") and len(s) in (4, 7, 9):
        return s
    if len(s) == 6 and all(c in "0123456789abcdefABCDEF" for c in s):
        return "#" + s
    return "#0f766e"


def get_image_urls(
    image_keywords: Dict[str, Any],
    business_name: str,
    services_count: int = 3,
    unsplash_access_key: Optional[str] = None,
    industry: Optional[str] = None,
    service_names: Optional[list] = None,
) -> Dict[str, str]:
    """
    Resolve image URLs for hero, about, and each service.
    Uses business/industry-relevant keywords so images match the business, not random.
    Uses Unsplash API if unsplash_access_key is set; otherwise Picsum with seed for variety.
    """
    # Build business-relevant keywords when LLM didn't provide good ones
    industry_str = (industry or "business").strip()
    hero_kw = image_keywords.get("hero") or [industry_str, "professional", "quality service"]
    about_kw = image_keywords.get("about") or [industry_str, "team", "local business"]
    service_kw_list = image_keywords.get("services")
    if not service_kw_list and service_names:
        service_kw_list = [f"{industry_str} {sn}" for sn in (service_names[: services_count] or [industry_str])]
    if not service_kw_list:
        service_kw_list = [industry_str] * max(services_count, 1)
    # Normalize to list of strings
    if isinstance(hero_kw, str):
        hero_kw = [hero_kw]
    if isinstance(about_kw, str):
        about_kw = [about_kw]
    enhanced_keywords = {
        "hero": hero_kw[:3],
        "about": about_kw[:3],
        "services": service_kw_list[: max(services_count, 1)],
    }

    base_seed = hashlib.md5(business_name.encode()).hexdigest()[:12]
    urls: Dict[str, str] = {}

    if unsplash_access_key:
        # Try Unsplash API for business-relevant images
        try:
            fetched = _fetch_unsplash_urls(
                enhanced_keywords, business_name, services_count, unsplash_access_key
            )
            if fetched:
                urls["hero"] = fetched.get("hero") or f"https://picsum.photos/seed/{base_seed}a/1200/600"
                urls["about"] = fetched.get("about") or f"https://picsum.photos/seed/{base_seed}b/800/500"
                for i in range(max(services_count, 1)):
                    urls[f"service_{i}"] = fetched.get(f"service_{i}") or f"https://picsum.photos/seed/{base_seed}s{i}/600/400"
                return urls
        except Exception as e:
            logger.warning("Unsplash fetch failed, using placeholder images: %s", e)

    # Fallback: Picsum with deterministic seed per section
    urls["hero"] = f"https://picsum.photos/seed/{base_seed}a/1200/600"
    urls["about"] = f"https://picsum.photos/seed/{base_seed}b/800/500"
    for i in range(max(services_count, 1)):
        urls[f"service_{i}"] = f"https://picsum.photos/seed/{base_seed}s{i}/600/400"
    return urls


def _fetch_unsplash_urls(
    image_keywords: Dict[str, Any],
    business_name: str,
    services_count: int,
    access_key: str,
) -> Dict[str, str]:
    """Fetch image URLs from Unsplash API using business-relevant search queries."""
    try:
        import urllib.parse
        import urllib.request

        urls: Dict[str, str] = {}
        hero_kw = image_keywords.get("hero") or [business_name, "professional"]
        query = " ".join(str(k) for k in hero_kw[:3])
        hero_url = _unsplash_search_one(query, access_key, "1200", "600")
        if hero_url:
            urls["hero"] = hero_url

        about_kw = image_keywords.get("about") or [business_name, "team"]
        query = " ".join(str(k) for k in about_kw[:3])
        about_url = _unsplash_search_one(query, access_key, "800", "500")
        if about_url:
            urls["about"] = about_url

        service_kw_list = image_keywords.get("services") or [business_name] * max(services_count, 1)
        for i in range(max(services_count, 1)):
            kw = service_kw_list[i] if i < len(service_kw_list) else service_kw_list[0] if service_kw_list else business_name
            q = kw if isinstance(kw, str) else str(kw)
            service_url = _unsplash_search_one(q, access_key, "600", "400")
            if service_url:
                urls[f"service_{i}"] = service_url
            else:
                urls[f"service_{i}"] = f"https://picsum.photos/seed/{hashlib.md5((business_name + str(i)).encode()).hexdigest()[:12]}/600/400"
        return urls
    except Exception as e:
        logger.warning("Unsplash request failed: %s", e)
        return {}


def _unsplash_search_one(
    query: str, access_key: str, width: str, height: str
) -> Optional[str]:
    """Search Unsplash for one image; return URL or None."""
    try:
        import urllib.parse
        import urllib.request

        encoded = urllib.parse.urlencode({"query": query, "per_page": "1"})
        req = urllib.request.Request(
            f"https://api.unsplash.com/search/photos?{encoded}",
            headers={"Authorization": f"Client-ID {access_key}"},
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            import json
            data = json.loads(resp.read().decode())
            results = data.get("results") or []
            if results and results[0].get("urls", {}).get("regular"):
                url = results[0]["urls"]["regular"]
                return f"{url}?w={width}&h={height}&fit=crop"
    except Exception:
        pass
    return None
