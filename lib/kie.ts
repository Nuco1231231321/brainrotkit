import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  defaultContentFormat,
  normalizeBrainrotScript,
  wordLimitForDuration,
  type BrainrotScript,
  type ContentFormat,
} from "@/lib/brainrot-script";

export type { BrainrotScene, BrainrotScript } from "@/lib/brainrot-script";

const kieApiBaseUrl = "https://api.kie.ai";
const kieRequestTimeoutMs = 30_000;

export const kieModels = {
  script: "gpt-5-6-luna",
  image: "seedream/5-pro-text-to-image",
  voice: "google/gemini-2-5-pro-tts",
  video: "grok-imagine-video-1-5-preview",
} as const;

type KieEnvironment = CloudflareEnv & {
  KIE_API_KEY?: string;
  KIE_WEBHOOK_SECRET?: string;
  NEXT_PUBLIC_SITE_URL?: string;
};

export type BrainrotScriptResult = {
  script: BrainrotScript;
  creditsConsumed: number;
};

export type ScriptRequest = {
  projectType: "video" | "text" | "pdf" | "italian";
  sourceText: string;
  durationSeconds: number;
  settings: Record<string, string | boolean>;
};

export type KieTaskState = "waiting" | "queuing" | "generating" | "success" | "fail";

export type KieTaskRecord = {
  taskId: string;
  model: string;
  state: KieTaskState;
  resultUrls: string[];
  failCode: string | null;
  failMessage: string | null;
  progress: number;
  creditsConsumed: number;
  rawResult: unknown;
};

export class KieApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: number | string | null = null,
  ) {
    super(message);
    this.name = "KieApiError";
  }
}

async function getKieEnvironment() {
  const { env } = await getCloudflareContext({ async: true });
  return env as KieEnvironment;
}

export async function getKieWebhookSecret() {
  const environment = await getKieEnvironment();
  const secret = environment.KIE_WEBHOOK_SECRET;
  if (!secret) throw new Error("KIE_WEBHOOK_SECRET is not configured.");
  return secret;
}

export async function getKieCallbackUrl() {
  const environment = await getKieEnvironment();
  const siteUrl = environment.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) throw new Error("NEXT_PUBLIC_SITE_URL is not configured.");
  return new URL("/api/webhooks/kie", siteUrl).toString();
}

