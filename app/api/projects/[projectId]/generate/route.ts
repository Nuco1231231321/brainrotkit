import { NextResponse } from "next/server";
import { startProjectGeneration } from "@/lib/generation";
import { getSessionUserId } from "@/lib/session";

export async function POST(_request: Request, context: { params: Promise<{ projectId: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await context.params;
  try {
    const jobId = await startProjectGeneration(userId, projectId);
    return NextResponse.json({ jobId, status: "processing" }, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation could not be started.";
    const status = message.includes("not found") ? 404 : message.includes("credits") ? 402 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
