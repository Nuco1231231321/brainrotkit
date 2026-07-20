# BrainrotKit Frontend

Implementation-ready frontend for the BrainrotKit V1 PRD. The project follows `DESIGN.md` as its visual source of truth and uses Next.js App Router for server-rendered public pages and noindex application routes.

## Run locally

```bash
npm install
npm run dev
```

The current local development server uses `http://localhost:3001` because port 3000 was already occupied during verification.

Quality checks:

```bash
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
npm run seo:check
npm run frontend:audit
```

## Cloudflare deployment

For Cloudflare Workers Builds, use `npm run build:cloudflare` as the build command and `npx opennextjs-cloudflare deploy` as the deploy command. Alternatively, use `npm run deploy` as one combined command.

Do not use `npm run build` as the OpenNext build command. It runs the regular Next.js build that OpenNext calls internally; the OpenNext adapter must run separately to create `.open-next/worker.js`.

## Implemented routes

Public tool and commercial pages:

- `/`
- `/italian-brainrot-generator`
- `/italian-brainrot-voice-generator`
- `/pdf-to-brainrot`
- `/text-to-brainrot`
- `/templates`
- `/pricing`

Account and product pages:

- `/login`
- `/checkout`
- `/app`
- `/app/projects/[projectId]`
- `/app/billing`
- `/app/account`
- `/admin`

Support and policy pages:

- `/about`
- `/contact`
- `/privacy`
- `/terms`
- `/refund-policy`
- `/copyright`
- `/data-deletion`
- `/status`

## Current integration boundary

Production Google OAuth, Cloudflare D1 account storage and Creem billing are connected. A private production Supabase Storage bucket is provisioned for source files and generated media; application upload and download routes are the next integration step. No production AI, OCR, TTS, image, video or rendering request is made.

`lib/adapters.ts` defines the current contracts:

- `AuthenticationAdapter`
- `GenerationAdapter`
- `BillingAdapter`
- `ProjectRepository`

The Google button uses the production Google OAuth application. Successful sign-in creates or updates the user in remote D1, then issues a 30-day HMAC-signed, HTTP-only BrainrotKit session and preserves the same-site return path.

Static HTML is copied into the Cloudflare asset bundle after every OpenNext build. Public pages and the account workspace therefore bypass the Worker runtime, while small `/api/account` and billing endpoints perform the authenticated D1 reads. This design keeps normal navigation inside the Workers Free CPU limit.

Checkout uses Creem production products and returns billing events through a signed production webhook. Subscription management uses the Creem customer portal. Card details are handled by Creem rather than stored by BrainrotKit.

Public tool forms store the pending draft at:

```text
brainrotkit:pending-draft
```

Project editor changes are autosaved locally under `brainrotkit:editor:<projectId>`. Text and settings can be restored after reload. Browser security does not allow a selected PDF file to be restored automatically, so the login screen explicitly asks the user to select that file again.

Frontend-only state coverage includes:

- Draft, processing, partial failure, failure, completed and insufficient-credit project states
- Google login pending, unavailable and retry states
- Checkout idle, pending, unavailable, processing, failed, canceled and provider-returned states
- Empty project filters, deletion confirmation, rename, duplicate and retry actions

The later generation integration must:

1. Read the pending draft after the Google session is established.
2. Create the project through the application API.
3. Remove the local draft only after the server confirms project creation.
4. Return to the saved `returnTo` path or the new project editor.

## Domain and indexing

Copy `.env.example` to `.env.local` for local development:

```text
NEXT_PUBLIC_SITE_URL=https://brainrotkit.com
NEXT_PUBLIC_ALLOW_INDEXING=false
```

Keep `NEXT_PUBLIC_ALLOW_INDEXING=false` until all five tool pages have final media examples, connected generation and production legal copy. When set to `true`, public canonical URLs, sitemap and robots rules become indexable while `/login`, `/checkout`, `/app` and `/admin` remain noindex.

## Media replacement

Current raster media uses temporary seeded preview URLs. Do not change page components when final assets are available. Replace only the `src` values in `lib/media.ts` and the project preview values in `lib/mock-data.ts`.

Recommended final media set:

- 8-12 verified examples for each public tool page
- Source prompt or PDF excerpt for every example
- Final vertical poster and playable MP4
- Captions or transcript for video accessibility
- Poster dimensions reserved at 9:16 or 4:5

## Next integration order

1. Connect the project database tables and signed Supabase Storage upload/download routes.
2. Connect generation providers and asynchronous job stages.
3. Add automatic generation-failure credit refunds.
4. Replace preview media and complete legal review.
5. Enable public indexing after the real generation workflow is verified.
