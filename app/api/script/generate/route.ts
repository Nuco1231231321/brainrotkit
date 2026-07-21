import { NextResponse } from "next/server";
import { generateBrainrotScript } from "@/lib/kie";
import { getSessionUserId } from "@/lib/session";

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Sign in to generate a script." }, { status: 401 });

  try {
    const body = await request.json() as {
      sourceText?: string;
      durationSeconds?: number;
      contentFormat?: string;
      tone?: string;
      projectType?: string;
    };
    const sourceText = typeof body.sourceText === "string" ? body.sourceText.trim() : "";
    if (sourceText.length < 8) {
      return NextResponse.json({ error: "Add at least 8 characters." }, { status: 400 });
    }
    const durationSeconds = Number(body.durationSeconds ?? 15);
    const result = await generateBrainrotScript({
      projectType: body.projectType === "pdf" ? "pdf" : body.projectType === "italian" ? "italian" : "text",
      sourceText,
      durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : 15,
      settings: {
        contentFormat: body.contentFormat === "debate" || body.contentFormat === "study" ? body.contentFormat : "story",
        tone: typeof body.tone === "string" ? body.tone : "Fast-paced",
      },
    });
    return NextResponse.json({ script: result.script });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Script could not be generated.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}