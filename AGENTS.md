# Glance — agent behavior layer

## What this is
Browser-based sight assistant for blind/low-vision users (IEEE Hack for Humanity, Track 2).
Static vanilla-TS page (`src/`) + one serverless function (`api/ask.ts`). Deployed: https://glance-sepia.vercel.app

## Hard rules
- **Zero runtime dependencies.** No npm packages in the browser bundle. Native APIs only (getUserMedia, SpeechRecognition, speechSynthesis, `<dialog>`).
- **Nothing stored, ever.** No database, no logs, no cookies, no analytics. Frames are processed per request and discarded. Any PR that persists user data is wrong.
- **Accessibility is the product.** Every visible change must keep: AA+ contrast (tokens in `src/tokens.css` — no raw hex in `styles.css`), text-scaling via `[data-font]`, keyboard reachability, aria-live answer region, reduced-motion respect. An a11y regression is a P0.
- **Honesty posture:** read mode quotes verbatim + `[unclear]` markers; never identify people; hazards named first; "verify anything critical" line stays.
- Model chain lives in `GLANCE_MODELS` env (default `google/gemini-2.5-flash,openai/gpt-4o-mini`); key only ever server-side.

## Verify before claiming done
- `bunx tsc --noEmit && bun run build` must pass.
- Live judge path: sample photo → answer <6s → status text must NOT say "Thinking…" after the answer lands.
- Screenshots re-gated by vision subagent when UI changes (gate history in ORCHESTRATOR.md).

## Quirks
- IAB/Chrome `reload()` restores scroll position — use a fresh query param when you need a clean top-of-page state.
- Full-page screenshots of this app stitch duplicated in the IAB capture — use viewport shots for evidence.
