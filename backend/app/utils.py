import re


def clean_text(text: str) -> str:
    text = re.sub(r"\r\n|\r", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


def rank_candidates(candidates: list[dict]) -> list[dict]:
    sorted_candidates = sorted(candidates, key=lambda c: c["score"], reverse=True)
    for i, c in enumerate(sorted_candidates, start=1):
        c["rank"] = i
    return sorted_candidates