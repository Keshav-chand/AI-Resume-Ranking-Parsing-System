from __future__ import annotations
import asyncio
from typing import Optional
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from app.extractor import extract_candidate_info, extract_skills
from app.matcher import semantic_similarity
from app.parser import clean_text, parse_file
from app.scorer import compute_score, extract_jd_experience, extract_jd_location
from app.utils import rank_candidates

app = FastAPI(title="AI Resume Ranker", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/rank")
async def rank_resumes(
    resumes: list[UploadFile] = File(...),
    jd_text: Optional[str] = Form(None),
    jd_file: Optional[UploadFile] = File(None),
):
    if jd_file and jd_file.filename:
        jd_raw = await jd_file.read()
        jd_content = clean_text(parse_file(jd_file.filename, jd_raw))
    elif jd_text and jd_text.strip():
        jd_content = clean_text(jd_text)
    else:
        raise HTTPException(status_code=422, detail="Provide either jd_text or jd_file.")

    if not resumes:
        raise HTTPException(status_code=422, detail="Upload at least one resume.")

    jd_skills = extract_skills(jd_content)
    required_years = extract_jd_experience(jd_content)
    jd_location = extract_jd_location(jd_content)

    async def process_resume(upload: UploadFile) -> dict:
        try:
            raw = await upload.read()
            text = clean_text(parse_file(upload.filename, raw))
            info = extract_candidate_info(text)
            sim = semantic_similarity(text, jd_content)
            score_data = compute_score(
                candidate=info,
                jd_skills=jd_skills,
                jd_text=jd_content,
                semantic_sim=sim,
                jd_location=jd_location,
                required_years=required_years,
            )
            return {
                "filename": upload.filename,
                "name": info["name"] or upload.filename,
                "email": info["email"],
                "phone": info["phone"],
                "skills": info["skills"],
                "experience_years": info["experience_years"],
                "education": info["education"],
                "location": info["location"],
                "score": score_data["score"],
                "breakdown": score_data["breakdown"],
                "matched_skills": list(
                    set(s.lower() for s in info["skills"]) &
                    set(s.lower() for s in jd_skills)
                ),
                "missing_skills": list(
                    set(s.lower() for s in jd_skills) -
                    set(s.lower() for s in info["skills"])
                ),
            }
        except Exception as exc:
            return {
                "filename": upload.filename,
                "name": upload.filename,
                "email": None, "phone": None,
                "skills": [], "experience_years": 0,
                "education": "N/A", "location": None,
                "score": 0.0, "breakdown": {},
                "matched_skills": [], "missing_skills": jd_skills,
                "error": str(exc),
            }

    results = await asyncio.gather(*[process_resume(r) for r in resumes])
    ranked = rank_candidates(list(results))

    return {
        "total": len(ranked),
        "jd_skills": jd_skills,
        "required_years": required_years,
        "jd_location": jd_location,
        "candidates": ranked,
    }