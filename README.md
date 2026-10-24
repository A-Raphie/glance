# Glance

**Point your camera. Ask your question. Hear the answer.**
Sight on demand, in the browser — no app, no account, no wait.

**Live: https://glance-sepia.vercel.app** · **Devpost: https://devpost.com/software/glance-6c45pt** · **Demo video: https://www.youtube.com/watch?v=MrRbW_vATmE**

Glance is a sight assistant for blind and low-vision users that runs entirely in the browser
you already have. Open the page on any phone, allow the camera, and ask out loud — *"What is this?",
"Read this label", "What's the expiry date?"* — and Glance answers in speech and text in about three seconds.

## Why

An estimated 295 million people live with moderate-to-severe vision impairment, and the tools built for
them are all **installs**: Be My Eyes and Seeing AI live in app stores, and the human path waits for a
volunteer to pick up. The most universal computing surface — the browser — has no on-demand sight.
Glance is that missing layer: nothing to download, nothing to set up, an answer in seconds on any device
with a camera.

## Try it — the 90-second path

No camera required to evaluate:

1. Open **https://glance-sepia.vercel.app**
2. Tap **"Try a sample photo"** → pick **"A medicine box"**
3. The answer arrives in ~3 seconds, spoken aloud and written on screen.

Then, on a phone: **"Open the camera"** → point at anything → tap the round shutter → ask by voice or
pick a preset chip ("Read this", "Expiry date", "Anything hazardous?"). **Read mode** quotes visible text
verbatim instead of describing it.

## What makes it defensible

- **Task-directed answers, not scene dumps.** You ask; it answers *your* question about the frame.
- **The honesty layer.** Read mode quotes exactly, marks unreadable text as `[unclear]`, and every answer
  carries a "verify anything critical" state line. It is instructed to say "I can't tell" rather than guess,
  and to never identify people.
- **Safety-first ordering.** If the frame contains a hazard — a flame, medication, broken glass — that's the
  first sentence spoken.
- **Accessibility of the tool itself.** Spoken-first answers with a text twin (aria-live), text scaling to
  A++ and a high-contrast mode, full keyboard support, visible focus, reduced-motion respected.

## How it's built

| Layer | Choice |
|---|---|
| Frontend | Static page, vanilla TypeScript, ~9 KB JS. No framework, no runtime dependencies. |
| Camera | Native `getUserMedia`, rear-facing preferred, frame → JPEG in-browser. |
| Voice in | Native `SpeechRecognition`; typed input is always available as the floor. |
| Voice out | Native `speechSynthesis` with user-controlled rate. |
| Answers | One serverless function → OpenRouter vision model chain (`gemini-2.5-flash` → `gpt-4o-mini` fallback). Key lives server-side. |
| Storage | **None.** No database, no analytics, no cookies. Frames are processed per request and discarded. |
| Deploy | Vercel (static + serverless). |

## Honesty table

| Claim | Status |
|---|---|
| Live URL answers real questions | ✅ measured 2.7–3.2 s per answer |
| Nothing is stored | ✅ stateless function, no database, no logs |
| Read mode quotes verbatim | ✅ verified against sample labels |
| Works on iPhone | ⚠️ camera + speech tested in WebKit browsers; if any native API is missing, the typed/upload path covers it |
| Sample photos are real | ❌ they are rendered label reproductions, disclosed as samples in the UI |
| Hazards always named first | ⚠️ instructed and observed in testing, not guaranteed |

## Judging criteria mapping (IEEE Hack for Humanity, Track 2)

| Criterion (pts) | Where Glance scores |
|---|---|
| Impact & problem relevance (25) | 295M people with vision impairment; zero-install reaches devices and moments apps don't |
| Innovation & creativity (20) | The browser as the assistive surface; task-directed Q&A on a live frame |
| Technical feasibility (20) | Working end-to-end prototype with graceful degradation at every step |
| Trust, ethics & risk (15) | Nothing stored, verbatim quotes, "can't tell" over guessing, hazard-first, no person ID |
| Scalability & reusability (10) | Stateless static + serverless; model-agnostic chain behind one env var |
| Implementation & adoption (10) | No install, no account, first answer in under 10 seconds |

## Run it

```bash
bun install
vercel link            # your project
vercel env add OPENROUTER_API_KEY production
vercel dev             # local: http://localhost:3000
```

## Event

Built for the **IEEE Hack for Humanity** hackathon — *"Beyond 2030: Build the World You Want to Live In"*,
Track 2: AI for Accessibility & Disability Inclusion. Solo entry, October 2026. **Submitted** Oct 24, 2026.
