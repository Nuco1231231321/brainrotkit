import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../lib/brainrot-script.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const scriptModule = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const { normalizeBrainrotScript, wordLimitForDuration } = scriptModule;

const legacy = normalizeBrainrotScript({
  title: "Legacy clip",
  hook: "Wait for the twist",
  narration: "A saved project still opens after the script upgrade.",
  scenes: [{ narration: "A saved project still opens after the script upgrade.", imagePrompt: "One robot", motionPrompt: "Move forward" }],
});
assert.equal(legacy.version, 2);
assert.equal(legacy.contentFormat, "story");
assert.equal(legacy.speakers.length, 1);
assert.equal(legacy.dialogue.length, 1);
assert.equal(legacy.narration, legacy.dialogue[0].text);

const debate = normalizeBrainrotScript({
  contentFormat: "debate",
  title: "The impossible shortcut",
  hook: "Speed or accuracy?",
  narration: "This stale field must be replaced.",
  speakers: [{ id: "only", name: "Only", role: "host", voicePreset: "Milano Rush", captionColor: "#ffffff" }],
  dialogue: [
    { speakerId: "only", text: "Speed wins when nobody watches.", emotion: "excited" },
    { speakerId: "missing", text: "Accuracy wins when the result matters.", emotion: "skeptical" },
  ],
  scenes: [{ narration: "Two hosts disagree.", imagePrompt: "Two original hosts", motionPrompt: "Alternating camera" }],
});
assert.equal(debate.speakers.length, 2);
assert.equal(debate.dialogue.length, 2);
assert.equal(debate.narration, "Speed wins when nobody watches. Accuracy wins when the result matters.");
assert.ok(debate.dialogue.every((turn) => debate.speakers.some((speaker) => speaker.id === turn.speakerId)));

const study = normalizeBrainrotScript({
  contentFormat: "study",
  studyMode: "quiz",
  title: "Retrieval practice",
  hook: "Can you recall it?",
  narration: "Test yourself before rereading.",
  sourceReferences: [{ label: "Page 3", excerpt: "Retrieval strengthens later recall." }],
});
assert.equal(study.studyMode, "quiz");
assert.deepEqual(study.sourceReferences, [{ label: "Page 3", excerpt: "Retrieval strengthens later recall." }]);
assert.equal(wordLimitForDuration(30, "study"), 75);
assert.equal(wordLimitForDuration(30, "debate"), 84);

console.log("Brainrot script fixtures passed: legacy upgrade, debate speakers and study references.");
