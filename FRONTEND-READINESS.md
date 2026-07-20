# Frontend Readiness Audit

Date: July 17, 2026  
Scope: UX, responsive behavior, SEO, accessibility and integration boundaries. Google authentication, Cloudflare D1 account storage and Creem billing are connected to production. AI generation, OCR, TTS, media storage and rendering remain intentionally disconnected.

## First-principles acceptance rule

A visitor must be able to answer four questions without instructions:

1. What can I provide?
2. What will I receive?
3. What can I change before paying?
4. What happens if login, generation or payment fails?

The frontend is considered ready for integration only when every visible action either performs a local frontend action or returns a clear, nearby state. No button may silently fail or imply that an external request was sent.

## Implemented entry paths

| User task | Entry route | Frontend result |
|---|---|---|
| Create a Brainrot video | `/` | Text, PDF and Idea inputs with visible cost and mobile-first CTA |
| Create an Italian character | `/italian-brainrot-generator` | Character, personality, setting, voice and output controls |
| Generate a Brainrot voice | `/italian-brainrot-voice-generator` | Script, preset, speed, pitch, intensity and MP3 intent |
| Turn a PDF into a study video | `/pdf-to-brainrot` | Upload, OCR-oriented settings, summary depth and scene controls |
| Turn text into scenes | `/text-to-brainrot` | Hook, tone, audience, voice, captions and video controls |
| Select a plan or credits | `/pricing` → `/login` → `/checkout` | Production Google login, Creem checkout and the return path are connected |

## UX state coverage

| State | Evidence |
|---|---|
| Default and Draft | Public tools and `/app/projects/pasta-pilot` |
| Field validation | Text length, PDF selection and original-character confirmation errors are attached to their fields |
| Authentication required | Draft is saved before `/login`; Google is the only login method |
| Google unavailable/error | Login button exposes pending, unavailable and retry states without losing the draft |
| Insufficient credits | `/app/projects/pasta-pilot?balance=4` shows the exact deficit and preserves the return path through Pricing and Checkout |
| Processing | `/app/projects/exam-rescue` shows current stage, estimated wait and safe exit |
| Partial failure / Failure | `/app/projects/opera-mode` keeps completed work, states the failed stage and confirms returned credits |
| Success | `/app/projects/gravity-glitch` prioritizes download, remix and settings export |
| Checkout processing/success/failure/cancel | `/checkout?status=processing`, `success`, `failed`, `canceled` |
| Empty | Project filters display one clear Create action when no projects match |
| Deleted / expired | Project not-found state explains the possible file state and returns to Projects |
| Route loading/error | Structural loading states and retryable route error page |

## Draft and file behavior

- Public form text and selected settings use `brainrotkit:pending-draft`.
- Project editor changes use `brainrotkit:editor:<projectId>` and expose Saving, Saved and Failed-to-save states.
- A selected PDF cannot be restored by a browser after an OAuth navigation. The frontend saves its settings and filename intent, then explicitly tells the user to select the PDF again.
- `returnTo` accepts only same-site paths. External and protocol-relative values fall back to `/app`.

## Responsive verification

Verified viewport sizes:

- `360 × 800`
- `390 × 844`
- `768 × 1024`
- `1024 × 768`
- `1440 × 900`

Observed requirements:

- No tested route creates document-level horizontal scrolling.
- Homepage and all four tool-page Generate actions are visible above the fixed mobile navigation.
- Mobile project editor keeps the main Generate/Download/Retry action fixed above the safe-area-aware bottom navigation.
- Tables scroll inside their own containers instead of widening the page.
- Important mobile controls use at least a 44px touch height.

## SEO and indexing

- Public pages have unique Title, Description, canonical, Open Graph and Twitter metadata and are open to indexing after the July 17 audit.
- Five core pages have one H1, mapped keywords, visible FAQs and matching JSON-LD.
- Login, Checkout, App and Admin routes are `noindex`.
- Public marketing pages are crawlable and listed in the sitemap. Private account, checkout, login and admin routes remain `noindex`.
- Indexing must remain disabled until the temporary media, example domain, legal drafts and disconnected services are replaced.

## Integration contracts

`lib/adapters.ts` contains the integration boundaries for:

- Google authentication
- Project generation
- Billing checkout
- Project storage

Google authentication is handled by NextAuth against the production Google OAuth application. After the OAuth callback, BrainrotKit issues a 30-day HMAC-signed, HTTP-only application session. Public pages and the `/app` workspace are served asset-first as static HTML; small authenticated JSON endpoints read account and billing state from remote D1. This keeps normal navigation within the Workers Free 10 ms CPU limit. Checkout, portal and signed webhook routes use Creem production endpoints. Generation and project-storage adapters remain unavailable and fail fast without reserving credits.

## Production capabilities connected

- `brainrotkit.com` on Cloudflare Workers
- Cloudflare asset-first static delivery and zone-level `www` to apex redirect
- Google-only OAuth in production
- Signed application session with simultaneous NextAuth/application sign-out
- Remote Cloudflare D1 account, credit ledger and billing records
- Creem live checkout for subscriptions and one-time credit packs
- Creem production webhook verification and billing portal

## Capabilities that intentionally remain disconnected

- AI, TTS, OCR, image and render providers
- Project object storage, generated media and signed downloads
- Server-side draft conversion into real generation jobs
- Asynchronous job updates and automatic credit refunds
- Real generated examples, playable media and final legal copy
- Analytics and production usability testing with target users

These boundaries do not affect production login or billing, but they must be completed before users can generate or download AI media.
