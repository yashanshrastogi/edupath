import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduPath AI - Your AI-Powered Career and Learning Platform",
  description:
    "Build personalized learning roadmaps, verify skills, connect with mentors, and accelerate your tech career with EduPath AI.",
  keywords: ["learning", "career", "AI", "roadmap", "resume", "skills", "mentorship"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full">
      <body className="h-full">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
