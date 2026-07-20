import { NextResponse } from "next/server";
import { prepareProjectScript } from "@/lib/projects";
import { getSessionUserId } from "@/lib/session";

export async function POST(_request: Request, context: { params: Promise<{ projectId: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await context.params;
  try {
    const project = await prepareProjectScript(userId, projectId);
    return NextResponse.json({ project }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Script could not be prepared.";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}