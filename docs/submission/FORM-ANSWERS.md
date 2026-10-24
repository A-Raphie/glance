# Glance — Devpost FORM-ANSWERS (drafted Oct 24, pre-submission)

Project title: **Glance** · Track: **2 — AI for Accessibility & Disability Inclusion** (primary, sole)
Live: https://glance-sepia.vercel.app · Repo: https://github.com/A-Raphie/glance
Team: solo entry (rules page: "Participation may be individual or team based").

---

## The Basics

**One-liner (repeat-verbatim bar):**
Point your camera. Ask your question. Hear the answer. Sight on demand, in the browser — no app, no account, no wait.

**Problem statement:**
An estimated 295 million people live with moderate-to-severe vision impairment. The tools built for them
are all installs: Be My Eyes and Seeing AI live in app stores, and the human path waits for a volunteer to
pick up. The moment is always the same — a medicine box on a counter, a jar on a shelf, a label in bad
light — and the current answer is "download an app, create an account, wait." The most universal computing
surface, the browser, has no on-demand sight. That's the gap: on devices that can't install, in moments
that can't wait, there is nothing.

**Proposed solution:**
Glance turns any phone or laptop browser into a sight assistant. The user opens a URL, allows the camera,
and asks a question — by voice or keyboard — about what's in front of them. One frozen frame plus their
question goes to a vision model; the answer comes back in about three seconds and is both spoken aloud and
written on screen. Two modes: **Ask** (task-directed answers: "what is this?", "is it expired?", "anything
hazardous here?") and **Read** (quotes all visible text verbatim, marking unclear parts). Five one-tap
preset chips cover the most common needs. The tool itself follows the accessibility standards it serves:
spoken-first with a text twin, text scaling to A++, high-contrast mode, full keyboard support.

**Prototype (what's built and working):**
- Live, deployed, end-to-end: https://glance-sepia.vercel.app
- Camera capture (rear-facing) with in-browser frame → JPEG; photo-upload fallback; two bundled sample
  photos so the full flow can be judged with no camera at all.
- Voice input (native SpeechRecognition) with typed floor; spoken answers (native speech synthesis) with
  adjustable rate; answer history kept on-device only.
- Settings: text size (A / A+ / A++), speech rate, high-contrast mode.
- Sample-judged results: ask mode names product + allergen correctly in 3.2 s; read mode quotes the
  medicine label verbatim including expiry date in 2.7 s.

**Demo evidence:** screenshots + 60-second video (scripted real run: sample photo → question → answer;
then live camera on a real object).

## Technology and architecture

One static page (vanilla TypeScript, ~9 KB JS, zero runtime dependencies) + one serverless function.
The browser handles camera (`getUserMedia`), voice in (`SpeechRecognition`), and voice out
(`speechSynthesis`) natively — nothing device-side is recorded. The function forwards one frame + one
question to a vision model chain on OpenRouter (`gemini-2.5-flash`, fallback `gpt-4o-mini`) with the API
key server-side. Data flow: frame + question → HTTPS → model → answer → browser; no database, no logs,
no cookies, nothing persisted anywhere. Built with Bun + Vite; deployed on Vercel.

## Impact and expected outcomes

Success measured against the moment, not the demo: time-to-first-answer under 10 seconds from opening the
URL (measured: first answer ~3 s after the frame). Value cases: reading medication labels and expiry dates,
identifying food and allergens on packaging, checking what's in front of you in an unfamiliar place,
any moment when reading is hard — poor light, small print, the wrong glasses. Because it's the browser,
it reaches shared computers, library terminals, borrowed phones, and work devices where installs are
locked down — populations app-store tools structurally miss.

## Trade-offs, risks, and constraints

- **Latency vs capability:** one frozen frame per question, not continuous video — chosen so answers stay
  fast (~3 s) and cheap (fractions of a cent). Continuous description is the obvious v2.
- **Vision models misread.** Blur, glare, and partial views produce wrong readings; mitigation is design
  honesty: verbatim quoting in Read mode, `[unclear]` markers, a standing "verify anything critical" line,
  and instructions to say "I can't tell" rather than guess. Not eliminated — disclosed and designed around.
- **Network required.** No offline mode in v1.
- **Voice input depends on the browser's speech engine.** Where it's missing (some browsers), typed input
  carries the flow — the typed path is the product's floor, not an afterthought.
- **Cost at scale:** each answer is a paid model call; free-for-users at hackathon scale, needs sponsorship
  or a freemium line for real deployment.

## Trust and responsible design

- **Privacy:** frames are sent only to answer the current question, over HTTPS, and discarded. No account,
  no analytics, no cookies; session history lives only on the user's device. Stated plainly on the page,
  not buried.
- **Hallucination controls:** read mode is verbatim-or-`[unclear]`; the model is instructed never to invent
  text, brands, prices, or dates, never to identify people, and to lead with hazards (flame, medication,
  broken glass) when present. Hazard-first ordering was observed in testing.
- **Equity:** the UI itself is WCAG-minded — contrast-checked tokens (≥ 5.5:1 everywhere, most text ≥ 8:1),
  user-scalable type, keyboard-complete, aria-live answers, reduced-motion respected. An accessibility tool
  that isn't accessible would be self-defeating.
- **Misuse:** low — a camera that describes what the user points it at. Person identification is refused by
  design; answers avoid guessing identity or emotion as fact.

## Scalability and reusability

Stateless static + serverless scales horizontally by construction. The model layer is a chain behind one
env var — swap or add models without touching the product. The answer pipeline (frame → question → spoken
answer) generalizes to adjacent users out of the box: people with reading disabilities (dyslexia), language
barriers on labels, anyone whose hands are full. No vendor lock on the device side — everything is web
standard.

## Implementation and adoption

Adoption friction is the product's core claim: zero. Open a URL, allow the camera, ask. No onboarding to
build, no store review, no update treadmill — refresh the page and everyone is current. To go real-world:
sponsor the per-answer model cost (pennies), add continuous-mode descriptions, and work with blind and
low-vision communities to tune preset questions to real daily needs — the architecture makes every one of
those a small, safe iteration.

## Team contribution

Solo entry. Raphie — product, design, and engineering end to end: the accessibility-first interaction
design, the client (camera/voice/settings), the serverless answer pipeline, deployment, and this writeup.
AI coding assistants were used for drafting acceleration, per the event's disclosure rule: assistant use
disclosed; all code reviewed, tested, and owned by the entrant.

---

## Standard Devpost fields (short-form)

**Inspired by (what inspired you):**
The moment that keeps repeating: someone holding a medicine box at arm's length, squinting. Every existing
tool answers that moment with "download an app." We wanted the answer to be "open a link."

**What it does:**
Turns any browser into an on-demand sight assistant: point the camera, ask out loud or by typing, hear the
answer in about three seconds — spoken and on screen. Two modes (Ask for task-directed answers, Read for
verbatim text), five one-tap presets, text scaling, high contrast, upload fallback, and sample photos so
anyone can try it in 90 seconds without a camera.

**How we built it:**
Vanilla TypeScript static page (~9 KB JS, zero runtime deps) + one serverless function. Browser-native
camera, speech recognition, and speech synthesis; vision answers via an OpenRouter model chain with the key
server-side. No database, no logs, no cookies — frames are processed and discarded. Bun + Vite + Vercel.

**Challenges we ran into:**
Making honesty the default: it's easy to demo a confident wrong answer, so the verbatim read mode,
`[unclear]` markers, hazard-first ordering, and the standing verify-line are load-bearing features, not
copy. Also: keeping the tool itself accessible (an accessibility tool failing its own contrast check would
be embarrassing) while keeping the whole app at ~9 KB.

**Accomplishments we're proud of:**
First answer in ~3 seconds from a URL anyone can open. The full judge flow works with no camera and no
account. Zero runtime dependencies.

**What we learned:**
The browser is underrated assistive tech: getUserMedia, SpeechRecognition, and speechSynthesis cover the
whole loop with nothing installed. And for accessibility products, the honesty layer isn't a feature —
it's the product.

**What's next:**
Continuous-mode descriptions (hands-free walk-around), community-tuned preset questions with blind and
low-vision testers, more languages, and a funded free tier.

**Built with:** typescript, vite, bun, vercel, openrouter, gemini, getusermedia, speech-synthesis, web-speech-api
