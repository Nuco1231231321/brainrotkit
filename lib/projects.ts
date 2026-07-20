import "server-only";

import { defaultContentFormat, normalizeBrainrotScript, type BrainrotDialogueTurn, type BrainrotScene, type BrainrotScript, type BrainrotSpeaker } from "@/lib/brainrot-script";
import { normalizeAudioTimeline, type AudioTimeline } from "@/lib/audio-timeline";
import { getDatabase } from "@/lib/cloudflare";
import { generateBrainrotScript, kieModels } from "@/lib/kie";
import { creditCostForRender, getRenderMode } from "@/lib/render-modes";
import { deleteStoredMedia, uploadGeneratedBytes } from "@/lib/storage";

export type ProjectType = "video" | "text" | "pdf" | "italian" | "voice";
export type ProjectStatus = "draft" | "processing" | "completed" | "failed";

export type ProjectSettings = Record<string, string | boolean>;

export type ProjectSummary = {
  id: string;
  title: string;
  type: ProjectType;
  typeLabel: string;
  status: ProjectStatus;
  durationSeconds: number;
  updatedAt: number;
  posterUrl: string | null;
  outputUrl: string | null;
  outputIsFinal: boolean;
  errorMessage: string | null;
};

export type ProjectDetail = ProjectSummary & {
  sourceText: string;
  sourceFileName: string | null;
  narrationUrl: string | null;
  audioSegments: Array<{
    url: string;
    sequence: number;
    speakerId: string | null;
    timeline: AudioTimeline | null;
  }>;
  motionUrl: string | null;
  settings: ProjectSettings;
  script: BrainrotScript;
  job: {
    id: string;
    status: "queued" | "processing" | "completed" | "failed";
    createdAt: number;
    reservedCredits: number;
    chargedCredits: number;
    providerCredits: number;
    errorMessage: string | null;
    steps: Array<{
      kind: "image" | "voice" | "video";
      status: "pending" | "submitted" | "processing" | "finalizing" | "completed" | "failed";
      sequence: number;
      progress: number;
      errorMessage: string | null;
    }>;
  } | null;
};

type ProjectRow = {
  id: string;
  title: string;
  type: ProjectType;
  status: ProjectStatus;
  source_text: string;
  source_file_name: string | null;
  settings_json: string;
  script_json: string;
  duration_seconds: number;
  poster_asset_id: string | null;
  output_asset_id: string | null;
  output_provider_url: string | null;
  error_message: string | null;
  updated_at: number;
};

type JobRow = {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  created_at: number;
  reserved_credits: number;
  charged_credits: number;
  provider_credits: number;
  error_message: string | null;
};

type StepRow = {
  kind: "image" | "voice" | "video";
  status: "pending" | "submitted" | "processing" | "finalizing" | "completed" | "failed";
  sequence: number;
  result_json: string | null;
  error_message: string | null;
  input_json?: string | null;
};

export const projectTypeLabels: Record<ProjectType, string> = {
  video: "AI video",
  text: "Text video",
  pdf: "PDF video",
  italian: "Italian character",
  voice: "Voice",
};

function mediaUrl(assetId: string | null, download = false) {
  if (!assetId) return null;
  return `/api/media/${encodeURIComponent(assetId)}${download ? "?download=1" : ""}`;
}

function parseJson<T>(value: string, context: string) {
  try {
    return JSON.parse(value) as T;
  } catch {
    throw new Error(`${context} contains invalid JSON.`);
  }
}

function flatRecordSignature(value: ProjectSettings) {
  return JSON.stringify(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)));
}

function mapSummary(row: ProjectRow, outputIsFinal = row.type === "voice"
  ? Boolean(row.output_asset_id)
  : Boolean(row.output_asset_id) && row.output_provider_url === null): ProjectSummary {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    typeLabel: projectTypeLabels[row.type],
    status: row.status,
    durationSeconds: row.duration_seconds,
    updatedAt: row.updated_at,
    posterUrl: mediaUrl(row.poster_asset_id),
    outputUrl: mediaUrl(row.output_asset_id),
    outputIsFinal,
    errorMessage: row.error_message,
  };
}

