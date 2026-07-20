"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import Image from "next/image";
import Link from "next/link";
import { Check, Copy, Download, LoaderCircle, MoreHorizontal, Pencil, Plus, Trash2, Video, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ProjectStatus, ProjectSummary } from "@/lib/projects";

const filters: ("all" | ProjectStatus)[] = ["all", "draft", "processing", "completed", "failed"];

function relativeTime(timestamp: number) {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1_000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

async function readProjects() {
  const response = await fetch("/api/projects", { cache: "no-store" });
  const payload = await response.json() as { projects?: ProjectSummary[]; error?: string };
  if (!response.ok || !payload.projects) throw new Error(payload.error ?? "Projects could not be loaded.");
  return payload.projects;
}

export function ProjectDashboard() {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [sort, setSort] = useState<"updated" | "name" | "type">("updated");
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let timer: number | undefined;
    async function load() {
      try {
        const nextProjects = await readProjects();
        if (!active) return;
        setProjects(nextProjects);
        setError("");
        setLoading(false);
        if (nextProjects.some((project) => project.status === "processing")) {
          timer = window.setTimeout(load, 5_000);
        }
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Projects could not be loaded.");
        setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const visibleProjects = useMemo(() => {
    const filtered = filter === "all" ? projects : projects.filter((project) => project.status === filter);
    if (sort === "name") return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "type") return [...filtered].sort((a, b) => a.typeLabel.localeCompare(b.typeLabel));
    return [...filtered].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [filter, projects, sort]);

  async function removeProject(id: string) {
    setNotice("");
    const response = await fetch(`/api/projects/${encodeURIComponent(id)}`, { method: "DELETE" });
    const payload = await response.json() as { error?: string };
    if (!response.ok) {
      setNotice(payload.error ?? "Project could not be deleted.");
      return;
    }
    setProjects((current) => current.filter((project) => project.id !== id));
    setNotice("Project and its stored media were deleted.");
  }

  async function renameProject(id: string, title: string) {
    const nextTitle = title.trim();
    if (!nextTitle) return false;
    const response = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: nextTitle }),
    });
    const payload = await response.json() as { project?: ProjectSummary; error?: string };
    if (!response.ok || !payload.project) {
      setNotice(payload.error ?? "Project could not be renamed.");
      return false;
    }
    setProjects((current) => current.map((project) => project.id === id ? { ...project, title: payload.project!.title, updatedAt: payload.project!.updatedAt } : project));
    setNotice(`Project renamed to ${payload.project.title}.`);
    return true;
  }

  async function duplicateExistingProject(id: string) {
    setNotice("Creating an editable copy…");
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(id)}/duplicate`, { method: "POST" });
      const payload = await response.json() as { projectId?: string; error?: string };
      if (!response.ok || !payload.projectId) {
        setNotice(payload.error ?? "The project could not be duplicated.");
        return false;
      }
      router.push(`/app/projects/${encodeURIComponent(payload.projectId)}`);
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The project could not be duplicated.");
      return false;
    }
  }

  if (loading) return <div className="empty-state" role="status"><p>Loading your projects…</p></div>;
  if (error) return <div className="empty-state" role="alert"><h2>Projects could not load</h2><p>{error}</p><button className="button-secondary" type="button" onClick={() => window.location.reload()}>Retry</button></div>;

  return (
    <>
      {projects.length ? (
        <div className="project-toolbar">
          <div className="project-filters" role="group" aria-label="Filter projects">
            {filters.map((item) => <button key={item} type="button" className={filter === item ? "active" : undefined} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}
          </div>
          <select aria-label="Sort projects" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="updated">Recently updated</option><option value="name">Project name</option><option value="type">Project type</option></select>
        </div>
      ) : null}

      {notice ? <p className="project-notice" role="status">{notice}</p> : null}

      {visibleProjects.length ? (
        <div className="project-grid">
          {visibleProjects.map((project) => <ProjectCard key={project.id} project={project} onDelete={() => removeProject(project.id)} onRename={(title) => renameProject(project.id, title)} onDuplicate={() => duplicateExistingProject(project.id)} />)}
        </div>
      ) : (
        <div className="empty-state">
          <Plus aria-hidden="true" size={24} />
          <h2>{projects.length ? `No ${filter} projects` : "No projects yet"}</h2>
          <p>{projects.length ? "Choose another filter or create a new project." : "Create a text video, PDF study clip, character or voice project."}</p>
          <Link href="/text-to-brainrot" className="button-primary">Create project</Link>
        </div>
      )}
    </>
  );
}

function ProjectCard({ project, onDelete, onRename, onDuplicate }: {
  project: ProjectSummary;
  onDelete: () => Promise<void>;
  onRename: (title: string) => Promise<boolean>;
  onDuplicate: () => Promise<boolean>;
}) {
  const [renaming, setRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(project.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const statusCopy = project.status === "completed"
    ? project.type === "voice" || project.outputIsFinal ? "Ready to download" : "Assets ready · finish export"
    : project.status === "processing"
      ? "Generation in progress"
      : project.status === "failed"
        ? project.errorMessage ?? "Generation needs attention"
        : "Continue editing";

  async function finishRename() {
    if (await onRename(draftTitle)) setRenaming(false);
  }

  async function duplicate() {
    setDuplicating(true);
    setMenuOpen(false);
    if (!(await onDuplicate())) setDuplicating(false);
  }

  return (
    <article className="project-card">
      <Link href={`/app/projects/${project.id}`} className="project-poster">
        {project.posterUrl
          ? <Image src={project.posterUrl} alt={`${project.title} project preview`} fill sizes="(max-width: 520px) 50vw, (max-width: 820px) 33vw, 20vw" unoptimized />
          : <span className="project-placeholder" aria-hidden="true"><Video size={28} /></span>}
        <span className={`project-status ${project.status}`}>{project.status}</span>
        <span className="project-duration">0:{String(project.durationSeconds).padStart(2, "0")}</span>
      </Link>
      <div className="project-card-copy">
        <div>
          {renaming ? (
            <form className="project-rename-form" onSubmit={(event) => { event.preventDefault(); void finishRename(); }}>
              <input aria-label={`Rename ${project.title}`} value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} autoFocus />
              <button type="submit" aria-label="Save project name"><Check aria-hidden="true" size={13} /></button>
              <button type="button" aria-label="Cancel rename" onClick={() => { setDraftTitle(project.title); setRenaming(false); }}><X aria-hidden="true" size={13} /></button>
            </form>
          ) : <h2><Link href={`/app/projects/${project.id}`}>{project.title}</Link></h2>}
          <p>{project.typeLabel} · {relativeTime(project.updatedAt)}</p>
          <span className={`project-status-copy ${project.status}`}>{statusCopy}</span>
        </div>
        <details className="project-menu" open={menuOpen} onToggle={(event) => setMenuOpen(event.currentTarget.open)}>
          <summary aria-label={`Open actions for ${project.title}`}><MoreHorizontal aria-hidden="true" size={18} /></summary>
          <div>
            {project.status === "completed" && project.outputUrl && (project.type === "voice" || project.outputIsFinal) ? <a href={`${project.outputUrl}?download=1`} onClick={() => setMenuOpen(false)}><Download aria-hidden="true" size={14} /> Download</a> : null}
            <button type="button" disabled={duplicating} onClick={() => void duplicate()}>{duplicating ? <LoaderCircle aria-hidden="true" size={14} /> : <Copy aria-hidden="true" size={14} />} {project.status === "completed" ? "Remix" : "Duplicate"}</button>
            <button type="button" onClick={() => { setRenaming(true); setMenuOpen(false); }}><Pencil aria-hidden="true" size={14} /> Rename</button>
            <AlertDialog.Root>
              <AlertDialog.Trigger asChild><button type="button" className="danger"><Trash2 aria-hidden="true" size={14} /> Delete</button></AlertDialog.Trigger>
              <AlertDialog.Portal>
                <AlertDialog.Overlay className="dialog-overlay" />
                <AlertDialog.Content className="dialog-content">
                  <AlertDialog.Title>Delete {project.title}?</AlertDialog.Title>
                  <AlertDialog.Description>This permanently removes the project and its generated files.</AlertDialog.Description>
                  <div className="dialog-actions"><AlertDialog.Cancel asChild><button type="button" className="button-secondary">Cancel</button></AlertDialog.Cancel><AlertDialog.Action asChild><button type="button" className="button-danger" onClick={() => void onDelete()}>Delete project</button></AlertDialog.Action></div>
                </AlertDialog.Content>
              </AlertDialog.Portal>
            </AlertDialog.Root>
          </div>
        </details>
      </div>
    </article>
  );
}
