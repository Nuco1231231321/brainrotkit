export type WordTimestamp = {
  word: string;
  start: number;
  end: number;
};

export type AudioTimeline = {
  words: WordTimestamp[];
  durationSeconds: number;
  source: "provider" | "fallback";
};

export type AudibleRange = {
  startSeconds: number;
  endSeconds: number;
};

export function findAudibleRange(channels: readonly Float32Array[], sampleRate: number): AudibleRange {
  const sampleLength = Math.max(...channels.map((channel) => channel.length), 0);
  if (!Number.isFinite(sampleRate) || sampleRate <= 0 || sampleLength === 0) {
    return { startSeconds: 0, endSeconds: 0 };
  }

  const windowSize = Math.max(1, Math.round(sampleRate * 0.02));
  const rmsThreshold = 0.004;
  const isAudible = (windowStart: number) => {
    const windowEnd = Math.min(sampleLength, windowStart + windowSize);
    let sumSquares = 0;
    let sampleCount = 0;
    for (const channel of channels) {
      const end = Math.min(windowEnd, channel.length);
      for (let index = windowStart; index < end; index += 1) {
        const sample = channel[index];
        sumSquares += sample * sample;
        sampleCount += 1;
      }
    }
    return sampleCount > 0 && Math.sqrt(sumSquares / sampleCount) >= rmsThreshold;
  };

  let firstAudibleSample = -1;
  for (let start = 0; start < sampleLength; start += windowSize) {
    if (!isAudible(start)) continue;
    firstAudibleSample = start;
    break;
  }
  if (firstAudibleSample < 0) {
    const durationSeconds = sampleLength / sampleRate;
    return { startSeconds: 0, endSeconds: durationSeconds };
  }

  let lastAudibleSample = sampleLength;
  for (let start = Math.max(0, sampleLength - windowSize); start >= 0; start -= windowSize) {
    if (!isAudible(start)) continue;
    lastAudibleSample = Math.min(sampleLength, start + windowSize);
    break;
  }

  return {
    startSeconds: Math.max(0, firstAudibleSample / sampleRate - 0.04),
    endSeconds: Math.min(sampleLength / sampleRate, lastAudibleSample / sampleRate + 0.12),
  };
}