function createVoiceScript(sourceText: string): BrainrotScript {
  const narration = sourceText.replace(/\s+/g, " ").trim().slice(0, 4_000);
  const titleWords = narration.split(" ").slice(0, 6).join(" ");
  return {
    version: 2,
    contentFormat: "story",
    title: titleWords || "Voice narration",
    hook: narration,
    narration,
    voiceDirection: "Clear, expressive English narration",
    speakers: [{
      id: "speaker-narrator",
      name: "Narrator",
      role: "narrator",
      voicePreset: "Milano Rush",
      captionColor: "#d1fe17",
    }],
    dialogue: [{
      id: "turn-1",
      speakerId: "speaker-narrator",
      text: narration,
      emotion: "neutral",
      sceneId: "scene-1",
    }],
    scenes: [{
      id: "scene-1",
      label: "Narration",
      narration,
      imagePrompt: "Minimal audio cover artwork, bold graphic composition, no text",
      motionPrompt: "Static audio cover",
    }],
  };
}

/** Instant local draft so the user can open the editor without waiting on Kie. */
function createQuickScript(input: {
  type: ProjectType;
  sourceText: string;
  durationSeconds: number;
  settings: ProjectSettings;
}): BrainrotScript {
  const cleaned = input.sourceText.replace(/\s+/g, " ").trim().slice(0, 4_000);
  const format = defaultContentFormat(input.type, input.settings);
  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const chunks = (sentences.length ? sentences : [cleaned]).slice(0, Math.max(3, Math.min(8, Math.ceil(input.durationSeconds / 6))));
  const title = cleaned.split(" ").slice(0, 7).join(" ") || "Untitled Brainrot";
  const hook = chunks[0] || cleaned;
  const narration = chunks.join(" ");

  if (format === "debate") {
    const speakers = [
      { id: "speaker-nova", name: "Nova", role: "host" as const, voicePreset: "Milano Rush", captionColor: "#d1fe17" },
      { id: "speaker-riff", name: "Riff", role: "challenger" as const, voicePreset: "Opera Max", captionColor: "#77d8ff" },
    ];
    const dialogue = chunks.map((text, index) => ({
      id: `turn-${index + 1}`,
      speakerId: speakers[index % 2].id,
      text,
      emotion: "neutral" as const,
      sceneId: `scene-${Math.floor(index / 2) + 1}`,
    }));
    const sceneCount = Math.max(1, Math.ceil(chunks.length / 2));
    const scenes = Array.from({ length: sceneCount }, (_, index) => {
      const lines = chunks.slice(index * 2, index * 2 + 2);
      return {
        id: `scene-${index + 1}`,
        label: `Beat ${index + 1}`,
        narration: lines.join(" "),
        imagePrompt: `Vertical short-form scene for: ${lines[0] || hook}. Original characters, no text overlays.`,
        motionPrompt: "Subtle forward motion, continuous camera energy",
      };
    });
    return normalizeBrainrotScript({
      version: 2,
      contentFormat: "debate",
      title,
      hook,
      narration: dialogue.map((turn) => turn.text).join(" "),
      voiceDirection: "Two distinct hosts trading short, punchy turns",
      speakers,
      dialogue,
      scenes,
    }, "debate");
  }

  const scenes = chunks.map((text, index) => ({
    id: `scene-${index + 1}`,
    label: format === "study" ? `Point ${index + 1}` : `Scene ${index + 1}`,
    narration: text,
    imagePrompt: `Vertical short-form visual for: ${text.slice(0, 160)}. Original composition, no captions or logos.`,
    motionPrompt: format === "study" ? "Calm clarifying motion" : "Energetic continuous motion",
  }));

  return normalizeBrainrotScript({
    version: 2,
    contentFormat: format,
    studyMode: format === "study" ? (typeof input.settings.studyMode === "string" ? input.settings.studyMode : "explain") : undefined,
    title,
    hook,
    narration,
    voiceDirection: format === "study"
      ? "Clear teaching voice with short pauses"
      : "Fast, clear short-form narration",
    speakers: format === "study"
      ? [{ id: "speaker-narrator", name: "Study Guide", role: "teacher", voicePreset: "Soft Study", captionColor: "#d1fe17" }]
      : [{ id: "speaker-narrator", name: "Narrator", role: "narrator", voicePreset: "Milano Rush", captionColor: "#d1fe17" }],
    dialogue: [{
      id: "turn-1",
      speakerId: "speaker-narrator",
      text: narration,
      emotion: "neutral",
      sceneId: "scene-1",
    }],
    scenes,
  }, format);
}

