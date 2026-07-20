# BrainrotKit AI Integration Plan

Updated: July 17, 2026

## 1. First-principles decision

A finished BrainrotKit project needs five different capabilities:

1. Read the source.
2. Turn the source into a script and scene plan.
3. Create a controllable voice.
4. Create visual assets and motion.
5. Assemble the final video.

These steps do not have the same cost. Video generation is the dominant cost; OCR, script generation, TTS and still images are comparatively cheap. The product should therefore create an editable script, voice preview and storyboard first, and spend video credits only after the user confirms the direction.

This is the recommended launch stack:

| Capability | Launch provider | Why |
|---|---|---|
| PDF text extraction | PDF.js in the browser | Free, fast for text PDFs, no Worker CPU cost |
| Scanned PDF OCR | Tesseract.js in a Web Worker | Free fallback; runs on the user's device |
| Script, summary and scene JSON | Cloudflare Workers AI `@cf/qwen/qwen3-30b-a3b-fp8` | Already on Cloudflare, structured multilingual output, very low token cost |
| General scene images | Cloudflare Workers AI `@cf/black-forest-labs/flux-1-schnell` | Daily free allocation and extremely low paid cost |
| Character/reference images | MiniMax `image-01` or `image-01-live` | Image-to-image support and stronger character continuity at ¥0.025 per image |
| Voice and word timestamps | MiniMax `speech-2.8-turbo` | Italian and many other languages, controllable speed/pitch/emotion, word timestamps, ¥2 per 10,000 characters |
| AI motion video | Volcengine Ark `doubao-seedance-1.5-pro` | 9:16, 4–12 second clips, webhook support, lower 480p/720p cost than the current alternatives reviewed |
| Final captions/audio assembly | Browser WebCodecs + Mediabunny | No render-server bill; the server stores assets and job state only |
| Files | Supabase Storage Free | No card required, 1 GB storage and 5 GB monthly egress for the launch phase |
| Job orchestration | Cloudflare Queues + D1 | Fits the existing stack and avoids holding a Worker request open |

## 2. Why not use one provider for everything?

Cloudflare is the cheapest place for text and generic images, but it currently has no suitable video generation model and its low-cost TTS options do not cover the Italian voice experience as well as MiniMax.

MiniMax can provide text, voice, image and video, but its current high-quality video tiers are more expensive than Seedance for the output quality BrainrotKit needs. It remains the best reviewed voice option because it offers Italian system voices, emotion controls, voice design, optional cloning and word-level subtitle timestamps.

Seedance 1.5 Pro can generate audio, but generated audio is not a substitute for exact narration. BrainrotKit must keep the approved script, voice and caption timing stable across retries, so the launch video requests should use silent motion and add the MiniMax narration afterward.

## 3. Verified public pricing

### Cloudflare Workers AI

- Free allocation: 10,000 Neurons per day.
- Overage on Workers Paid: $0.011 per 1,000 Neurons.
- Qwen3 30B A3B FP8: $0.051 per million input tokens and $0.335 per million output tokens.
- FLUX.1 Schnell: $0.0000528 per 512×512 tile plus $0.0001056 per diffusion step.
- MeloTTS is inexpensive at $0.0002 per audio minute, but MiniMax is selected because BrainrotKit needs Italian voices and more delivery controls.

A typical 6,000-token source plus 2,000-token structured result uses about 89 Neurons. The daily free allocation can cover roughly 100 such script jobs before any paid AI usage.

### MiniMax

- `speech-2.8-turbo`: ¥2 per 10,000 input characters.
- `speech-2.8-hd`: ¥3.5 per 10,000 input characters.
- Voice Design: ¥9.9 per created voice, charged on first synthesis use.
- Voice Cloning: ¥9.9 per cloned voice, charged on first synthesis use; account verification is required.
- `image-01` / `image-01-live`: ¥0.025 per generated image.
- Italian system voices include `Italian_BraveHeroine`, `Italian_Narrator`, `Italian_WanderingSorcerer` and `Italian_DiligentLeader`.
- Speech 2.8 supports speed, volume, pitch, emotion, pronunciation overrides, Italian language boosting and sentence/word timestamps.

### Volcengine Seedance 1.5 Pro

Official five-second examples:

| Native motion quality | Silent | With generated audio |
|---|---:|---:|
| 480p | ¥0.40 | ¥0.80 |
| 720p | ¥0.86 | ¥1.73 |
| 1080p | ¥1.94 | ¥3.89 |

Only successful video outputs are charged. The model supports 9:16 and integer durations from 4 to 12 seconds. Video generation is asynchronous and supports a Cloudflare webhook callback.

## 4. Estimated cost per finished result

Planning assumption: three five-second scenes, roughly 300 narration characters, three still images, and ¥7.2 per US dollar. Storage and queue use remain inside the free tier at early volume.

| Result | Estimated direct cost | Recommended credits | Revenue at current 175 credits / $9.99 pack | Estimated gross margin |
|---|---:|---:|---:|---:|
| 15s free motion, 720p watermarked export from 480p source | about ¥1.35 / $0.19 | 10 | $0.57 | about 67% |
| 15s Creator, 1080p export from 720p source | about ¥2.72 / $0.38 | 12 | $0.69 | about 45% |
| 15s Pro, native 1080p motion | about ¥5.96 / $0.83 | 20 | $1.14 | about 28% |
| Voice only, up to about 60s | up to about ¥0.18 / $0.03 | 2 | $0.11 | about 78% |