function numberValue(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function asSeconds(value: unknown) {
  const number = numberValue(value);
  if (number === null || number < 0) return null;
  return number > 1_000 ? number / 1_000 : number;
}

function normalizeWord(word: unknown) {
  return typeof word === "string" ? word.replace(/\s+/g, " ").trim() : "";
}

function normalizeWordList(value: unknown): WordTimestamp[] {
  if (!Array.isArray(value)) return [];
  const words: WordTimestamp[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const word = normalizeWord(record.word ?? record.text ?? record.token ?? record.value);
    const start = asSeconds(record.start ?? record.startTime ?? record.start_time ?? record.start_seconds);
    const end = asSeconds(record.end ?? record.endTime ?? record.end_time ?? record.end_seconds);
    if (!word || start === null || end === null || end <= start) continue;
    words.push({ word, start, end });
  }
  return words;
}

function wordsFromParallelArrays(record: Record<string, unknown>) {
  const words = record.words ?? record.tokens ?? record.characters;
  const starts = record.start_times_seconds ?? record.character_start_times_seconds ?? record.startTimes ?? record.starts;
  const ends = record.end_times_seconds ?? record.character_end_times_seconds ?? record.endTimes ?? record.ends;
  if (!Array.isArray(words) || !Array.isArray(starts) || !Array.isArray(ends)) return [];

  const values = words.map((item) => typeof item === "string" ? item : String(item ?? ""));
  const startsSeconds = starts.map(asSeconds);
  const endsSeconds = ends.map(asSeconds);
  if (values.length !== startsSeconds.length || values.length !== endsSeconds.length) return [];

  // ElevenLabs returns character-level alignment. Fold non-whitespace characters
  // into words while retaining the provider's exact start/end boundaries.
  const result: WordTimestamp[] = [];
  let current = "";
  let currentStart: number | null = null;
  let currentEnd: number | null = null;
  const flush = () => {
    const word = normalizeWord(current);
    if (word && currentStart !== null && currentEnd !== null && currentEnd > currentStart) {
      result.push({ word, start: currentStart, end: currentEnd });
    }
    current = "";
    currentStart = null;
    currentEnd = null;
  };

  values.forEach((value, index) => {
    const start = startsSeconds[index];
    const end = endsSeconds[index];
    if (start === null || end === null || end <= start) return;
    if (/\s/.test(value)) {
      flush();
      return;
    }
    if (currentStart === null) currentStart = start;
    current += value;
    currentEnd = end;
  });
  flush();
  return result;
}

function findProviderWords(value: unknown, depth = 0): WordTimestamp[] {
  if (depth > 6 || value === null || typeof value !== "object") return [];
  if (Array.isArray(value)) {
    const direct = normalizeWordList(value);
    if (direct.length) return direct;
    for (const item of value) {
      const nested = findProviderWords(item, depth + 1);
      if (nested.length) return nested;
    }
    return [];
  }
  const record = value as Record<string, unknown>;
  const parallel = wordsFromParallelArrays(record);
  if (parallel.length) return parallel;
  for (const key of ["words", "word_timestamps", "wordTimestamps", "timestamps", "alignment", "normalized_alignment", "result", "data", "output"]) {
    const nested = findProviderWords(record[key], depth + 1);
    if (nested.length) return nested;
  }
  return [];
}

export function extractProviderTimeline(rawResult: unknown): AudioTimeline | null {
  const words = findProviderWords(rawResult)
    .filter((item, index, list) => index === 0 || item.start >= list[index - 1].start)
    .map((item) => ({ ...item, start: Math.max(0, item.start), end: Math.max(item.start + 0.01, item.end) }));
  if (!words.length) return null;
  return { words, durationSeconds: words[words.length - 1].end, source: "provider" };
}

export function normalizeAudioTimeline(value: unknown): AudioTimeline | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const words = normalizeWordList(record.words);
  if (!words.length) return extractProviderTimeline(value);
  const duration = asSeconds(record.durationSeconds ?? record.duration_seconds) ?? words[words.length - 1].end;
  return {
    words,
    durationSeconds: Math.max(duration, words[words.length - 1].end),
    source: record.source === "fallback" ? "fallback" : "provider",
  };
}

function comparableWords(text: string) {
  return text
    .normalize("NFKD")
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z0-9']/g, ""))
    .filter(Boolean);
}

export function timelineMatchesText(timeline: AudioTimeline, text: string) {
  const expected = comparableWords(text);
  const actual = timeline.words.flatMap((item) => comparableWords(item.word));
  if (!expected.length || !actual.length) return false;

  const lengthRatio = actual.length / expected.length;
  if (lengthRatio < 0.65 || lengthRatio > 1.35) return false;

  let expectedIndex = 0;
  let orderedMatches = 0;
  for (const word of actual) {
    const matchIndex = expected.indexOf(word, expectedIndex);
    if (matchIndex < 0 || matchIndex > expectedIndex + 2) continue;
    orderedMatches += 1;
    expectedIndex = matchIndex + 1;
  }
  return orderedMatches / Math.max(expected.length, actual.length) >= 0.7;
}

export function buildFallbackTimeline(text: string, durationSeconds: number): AudioTimeline {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const weights = words.map((word) => {
    const letters = word.replace(/[^a-z0-9]/gi, "").length;
    const punctuation = /[.!?]$/.test(word) ? 0.7 : /[,;:]$/.test(word) ? 0.3 : 0;
    return Math.max(0.75, Math.min(2.4, 0.55 + letters / 5 + punctuation));
  });
  const total = weights.reduce((sum, value) => sum + value, 0) || 1;
  let cursor = 0;
  const timelineWords = words.map((word, index) => {
    const span = durationSeconds * (weights[index] / total);
    const item = { word, start: cursor, end: cursor + span };
    cursor += span;
    return item;
  });
  return { words: timelineWords, durationSeconds, source: "fallback" };
}
