import { NextResponse } from "next/server";
import { createProject, listProjects, type ProjectSettings, type ProjectType } from "@/lib/projects";
import { getSessionUserId } from "@/lib/session";

const projectTypes = new Set<ProjectType>(["video", "text", "pdf", "italian", "voice"]);

function asSettings(value: unknown): ProjectSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([, item]) => typeof item === "string" || typeof item === "boolean").slice(0, 30));
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ projects: await listProjects(userId) }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const type = body.type;
    const sourceText = typeof body.sourceText === "string" ? body.sourceText : "";
    const durationSeconds = Number(body.durationSeconds ?? 15);
    if (typeof type !== "string" || !projectTypes.has(type as ProjectType)) {
      return NextResponse.json({ error: "Unsupported project type." }, { status: 400 });
    }
    const projectId = await createProject({
      userId,
      type: type as ProjectType,
      sourceText,
      sourceFileName: typeof body.sourceFileName === "string" ? body.sourceFileName : null,
      settings: asSettings(body.settings),
      durationSeconds,
    });
    return NextResponse.json({ projectId }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Project could not be created.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