Duration pricing should scale from the 15-second base:

- 15 seconds: 1× base credits.
- 30 seconds: 2× base credits.
- 60 seconds: 4× base credits.

The current 10-credit homepage estimate is suitable for one free-standard 15-second result. Native 1080p must not also cost 10 credits.

## 5. User experience that protects both time and money

### Stage A: instant project draft

- Save the source and selected settings immediately.
- For PDFs, extract embedded text in the browser first.
- Run OCR only on pages that do not contain enough usable text.
- Show page-by-page progress and allow the user to continue editing extracted text.

### Stage B: cheap editable preview

- Generate structured JSON: hook, narration, scene list, image prompts, motion prompts and safety flags.
- Generate the voice preview and word timestamps.
- Generate still storyboard images.
- Show the exact final-render credit cost.
- Let the user change one scene, voice or caption style before video spend begins.

Target experience: the first editable storyboard and voice preview should appear in roughly 10–40 seconds, depending on OCR and source length.

### Stage C: expensive final motion

- Reserve credits in one D1 transaction.
- Submit scene clips to Seedance, with at most two scene requests in flight per project initially.
- Use webhooks to update each scene independently.
- Let the user leave the page; progress remains in D1 and finished assets are stored in Supabase Storage.
- Return credits for the failed scene if no usable clip is delivered.
- Assemble captions, MiniMax narration and scene clips in the browser when the assets are ready.

Video provider latency is not guaranteed by the official documentation. The UI should promise no exact completion time and should present a practical expectation of a few minutes, with persistent progress rather than a blocking spinner.

## 6. Cloudflare and Supabase architecture

```text
Browser
  ├─ PDF.js / Tesseract.js
  ├─ editable project UI
  └─ WebCodecs + Mediabunny final export
        │
        ▼
Cloudflare Worker APIs
  ├─ signed session and validation
  ├─ D1 credit reservation
  ├─ Workers AI script/image calls
  ├─ MiniMax TTS/image calls
  └─ Seedance task submission
        │
        ├─ D1: project, job, step and credit state
        ├─ Supabase Storage: sources, images, audio, clips and final exports
        └─ Queue: short orchestration messages containing job IDs only

Seedance / MiniMax webhooks
  └─ verify event → update D1 → copy result to Supabase Storage → release next step
```

No API key is exposed to the browser. No Cloudflare request stays open while a video model is working. The Worker only validates, submits, records and reacts to callbacks.

## 7. Required D1 records

Keep the schema direct and reversible:

- `projects`: owner, type, title, source state, settings and status.
- `generation_jobs`: project, requested quality, credit reservation and overall status.
- `generation_steps`: script, voice, image, video scene and render states with provider IDs.
- `media_assets`: storage object key, kind, duration, dimensions, retention and ownership.
- `credit_reservations`: reserved, charged or returned amount linked to one job.
- `provider_events`: deduplicated webhook event IDs and safe diagnostics.

Do not add a generic workflow engine. The launch pipeline has a known, small number of steps and should use explicit states.

## 8. Launch safeguards

- Give a new Google account 10 credits: enough for one standard 15-second result, not repeated unlimited previews.
- Reserve credits before video task submission; charge after usable output; return the failed portion automatically.
- Add per-account, per-IP and per-device daily creation limits for free users.
- Stop new free jobs before a provider or Workers AI free quota is exhausted; do not silently create an uncontrolled bill.
- Keep uploaded PDFs for no more than 24 hours by default.
- Store provider keys only as Cloudflare secrets.
- Log provider request IDs, prices and outcomes without logging full private prompts or PDF contents.
- Start Voice Cloning only after the regular voice flow is stable. MiniMax makes it technically feasible later at ¥9.9 per cloned voice plus normal synthesis usage.

## 9. Implementation order

1. Add the Supabase Storage adapter, Queue and the six D1 records.
2. Implement credit reservation, success charge and failure return before connecting a costly model.
3. Connect PDF.js and browser OCR.
4. Connect Workers AI structured script generation.
5. Connect MiniMax Speech 2.8 Turbo and word timestamps.
6. Connect still images and the editable storyboard.
7. Connect Seedance scene generation and webhook updates.
8. Add browser final assembly and download.
9. Replace temporary media with real outputs and complete the final SEO/E-E-A-T review.
10. Enable public indexing only when the real generation paths and examples are verified.

## 10. Official references

- Cloudflare Workers AI pricing: https://developers.cloudflare.com/workers-ai/platform/pricing/
- Cloudflare Workers AI models: https://developers.cloudflare.com/workers-ai/models/
- Supabase Storage: https://supabase.com/docs/guides/storage
- Supabase pricing: https://supabase.com/pricing
- Cloudflare Queues pricing: https://developers.cloudflare.com/queues/platform/pricing/
- Volcengine Ark model pricing: https://www.volcengine.com/docs/82379/1544106
- Volcengine video generation guide: https://www.volcengine.com/docs/82379/1366799
- MiniMax pay-as-you-go pricing: https://platform.minimaxi.com/docs/guides/pricing-paygo
- MiniMax speech API: https://platform.minimaxi.com/docs/api-reference/speech-t2a-http
- MiniMax system voices: https://platform.minimaxi.com/docs/faq/system-voice-id
- PDF.js: https://github.com/mozilla/pdf.js
- Tesseract.js: https://github.com/naptha/tesseract.js
- Mediabunny: https://github.com/Vanilagy/mediabunny
