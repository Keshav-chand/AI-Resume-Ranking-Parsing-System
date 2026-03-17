# AI Resume Ranking & Parsing System

> Rank candidates against a job description using local AI — no external APIs, no data leaves your machine.

---

## What it does

Upload up to 100 resumes (PDF, DOCX, PPTX) alongside a job description, and the system automatically extracts candidate information, scores each resume using a weighted algorithm, and ranks candidates from best to worst match — all running entirely on your local machine using a sentence-transformers model.

---

## Tech Stack

**Backend**
- Python · FastAPI · Uvicorn
- pdfplumber · python-docx · python-pptx
- sentence-transformers (`all-MiniLM-L6-v2`)
- NumPy · Regex

**Frontend**
- Next.js 14 · TypeScript
- Tailwind CSS · Framer Motion
- Axios · React Dropzone · React Hot Toast

---

## Project Structure

```
ai-resume-ranker/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI endpoints
│   │   ├── parser.py        # PDF / DOCX / PPTX text extraction
│   │   ├── extractor.py     # Name, email, skills, experience, education, location
│   │   ├── matcher.py       # Local sentence-transformers embeddings
│   │   ├── scorer.py        # Weighted scoring engine
│   │   └── utils.py         # Helpers + ranking
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx         # Main UI
│   │   └── globals.css
│   ├── components/
│   │   ├── CandidateCard.tsx
│   │   ├── ResumeDropzone.tsx
│   │   └── ScoreBar.tsx
│   ├── tailwind.config.ts
│   └── package.json
│
└── README.md
```

---

## How It Works

```
Resumes + JD  →  Text Extraction  →  Skill & Info Extraction
                                              ↓
              Ranked Output  ←  Scoring  ←  Embeddings (semantic similarity)
```

**Step 1 — Parse:** Converts PDF / DOCX / PPTX files into plain text using `pdfplumber`, `python-docx`, and `python-pptx`.

**Step 2 — Extract:** Pulls structured data from each resume — name, email, phone, skills, years of experience, education level, and location — using regex and a predefined skill taxonomy of 80+ technologies.

**Step 3 — Embed:** Converts resume text and job description into vector embeddings using the `all-MiniLM-L6-v2` sentence-transformers model running locally. Computes cosine similarity to measure semantic fit.

**Step 4 — Score:** Combines all signals into a single 0–100 score using this weighted formula:

| Factor | Weight |
|---|---|
| Skills Match | 40% |
| Experience | 25% |
| Location | 15% |
| Education | 10% |
| Semantic Similarity | 10% |

**Step 5 — Rank:** Sorts candidates by final score and returns a ranked list with full breakdowns.

---

## Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

### Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`

### Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## API Reference

### `POST /api/rank`

Accepts resumes and a job description, returns ranked candidates.

**Request** — `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `resumes` | File[] | ✅ | PDF / DOCX / PPTX resume files |
| `jd_text` | string | one of | Job description as plain text |
| `jd_file` | File | one of | Job description as a file |

**Response**

```json
{
  "total": 3,
  "jd_skills": ["python", "django", "aws"],
  "required_years": 3,
  "jd_location": "Bangalore",
  "candidates": [
    {
      "rank": 1,
      "name": "Rahul Sharma",
      "email": "rahul@email.com",
      "phone": "+91 98765 43210",
      "skills": ["python", "django", "sql", "aws"],
      "experience_years": 4,
      "education": "B.TECH",
      "location": "Bangalore",
      "score": 87.4,
      "breakdown": {
        "skills_score": 90.0,
        "experience_score": 100.0,
        "education_score": 70.0,
        "location_score": 100.0,
        "semantic_score": 74.2
      },
      "matched_skills": ["python", "django", "aws"],
      "missing_skills": []
    }
  ]
}
```

### `GET /api/health`

Returns `{ "status": "ok" }` — use to verify the backend is running.

---

## Features

- Upload up to **100 resumes** simultaneously
- Supports **PDF, DOCX, and PPTX** formats for both resumes and job description
- Extracts **name, email, phone, skills, experience, education, and location** from each resume
- **80+ skill keywords** across AI/ML, backend, frontend, cloud, DevOps, and databases
- **Local AI embeddings** — `all-MiniLM-L6-v2` runs entirely on your machine, no API key needed
- **Score breakdown** per candidate — see exactly why each candidate ranked where they did
- **Matched vs missing skills** highlighted per candidate
- Concurrent processing — all resumes processed in parallel via `asyncio`

---

## No External APIs

This project was built without any external AI APIs (OpenAI, Gemini, etc.) as per the assignment requirements. The semantic similarity engine uses the `sentence-transformers` library which downloads and runs the model locally on first use (~80MB). After the first run the model is cached.

---

## Screenshots

<img width="1919" height="870" alt="image" src="https://github.com/user-attachments/assets/0e80955a-f4cd-4693-b434-30df34d57668" />
<img width="1910" height="866" alt="image" src="https://github.com/user-attachments/assets/aecaaefe-1c2b-48dc-aa79-13e02041faa9" />
<img width="1919" height="869" alt="image" src="https://github.com/user-attachments/assets/299cd243-e77e-4c03-8029-de944054fdf8" />

---

