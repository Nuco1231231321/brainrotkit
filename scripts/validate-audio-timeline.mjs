import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../lib/audio-timeline.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const timelineModule = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const { buildFallbackTimeline, extractProviderTimeline, normalizeAudioTimeline, timelineMatchesText } = timelineModule;

const elevenLabs = extractProviderTimeline({
  output: {
    alignment: {
      characters: ["H", "i", " ", "a", "l", "l"],
      character_start_times_seconds: [0, 0.08, 0.16, 0.22, 0.3, 0.38],
      character_end_times_seconds: [0.08, 0.16, 0.2, 0.3, 0.38, 0.5],
    },
  },
});
assert.deepEqual(elevenLabs?.words, [
  { word: "Hi", start: 0, end: 0.16 },
  { word: "all", start: 0.22, end: 0.5 },
]);
assert.equal(elevenLabs?.source, "provider");

const kieWords = extractProviderTimeline({
  result: {
    word_timestamps: [
      { word: "Wait", start: 0, end: 0.31 },
      { text: "what?", start_time: 0.34, end_time: 0.88 },
    ],
  },
});
assert.deepEqual(kieWords?.words, [
  { word: "Wait", start: 0, end: 0.31 },
  { word: "what?", start: 0.34, end: 0.88 },
]);

const nestedAlignment = extractProviderTimeline({
  audio_url: "https://cdn.example.test/voice.mp3",
  alignment: {
    words: [{ word: "Ready", start: 0, end: 0.4 }],
  },
});
assert.deepEqual(nestedAlignment?.words, [{ word: "Ready", start: 0, end: 0.4 }]);
assert.equal(normalizeAudioTimeline({ words: "not-an-array", durationSeconds: -1 }), null);

const milliseconds = extractProviderTimeline({
  words: [{ token: "Fast", start: 1200, end: 1600 }],
});
assert.deepEqual(milliseconds?.words, [{ word: "Fast", start: 1.2, end: 1.6 }]);

const fallback = buildFallbackTimeline("One short sentence.", 2.4);
assert.equal(fallback.words.length, 3);
assert.equal(fallback.source, "fallback");
assert.ok(Math.abs(fallback.durationSeconds - 2.4) < 0.001);
assert.ok(Math.abs(fallback.words.at(-1).end - 2.4) < 0.001);

assert.equal(timelineMatchesText(kieWords, "Wait, what?"), true);
assert.equal(timelineMatchesText(kieWords, "A completely unrelated caption line"), false);

console.log("Audio timeline fixtures passed: provider alignment, text matching and fallback timing.");
