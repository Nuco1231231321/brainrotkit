# SEO Content Specification

## First-principles rule

Search traffic is useful only when the page answers the visitor's task and lets the visitor start that task immediately. From first principles, users care about the source they can provide, the result they will receive, what they can edit and what it will cost. Keyword placement supports that explanation; it does not replace it.

Each public tool page therefore contains:

1. One search intent and one visible H1.
2. A usable tool above the long-form explanation.
3. A direct definition of the tool.
4. Input, result, editing, cost and privacy details written to the user, not as an internal product specification.
5. At least six visible FAQ answers that match FAQPage schema.
6. Links to related tools without creating duplicate pages for the same intent.

## Validated page metrics

Metrics are taken from the rendered `<main>` by `npm run seo:check`.

| Page | Primary keyword | Main words | FAQ words | Exact primary uses | Exact density | User references | Secondary coverage |
|---|---|---:|---:|---:|---:|---:|---|
| `/` | AI brainrot video generator | 1,467 | 353 | 6 | 0.41% | 50 | brainrot video generator, AI brainrot generator, AI brainrot |
| `/italian-brainrot-generator` | italian brainrot generator | 1,094 | 284 | 8 | 0.73% | 28 | italian brainrot maker |
| `/italian-brainrot-voice-generator` | italian brainrot voice generator | 987 | 272 | 5 | 0.51% | 23 | italian brainrot voice, brainrot text to speech |
| `/pdf-to-brainrot` | pdf to brainrot | 1,032 | 279 | 6 | 0.58% | 21 | brainrot PDF |
| `/text-to-brainrot` | text to brainrot | 1,030 | 270 | 6 | 0.58% | 24 | text to AI brainrot video |

## Placement rules

- Put the exact primary keyword in Title, H1, Meta Description and the first direct-answer section.
- Use the exact primary phrase naturally in 0.2%-1.0% of visible main-content words.
- Include every mapped secondary phrase at least once, only where the sentence directly answers that variation.
- Include the primary keyword in a visible FAQ question or answer.
- Keep homepage content at 1,200-1,500 English words, including 300-450 FAQ words.
- Prefer direct `you` and `your` language over repeated references to the product, pipeline, system or workflow.
- Do not place Italian, PDF, Voice or Text secondary phrases repeatedly on the homepage.
- Do not create separate pages for plural, reordered or free variants of the same intent.
- Do not hide keyword blocks in footers, accordions without visible questions, alt text or schema-only content.

## Content language removed from public pages

Public tool pages must not show internal product language such as:

- frontend preview
- adapter integration
- production domain configuration
- planned workflow
- final launch gallery
- representative media slot

Status, login and application pages may explain that a service is temporarily unavailable, but the message must tell the user what is safe and what action remains available.

## E-E-A-T status

Current status: `partial`.

Trust signals already present:

- About, Contact, Privacy, Terms, Refund, Copyright and Data Deletion pages
- Visible last-updated date
- Clear credit, failure, watermark and file-retention rules
- Visible FAQ content matching structured data
- Public pages are indexable after the July 17 content and metadata audit

Experience evidence still required before indexing:

- Replace temporary media with real generated outputs.
- Show the original prompt or source for each example.
- Include at least one failed-attempt or correction example per workflow.
- Add playable MP4 or MP3 results with captions or transcripts.
- Verify pricing, credit cost and processing limits against connected providers.

Indexing is enabled, so replacing temporary media with verified generated outputs is the next E-E-A-T priority rather than a precondition hidden behind `noindex`.
