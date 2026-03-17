import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "ResumeRank · AI Candidate Ranker",
  description: "Rank candidates instantly with local AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#0d0d0f", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a20",
              color: "#fff",
              border: "1px solid #2a2a35",
              fontSize: "13px",
              borderRadius: "12px",
            },
          }}
        />
      </body>
    </html>
  );
}