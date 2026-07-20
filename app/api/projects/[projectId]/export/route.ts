import { NextResponse } from "next/server";
import { saveProjectExport } from "@/lib/projects";
import { maxGeneratedMediaBytes } from "@/lib/storage";
import { getSessionUserId } from "@/lib/session";

export async function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await context.params;
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "video/mp4") {
    return NextResponse.json({ error: "Final exports must be MP4 video files." }, { status: 415 });
  }
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxGeneratedMediaBytes) {
    return NextResponse.json({ error: "The final export exceeds the 80 MB project limit." }, { status: 413 });
  }
  try {
    const bytes = await request.arrayBuffer();
    if (!bytes.byteLength || bytes.byteLength > maxGeneratedMediaBytes) {
      return NextResponse.json({ error: "The final export is empty or exceeds the 80 MB project limit." }, { status: 413 });
    }
    const project = await saveProjectExport(userId, projectId, bytes);
    if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
    return NextResponse.json({ project }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The final export could not be saved.";
    const status = message === "Project not found." ? 404 : message.includes("finish generating") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
