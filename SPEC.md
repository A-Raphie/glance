# Glance — SPEC

## One-liner
For blind and low-vision people who need an answer right now, **Glance** is a browser-based sight assistant
that turns any phone camera into on-demand answers — you ask, it looks and speaks — unlike Be My Eyes or
Seeing AI, which need an app install, a volunteer, or a wait.

## Event
IEEE Hack for Humanity ("Beyond 2030"), Track 2: AI for Accessibility & Disability Inclusion.
Solo entry. Deadline Oct 24, 2026 10:00 GMT+1. Rubric: impact 25, innovation 20, feasibility 20,
trust/ethics 15, scalability 10, adoption 10.

## Scope (v1 — what ships)
- Single page: hero → camera stage → answer card; landing sections (how/who/privacy/tech/FAQ).
- Camera via getUserMedia (rear-facing preferred) + **photo upload fallback** + **two bundled sample photos**
  (deterministic judge path with zero hardware).
- Ask modes: **Ask** (voice via SpeechRecognition or typed) and **Read** (verbatim OCR out loud).
- One-tap preset questions (describe / read / colors / expiry / hazard).
- Answers: speech (speechSynthesis, rate control) + text twin (aria-live), session history (device-only).
- Settings dialog: text size A/A+/A++, speech rate, high-contrast mode.
- `/api/ask` serverless: frame+question → OpenRouter vision model chain, key in env, nothing stored.
- Honesty posture: "verify anything critical" state line, [unclear] marks in read mode, no people-identification.

## Cut list (if time runs out)
- Voice input degradation → typed input is the floor (already shipped).
- OG image can be last (favicon + meta description required).
- Demo video: 45–60s scripted take beats fancy edit.

## Non-goals
- Continuous video streaming answers; offline mode; user accounts; storing anything.

## Rubric map
| Criterion | Where Glance scores |
|---|---|
| Impact (25) | 285M blind/low-vision people; zero-install reaches devices apps don't; answers in seconds |
| Innovation (20) | Task-directed Q&A on a live frame vs generic scene dump; the browser as the assistive surface |
| Feasibility (20) | Working end-to-end prototype, ~9KB JS, one endpoint; graceful degradation everywhere |
| Trust (15) | Nothing stored, quoted-verbatim read mode, "I can't tell" over guessing, hazard-first ordering |
| Scalability (10) | Static page + serverless; stateless; model-agnostic chain behind one env var |
| Adoption (10) | No install, no account, works on any phone browser; presets make first answer <10s |
