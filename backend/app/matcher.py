from __future__ import annotations
import threading
from typing import Optional
import numpy as np
from sentence_transformers import SentenceTransformer

_model: Optional[SentenceTransformer] = None
_model_lock = threading.Lock()
MODEL_NAME = "all-MiniLM-L6-v2"


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                _model = SentenceTransformer(MODEL_NAME)
    return _model


def embed(text: str) -> np.ndarray:
    model = _get_model()
    return model.encode(text, normalize_embeddings=True)


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b))


def semantic_similarity(resume_text: str, jd_text: str) -> float:
    r_vec = embed(resume_text[:2000])
    j_vec = embed(jd_text[:2000])
    return max(0.0, min(1.0, cosine_similarity(r_vec, j_vec)))