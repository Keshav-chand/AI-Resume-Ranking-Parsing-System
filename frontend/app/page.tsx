"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const S = {
  page: { minHeight: "100vh", background: "#0d0d0f", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" } as React.CSSProperties,
  header: { borderBottom: "1px solid #1e1e26", background: "rgba(13,13,15,0.85)", backdropFilter: "blur(16px)", position: "sticky" as const, top: 0, zIndex: 50, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoDot: { width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 },
  badge: { padding: "2px 8px", borderRadius: 20, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa", fontSize: 10, fontFamily: "monospace", letterSpacing: 1 },
  main: { maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" },
  heroTitle: { fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, textAlign: "center" as const, lineHeight: 1.2, marginBottom: 12 },
  heroSub: { color: "rgba(255,255,255,0.45)", fontSize: 15, textAlign: "center" as const, maxWidth: 480, margin: "0 auto 40px" },
  card: { background: "#141418", border: "1px solid #1e1e26", borderRadius: 16, overflow: "hidden" },
  textarea: { width: "100%", background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14, lineHeight: 1.7, padding: "20px 20px 12px", resize: "none" as const, fontFamily: "inherit" } as React.CSSProperties,
  bottomBar: { borderTop: "1px solid #1e1e26", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 },
  attachBtn: (active: boolean): React.CSSProperties => ({ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: `1px solid ${active ? "rgba(124,58,237,0.4)" : "#1e1e26"}`, background: active ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)", color: active ? "#c4b5fd" : "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }),
  rankBtn: (loading: boolean): React.CSSProperties => ({ display: "flex", alignItems: "center", gap: 7, padding: "8px 20px", borderRadius: 10, background: loading ? "rgba(124,58,237,0.4)" : "linear-gradient(135deg,#7c3aed,#6d28d9)", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.15s" }),
  dropzone: (active: boolean): React.CSSProperties => ({ border: `2px dashed ${active ? "#7c3aed" : "#1e1e26"}`, borderRadius: 12, padding: 28, textAlign: "center", cursor: "pointer", background: active ? "rgba(124,58,237,0.05)" : "transparent", transition: "all 0.15s" }),
  fileChip: { display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e26", borderRadius: 8, padding: "6px 10px" } as React.CSSProperties,
  modeBtn: (active: boolean): React.CSSProperties => ({ padding: "5px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none", background: active ? "#7c3aed" : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.4)", transition: "all 0.15s" }),
};

interface RankResult {
  total: number;
  jd_skills: string[];
  required_years: number;
  jd_location: string | null;
  candidates: any[];
}

// ── Dropzone component ────────────────────────────────────────────────────────
function FileDropzone({ files, onChange, label, maxFiles = 100 }: { files: File[]; onChange: (f: File[]) => void; label: string; maxFiles?: number }) {
  const onDrop = useCallback((accepted: File[]) => onChange([...files, ...accepted].slice(0, maxFiles)), [files, onChange, maxFiles]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "application/vnd.ms-powerpoint": [".ppt"],
    },
    maxFiles,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div {...getRootProps()} style={S.dropzone(isDragActive)}>
        <input {...getInputProps()} />
        <div style={{ fontSize: 28, marginBottom: 8 }}>{isDragActive ? "✨" : "📂"}</div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{isDragActive ? "Release to add" : label}</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>PDF · DOCX · PPTX</p>
      </div>
      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 180, overflowY: "auto" }}>
          {files.map((f, i) => (
            <div key={i} style={S.fileChip}>
              <span style={{ fontSize: 14 }}>{f.name.endsWith(".pdf") ? "📄" : f.name.match(/pptx?$/) ? "📊" : "📝"}</span>
              <span style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{(f.size / 1024).toFixed(0)}KB</span>
              <button onClick={(e) => { e.stopPropagation(); onChange(files.filter((_, j) => j !== i)); }}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 2px" }}>×</button>
            </div>
          ))}
          <button onClick={() => onChange([])} style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", background: "none", border: "none", cursor: "pointer", textAlign: "right", padding: "2px 0" }}>
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

// ── Score ring ─────────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 52, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#f59e0b" : score >= 65 ? "#a78bfa" : score >= 45 ? "#34d399" : "#f87171";
  const label = score >= 80 ? "Excellent match" : score >= 65 ? "Strong match" : score >= 45 ? "Moderate match" : "Weak match";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <svg width={130} height={130} viewBox="0 0 130 130">
        <circle cx={65} cy={65} r={r} fill="none" stroke="#1e1e26" strokeWidth={10} />
        <circle cx={65} cy={65} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 65 65)" style={{ transition: "stroke-dashoffset 1s ease" }} />
        <text x={65} y={60} textAnchor="middle" fill={color} fontSize={26} fontWeight={700} fontFamily="-apple-system,sans-serif">{score.toFixed(0)}</text>
        <text x={65} y={78} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={11} fontFamily="-apple-system,sans-serif">/ 100</text>
      </svg>
      <span style={{ color, fontWeight: 600, fontSize: 14 }}>{label}</span>
    </div>
  );
}

// ── Score bar ──────────────────────────────────────────────────────────────────
function ScoreBar({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
  const color = value >= 75 ? "#34d399" : value >= 50 ? "#a78bfa" : value >= 25 ? "#f59e0b" : "#f87171";
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{label}</span>
        <span style={{ fontSize: 12, fontFamily: "monospace", color }}>{value.toFixed(0)}%</span>
      </div>
      <div style={{ height: 4, background: "#1e1e26", borderRadius: 4, overflow: "hidden" }}>
        <motion.div style={{ height: "100%", background: color, borderRadius: 4 }}
          initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }} />
      </div>
    </div>
  );
}

// ── Candidate card ─────────────────────────────────────────────────────────────
function CandidateCard({ c, delay = 0 }: { c: any; delay?: number }) {
  const [open, setOpen] = useState(false);
  const rankColors: Record<number, string> = { 1: "#f59e0b", 2: "#94a3b8", 3: "#cd7c32" };
  const rankColor = rankColors[c.rank] || "rgba(255,255,255,0.2)";

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}
      style={{ background: "#141418", border: "1px solid #1e1e26", borderRadius: 16, overflow: "hidden", transition: "border-color 0.2s" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2a2a35")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e1e26")}>

      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          {/* Rank */}
          <div style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${rankColor}30`, background: `${rankColor}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 700, color: rankColor }}>
            {c.rank <= 3 ? ["🥇","🥈","🥉"][c.rank-1] : `#${c.rank}`}
          </div>

          {/* Left info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "#fff" }}>{c.name}</h3>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 2, fontFamily: "monospace" }}>{c.filename}</p>
              </div>
              {/* Score ring for top 3, number for rest */}
              {c.rank <= 3 ? (
                <div style={{ flexShrink: 0 }}>
                  <ScoreRing score={c.score} />
                </div>
              ) : (
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: c.score >= 65 ? "#a78bfa" : c.score >= 45 ? "#f59e0b" : "#f87171" }}>{c.score.toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>/ 100</div>
                </div>
              )}
            </div>

            {/* Meta */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              {c.email && <span>✉ {c.email}</span>}
              {c.phone && <span>📞 {c.phone}</span>}
              {c.location && <span>📍 {c.location}</span>}
              <span>🎓 {c.education}</span>
              <span>⏱ {c.experience_years} yrs</span>
            </div>

            {/* Skills */}
            {c.skills.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                {c.skills.slice(0, open ? undefined : 8).map((sk: string) => {
                  const matched = c.matched_skills.map((s: string) => s.toLowerCase()).includes(sk.toLowerCase());
                  return (
                    <span key={sk} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontFamily: "monospace", border: `1px solid ${matched ? "rgba(52,211,153,0.3)" : "#1e1e26"}`, background: matched ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.03)", color: matched ? "#34d399" : "rgba(255,255,255,0.35)" }}>
                      {sk}
                    </span>
                  );
                })}
                {!open && c.skills.length > 8 && (
                  <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, border: "1px solid #1e1e26", color: "rgba(255,255,255,0.2)" }}>+{c.skills.length - 8}</span>
                )}
              </div>
            )}

            <button onClick={() => setOpen(!open)} style={{ marginTop: 12, fontSize: 11, color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
              {open ? "▲ Hide breakdown" : "▼ Show score breakdown"}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded breakdown */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
            <div style={{ borderTop: "1px solid #1e1e26", padding: "16px 20px" }}>
              <p style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: 2, color: "rgba(255,255,255,0.2)", marginBottom: 12, textTransform: "uppercase" }}>Score breakdown</p>
              <ScoreBar label="Skills match" value={c.breakdown.skills_score} delay={0} />
              <ScoreBar label="Experience" value={c.breakdown.experience_score} delay={0.08} />
              <ScoreBar label="Education" value={c.breakdown.education_score} delay={0.16} />
              <ScoreBar label="Location" value={c.breakdown.location_score} delay={0.24} />
              <ScoreBar label="Semantic fit" value={c.breakdown.semantic_score} delay={0.32} />

              {c.missing_skills.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <p style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: 2, color: "rgba(255,255,255,0.2)", marginBottom: 8, textTransform: "uppercase" }}>Missing skills</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {c.missing_skills.map((s: string) => (
                      <span key={s} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontFamily: "monospace", border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.08)", color: "#f87171" }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [jdMode, setJdMode] = useState<"text" | "file">("text");
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RankResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [showDrop, setShowDrop] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    if (!resumeFiles.length) return toast.error("Attach at least one resume.");
    if (jdMode === "text" && !jdText.trim()) return toast.error("Enter a job description.");
    if (jdMode === "file" && !jdFile.length) return toast.error("Upload a JD file.");

    setLoading(true); setResult(null); setProgress(0);
    const iv = setInterval(() => setProgress((p) => Math.min(p + Math.random() * 9, 88)), 350);

    try {
      const fd = new FormData();
      resumeFiles.forEach((f) => fd.append("resumes", f));
      if (jdMode === "text") fd.append("jd_text", jdText);
      else fd.append("jd_file", jdFile[0]);

      const { data } = await axios.post<RankResult>(`${API_BASE}/api/rank`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setProgress(100); setResult(data);
      toast.success(`Ranked ${data.total} candidates!`);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Backend not responding.");
    } finally {
      clearInterval(iv); setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      {/* Purple glow */}
      <div style={{ position: "fixed", top: "-15%", left: "50%", transform: "translateX(-50%)", width: 700, height: 400, background: "radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Header */}
      <header style={S.header}>
        <div style={S.logo}>
          <div style={S.logoDot}>R</div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>ResumeRank</span>
          <div style={S.badge}>AI · LOCAL</div>
        </div>
        {result && (
          <button onClick={() => { setResult(null); setResumeFiles([]); setJdText(""); setJdFile([]); setShowDrop(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer" }}>
            ← New analysis
          </button>
        )}
      </header>

      <main style={{ ...S.main, position: "relative", zIndex: 1 }}>
        {/* Hero */}
        {!result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 36 }}>
            <h1 style={S.heroTitle}>Find your best candidates<br /><span style={{ color: "#a78bfa" }}>instantly.</span></h1>
            <p style={S.heroSub}>Paste a job description, attach resumes — AI ranks them by skill match, experience &amp; semantic fit.</p>
          </motion.div>
        )}

        {!result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            {/* Mode toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", letterSpacing: 1, textTransform: "uppercase" }}>Job Description</span>
              <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid #1e1e26" }}>
                <button style={S.modeBtn(jdMode === "text")} onClick={() => setJdMode("text")}>Paste text</button>
                <button style={S.modeBtn(jdMode === "file")} onClick={() => setJdMode("file")}>Upload file</button>
              </div>
            </div>

            {/* Main input card */}
            <div style={S.card}>
              {jdMode === "text" ? (
                <textarea style={S.textarea} rows={7} value={jdText} onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the job description here…&#10;&#10;e.g. Looking for a Python Developer with 3+ years in Django, REST APIs, PostgreSQL, AWS…" />
              ) : (
                <div style={{ padding: 16 }}>
                  <FileDropzone files={jdFile} onChange={(f) => setJdFile(f.slice(-1))} label="Drop JD file here" maxFiles={1} />
                </div>
              )}

              {/* Bottom bar */}
              <div style={S.bottomBar}>
                <button style={S.attachBtn(resumeFiles.length > 0)} onClick={() => setShowDrop(!showDrop)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {resumeFiles.length > 0 ? `${resumeFiles.length} resume${resumeFiles.length !== 1 ? "s" : ""} attached` : "Attach resumes"}
                </button>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>PDF · DOCX · PPTX</span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>Ctrl+Enter to rank</span>
                <button style={S.rankBtn(loading)} onClick={handleSubmit} disabled={loading}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                  {loading
                    ? <><svg style={{ animation: "spin 1s linear infinite" }} width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg> Ranking…</>
                    : "Rank →"}
                </button>
              </div>
            </div>

            {/* Resume dropzone */}
            <AnimatePresence>
              {showDrop && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginTop: 10 }}>
                  <div style={{ ...S.card, padding: 16 }}>
                    <FileDropzone files={resumeFiles} onChange={setResumeFiles} label="Drop resumes here (up to 100)" maxFiles={100} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress */}
            <AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ marginTop: 12, ...S.card, padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>Analysing {resumeFiles.length} resume{resumeFiles.length !== 1 ? "s" : ""}…</span>
                    <span style={{ fontFamily: "monospace", color: "#a78bfa" }}>{Math.round(progress)}%</span>
                  </div>
                  <div style={{ height: 4, background: "#1e1e26", borderRadius: 4, overflow: "hidden" }}>
                    <motion.div style={{ height: "100%", background: "linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius: 4 }}
                      animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>Extracting skills · Computing embeddings · Scoring candidates</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* How it works */}
            {!loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 28 }}>
                {[
                  { n: "01", icon: "📎", t: "Attach", d: "PDF, DOCX, PPTX" },
                  { n: "02", icon: "🔍", t: "Parse", d: "Skills & experience" },
                  { n: "03", icon: "🧠", t: "Embed", d: "Semantic similarity" },
                  { n: "04", icon: "🏆", t: "Rank", d: "Weighted score" },
                ].map((s) => (
                  <div key={s.n} style={{ ...S.card, padding: "16px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                    <div style={{ fontSize: 10, fontFamily: "monospace", color: "#7c3aed", marginBottom: 4 }}>{s.n}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{s.t}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{s.d}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div ref={resultsRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Summary bar */}
              <div style={{ ...S.card, padding: "14px 20px", marginBottom: 14, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#a78bfa", fontSize: 15 }}>{result.total}</div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>Candidates ranked</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>
                      {result.jd_skills.length} skills detected{result.required_years > 0 && ` · ${result.required_years}+ yrs required`}{result.jd_location && ` · ${result.jd_location}`}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginLeft: "auto" }}>
                  {result.jd_skills.slice(0, 8).map((s) => (
                    <span key={s} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontFamily: "monospace", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "#c4b5fd" }}>{s}</span>
                  ))}
                  {result.jd_skills.length > 8 && <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, border: "1px solid #1e1e26", color: "rgba(255,255,255,0.2)" }}>+{result.jd_skills.length - 8}</span>}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.candidates.map((c, i) => <CandidateCard key={c.filename + i} c={c} delay={i * 0.05} />)}
              </div>

              <div style={{ textAlign: "center", marginTop: 28 }}>
                <button onClick={() => { setResult(null); setResumeFiles([]); setJdText(""); setJdFile([]); setShowDrop(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  style={{ padding: "10px 24px", borderRadius: 10, border: "1px solid #1e1e26", background: "transparent", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 13, fontWeight: 500 }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.color = "#a78bfa"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1e1e26"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}>
                  ← Start new analysis
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer style={{ borderTop: "1px solid #1e1e26", padding: "20px 24px", textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.15)", fontFamily: "monospace" }}>
        ResumeRank · Sure4Job Assignment · 100% local — no data leaves your machine
      </footer>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}