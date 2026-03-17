"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const ACCEPT_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "application/vnd.ms-powerpoint": [".ppt"],
};

interface Props {
  files: File[];
  onFilesChange: (files: File[]) => void;
  label?: string;
  maxFiles?: number;
  hint?: string;
  minimal?: boolean;
}

export default function ResumeDropzone({
  files, onFilesChange, label = "Drop files here",
  maxFiles = 100, hint = "PDF · DOCX · PPTX", minimal = false,
}: Props) {
  const onDrop = useCallback((accepted: File[]) => {
    onFilesChange([...files, ...accepted].slice(0, maxFiles));
  }, [files, onFilesChange, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: ACCEPT_TYPES, maxFiles });

  const removeFile = (index: number) => onFilesChange(files.filter((_, i) => i !== index));

  const getIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "📄";
    if (ext === "pptx" || ext === "ppt") return "📊";
    return "📝";
  };

  return (
    <div className="space-y-2.5">
      <div {...getRootProps()} className={clsx(
        "border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200",
        minimal ? "p-5" : "p-8",
        isDragActive
          ? "border-violet-500 bg-violet-500/5"
          : "border-white/[0.08] hover:border-violet-500/40 hover:bg-white/[0.02]"
      )}>
        <input {...getInputProps()} />
        <motion.div animate={isDragActive ? { scale: 1.03 } : { scale: 1 }} className="text-center space-y-1.5">
          <div className={clsx("mb-2", minimal ? "text-2xl" : "text-3xl")}>
            {isDragActive ? "✨" : "📂"}
          </div>
          <p className="text-sm font-medium text-white/70">
            {isDragActive ? "Release to add" : label}
          </p>
          <p className="text-xs text-white/30">or click to browse · {hint}</p>
        </motion.div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {files.map((file, i) => (
              <motion.div key={`${file.name}-${i}`}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }} transition={{ delay: i * 0.02 }}
                className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 group">
                <span className="text-base">{getIcon(file.name)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate text-white/80">{file.name}</p>
                  <p className="text-[10px] text-white/30">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none">×</button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {files.length > 0 && (
        <div className="flex items-center justify-between text-[11px] text-white/30">
          <span>{files.length} file{files.length !== 1 ? "s" : ""} selected</span>
          <button onClick={() => onFilesChange([])} className="hover:text-red-400 transition-colors">Clear all</button>
        </div>
      )}
    </div>
  );
}