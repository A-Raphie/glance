# Glance — Hackathon Orchestrator Ledger
Event: IEEE Hack for Humanity (https://ieee-ai-hack-for-humanity.devpost.com/) · Deadline: Oct 24 2026 10:00 GMT+1 · Current stage: 3 (build) · Updated: Oct 24 02:16 WAT

Mode: hackathon, solo, portfolio-first. Timebox overrides ceremony; skips are logged, never silent.

## Sweeps
| Stage | Entered | Exited | Notes |
|---|---|---|---|
| 0 Calibrate | 02:00 | 02:05 | event chosen by user (portfolio play); playbook re-read |
| 1 Idea | 02:05 | 02:12 | Track 2 picked; idea gates run inline (see SPEC) |
| 2 Plan+design | 02:12 | 02:18 | tokens.css direction locked (calm dark, amber, big type); naming: Glance |
| 3 Build | 02:18 | — | v1 committed a69b2f3; serverless + samples pending deploy test |

## Skill ledger
| Skill | Stage | State | Note |
|---|---|---|---|
| hackathon-idea-hack | 1 | ✅ | gates run inline; sponsor = track rubric (no SDK); winner: Track 2 sight assistant |
| naming | 2 | ✅ | Glance — monosyllable, SMILE/SCRATCH clean, collision-checked vs repos+local |
| forensic playbook | 0/6 | ✅ | read pre-idea; Winning Checklist drives submission docs |
| spec | 2 | ✅ | compressed to SPEC.md (one page, rubric map, cut list) |
| design-direction | 2 | 🔍 | timebox: direction locked inline (dark warm, amber accent, zero gradients) |
| semantic-tokens | 3 | ✅ | tokens.css before any component CSS; no raw hex in styles.css |
| component-harvest | 3 | 🔍 | no UI kit fetched: 9KB vanilla build, primitives are native buttons/dialog/input |
| hackathon-design | 3 | ⏳ | signature move = shutter pulse + spoken answer card; revisit if time |
| agents-md | 3 | ⏳ | minimal AGENTS.md after deploy |
| ui-craft / ux-laws | 3-4 | ⏳ | per-screen loop partially inline (a11y is the craft bar here); audit pass at stage 4 |
| modern-web-guidance | 3 | ✅ | native dialog, getUserMedia, speechSynthesis, aria-live — zero npm runtime deps |
| humaniser | 4/6 | ⏳ | landing copy written plain-voice; sweep before submission |
| terminal-preflight | 4 | ⏳ | before browser e2e + recording |
| browser-testing-with-devtools | 4 | ⏳ | live e2e after deploy |
| mock-hunter | 4/6 | ⏳ | ◆ pre-demo: sample photos are LABELED as samples — verify copy claims |
| ship-rehearsal / pre-ship-gate | 5 | ⏳ | deploy → e2e as real user → verify live revision |
| claims-verify | 6 | ⏳ | every submission claim vs live build |
| demo-script → demo-video | 6 | ⏳ | scripted <60s; ◆ publish gate = user yes |
| submission | 6 | ⏳ | ◆ explicit user yes before Devpost publish |
| readme | 6 | ⏳ | README = hero + honesty table + judge path |
| great-work / idea-autopsy / before-you-build / talk-to-users | 1 | 🔍 | timebox: idea-hack gates 9-11 suffice (≤48h rule) |
| lemmaly/invariant-guard/mathguard | 3 | 🔍 | no non-trivial algorithms in scope |
| frontend-lighthouse | 4 | ⏳ | one local run only |
| vercel-disable-sso | 5 | ⏳ | if Vercel preview auth blocks public URL |
| x-post | 6 | ⏳ | optional; only if time |

## Stage gate
- [x] Exit sweep stage 2 (all ⏳/⏸ revisited — hackathon-design deferred with trigger)
- [x] ◆ skills so far: none run
- [ ] Stage 4 entry sweep queued after deploy

## Stage 4-6 update (Oct 24 02:50 WAT)
| Skill | Stage | State | Note |
|---|---|---|---|
| humaniser | 4/6 | ✅ | landing + submission copy plain-voice |
| terminal-preflight | 4 | ✅ | 3 live amicus ffmpeg audio procs found — NOT stale (amicus running), left alive; IAB recorder doesn't use avfoundation |
| browser-testing-with-devtools | 4 | ✅ | judge-path e2e ×3 (curl + IAB sample flow) |
| mock-hunter | 4/6 | ✅ | only mock = sample photos, disclosed in UI + README honesty ❌ row; answers are real API |
| ship-rehearsal / pre-ship-gate | 5 | ✅ | deploy → e2e → live revision match (fresh-URL loads defeat scroll restoration) |
| claims-verify | 6 | ✅ | claims exercised vs live build: 2.7–3.2s measured, 8.76kB, zero deps, zero trackers (grep hit = own privacy copy) |
| demo-script → demo-video | 6 | ✅ | 34.9s scripted take on fixed build, VO muxed (Samantha, mean -17.6dB) → demo/glance-demo.mp4 |
| demo-final-gate | 6 | ✅ | probe h264+aac 34.9s 1.28MB, audio nonzero, frames vision-QC'd |
| frontend-lighthouse | 4 | 🔍 | timebox skip: 8.8kB native-API page |
| ui-craft / ux-laws | 3-4 | ✅ | 2 vision-gate rounds → 6 real fixes (stale status, AA contrast, history clip, dup CTA, dead column, placeholder) |
| vision-flash gates | 4/6 | ✅ | gate1 FAIL→fixed; gate2 confirmed fixes live, exposed scroll-restoration contamination in takes; gate3 final = pending |

Known capture quirks (logged): IAB fullPage screenshot stitches 3× (artifact, DOM verified single-copy);
reload() restores scroll — fresh query params for clean states.

## Post-gate root cause (Oct 24 03:10 WAT)
The "black frozen frame" was NOT a capture artifact: a sibling `<video>` element blanks `<img>` painting
in WKWebView compositing even when hidden and stream-less. Bisect: img-only page mean 206 vs video+img page
mean 18 (PIL pixel stats, deterministic). Fix: `video.remove()` while frozen, re-`prepend` on live resume.
Verified: live still mean 204 at element rect; take-3 video frame at 5.5s mean 76.6/stdev 71.1 (paints).
Demo video = take 3 + VO mux → demo/glance-demo.mp4 (34.9s, mean -17.6dB).
Vision gates: gate1 FAIL→6 fixes; gate2 confirmed fixes, exposed takes contaminated by scroll restoration;
gate3 6/8 PASS (2 fails = the compositing bug, since fixed); final ship-gate on money shot + take3 frame = pending.
Still blocked on: his Devpost login (tab staged at secure.devpost.com/users/login).
