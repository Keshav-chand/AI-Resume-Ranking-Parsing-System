"use client";

import { motion } from "framer-motion";

interface Props {
  label: string;
  value: number;
  delay?: number;
}

const getColor = (v: number) =>
  v >= 75 ? "#34d399" : v >= 50 ? "#a78bfa" : v >= 25 ? "#fbbf24" : "#f87171";

export default function ScoreBar({ label, value, delay = 0 }: Props) {
  const color = getColor(value);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-white/40">{label}</span>
        <span className="text-[11px] font-mono font-medium" style={{ color }}>{value.toFixed(0)}%</span>
      </div>
      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
          initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, delay, ease: "easeOut" }} />
      </div>
    </div>
  );
}