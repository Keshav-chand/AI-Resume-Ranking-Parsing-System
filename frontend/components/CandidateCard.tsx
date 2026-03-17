"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScoreBar from "./ScoreBar";
import clsx from "clsx";

interface Candidate {
  rank: number; filename: string; name: string; email?: string; phone?: string;
  skills: string[]; experience_years: number; education: string; location?: string;
  score: number;
  breakdown: { skills_score: number; experience_score: number; education_score: number; location_score: number; semantic_score: number; };
  matched_skills: string[]; missing_skills: string[]; error?: string;
}

const rankStyle = (r: number) =>
  r === 1 ? { bg: "bg-amber-400/20 border-amber-400/30 text-amber-300", label: "🥇" } :
  r === 2 ? { bg: "bg-slate-400/20 border-slate-400/30 text-slate-300", label: "🥈" } :
  r === 3 ? { bg: "bg-orange-400/20 border-orange-400/30 text-orange-300", label: "🥉" } :
             { bg: "bg-white/[0.05] border-white/[0.08] text-white/40", label: `#${r}` };

const scoreStyle = (s: number) =>
  s >= 80 ? "text-emerald-400" :
  s >= 65 ? "text-violet-400" :
  s >= 45 ? "text-amber-400" : "text-red-400";

const scoreTag = (s: number) =>
  s >= 80 ? { t: "Excellent", c: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" } :
  s >= 65 ? { t: "Strong",    c: "bg-violet-400/10 text-violet-400 border-violet-400/20" } :
  s >= 45 ? { t: "Moderate",  c: "bg-amber-400/10 text-amber-400 border-amber-400/20" } :
             { t: "Weak",      c: "bg-red-400/10 text-red-400 border-red-400/20" };

export default function CandidateCard({ candidate, delay = 0 }: { candidate: Candidate; delay?: number }) {
  const [expanded, setExpanded] = useState(false);
  const rs = rankStyle(candidate.rank);
  const ss = scoreStyle(candidate.score);
  const st = scoreTag(candidate.score);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }}
      className="rounded-2xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05] transition-colors overflow-hidden">

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          {/* Rank */}
          <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold border", rs.bg)}>
            {rs.label}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-white text-sm leading-tight">{candidate.name}</h3>
                <p className="text-[11px] text-white/30 mt-0.5 font-mono">{candidate.filename}</p>
              </div>
              <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                <span className={clsx("text-2xl font-bold tabular-nums", ss)}>{candidate.score.toFixed(1)}</span>
                <span className={clsx("text-[10px] font-medium px-2 py-0.5 rounded-md border", st.c)}>{st.t}</span>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5 text-[11px] text-white/35">
              {candidate.email && <span>✉ {candidate.email}</span>}
              {candidate.phone && <span>📞 {candidate.phone}</span>}
              {candidate.location && <span>📍 {candidate.location}</span>}
              <span>🎓 {candidate.education}</span>
              <span>⏱ {candidate.experience_years} yrs exp</span>
            </div>

            {/* Skills */}
            {candidate.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {candidate.skills.slice(0, expanded ? undefined : 9).map((skill) => {
                  const matched = candidate.matched_skills.map(s => s.toLowerCase()).includes(skill.toLowerCase());
                  return (
                    <span key={skill} className={clsx(
                      "px-2 py-0.5 rounded-md text-[11px] font-mono border transition-colors",
                      matched
                        ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/20"
                        : "bg-white/[0.04] text-white/35 border-white/[0.07]"
                    )}>
                      {skill}
                    </span>
                  );
                })}
                {!expanded && candidate.skills.length > 9 && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] text-white/25 border border-white/[0.07]">
                    +{candidate.skills.length - 9}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <button onClick={() => setExpanded(!expanded)}
          className="mt-3.5 text-[11px] text-white/30 hover:text-violet-400 transition-colors flex items-center gap-1">
          {expanded ? "▲ Hide breakdown" : "▼ Show score breakdown"}
        </button>
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="border-t border-white/[0.06] px-4 sm:px-5 py-4 space-y-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/25 mb-3">Score breakdown</p>
                <div className="space-y-2.5">
                  <ScoreBar label="Skills match" value={candidate.breakdown.skills_score} delay={0.0} />
                  <ScoreBar label="Experience" value={candidate.breakdown.experience_score} delay={0.08} />
                  <ScoreBar label="Education" value={candidate.breakdown.education_score} delay={0.16} />
                  <ScoreBar label="Location" value={candidate.breakdown.location_score} delay={0.24} />
                  <ScoreBar label="Semantic fit" value={candidate.breakdown.semantic_score} delay={0.32} />
                </div>
              </div>

              {candidate.missing_skills.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/25 mb-2">Missing skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.missing_skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-red-400/10 text-red-300 border border-red-400/20">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {candidate.error && (
                <p className="text-[11px] text-red-400 bg-red-400/10 rounded-lg px-3 py-2 border border-red-400/20">⚠ {candidate.error}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}