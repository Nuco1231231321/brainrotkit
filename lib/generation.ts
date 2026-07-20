import "server-only";

import { extractProviderTimeline } from "@/lib/audio-timeline";
import { wordLimitForDuration } from "@/lib/brainrot-script";
import { getDatabase } from "@/lib/cloudflare";
import {
  createKieTask,
  getKieCreditBalance,
  getKieTask,
  kieModels,
  type KieTaskRecord,
} from "@/lib/kie";
import { appCreditCost, getProject, type ProjectDetail, type ProjectSettings } from "@/lib/projects";
import { getRenderMode, isAllowedDuration } from "@/lib/render-modes";
import { createSignedMediaUrl, uploadGeneratedMedia, verifyStorageBucket } from "@/lib/storage";

type StepKind = "image" | "voice" | "video";
type StepStatus = "pending" | "submitted" | "processing" | "finalizing" | "completed" | "failed";

type StepRow = {
  id: string;
  job_id: string;
  project_id: string;
  user_id: string;
  kind: StepKind;
  sequence: number;
  provider_model: string;
  provider_task_id: string | null;
  status: StepStatus;
  input_json: string;
  expected_provider_credits: number;
  provider_credits: number;
  last_polled_at: number | null;
  job_status: "queued" | "processing" | "completed" | "failed";
  project_type: ProjectDetail["type"];
};

type MediaRow = {
  id: string;
  storage_path: string;
  content_type: string;
  byte_size: number;
};

type ReusableAssetRow = {
  id: string;
  kind: "image" | "audio";
};

const stepMediaKind: Record<StepKind, "image" | "audio" | "video"> = {
  image: "image",
  voice: "audio",
  video: "video",
};

function parseStoredJson<T>(value: string, context: string) {
  try {
    return JSON.parse(value) as T;
  } catch {
    throw new Error(`${context} contains invalid JSON.`);
  }
}

