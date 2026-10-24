## Primary challenge track
Track 2: AI for Accessibility and Disability Inclusion.

## Inspiration
An estimated 295 million people live with moderate-to-severe vision impairment. The tools built for them are all installs: Be My Eyes and Seeing AI live in app stores, and the human path waits for a volunteer to pick up. The moment is always the same: a medicine box on a counter, a jar on a shelf, a label in bad light. The current answer is "download an app, create an account, wait." The most universal computing surface, the browser, has no on-demand sight. Glance is that missing layer.

## What it does
**Point your camera. Ask your question. Hear the answer.**
- **Zero install**: runs in any phone or laptop browser. No account, no setup.
- **Ask mode**: task-directed answers to spoken or typed questions: "What is this?", "Is it expired?", "Anything hazardous here?"
- **Read mode**: quotes all visible text verbatim and marks unclear parts as [unclear] instead of guessing.
- **One-tap presets** for the most common needs: describe, read, colors, expiry date, hazards.
- **Spoken answers with an on-screen text twin**, typically in about 3 seconds.
- The tool itself is accessible: text scaling to A++, high-contrast mode, full keyboard support, aria-live announcements.
- No camera? Photo upload fallback plus two bundled sample photos, so anyone can evaluate the full flow in 90 seconds.

## How I built it
One static page (vanilla TypeScript, about 9 KB of JS, zero runtime dependencies) plus one serverless function. The browser handles the camera (getUserMedia), voice input (SpeechRecognition), and spoken answers (speechSynthesis) natively. The function forwards one frozen frame plus the question to a vision model chain through OpenRouter (gemini-2.5-flash with gpt-4o-mini fallback); the API key stays server-side. Nothing is stored: no database, no logs, no cookies, no analytics. Built with Bun and Vite, deployed on Vercel.

## Challenges I ran into
Making honesty the default. It is easy to demo a confident wrong answer, so the verbatim read mode, the [unclear] markers, hazard-first ordering, and the standing "verify anything critical" line are load-bearing features, not copy. The second fight was with WebKit itself: a sibling video element blanks the frozen photo's rendering even while hidden. The fix was to remove the video element from the DOM entirely while a still frame is shown.

## Accomplishments I'm proud of
- First answer in about 3 seconds from a URL anyone can open (measured 2.7 to 3.2 s).
- The full evaluation path works with no camera and no account.
- Zero runtime dependencies in a 9 KB bundle.
- Every accessibility claim the product makes, the product itself passes: AA+ contrast tokens, scalable type, keyboard-complete controls.

## What I learned
The browser is underrated assistive tech: getUserMedia, SpeechRecognition, and speechSynthesis cover the entire sight-assistant loop with nothing installed. And for accessibility products, the honesty layer is not a feature; it is the product.

## What's next for Glance
Continuous-mode descriptions (hands-free walk-around), preset questions tuned with blind and low-vision testers, more languages, and a funded free tier.

---
**Try it**: https://glance-sepia.vercel.app
**Demo video (35 s)**: https://glance-sepia.vercel.app/demo.mp4
**Source**: https://github.com/A-Raphie/glance

## Judging criteria mapping
- **Impact and problem relevance (25)**: 295M people with vision impairment; the browser reaches shared computers, borrowed phones, and locked-down devices that app-store tools structurally miss; answers in seconds, not volunteer queues.
- **Innovation (20)**: the browser as the assistive surface; task-directed Q&A on a frozen frame instead of generic scene dumps.
- **Technical feasibility (20)**: live end-to-end prototype, ~9 KB client, one stateless endpoint, graceful degradation at every step (camera to upload to samples, voice to typed).
- **Trust, ethics, risks (15)**: nothing stored, verbatim quoting in read mode, "I can't tell" over guessing, hazard-first ordering, no person identification, limits stated on the page.
- **Scalability (10)**: stateless static + serverless; model-agnostic chain behind one env var.
- **Adoption (10)**: no install, no account; first answer in under 10 seconds from a fresh URL.

## Disclosure
Solo entry. AI coding assistants were used for drafting acceleration, per the event's responsible-AI rule; all code was reviewed, tested, and is owned by the entrant. The two sample photos are rendered label reproductions, labeled as samples in the UI.