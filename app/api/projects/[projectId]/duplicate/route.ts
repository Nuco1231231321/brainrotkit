import { NextResponse } from "next/server";
import { duplicateProject } from "@/lib/projects";
import { getSessionUserId } from "@/lib/session";

export async function POST(_request: Request, context: { params: Promise<{ projectId: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await context.params;
  try {
    const duplicatedProjectId = await duplicateProject(userId, projectId);
    if (!duplicatedProjectId) return NextResponse.json({ error: "Project not found." }, { status: 404 });
    return NextResponse.json({ projectId: duplicatedProjectId }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The project could not be duplicated.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