function textSetting(settings: ProjectSettings, key: string, fallback: string) {
  const value = settings[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function mapVoiceName(preset: string) {
  return {
    "Milano Rush": "Puck",
    "Opera Max": "Fenrir",
    "Narrator Zero": "Charon",
    "Soft Study": "Zephyr",
  }[preset] ?? "Puck";
}

function buildImageInput(project: ProjectDetail) {
  const primaryScene = project.script.scenes[0];
  const visualDirection = primaryScene?.imagePrompt || project.script.hook;
  return {
    prompt: [
      visualDirection,
      `Visual template: ${textSetting(project.settings, "template", "Parkour")}.`,
      "Create one continuous, full-bleed vertical scene with one clear focal subject and one camera viewpoint.",
      "Cinematic lighting, detailed, original character, no logos, no captions, no text.",
      "Do not create a collage, storyboard, split screen, contact sheet, grid, comic layout, multiple panels, borders, frames, or multiple moments.",
    ].join(" "),
    aspect_ratio: textSetting(project.settings, "aspectRatio", "9:16"),
    quality: "basic",
    output_format: "png",
    nsfw_checker: true,
  };
}

function buildVoiceInput(project: ProjectDetail, turn = project.script.dialogue[0]) {
  const defaultVoicePreset = textSetting(project.settings, "voice", textSetting(project.settings, "template", "Milano Rush"));
  const speaker = project.script.speakers.find((candidate) => candidate.id === turn.speakerId);
  const voicePreset = speaker?.id === project.script.speakers[0]?.id
    ? defaultVoicePreset
    : textSetting(project.settings, `voice:${turn.speakerId}`, speaker?.voicePreset ?? defaultVoicePreset);
  const language = textSetting(project.settings, "language", "English (US)");
  const requestedSpeed = Number(textSetting(project.settings, "speed", "1"));
  const speed = Number.isFinite(requestedSpeed) ? Math.max(0.7, Math.min(1.2, requestedSpeed)) : 1;
  const requestedIntensity = Number(textSetting(project.settings, "intensity", "65"));
  const intensity = Number.isFinite(requestedIntensity) ? Math.max(0, Math.min(100, requestedIntensity)) : 65;
  const energetic = turn.emotion === "excited" || turn.emotion === "surprised";
  const calm = turn.emotion === "calm";
  const pace = speed >= 1.1 ? "Rapid Fire" : "Natural";
  const style = energetic ? "Promo/Hype" : calm ? "Empathetic" : "Newscaster";
  const accent = language.startsWith("English (UK)") ? "British (RP)" : language.startsWith("English") ? "American (Gen)" : "Neutral";
  return {
    temperature: 0.8,
    scene: `A polished vertical short-video narration. ${voicePreset}, ${language}, ${style.toLowerCase()} delivery at ${intensity}% intensity.`,
    sample_context: `Keep the delivery clear and expressive at approximately ${speed.toFixed(1)}x speed. Read only the supplied dialogue text.`,
    speakers: [{
      speaker_id: "Speaker 1",
      voice_name: mapVoiceName(voicePreset),
      audio_profile: `${voicePreset}: clear, expressive short-form narration at ${intensity}% intensity.`,
      accent,
      style,
      pace,
    }],
    dialogue_turns: [{ speaker_id: "Speaker 1", text: turn.text }],
  };
}

function buildVideoBaseInput(project: ProjectDetail) {
  return {
    prompt: [
      project.script.hook,
      ...project.script.scenes.map((scene, index) => `Shot ${index + 1}: ${scene.motionPrompt} Narration context only: ${scene.narration}`),
      `Create one coherent vertical social video with a ${textSetting(project.settings, "template", "Parkour")} visual treatment and clean cinematic cuts between the shots. Preserve the reference character design and match the motion to the narration context. Do not render the narration as text or speech. No captions, logos, watermarks, dialogue, or voiceover; the final browser compositor adds the approved narration and deterministic subtitles.`,
    ].join(" ").slice(0, 4_000),
    resolution: "480p",
    aspect_ratio: textSetting(project.settings, "aspectRatio", "9:16"),
    duration: project.durationSeconds,
    nsfw_checker: true,
  };
}

function stepModel(kind: StepKind) {
  return kind === "image" ? kieModels.image : kind === "voice" ? kieModels.voice : kieModels.video;
}

function stepExpectedCredits(kind: StepKind, durationSeconds: number) {
  if (kind === "image") return 7;
  if (kind === "voice") return 5;
  return Math.ceil(1.6 * Math.min(durationSeconds, 15));
}

function buildInitialSteps(project: ProjectDetail, jobId: string, reusableAssets: Map<"image" | "audio", string>) {
  const now = Date.now();
  const renderMode = getRenderMode(project.settings);
  const firstTurn = project.script.dialogue[0];
  const dialogue = project.script.contentFormat === "debate" && project.script.dialogue.length
    ? project.script.dialogue
    : [{
        id: firstTurn?.id ?? "turn-1",
        speakerId: firstTurn?.speakerId ?? project.script.speakers[0]?.id ?? "speaker-narrator",
        text: project.script.narration,
        emotion: firstTurn?.emotion ?? "neutral" as const,
      }];
  const steps: Array<{ kind: StepKind; sequence: number; turn?: typeof dialogue[number] }> = [];
  if (renderMode === "ai-motion" || project.type === "italian") steps.push({ kind: "image", sequence: 0 });
  const voiceStart = steps.length;
  dialogue.forEach((turn, index) => steps.push({ kind: "voice", sequence: voiceStart + index, turn }));
  if (renderMode === "ai-motion") steps.push({ kind: "video", sequence: steps.length });
  return steps.map(({ kind, sequence, turn }) => {
    const reusableAssetId = kind === "image"
      ? reusableAssets.get("image")
      : kind === "voice" && dialogue.length === 1
        ? reusableAssets.get("audio")
        : undefined;
    return {
      id: crypto.randomUUID(),
      jobId,
      projectId: project.id,
      kind,
      sequence,
      providerModel: stepModel(kind),
      input: kind === "image" ? buildImageInput(project) : kind === "voice" ? buildVoiceInput(project, turn) : buildVideoBaseInput(project),
      status: reusableAssetId ? "completed" as const : "pending" as const,
      resultJson: reusableAssetId ? JSON.stringify({ progress: 100, assetId: reusableAssetId, reused: true }) : null,
      expectedProviderCredits: reusableAssetId ? 0 : stepExpectedCredits(kind, kind === "voice" ? Math.max(1, Math.ceil((turn?.text.split(/\s+/).length ?? 1) / 2.7)) : project.durationSeconds),
      createdAt: now,
      completedAt: reusableAssetId ? now : null,
    };
  });
}

async function getReusableAssets(project: ProjectDetail, userId: string) {
  const assets = new Map<"image" | "audio", string>();
  if (project.status !== "failed" || project.type === "voice") return assets;
  const db = await getDatabase();
  const result = await db.prepare(
    `SELECT id, kind FROM media_assets
      WHERE project_id = ? AND user_id = ? AND kind IN ('image', 'audio')
      ORDER BY created_at DESC`,
  ).bind(project.id, userId).all<ReusableAssetRow>();
  for (const asset of result.results) {
    if (asset.kind === "audio" && getRenderMode(project.settings) !== "ai-motion") continue;
    if (!assets.has(asset.kind)) assets.set(asset.kind, asset.id);
  }
  return assets;
}

async function getStepById(stepId: string) {
  const db = await getDatabase();
  return db.prepare(
    `SELECT s.id, s.job_id, s.project_id, j.user_id, s.kind, s.sequence,
      s.provider_model, s.provider_task_id, s.status, s.input_json,
      s.expected_provider_credits, s.provider_credits, s.last_polled_at,
      j.status AS job_status, p.type AS project_type
      FROM generation_steps s
      JOIN generation_jobs j ON j.id = s.job_id
      JOIN projects p ON p.id = s.project_id
      WHERE s.id = ?`,
  ).bind(stepId).first<StepRow>();
}

async function getStepByProviderTaskId(taskId: string) {
  const db = await getDatabase();
  return db.prepare(
    `SELECT s.id, s.job_id, s.project_id, j.user_id, s.kind, s.sequence,
      s.provider_model, s.provider_task_id, s.status, s.input_json,
      s.expected_provider_credits, s.provider_credits, s.last_polled_at,
      j.status AS job_status, p.type AS project_type
      FROM generation_steps s
      JOIN generation_jobs j ON j.id = s.job_id
      JOIN projects p ON p.id = s.project_id
      WHERE s.provider_task_id = ?`,
  ).bind(taskId).first<StepRow>();
}

async function getNextPendingStep(step: StepRow) {
  const db = await getDatabase();
  return db.prepare(
    `SELECT s.id, s.job_id, s.project_id, j.user_id, s.kind, s.sequence,
      s.provider_model, s.provider_task_id, s.status, s.input_json,
      s.expected_provider_credits, s.provider_credits, s.last_polled_at,
      j.status AS job_status, p.type AS project_type
      FROM generation_steps s
      JOIN generation_jobs j ON j.id = s.job_id
      JOIN projects p ON p.id = s.project_id
      WHERE s.job_id = ? AND s.sequence > ? AND s.status = 'pending'
      ORDER BY s.sequence ASC
      LIMIT 1`,
  ).bind(step.job_id, step.sequence).first<StepRow>();
}

async function getMediaForStep(stepId: string) {
  const db = await getDatabase();
  return db.prepare(
    `SELECT id, storage_path, content_type, byte_size
      FROM media_assets
      WHERE step_id = ?
      ORDER BY created_at DESC
      LIMIT 1`,
  ).bind(stepId).first<MediaRow>();
}

async function buildVideoInput(step: StepRow) {
  const db = await getDatabase();
  const dependencies = await db.prepare(
    `SELECT kind, storage_path FROM media_assets
      WHERE project_id = ? AND user_id = ? AND kind IN ('image', 'audio')
      ORDER BY created_at DESC`,
  ).bind(step.project_id, step.user_id).all<{ kind: "image" | "audio"; storage_path: string }>();
  const image = dependencies.results.find((item) => item.kind === "image");
  if (!image) throw new Error("The generated reference image is missing.");
  const base = parseStoredJson<Record<string, unknown>>(step.input_json, "Video step input");
  return {
    ...base,
    image_urls: [await createSignedMediaUrl(image.storage_path, 3_600)],
  };
}

async function failGeneration(jobId: string, code: string, message: string) {
  const db = await getDatabase();
  const now = Date.now();
  await db.batch([
    db.prepare(
      `UPDATE credit_reservations
        SET status = 'returned', updated_at = ?
        WHERE job_id = ? AND status = 'reserved'`,
    ).bind(now, jobId),
    db.prepare(
      `UPDATE generation_jobs
        SET status = 'failed',
          provider_credits = (SELECT COALESCE(SUM(provider_credits), 0) FROM generation_steps WHERE job_id = ?),
          error_code = ?, error_message = ?, updated_at = ?, completed_at = ?
        WHERE id = ? AND status IN ('queued', 'processing')`,
    ).bind(jobId, code, message.slice(0, 500), now, now, jobId),
    db.prepare(
      `UPDATE generation_steps
        SET status = 'failed', error_code = COALESCE(error_code, ?),
          error_message = COALESCE(error_message, ?), updated_at = ?, completed_at = COALESCE(completed_at, ?)
        WHERE job_id = ? AND status IN ('pending', 'submitted', 'processing', 'finalizing')`,
    ).bind(code, message.slice(0, 500), now, now, jobId),
    db.prepare(
      `UPDATE projects
        SET status = 'failed', error_code = ?, error_message = ?, updated_at = ?
        WHERE id = (SELECT project_id FROM generation_jobs WHERE id = ?)`,
    ).bind(code, message.slice(0, 500), now, jobId),
  ]);
}

async function submitStep(step: StepRow) {
  const db = await getDatabase();
  const claim = await db.prepare(
    `UPDATE generation_steps
      SET status = 'processing', updated_at = ?
      WHERE id = ? AND status = 'pending'
      RETURNING id`,
  ).bind(Date.now(), step.id).first<{ id: string }>();
  if (!claim) return;

  try {
    const input = step.kind === "video"
      ? await buildVideoInput(step)
      : parseStoredJson<Record<string, unknown>>(step.input_json, "Generation step input");
    const providerTaskId = await createKieTask(step.provider_model, input);
    await db.prepare(
      `UPDATE generation_steps
        SET provider_task_id = ?, status = 'submitted', updated_at = ?
        WHERE id = ? AND status = 'processing'`,
    ).bind(providerTaskId, Date.now(), step.id).run();
    await db.prepare(
      `UPDATE generation_jobs SET status = 'processing', updated_at = ? WHERE id = ? AND status = 'queued'`,
    ).bind(Date.now(), step.job_id).run();
  } catch (error) {
    const message = error instanceof Error ? error.message : "The generation provider rejected the request.";
    await failGeneration(step.job_id, "provider_submission_failed", message);
    throw error;
  }
}

export async function startProjectGeneration(userId: string, projectId: string) {
  const project = await getProject(userId, projectId);
  if (!project) throw new Error("Project not found.");
  if (project.status === "processing") throw new Error("This project is already processing.");
  const renderMode = getRenderMode(project.settings);
  const legacyFiveSecondGameplay = renderMode === "gameplay" && project.durationSeconds === 5 && project.settings.renderMode === undefined;
  if (project.type !== "voice" && !isAllowedDuration(renderMode, project.durationSeconds) && !legacyFiveSecondGameplay) {
    throw new Error(renderMode === "ai-motion"
      ? "AI Motion Mode supports 5 or 15 seconds. Choose Gameplay Mode for 30, 45 or 60 seconds."
      : "Gameplay Mode supports 15, 30, 45 or 60 seconds.");
  }
  if (project.type !== "voice") {
    const narrationWords = project.script.narration.trim().split(/\s+/).filter(Boolean).length;
    const maximumWords = wordLimitForDuration(project.durationSeconds, project.script.contentFormat);
    if (narrationWords < 4 || narrationWords > maximumWords) {
      throw new Error(`Keep the narration between 4 and ${maximumWords} words for a ${project.durationSeconds}-second video.`);
    }
  }

  const reusableAssets = await getReusableAssets(project, userId);
  const jobId = crypto.randomUUID();
  const steps = buildInitialSteps(project, jobId, reusableAssets);
  const providerEstimate = steps.reduce((total, step) => total + step.expectedProviderCredits, 0);
  const [providerBalance] = await Promise.all([
    getKieCreditBalance(),
    verifyStorageBucket(),
  ]);
  if (providerBalance < providerEstimate) throw new Error("Generation is temporarily unavailable because the provider balance is too low.");

  const appCredits = appCreditCost(project);
  const reservationId = crypto.randomUUID();
  const now = Date.now();
  const db = await getDatabase();
  try {
    await db.batch([
      db.prepare(
        `INSERT INTO generation_jobs (
          id, project_id, user_id, status, reserved_credits, charged_credits,
          provider_credits, created_at, updated_at
        ) VALUES (?, ?, ?, 'queued', ?, 0, 0, ?, ?)`,
      ).bind(jobId, projectId, userId, appCredits, now, now),
      ...steps.map((step) => db.prepare(
        `INSERT INTO generation_steps (
          id, job_id, project_id, kind, sequence, provider, provider_model,
          status, input_json, expected_provider_credits, provider_credits,
          result_json, created_at, updated_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, 'kie', ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
      ).bind(
        step.id,
        step.jobId,
        step.projectId,
        step.kind,
        step.sequence,
        step.providerModel,
        step.status,
        JSON.stringify(step.input),
        step.expectedProviderCredits,
        step.resultJson,
        step.createdAt,
        step.createdAt,
        step.completedAt,
      )),
      db.prepare(
        `INSERT INTO credit_reservations (id, job_id, user_id, amount, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, 'reserved', ?, ?)`,
      ).bind(reservationId, jobId, userId, appCredits, now, now),
      db.prepare(
        `UPDATE projects
          SET status = 'processing', output_asset_id = NULL,
            error_code = NULL, error_message = NULL, updated_at = ?
          WHERE id = ? AND user_id = ?`,
      ).bind(now, projectId, userId),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Credits could not be reserved.";
    if (message.includes("insufficient_generation_credits")) throw new Error("You do not have enough credits for this generation.");
    if (message.includes("generation_jobs.project_id") || message.includes("UNIQUE constraint failed")) {
      throw new Error("This project is already processing.");
    }
    throw error;
  }

  const firstPendingStep = steps.find((item) => item.status === "pending");
  const step = firstPendingStep ? await getStepById(firstPendingStep.id) : null;
  if (!step) {
    await failGeneration(jobId, "step_not_found", "The first generation step could not be loaded.");
    throw new Error("The first generation step could not be loaded.");
  }
  await submitStep(step);
  return jobId;
}

async function persistStepMedia(step: StepRow, task: KieTaskRecord) {
  const existing = await getMediaForStep(step.id);
  if (existing) {
    return {
      ...existing,
      timeline: step.kind === "voice" ? extractProviderTimeline(task.rawResult) : null,
    };
  }
  const sourceUrl = task.resultUrls[0];
  if (!sourceUrl) throw new Error("Kie completed the task without a downloadable result.");

  const stored = await uploadGeneratedMedia({
    sourceUrl,
    objectPrefix: `${step.user_id}/${step.project_id}/${step.kind}-${step.id}`,
  });
  const assetId = crypto.randomUUID();
  const db = await getDatabase();
  await db.prepare(
    `INSERT INTO media_assets (
      id, project_id, user_id, step_id, kind, storage_path, content_type,
      byte_size, provider_url, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    assetId,
    step.project_id,
    step.user_id,
    step.id,
    stepMediaKind[step.kind],
    stored.storagePath,
    stored.contentType,
    stored.byteSize,
    sourceUrl,
    Date.now(),
  ).run();
  const providerTimeline = step.kind === "voice" ? extractProviderTimeline(task.rawResult) : null;
  return { id: assetId, storage_path: stored.storagePath, content_type: stored.contentType, byte_size: stored.byteSize, timeline: providerTimeline };
}

async function completeGeneration(step: StepRow) {
  const db = await getDatabase();
  const now = Date.now();
  await db.batch([
    db.prepare(
      `UPDATE credit_reservations SET status = 'charged', updated_at = ?
        WHERE job_id = ? AND status = 'reserved'`,
    ).bind(now, step.job_id),
    db.prepare(
      `UPDATE generation_jobs
        SET status = 'completed', charged_credits = reserved_credits,
          provider_credits = (SELECT COALESCE(SUM(provider_credits), 0) FROM generation_steps WHERE job_id = ?),
          error_code = NULL, error_message = NULL, updated_at = ?, completed_at = ?
        WHERE id = ? AND status IN ('queued', 'processing')`,
    ).bind(step.job_id, now, now, step.job_id),
    db.prepare(
      `UPDATE projects
        SET status = 'completed', error_code = NULL, error_message = NULL, updated_at = ?
        WHERE id = ?`,
    ).bind(now, step.project_id),
  ]);
}

export async function processKieTaskUpdate(task: KieTaskRecord) {
  const step = await getStepByProviderTaskId(task.taskId);
  if (!step || step.job_status === "failed" || step.job_status === "completed") return { ignored: true };
  const db = await getDatabase();
  const now = Date.now();

  if (task.state === "waiting" || task.state === "queuing" || task.state === "generating") {
    await db.prepare(
      `UPDATE generation_steps
        SET status = 'processing', result_json = ?, last_polled_at = ?, updated_at = ?
        WHERE id = ? AND status IN ('submitted', 'processing')`,
    ).bind(JSON.stringify({ progress: task.progress }), now, now, step.id).run();
    return { processing: true };
  }

  if (task.state === "fail") {
    const message = task.failMessage || "Kie could not produce a usable result.";
    await db.prepare(
      `UPDATE generation_steps
        SET status = 'failed', provider_credits = ?, error_code = ?, error_message = ?,
          result_json = ?, updated_at = ?, completed_at = ?
        WHERE id = ? AND status IN ('submitted', 'processing')`,
    ).bind(
      task.creditsConsumed,
      task.failCode ?? "provider_failed",
      message.slice(0, 500),
      JSON.stringify({ progress: task.progress }),
      now,
      now,
      step.id,
    ).run();
    await failGeneration(step.job_id, task.failCode ?? "provider_failed", message);
    return { failed: true };
  }

  try {
    const claim = await db.prepare(
      `UPDATE generation_steps SET status = 'finalizing', updated_at = ?
        WHERE id = ? AND status IN ('submitted', 'processing')
        RETURNING id`,
    ).bind(now, step.id).first<{ id: string }>();
    if (!claim) return { ignored: true };
    const asset = await persistStepMedia(step, task);
    await db.prepare(
      `UPDATE generation_steps
        SET status = 'completed', provider_credits = ?, result_json = ?,
          error_code = NULL, error_message = NULL, updated_at = ?, completed_at = ?
        WHERE id = ? AND status = 'finalizing'`,
    ).bind(
      task.creditsConsumed,
      JSON.stringify({ progress: 100, assetId: asset.id, timeline: asset.timeline, rawResult: task.rawResult }),
      now,
      now,
      step.id,
    ).run();
    if (step.kind === "image") {
      await db.prepare(`UPDATE projects SET poster_asset_id = ?, updated_at = ? WHERE id = ?`)
        .bind(asset.id, now, step.project_id).run();
    }
    if (step.kind === "voice" && step.project_type === "voice") {
      await db.prepare(`UPDATE projects SET output_asset_id = ?, updated_at = ? WHERE id = ?`)
        .bind(asset.id, now, step.project_id).run();
      await completeGeneration(step);
      return { completed: true };
    }
    if (step.kind === "video") {
      await db.prepare(`UPDATE projects SET output_asset_id = ?, updated_at = ? WHERE id = ?`)
        .bind(asset.id, now, step.project_id).run();
      await completeGeneration(step);
      return { completed: true };
    }

    const next = await getNextPendingStep(step);
    if (!next) {
      if (step.kind === "voice") {
        await completeGeneration(step);
        return { completed: true, readyToExport: true };
      }
      throw new Error("The next generation step is missing.");
    }
    await submitStep(next);
    return { advanced: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generated media could not be stored.";
    await failGeneration(step.job_id, "media_processing_failed", message);
    throw error;
  }
}

export async function refreshProjectGeneration(userId: string, projectId: string) {
  const db = await getDatabase();
  const step = await db.prepare(
    `SELECT s.id, s.job_id, s.project_id, j.user_id, s.kind, s.sequence,
      s.provider_model, s.provider_task_id, s.status, s.input_json,
      s.expected_provider_credits, s.provider_credits, s.last_polled_at,
      j.status AS job_status, p.type AS project_type
      FROM generation_steps s
      JOIN generation_jobs j ON j.id = s.job_id
      JOIN projects p ON p.id = s.project_id
      WHERE s.project_id = ? AND j.user_id = ?
        AND j.status IN ('queued', 'processing')
        AND s.status IN ('submitted', 'processing')
      ORDER BY s.sequence ASC
      LIMIT 1`,
  ).bind(projectId, userId).first<StepRow>();
  if (!step?.provider_task_id) return;
  const now = Date.now();
  if (step.last_polled_at && now - step.last_polled_at < 3_000) return;
  await db.prepare(`UPDATE generation_steps SET last_polled_at = ? WHERE id = ?`).bind(now, step.id).run();
  try {
    await processKieTaskUpdate(await getKieTask(step.provider_task_id));
  } catch {
    // Polling is a webhook fallback. A transient provider read must not fail or retry a paid task.
  }
}
