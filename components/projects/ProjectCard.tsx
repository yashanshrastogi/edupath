"use client";

import { CheckCircle, ExternalLink, Play } from "lucide-react";

export type ProjectCardProject = {
  id: string;
  title: string;
  summary: string;
  difficulty: string;
  stack: string[];
  estimatedHours: number;
  repoUrl: string;
  requirements: string[];
};

export type ProjectCardUserProject = {
  id: string;
  progress: number;
  status: string;
};

type ProjectCardProps = {
  project: ProjectCardProject;
  userProject?: ProjectCardUserProject;
  difficultyColor: string;
  isStarting: boolean;
  onStart: (projectId: string) => void;
};

export default function ProjectCard({
  project,
  userProject,
  difficultyColor,
  isStarting,
  onStart,
}: ProjectCardProps) {
  return (
    <div className="card flex flex-col glass-hover" style={{ borderTop: `3px solid ${difficultyColor}` }}>
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <span
            className="badge text-xs"
            style={{ background: `${difficultyColor}15`, color: difficultyColor, border: `1px solid ${difficultyColor}30` }}
          >
            {project.difficulty}
          </span>
          <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
            ~{project.estimatedHours}h
          </span>
        </div>
        <h3 className="text-xl font-bold font-display mb-2">{project.title}</h3>
        <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {project.summary}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.stack.map((item) => <span key={item} className="tag">{item}</span>)}
        </div>

        <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
          Requirements
        </h4>
        <ul className="space-y-1.5 mb-5">
          {project.requirements.slice(0, 3).map((requirement, index) => (
            <li key={`${project.id}-${index}`} className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
              <CheckCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: difficultyColor }} />
              <span className="leading-tight">{requirement}</span>
            </li>
          ))}
          {project.requirements.length > 3 && (
            <li className="text-xs italic" style={{ color: "var(--text-muted)" }}>
              + {project.requirements.length - 3} more
            </li>
          )}
        </ul>
      </div>

      <div className="pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        {userProject ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">{userProject.status.replace("_", " ")}</span>
              <span className="font-bold" style={{ color: difficultyColor }}>{userProject.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${userProject.progress}%`, background: difficultyColor }} />
            </div>
            <a className="btn-secondary w-full justify-center" href={project.repoUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={14} /> Open Repository
            </a>
          </div>
        ) : (
          <button
            className="btn-primary w-full justify-center"
            onClick={() => onStart(project.id)}
            disabled={isStarting}
          >
            <Play size={14} /> {isStarting ? "Preparing Environment..." : "Start Project Session"}
          </button>
        )}
      </div>
    </div>
  );
}
