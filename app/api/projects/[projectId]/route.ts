import { NextResponse } from "next/server";
import { deleteProject, getProject, updateProject } from "@/lib/projects";
import { refreshProjectGeneration } from "@/lib/generation";
import { getSessionUserId } from "@/lib/session";

type RouteContext = { params: Promise<{ projectId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await context.params;
  await refreshProjectGeneration(userId, projectId);
  const project = await getProject(userId, projectId);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  return NextResponse.json({ project }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PATCH(request: Request, context: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await context.params;
  try {
    const updated = await updateProject(userId, projectId, await request.json());
    if (!updated) return NextResponse.json({ error: "Project not found." }, { status: 404 });
    return NextResponse.json({ project: await getProject(userId, projectId) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Project could not be saved.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await context.params;
  try {
    const deleted = await deleteProject(userId, projectId);
    if (!deleted) return NextResponse.json({ error: "Project not found." }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Project could not be deleted.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