export async function createProject(input: {
  userId: string;
  type: ProjectType;
  sourceText: string;
  sourceFileName?: string | null;
  settings: ProjectSettings;
  durationSeconds: number;
}) {
  const sourceText = input.sourceText.replace(/\u0000/g, "").trim().slice(0, 50_000);
  if (sourceText.length < 8) throw new Error("Add at least 8 characters before creating a project.");
  if (!Number.isInteger(input.durationSeconds) || input.durationSeconds < 5 || input.durationSeconds > 60) {
    throw new Error("Project duration must be between 5 and 60 seconds.");
  }

  const id = crypto.randomUUID();
  const now = Date.now();
  const db = await getDatabase();
  // Open the editor immediately. AI script polish happens in the editor via prepareProjectScript.
  const script = input.type === "voice"
    ? createVoiceScript(sourceText)
    : createQuickScript({
      type: input.type,
      sourceText,
      durationSeconds: input.durationSeconds,
      settings: input.settings,
    });
  const settings: ProjectSettings = {
    ...input.settings,
    scriptSource: input.type === "voice" ? "ready" : "provisional",
  };

  await db.prepare(
    `INSERT INTO projects (
      id, user_id, type, title, status, source_text, source_file_name,
      settings_json, script_json, duration_seconds, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    id,
    input.userId,
    input.type,
    script.title,
    sourceText,
    input.sourceFileName?.slice(0, 240) ?? null,
    JSON.stringify(settings),
    JSON.stringify(script),
    input.durationSeconds,
    now,
    now,
  ).run();
  return id;
}

/** Upgrade a provisional draft script with Kie AI after the user is already in the editor. */
export async function prepareProjectScript(userId: string, projectId: string) {
  const project = await getProject(userId, projectId);
  if (!project) throw new Error("Project not found.");
  if (project.type === "voice") return project;
  if (project.status === "processing") throw new Error("Wait for the current generation job to finish first.");
  if (project.settings.scriptSource === "ai" || project.settings.scriptSource === "ready") return project;

  const now = Date.now();
  const db = await getDatabase();
  const [account, recentCalls] = await db.batch([
    db.prepare(`SELECT plan FROM users WHERE id = ?`).bind(userId),
    db.prepare(`SELECT COUNT(*) AS count FROM provider_calls WHERE user_id = ? AND kind = 'script' AND created_at >= ?`)
      .bind(userId, now - 86_400_000),
  ]) as [D1Result<{ plan: "free" | "creator" | "pro" }>, D1Result<{ count: number }>];
  const dailyLimit = account.results[0]?.plan === "pro" ? 80 : account.results[0]?.plan === "creator" ? 30 : 6;
  if (Number(recentCalls.results[0]?.count ?? 0) >= dailyLimit) {
    // Keep the provisional script so the user can still edit and generate voice.
    const settings: ProjectSettings = { ...project.settings, scriptSource: "ready" };
    await db.prepare(`UPDATE projects SET settings_json = ?, updated_at = ? WHERE id = ? AND user_id = ?`)
      .bind(JSON.stringify(settings), Date.now(), projectId, userId).run();
    return (await getProject(userId, projectId)) ?? project;
  }

  const providerCallId = crypto.randomUUID();
  await db.prepare(
    `INSERT INTO provider_calls (
      id, user_id, project_id, kind, provider, provider_model, status,
      provider_credits, created_at
    ) VALUES (?, ?, ?, 'script', 'kie', ?, 'processing', 0, ?)`,
  ).bind(providerCallId, userId, projectId, kieModels.script, now).run();

  try {
    const result = await generateBrainrotScript({
      projectType: project.type,
      sourceText: project.sourceText,
      durationSeconds: project.durationSeconds,
      settings: project.settings,
    });
    const settings: ProjectSettings = {
      ...project.settings,
      scriptSource: "ai",
    };
    await db.batch([
      db.prepare(
        `UPDATE projects
          SET title = ?, script_json = ?, settings_json = ?, updated_at = ?
          WHERE id = ? AND user_id = ? AND status = 'draft'`,
      ).bind(result.script.title, JSON.stringify(result.script), JSON.stringify(settings), Date.now(), projectId, userId),
      db.prepare(
        `UPDATE provider_calls SET status = 'completed', provider_credits = ?, completed_at = ? WHERE id = ?`,
      ).bind(result.creditsConsumed, Date.now(), providerCallId),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Script generation failed.";
    await db.batch([
      db.prepare(
        `UPDATE provider_calls SET status = 'failed', error_message = ?, completed_at = ? WHERE id = ?`,
      ).bind(message.slice(0, 500), Date.now(), providerCallId),
      db.prepare(
        `UPDATE projects SET settings_json = ?, updated_at = ? WHERE id = ? AND user_id = ?`,
      ).bind(JSON.stringify({ ...project.settings, scriptSource: "ready" }), Date.now(), projectId, userId),
    ]);
    // Leave provisional script in place so create → editor never dead-ends.
  }

  const refreshed = await getProject(userId, projectId);
  if (!refreshed) throw new Error("Project not found.");
  return refreshed;
}

export async function listProjects(userId: string) {
  const db = await getDatabase();
  const result = await db.prepare(
    `SELECT id, title, type, status, source_text, source_file_name, settings_json,
      script_json, duration_seconds, poster_asset_id, output_asset_id, error_message, updated_at,
      (SELECT provider_url FROM media_assets WHERE id = projects.output_asset_id) AS output_provider_url
      FROM projects
      WHERE user_id = ?
      ORDER BY updated_at DESC
      LIMIT 100`,
  ).bind(userId).all<ProjectRow>();
  return result.results.map((row) => mapSummary(row));
}

export async function getProject(userId: string, projectId: string): Promise<ProjectDetail | null> {
  const db = await getDatabase();
  const row = await db.prepare(
    `SELECT id, title, type, status, source_text, source_file_name, settings_json,
      script_json, duration_seconds, poster_asset_id, output_asset_id, error_message, updated_at,
      (SELECT provider_url FROM media_assets WHERE id = projects.output_asset_id) AS output_provider_url
      FROM projects
      WHERE id = ? AND user_id = ?`,
  ).bind(projectId, userId).first<ProjectRow>();
  if (!row) return null;

  const job = await db.prepare(
    `SELECT id, status, reserved_credits, charged_credits, provider_credits, error_message, created_at
      FROM generation_jobs
      WHERE project_id = ? AND user_id = ?
      ORDER BY created_at DESC
      LIMIT 1`,
  ).bind(projectId, userId).first<JobRow>();
  const steps = job
    ? await db.prepare(
      `SELECT kind, status, sequence, input_json, result_json, error_message
          FROM generation_steps
          WHERE job_id = ?
          ORDER BY sequence ASC, kind ASC`,
      ).bind(job.id).all<StepRow>()
    : null;
  const [narrationAssets, videoAssets] = await db.batch([
    db.prepare(
      `SELECT media_assets.id, media_assets.provider_url, media_assets.step_id,
          generation_steps.sequence, generation_steps.input_json, media_assets.created_at
        FROM media_assets
        LEFT JOIN generation_steps ON generation_steps.id = media_assets.step_id
        WHERE media_assets.project_id = ? AND media_assets.user_id = ? AND media_assets.kind = 'audio'
          AND generation_steps.job_id = ?
        ORDER BY COALESCE(generation_steps.sequence, 0) ASC, media_assets.created_at ASC`,
    ).bind(projectId, userId, job?.id ?? ""),
    db.prepare(
      `SELECT id, provider_url FROM media_assets
        WHERE project_id = ? AND user_id = ? AND kind = 'video'
        ORDER BY created_at DESC`,
    ).bind(projectId, userId),
  ]) as [D1Result<{ id: string; provider_url: string | null; step_id: string | null; sequence: number | null; input_json: string | null; created_at: number }>, D1Result<{ id: string; provider_url: string | null }>];
  const narrationAsset = narrationAssets.results[0];
  const motionAsset = videoAssets.results.find((asset) => asset.provider_url !== null);
  const selectedOutput = videoAssets.results.find((asset) => asset.id === row.output_asset_id);
  const outputIsFinal = row.type === "voice"
    ? Boolean(row.output_asset_id)
    : selectedOutput ? selectedOutput.provider_url === null : false;
  const settings = parseJson<ProjectSettings>(row.settings_json, "Project settings");
  const script = normalizeBrainrotScript(parseJson<unknown>(row.script_json, "Project script"), defaultContentFormat(row.type, settings));

  return {
    ...mapSummary(row, outputIsFinal),
    sourceText: row.source_text,
    sourceFileName: row.source_file_name,
    narrationUrl: mediaUrl(narrationAsset?.id ?? null),
    motionUrl: mediaUrl(motionAsset?.id ?? null),
    settings,
    script,
    audioSegments: narrationAssets.results.map((asset, audioIndex) => {
      let timeline: AudioTimeline | null = null;
      if (asset.step_id) {
        const step = steps?.results.find((candidate) => candidate.sequence === asset.sequence && candidate.kind === "voice");
        if (step?.result_json) {
          const result = parseJson<{ timeline?: unknown }>(step.result_json, "Generation step");
          timeline = normalizeAudioTimeline(result.timeline);
        }
      }
      return {
        url: mediaUrl(asset.id) ?? "",
        sequence: asset.sequence ?? 0,
        speakerId: script.dialogue[audioIndex]?.speakerId ?? script.speakers[0]?.id ?? null,
        timeline,
      };
    }),
    job: job ? {
      id: job.id,
      status: job.status,
      createdAt: job.created_at,
      reservedCredits: job.reserved_credits,
      chargedCredits: job.charged_credits,
      providerCredits: job.provider_credits,
      errorMessage: job.error_message,
      steps: (steps?.results ?? []).map((step) => {
        const result = step.result_json ? parseJson<{ progress?: unknown; timeline?: unknown; rawResult?: unknown }>(step.result_json, "Generation step") : null;
        const progress = Number(result?.progress ?? (step.status === "completed" ? 100 : 0));
        return {
          kind: step.kind,
          status: step.status,
          sequence: step.sequence,
          progress: Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0,
          errorMessage: step.error_message,
          timeline: normalizeAudioTimeline(result?.timeline) ?? undefined,
        };
      }),
    } : null,
  };
}

function validateScenes(value: unknown): BrainrotScene[] {
  if (!Array.isArray(value) || !value.length || value.length > 8) throw new Error("A project needs between 1 and 8 scenes.");
  return value.map((scene, index) => {
    const item = scene as Partial<BrainrotScene>;
    const narration = typeof item.narration === "string" ? item.narration.trim().slice(0, 700) : "";
    const imagePrompt = typeof item.imagePrompt === "string" ? item.imagePrompt.trim().slice(0, 1_200) : "";
    const motionPrompt = typeof item.motionPrompt === "string" ? item.motionPrompt.trim().slice(0, 1_200) : "";
    if (!narration || !imagePrompt || !motionPrompt) throw new Error(`Scene ${index + 1} is incomplete.`);
    return {
      id: typeof item.id === "string" ? item.id.slice(0, 80) : `scene-${index + 1}`,
      label: typeof item.label === "string" && item.label.trim() ? item.label.trim().slice(0, 48) : `Scene ${index + 1}`,
      narration,
      imagePrompt,
      motionPrompt,
    };
  });
}

function validateSpeakers(value: unknown, fallback: BrainrotSpeaker[]) {
  if (value === undefined) return fallback;
  return normalizeBrainrotScript({ speakers: value, contentFormat: "story", title: "x", hook: "x", narration: "x", dialogue: [{ speakerId: "", text: "x" }], scenes: [{ narration: "x", imagePrompt: "x", motionPrompt: "x" }] }).speakers;
}

function validateDialogue(value: unknown, fallback: BrainrotDialogueTurn[]) {
  if (value === undefined) return fallback;
  if (!Array.isArray(value) || !value.length || value.length > 24) throw new Error("A project needs between 1 and 24 dialogue turns.");
  return value.map((turn, index) => {
    const item = turn as Partial<BrainrotDialogueTurn>;
    if (typeof item.text !== "string" || !item.text.trim()) throw new Error(`Dialogue turn ${index + 1} is empty.`);
    return {
      id: typeof item.id === "string" && item.id.trim() ? item.id.trim().slice(0, 80) : `turn-${index + 1}`,
      speakerId: typeof item.speakerId === "string" ? item.speakerId.trim().slice(0, 60) : "speaker-narrator",
      text: item.text.replace(/\s+/g, " ").trim().slice(0, 700),
      emotion: item.emotion ?? "neutral",
      sceneId: typeof item.sceneId === "string" ? item.sceneId.slice(0, 80) : undefined,
    } satisfies BrainrotDialogueTurn;
  });
}

export async function updateProject(userId: string, projectId: string, input: {
  title?: unknown;
  hook?: unknown;
  narration?: unknown;
  scenes?: unknown;
  speakers?: unknown;
  dialogue?: unknown;
  studyMode?: unknown;
  sourceReferences?: unknown;
  settings?: unknown;
}) {
  const current = await getProject(userId, projectId);
  if (!current) return false;
  if (current.status === "processing") throw new Error("A processing project cannot be edited.");

  const title = typeof input.title === "string" && input.title.trim()
    ? input.title.replace(/\s+/g, " ").trim().slice(0, 80)
    : current.title;
  const hook = typeof input.hook === "string" && input.hook.trim()
    ? input.hook.replace(/\s+/g, " ").trim().slice(0, 1_200)
    : current.script.hook;
  const editedNarration = typeof input.narration === "string" && input.narration.trim()
    ? input.narration.replace(/\s+/g, " ").trim().slice(0, 4_000)
    : current.script.narration;
  const scenes = input.scenes === undefined ? current.script.scenes : validateScenes(input.scenes);
  const speakers = validateSpeakers(input.speakers, current.script.speakers);
  const dialogue = input.dialogue === undefined
    ? (input.narration === undefined ? current.script.dialogue : [{ ...current.script.dialogue[0], text: editedNarration }])
    : validateDialogue(input.dialogue, current.script.dialogue);
  const sourceReferences = input.sourceReferences === undefined ? current.script.sourceReferences : Array.isArray(input.sourceReferences) ? input.sourceReferences : undefined;
  const studyMode = input.studyMode === "quiz" || input.studyMode === "summary" || input.studyMode === "explain" ? input.studyMode : current.script.studyMode;
  const settings = input.settings && typeof input.settings === "object" && !Array.isArray(input.settings)
    ? Object.fromEntries(Object.entries(input.settings).filter(([, value]) => typeof value === "string" || typeof value === "boolean").slice(0, 30)) as ProjectSettings
    : current.settings;
  const script = normalizeBrainrotScript({
    ...current.script,
    title,
    hook,
    narration: editedNarration,
    scenes,
    speakers,
    dialogue,
    sourceReferences,
    studyMode,
  }, current.script.contentFormat);
  const changed = title !== current.title
    || hook !== current.script.hook
    || script.narration !== current.script.narration
    || JSON.stringify(scenes) !== JSON.stringify(current.script.scenes)
    || JSON.stringify(script.speakers) !== JSON.stringify(current.script.speakers)
    || JSON.stringify(script.dialogue) !== JSON.stringify(current.script.dialogue)
    || JSON.stringify(script.sourceReferences) !== JSON.stringify(current.script.sourceReferences)
    || script.studyMode !== current.script.studyMode
    || flatRecordSignature(settings) !== flatRecordSignature(current.settings);
  if (!changed) return true;

  const changedSettingKeys = Object.keys({ ...current.settings, ...settings }).filter((key) => current.settings[key] !== settings[key]);
  const localExportOnlyChange = current.status === "completed"
    && title === current.title
    && hook === current.script.hook
    && script.narration === current.script.narration
    && JSON.stringify(scenes) === JSON.stringify(current.script.scenes)
    && changedSettingKeys.every((key) => key === "captionStyle" || key === "backgroundId");
  const nextStatus = localExportOnlyChange ? current.status : "draft";

  const db = await getDatabase();
  await db.prepare(
    `UPDATE projects
      SET title = ?, script_json = ?, settings_json = ?, status = ?,
        error_code = NULL, error_message = NULL, updated_at = ?
      WHERE id = ? AND user_id = ?`,
  ).bind(title, JSON.stringify(script), JSON.stringify(settings), nextStatus, Date.now(), projectId, userId).run();
  return true;
}

export async function deleteProject(userId: string, projectId: string) {
  const db = await getDatabase();
  const assets = await db.prepare(
    `SELECT storage_path FROM media_assets WHERE project_id = ? AND user_id = ?`,
  ).bind(projectId, userId).all<{ storage_path: string }>();
  if (assets.results.length) await deleteStoredMedia(assets.results.map((asset) => asset.storage_path));
  const result = await db.prepare(
    `DELETE FROM projects WHERE id = ? AND user_id = ?`,
  ).bind(projectId, userId).run();
  return result.meta.changes === 1;
}

export async function duplicateProject(userId: string, projectId: string) {
  const project = await getProject(userId, projectId);
  if (!project) return null;

  const id = crypto.randomUUID();
  const now = Date.now();
  const copySuffix = " copy";
  const title = `${project.title.slice(0, 80 - copySuffix.length).trimEnd()}${copySuffix}`;
  const script: BrainrotScript = { ...project.script, title };
  const db = await getDatabase();
  await db.prepare(
    `INSERT INTO projects (
      id, user_id, type, title, status, source_text, source_file_name,
      settings_json, script_json, duration_seconds, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    id,
    userId,
    project.type,
    title,
    project.sourceText,
    project.sourceFileName,
    JSON.stringify(project.settings),
    JSON.stringify(script),
    project.durationSeconds,
    now,
    now,
  ).run();
  return id;
}

export async function saveProjectExport(userId: string, projectId: string, bytes: ArrayBuffer) {
  const project = await getProject(userId, projectId);
  if (!project) throw new Error("Project not found.");
  if (project.type === "voice") throw new Error("Voice projects do not accept video exports.");
  if (project.status !== "completed") throw new Error("Finish generating the project assets before saving an export.");

  const db = await getDatabase();
  const existing = await db.prepare(
    `SELECT id FROM media_assets
      WHERE project_id = ? AND user_id = ? AND kind = 'video' AND provider_url IS NULL
      ORDER BY created_at DESC LIMIT 1`,
  ).bind(projectId, userId).first<{ id: string }>();
  const stored = await uploadGeneratedBytes({
    bytes,
    contentType: "video/mp4",
    objectPrefix: `${userId}/${projectId}/final-export`,
  });
  const assetId = existing?.id ?? crypto.randomUUID();
  const now = Date.now();
  if (existing) {
    await db.prepare(
      `UPDATE media_assets
        SET storage_path = ?, content_type = ?, byte_size = ?, created_at = ?
        WHERE id = ? AND project_id = ? AND user_id = ?`,
    ).bind(stored.storagePath, stored.contentType, stored.byteSize, now, assetId, projectId, userId).run();
  } else {
    await db.prepare(
      `INSERT INTO media_assets (
        id, project_id, user_id, step_id, kind, storage_path, content_type,
        byte_size, provider_url, created_at
      ) VALUES (?, ?, ?, NULL, 'video', ?, ?, ?, NULL, ?)`,
    ).bind(assetId, projectId, userId, stored.storagePath, stored.contentType, stored.byteSize, now).run();
  }
  await db.prepare(
    `UPDATE projects SET output_asset_id = ?, updated_at = ? WHERE id = ? AND user_id = ?`,
  ).bind(assetId, now, projectId, userId).run();
  return getProject(userId, projectId);
}

export function appCreditCost(project: Pick<ProjectSummary, "type" | "durationSeconds"> & { settings?: Record<string, unknown> }) {
  return creditCostForRender({
    type: project.type,
    durationSeconds: project.durationSeconds,
    renderMode: getRenderMode(project.settings),
  });
}
