from __future__ import annotations
import re
from typing import Optional

WEIGHTS = {
    "skills": 0.40,
    "experience": 0.25,
    "education": 0.10,
    "location": 0.15,
    "semantic": 0.10,
}

MAX_EXPERIENCE_YEARS = 10
EDU_SCORE = {0: 0.0, 1: 0.4, 2: 0.7, 3: 0.9, 4: 1.0}


def score_skills(candidate_skills: list[str], jd_skills: list[str]) -> float:
    if not jd_skills:
        return 0.5
    matched = len(set(s.lower() for s in candidate_skills) &
                  set(s.lower() for s in jd_skills))
    return matched / len(jd_skills)


def score_experience(years: float, required_years: float = 0.0) -> float:
    if required_years > 0:
        return 1.0 if years >= required_years else years / required_years
    return min(years / MAX_EXPERIENCE_YEARS, 1.0)


def score_education(level: int) -> float:
    return EDU_SCORE.get(level, 0.0)


def score_location(candidate_location: Optional[str], jd_location: Optional[str]) -> float:
    if not jd_location:
        return 0.8
    if not candidate_location:
        return 0.5
    if "remote" in jd_location.lower():
        return 1.0
    if candidate_location.lower() == jd_location.lower():
        return 1.0
    return 0.2


def compute_score(
    candidate: dict,
    jd_skills: list[str],
    jd_text: str,
    semantic_sim: float,
    jd_location: Optional[str] = None,
    required_years: float = 0.0,
) -> dict:
    s_skills = score_skills(candidate["skills"], jd_skills)
    s_exp = score_experience(candidate["experience_years"], required_years)
    s_edu = score_education(candidate["education_level"])
    s_loc = score_location(candidate.get("location"), jd_location)
    s_sem = semantic_sim

    final = (
        WEIGHTS["skills"] * s_skills
        + WEIGHTS["experience"] * s_exp
        + WEIGHTS["education"] * s_edu
        + WEIGHTS["location"] * s_loc
        + WEIGHTS["semantic"] * s_sem
    )

    return {
        "score": round(final * 100, 1),
        "breakdown": {
            "skills_score": round(s_skills * 100, 1),
            "experience_score": round(s_exp * 100, 1),
            "education_score": round(s_edu * 100, 1),
            "location_score": round(s_loc * 100, 1),
            "semantic_score": round(s_sem * 100, 1),
        },
    }


def extract_jd_experience(jd_text: str) -> float:
    patterns = [
        r"(\d+)\+?\s*years?\s+(?:of\s+)?experience",
        r"experience\s+(?:of\s+)?(\d+)\+?\s*years?",
        r"minimum\s+(\d+)\s+years?",
        r"at\s+least\s+(\d+)\s+years?",
    ]
    for p in patterns:
        m = re.search(p, jd_text, re.IGNORECASE)
        if m:
            return float(m.group(1))
    return 0.0


def extract_jd_location(jd_text: str) -> Optional[str]:
    from app.extractor import extract_location
    return extract_location(jd_text)