async function kieFetch(path: string, init: RequestInit = {}, timeoutMs = kieRequestTimeoutMs) {
  const environment = await getKieEnvironment();
  if (!environment.KIE_API_KEY) throw new Error("KIE_API_KEY is not configured.");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${kieApiBaseUrl}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${environment.KIE_API_KEY}`,
        ...init.headers,
      },
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new KieApiError("Kie did not respond before the request timeout.", 504);
    }
    throw new KieApiError("Kie could not be reached.", 502);
  } finally {
    clearTimeout(timeout);
  }
}

async function readKieJson(response: Response) {
  const raw = await response.text();
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new KieApiError("Kie returned an invalid JSON response.", response.status || 502);
  }

  if (!response.ok) {
    const record = payload as { code?: unknown; msg?: unknown };
    throw new KieApiError(
      typeof record.msg === "string" ? record.msg : `Kie request failed with status ${response.status}.`,
      response.status,
      typeof record.code === "number" || typeof record.code === "string" ? record.code : null,
    );
  }
  return payload;
}

function parseTaskId(payload: unknown) {
  const record = payload as { code?: unknown; msg?: unknown; data?: { taskId?: unknown } };
  if (record.code !== 200 || typeof record.data?.taskId !== "string" || !record.data.taskId) {
    throw new KieApiError(
      typeof record.msg === "string" ? record.msg : "Kie did not return a task identifier.",
      502,
      typeof record.code === "number" || typeof record.code === "string" ? record.code : null,
    );
  }
  return record.data.taskId;
}

export async function createKieTask(model: string, input: Record<string, unknown>) {
  const response = await kieFetch("/api/v1/jobs/createTask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      callBackUrl: await getKieCallbackUrl(),
      input,
    }),
  });
  return parseTaskId(await readKieJson(response));
}

function parseResultJson(value: unknown) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function collectResultUrls(result: unknown) {
  const urlKeys = new Set(["resultUrls", "result_urls", "urls", "url", "audioUrl", "audio_url", "videoUrl", "video_url", "imageUrl", "image_url", "downloadUrl", "download_url"]);
  const urls: string[] = [];
  function visit(value: unknown, depth = 0) {
    if (depth > 6 || value === null || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach((item) => visit(item, depth + 1));
      return;
    }
    const record = value as Record<string, unknown>;
    for (const [key, nested] of Object.entries(record)) {
      if (urlKeys.has(key)) {
        const values = Array.isArray(nested) ? nested : [nested];
        values.forEach((candidate) => {
          if (typeof candidate !== "string") return;
          try {
            if (new URL(candidate).protocol === "https:") urls.push(candidate);
          } catch {
            // Ignore non-URL metadata fields.
          }
        });
      }
      visit(nested, depth + 1);
    }
  }
  visit(result);
  return [...new Set(urls)];
}

export function parseKieTaskData(data: unknown): KieTaskRecord {
  const record = data as {
    taskId?: unknown;
    task_id?: unknown;
    model?: unknown;
    state?: unknown;
    resultJson?: unknown;
    result_json?: unknown;
    failCode?: unknown;
    failMsg?: unknown;
    fail_message?: unknown;
    progress?: unknown;
    creditsConsumed?: unknown;
    credits_consumed?: unknown;
  };
  const taskId = typeof record.taskId === "string"
    ? record.taskId
    : typeof record.task_id === "string"
      ? record.task_id
      : "";
  const state = record.state;
  if (!taskId || !["waiting", "queuing", "generating", "success", "fail"].includes(String(state))) {
    throw new KieApiError("Kie returned an invalid task record.", 502);
  }

  const rawResult = parseResultJson(record.resultJson ?? record.result_json);
  const consumed = Number(record.creditsConsumed ?? record.credits_consumed ?? 0);
  const progress = Number(record.progress ?? 0);
  return {
    taskId,
    model: typeof record.model === "string" ? record.model : "",
    state: state as KieTaskState,
    resultUrls: collectResultUrls(rawResult),
    failCode: typeof record.failCode === "string" && record.failCode ? record.failCode : null,
    failMessage: typeof record.failMsg === "string"
      ? record.failMsg
      : typeof record.fail_message === "string"
        ? record.fail_message
        : null,
    progress: Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0,
    creditsConsumed: Number.isFinite(consumed) ? Math.max(0, consumed) : 0,
    rawResult,
  };
}

export async function getKieTask(taskId: string) {
  if (!/^[a-zA-Z0-9_-]{6,160}$/.test(taskId)) {
    throw new KieApiError("The Kie task identifier is invalid.", 400);
  }
  const response = await kieFetch(`/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`);
  const payload = await readKieJson(response) as { code?: unknown; msg?: unknown; data?: unknown };
  // Kie's published task-detail example currently uses code 505 together
  // with msg "success" and a complete task record. The record itself is the
  // reliable source of truth, so accept any HTTP-success response with data.
  if (!payload.data) {
    throw new KieApiError(
      typeof payload.msg === "string" ? payload.msg : "Kie task details were unavailable.",
      502,
      typeof payload.code === "number" || typeof payload.code === "string" ? payload.code : null,
    );
  }
  return parseKieTaskData(payload.data);
}

export async function getKieCreditBalance() {
  const response = await kieFetch("/api/v1/chat/credit");
  const payload = await readKieJson(response) as { code?: unknown; msg?: unknown; data?: unknown };
  const balance = Number(payload.data);
  if (payload.code !== 200 || !Number.isFinite(balance) || balance < 0) {
    throw new KieApiError("Kie returned an invalid credit balance.", 502);
  }
  return balance;
}

function extractResponseText(payload: unknown) {
  const response = payload as {
    status?: unknown;
    output?: Array<{ type?: unknown; content?: Array<{ type?: unknown; text?: unknown }> }>;
    credits_consumed?: unknown;
  };
  const text = response.output
    ?.flatMap((item) => item.type === "message" && Array.isArray(item.content) ? item.content : [])
    .find((item) => item.type === "output_text" && typeof item.text === "string")?.text;
  if (response.status !== "completed" || typeof text !== "string" || !text.trim()) {
    throw new KieApiError("Kie did not return a completed script response.", 502);
  }
  const creditsConsumed = Number(response.credits_consumed ?? 0);
  return {
    text: text.trim(),
    creditsConsumed: Number.isFinite(creditsConsumed) ? Math.max(0, creditsConsumed) : 0,
  };
}

function parseJsonObject(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = (fenced ?? text).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) throw new KieApiError("Kie returned a script in an unsupported format.", 502);
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as unknown;
  } catch {
    throw new KieApiError("Kie returned malformed script JSON.", 502);
  }
}

function validateScript(value: unknown, fallbackFormat: ContentFormat): BrainrotScript {
  const script = normalizeBrainrotScript(value, fallbackFormat);
  if (!script.title || !script.hook || !script.narration || !script.dialogue.length || !script.scenes.length) {
    throw new KieApiError("Kie returned an incomplete script.", 502);
  }
  if (script.contentFormat === "debate" && script.speakers.length < 2) {
    throw new KieApiError("Kie returned a debate without two speakers.", 502);
  }
  return script;
}

export async function generateBrainrotScript(request: ScriptRequest): Promise<BrainrotScriptResult> {
  const sourceText = request.sourceText.trim().slice(0, 50_000);
  if (sourceText.length < 8) throw new KieApiError("The source is too short to create a script.", 400);

  const settings = Object.entries(request.settings)
    .filter(([, value]) => typeof value === "string" || typeof value === "boolean")
    .slice(0, 20)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join("\n");
  const contentFormat = defaultContentFormat(request.projectType, request.settings);
  const targetScenes = Math.max(1, Math.min(8, Number(request.settings.sceneCount) || Math.ceil(request.durationSeconds / 6)));
  const maximumNarrationWords = wordLimitForDuration(request.durationSeconds, contentFormat);
  const prompt = [
    "You create concise, production-ready vertical short-video plans for a real editor.",
    "Return only valid JSON. Do not use markdown or commentary.",
    `Project type: ${request.projectType}`,
    `Content format: ${contentFormat}`,
    `Target duration: ${request.durationSeconds} seconds`,
    `Target scene count: ${targetScenes}`,
    `Narration word limit: 12 to ${maximumNarrationWords} words total`,
    "The result must use this exact structure:",
    '{"version":2,"contentFormat":"story|debate|study","studyMode":"explain|quiz|summary","title":"...","hook":"...","narration":"...","voiceDirection":"...","speakers":[{"id":"...","name":"...","role":"narrator|host|challenger|teacher|student","voicePreset":"Milano Rush|Opera Max|Narrator Zero|Soft Study","captionColor":"#d1fe17"}],"dialogue":[{"id":"turn-1","speakerId":"...","text":"...","emotion":"neutral|excited|skeptical|angry|surprised|calm","sceneId":"scene-1"}],"sourceReferences":[{"label":"Page 1","excerpt":"..."}],"scenes":[{"label":"...","narration":"...","imagePrompt":"...","motionPrompt":"..."}]}',
    "The narration field must equal the dialogue text joined in order and obey the word limit. Use original characters only. Never imitate a real person or copyrighted character.",
    contentFormat === "debate"
      ? "Debate rules: use exactly two speakers, alternate for 8 to 12 short turns, start with a provocative hook, include a specific disagreement, escalate, then land a surprising or useful conclusion. Each turn should be easy to say in one breath."
      : contentFormat === "study"
        ? "Study rules: use only facts supported by the source. Explain one concept at a time. For quiz mode, ask a question, pause conceptually, then provide the answer. Add sourceReferences with page labels when the source contains page markers."
        : "Story rules: hook the viewer immediately, establish a concrete conflict, escalate once, reveal a twist or payoff, and end with a concise share/comment prompt.",
    "Image prompts must describe a clear 9:16 composition without text overlays. Motion prompts must describe camera movement and subject action.",
    settings ? `User settings:\n${settings}` : "",
    `Source:\n${sourceText}`,
  ].filter(Boolean).join("\n\n");

  const response = await kieFetch("/codex/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: kieModels.script,
      stream: false,
      input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      reasoning: { effort: "low" },
    }),
  }, 90_000);
  const result = extractResponseText(await readKieJson(response));
  return {
    script: validateScript(parseJsonObject(result.text), contentFormat),
    creditsConsumed: result.creditsConsumed,
  };
}

export function estimateKieProviderCredits(projectType: string, durationSeconds: number) {
  if (projectType === "voice") return 5;
  return Math.ceil(7 + 5 + (9.5 * Math.min(durationSeconds, 15)));
}
