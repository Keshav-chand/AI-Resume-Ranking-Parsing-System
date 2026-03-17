import re
from typing import Optional

SKILL_KEYWORDS = [
    "python", "java", "javascript", "typescript", "c++", "c#", "c", "go",
    "golang", "rust", "ruby", "php", "swift", "kotlin", "scala", "r",
    "matlab", "perl", "bash", "shell", "powershell",
    "html", "css", "react", "reactjs", "next.js", "nextjs", "vue", "vuejs",
    "angular", "svelte", "tailwind", "bootstrap", "sass", "webpack", "vite",
    "redux", "graphql",
    "node.js", "nodejs", "express", "django", "flask", "fastapi", "spring",
    "spring boot", "laravel", "rails", "asp.net", "rest api", "rest",
    "microservices", "grpc", "websocket",
    "machine learning", "deep learning", "nlp", "natural language processing",
    "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn",
    "sklearn", "pandas", "numpy", "matplotlib", "seaborn", "huggingface",
    "transformers", "langchain", "llm", "data analysis",
    "data science", "data engineering", "feature engineering",
    "model deployment", "mlops",
    "sql", "mysql", "postgresql", "postgres", "sqlite", "mongodb", "redis",
    "cassandra", "dynamodb", "firebase", "elasticsearch", "oracle",
    "nosql", "neo4j",
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
    "terraform", "ansible", "jenkins", "github actions", "ci/cd", "linux",
    "nginx", "apache", "heroku", "vercel", "netlify",
    "git", "github", "gitlab", "bitbucket", "jira", "confluence",
    "figma", "postman", "swagger", "rabbitmq", "kafka", "celery",
    "hadoop", "spark", "airflow", "dbt",
]

SKILL_ALIASES: dict[str, str] = {
    "reactjs": "react", "vuejs": "vue", "nodejs": "node.js",
    "nextjs": "next.js", "postgres": "postgresql", "sklearn": "scikit-learn",
    "k8s": "kubernetes", "golang": "go", "rest api": "rest",
}

EDUCATION_LEVELS: dict[str, int] = {
    "phd": 4, "ph.d": 4, "doctorate": 4,
    "masters": 3, "master": 3, "m.tech": 3, "m.sc": 3, "msc": 3, "mba": 3, "m.e": 3,
    "bachelors": 2, "bachelor": 2, "b.tech": 2, "b.sc": 2, "bsc": 2, "b.e": 2, "be": 2,
    "undergraduate": 2, "diploma": 1, "associate": 1,
}

CITIES = [
    "bangalore", "bengaluru", "mumbai", "delhi", "hyderabad", "chennai",
    "pune", "kolkata", "ahmedabad", "noida", "gurugram", "gurgaon",
    "new york", "san francisco", "london", "berlin", "toronto", "sydney",
    "singapore", "dubai", "remote",
]


def extract_email(text: str) -> Optional[str]:
    match = re.search(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", text)
    return match.group(0) if match else None


def extract_phone(text: str) -> Optional[str]:
    match = re.search(
        r"(\+?91[\s\-]?)?[6-9]\d{9}|(\+?1[\s\-]?)?\(?\d{3}\)?[\s\-]\d{3}[\s\-]\d{4}",
        text,
    )
    return match.group(0).strip() if match else None


def extract_name(text: str) -> Optional[str]:
    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue
        if re.search(r"\d", line):
            continue
        if "@" in line or "http" in line.lower():
            continue
        if len(line.split()) > 5 or len(line) > 50:
            continue
        if re.match(r"^[A-Za-z]+([\s\-'][A-Za-z]+){0,3}$", line):
            return line.title()
    return None


def extract_skills(text: str) -> list[str]:
    text_lower = text.lower()
    found: set[str] = set()
    for skill in sorted(SKILL_KEYWORDS, key=len, reverse=True):
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text_lower):
            canonical = SKILL_ALIASES.get(skill, skill)
            found.add(canonical)
    return sorted(found)


def extract_experience(text: str) -> float:
    candidates: list[float] = []
    patterns = [
        r"(\d+(?:\.\d+)?)\s*\+?\s*years?\s+(?:of\s+)?(?:work\s+)?experience",
        r"experience\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*\+?\s*years?",
        r"(\d+(?:\.\d+)?)\s*\+?\s*yrs?\.?\s+(?:of\s+)?(?:work\s+)?exp",
        r"(20\d{2})\s*[-–—to]+\s*(20\d{2}|present|current)",
    ]
    for pattern in patterns[:-1]:
        for m in re.finditer(pattern, text, re.IGNORECASE):
            try:
                candidates.append(float(m.group(1)))
            except ValueError:
                pass
    for m in re.finditer(patterns[-1], text, re.IGNORECASE):
        start = int(m.group(1))
        end_raw = m.group(2).lower()
        end = 2024 if end_raw in ("present", "current") else int(end_raw)
        candidates.append(float(end - start))
    if not candidates:
        return 0.0
    return round(min(max(candidates), 40.0), 1)


def extract_education(text: str) -> tuple[str, int]:
    text_lower = text.lower()
    best_label = "not specified"
    best_level = 0
    for edu, level in EDUCATION_LEVELS.items():
        if re.search(r"\b" + re.escape(edu) + r"\b", text_lower):
            if level > best_level:
                best_level = level
                best_label = edu.upper()
    return best_label, best_level


def extract_location(text: str) -> Optional[str]:
    text_lower = text.lower()
    for city in CITIES:
        if re.search(r"\b" + re.escape(city) + r"\b", text_lower):
            return city.title()
    return None


def extract_candidate_info(text: str) -> dict:
    edu_label, edu_level = extract_education(text)
    return {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": extract_skills(text),
        "experience_years": extract_experience(text),
        "education": edu_label,
        "education_level": edu_level,
        "location": extract_location(text),
    }