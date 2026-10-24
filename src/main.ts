import './tokens.css';
import './styles.css';

// ---------- element handles ----------
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const idleView = $('idleView');
const liveView = $('liveView');
const video = $<HTMLVideoElement>('camera');
const frozen = $<HTMLImageElement>('frozen');
const frameStatus = $('frameStatus');
const frameWrap = document.querySelector('.frame-wrap') as HTMLElement;

const shutter = $('shutter');
const shutterHint = $('shutterHint');
const shutterSub = $('shutterSub');
const modeAsk = $('modeAsk');
const modeRead = $('modeRead');
const typeForm = $<HTMLFormElement>('typeForm');
const typeInput = $<HTMLInputElement>('typeInput');
const listeningNote = $('listeningNote');
const describeInstead = $('describeInstead');

const answerCard = $('answerCard');
const answerText = $('answerText');
const answerState = $('answerState');
const repeatBtn = $('repeatBtn');
const newFrameBtn = $('newFrameBtn');

const historySection = $('history');
const historyList = $('historyList');

const startCameraBtn = $('startCamera');
const trySampleBtn = $('trySample');
const stopCameraBtn = $('stopCamera');
const uploadBtn = $('uploadBtn');
const uploadInput = $<HTMLInputElement>('uploadInput');

const settingsDialog = $<HTMLDialogElement>('settings');
const openSettingsBtn = $('openSettings');
const closeSettingsBtn = $('closeSettings');
const rateRange = $<HTMLInputElement>('rateRange');
const rateOut = $('rateOut');
const contrastToggle = $('contrastToggle');
const sampleDialog = $<HTMLDialogElement>('sampleChooser');
const trySampleClose = $('closeSample');

// ---------- state ----------
type Mode = 'ask' | 'read';
let mode: Mode = 'ask';
let stream: MediaStream | null = null;
let currentFrame: string | null = null; // data URL of the frozen frame
let lastAnswer = '';
let busy = false;

type Phase = 'idle' | 'live' | 'frozen' | 'listening' | 'working';
let phase: Phase = 'idle';

// ---------- settings ----------
type Settings = { font: 'base' | 'lg' | 'xl'; rate: number; contrast: boolean };
const settings: Settings = loadSettings();

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem('glance-settings');
    if (raw) return { font: 'base', rate: 1, contrast: false, ...JSON.parse(raw) };
  } catch { /* fresh start */ }
  return { font: 'base', rate: 1, contrast: false };
}

function applySettings() {
  document.documentElement.dataset.font = settings.font;
  document.documentElement.dataset.contrast = settings.contrast ? 'high' : 'normal';
  rateRange.value = String(settings.rate);
  rateOut.textContent = `${settings.rate.toFixed(2).replace(/0$/, '').replace(/\.$/, '')}×`;
  contrastToggle.setAttribute('aria-pressed', String(settings.contrast));
  contrastToggle.textContent = settings.contrast ? 'On' : 'Off';
  document.querySelectorAll<HTMLButtonElement>('.seg[data-font-val]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.fontVal === settings.font));
  });
  try { localStorage.setItem('glance-settings', JSON.stringify(settings)); } catch { /* private mode */ }
}

document.querySelectorAll<HTMLButtonElement>('.seg[data-font-val]').forEach((b) =>
  b.addEventListener('click', () => { settings.font = b.dataset.fontVal as Settings['font']; applySettings(); })
);
rateRange.addEventListener('input', () => { settings.rate = Number(rateRange.value); applySettings(); });
contrastToggle.addEventListener('click', () => { settings.contrast = !settings.contrast; applySettings(); });
openSettingsBtn.addEventListener('click', () => settingsDialog.showModal());
closeSettingsBtn.addEventListener('click', () => settingsDialog.close());
applySettings();

// ---------- speech output ----------
function speak(text: string) {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = settings.rate;
    u.lang = navigator.language || 'en-US';
    speechSynthesis.speak(u);
  } catch { /* speech unavailable — text is always shown */ }
}

// ---------- phases / UI state ----------
function setPhase(next: Phase) {
  phase = next;
  shutter.classList.toggle('is-listening', next === 'listening');
  listeningNote.hidden = next !== 'listening';
  frameWrap.classList.toggle('is-working', next === 'working');
  switch (next) {
    case 'idle':
      idleView.hidden = false; liveView.hidden = true;
      break;
    case 'live':
      idleView.hidden = true; liveView.hidden = false;
      frozen.hidden = true; video.hidden = false;
      shutterHint.textContent = mode === 'ask' ? 'Tap to look' : 'Tap to read';
      shutterSub.textContent = mode === 'ask' ? 'then ask by voice or keyboard' : 'everything visible, read out loud';
      frameStatus.textContent = '';
      break;
    case 'frozen':
      shutterHint.textContent = 'Listening…';
      shutterSub.textContent = 'say your question now, or type below';
      break;
    case 'listening':
      shutterHint.textContent = 'Listening…';
      shutterSub.textContent = 'speak your question, or type it below';
      break;
    case 'working':
      frameStatus.textContent = 'Looking…';
      shutterHint.textContent = 'Thinking…';
      shutterSub.textContent = 'Glance is answering';
      break;
  }
}

// ---------- camera ----------
async function startCamera() {
  stopStream();
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1440 } },
      audio: false,
    });
    video.srcObject = stream;
    await video.play();
    idleView.hidden = true;
    liveView.hidden = false;
    setPhase('live');
    frameStatus.textContent = 'Camera is on. Point it at what you want to know about.';
    speak('Camera is on. Point it at what you want to know about, then tap the round button.');
  } catch (err) {
    idleView.hidden = true;
    liveView.hidden = false;
    setPhase('live');
    frameStatus.textContent = 'Camera unavailable — use a photo from your library instead.';
    speak('The camera is not available. You can use a photo from your library instead.');
    uploadInput.click();
  }
}

function stopStream() {
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
}

// freeze the current video frame into a still
function captureFrame(): string | null {
  if (!video.videoWidth) return null;
  const maxEdge = 1280;
  const scale = Math.min(1, maxEdge / Math.max(video.videoWidth, video.videoHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(video.videoWidth * scale);
  c.height = Math.round(video.videoHeight * scale);
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.82);
}

function showFrozen(dataUrl: string) {
  currentFrame = dataUrl;
  video.hidden = true;
  frozen.src = dataUrl;
  frozen.hidden = false;
  stopStream();
}

// ---------- voice input ----------
type SRResult = { transcript: string };
function listenOnce(): Promise<SRResult | null> {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) return Promise.resolve(null);
  return new Promise((resolve) => {
    const rec = new SR();
    rec.lang = navigator.language || 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    let settled = false;
    const done = (v: SRResult | null) => { if (!settled) { settled = true; resolve(v); } };
    rec.onresult = (e: any) => done({ transcript: e.results[0][0].transcript });
    rec.onerror = () => done(null);
    rec.onend = () => done(null);
    try { rec.start(); } catch { done(null); }
  });
}

// ---------- the ask pipeline ----------
async function ask(question: string | null, forcedMode?: Mode) {
  if (busy) return;
  const useMode = forcedMode ?? mode;
  if (!currentFrame) {
    // no frame yet — capture from live video or bail
    const frame = captureFrame();
    if (!frame) { return; }
    showFrozen(frame);
  }
  const q = (question ?? '').trim();
  if (useMode === 'ask' && !q) {
    // need a question: start listening / focus input
    promptForQuestion();
    return;
  }
  busy = true;
  setPhase('working');
  frameStatus.textContent = useMode === 'read' ? 'Reading…' : 'Thinking…';
  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ image: currentFrame, question: q || null, mode: useMode }),
    });
    if (!res.ok) throw new Error(`server ${res.status}`);
    const data = await res.json();
    lastAnswer = String(data.answer ?? '');
    renderAnswer(q, lastAnswer, useMode);
    speak(lastAnswer);
  } catch (err) {
    const msg = 'Glance could not reach its eyes just now. Check the connection and try again.';
    renderAnswer(q, msg, useMode, true);
    speak(msg);
  } finally {
    busy = false;
  }
}

function promptForQuestion() {
  setPhase('listening');
  listenOnce().then((r) => {
    if (r?.transcript) {
      typeInput.value = r.transcript;
      ask(r.transcript);
    } else {
      setPhase('frozen');
      typeInput.focus();
      frameStatus.textContent = 'Type your question below, or tap the round button to try voice again.';
    }
  });
}

function renderAnswer(question: string, answer: string, useMode: Mode, isError = false) {
  answerText.textContent = answer;
  answerState.textContent = isError
    ? 'Something went wrong.'
    : useMode === 'read'
      ? 'Read mode — quoted as exactly as Glance can see it. Verify anything critical.'
      : 'Glance can misread a photo. Double-check anything critical.';
  answerCard.hidden = false;
  historySection.hidden = false;
  if (!isError) {
    const li = document.createElement('li');
    const qp = document.createElement('p'); qp.className = 'q';
    qp.textContent = useMode === 'read' && !question ? 'Read mode' : `“${question}”`;
    const ap = document.createElement('p'); ap.className = 'a';
    ap.textContent = answer;
    li.append(qp, ap);
    historyList.prepend(li);
    while (historyList.children.length > 5) historyList.lastChild?.remove();
  }
  answerCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ---------- wire up controls ----------
startCameraBtn.addEventListener('click', startCamera);

shutter.addEventListener('click', () => {
  if (phase === 'listening') return;
  if (video.hidden || !video.videoWidth) { promptForQuestion(); return; }
  const frame = captureFrame();
  if (!frame) return;
  showFrozen(frame);
  if (mode === 'read') {
    ask(null, 'read');
  } else {
    setPhase('frozen');
    promptForQuestion();
  }
});

modeAsk.addEventListener('click', () => setMode('ask'));
modeRead.addEventListener('click', () => setMode('read'));
function setMode(m: Mode) {
  mode = m;
  modeAsk.classList.toggle('is-active', m === 'ask');
  modeAsk.setAttribute('aria-checked', String(m === 'ask'));
  modeRead.classList.toggle('is-active', m === 'read');
  modeRead.setAttribute('aria-checked', String(m === 'read'));
  if (phase === 'live') setPhase('live');
}

typeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = typeInput.value.trim();
  if (!q) return;
  if (!currentFrame) {
    const frame = captureFrame();
    if (frame) { showFrozen(frame); }
    else { startCameraThenAsk(q); return; }
  }
  ask(q);
});

async function startCameraThenAsk(q: string) {
  await startCamera();
  // wait briefly for first frame, then run
  setTimeout(() => {
    const frame = captureFrame();
    if (frame) { showFrozen(frame); ask(q); }
  }, 900);
}

document.querySelectorAll<HTMLButtonElement>('.chip').forEach((chip) =>
  chip.addEventListener('click', () => {
    const q = chip.dataset.q ?? '';
    typeInput.value = q;
    if (!currentFrame) {
      if (video.hidden || !video.videoWidth) { startCameraThenAsk(q); return; }
      const frame = captureFrame();
      if (!frame) return;
      showFrozen(frame);
    }
    ask(q);
  })
);

describeInstead.addEventListener('click', () => {
  ask('Describe this scene for someone who cannot see it: what is here, where is it, and anything I should know.');
});

repeatBtn.addEventListener('click', () => { if (lastAnswer) speak(lastAnswer); });
newFrameBtn.addEventListener('click', () => {
  answerCard.hidden = true;
  currentFrame = null;
  typeInput.value = '';
  if (stream) {
    video.hidden = false;
    frozen.hidden = true;
    setPhase('live');
  } else {
    startCamera();
  }
});

stopCameraBtn.addEventListener('click', () => {
  stopStream();
  setPhase('idle');
  answerCard.hidden = true;
});

uploadBtn.addEventListener('click', () => uploadInput.click());
uploadInput.addEventListener('change', () => {
  const file = uploadInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    showFrozen(String(reader.result));
    idleView.hidden = true;
    liveView.hidden = false;
    if (mode === 'read') ask(null, 'read');
    else { setPhase('frozen'); typeInput.focus(); }
  };
  reader.readAsDataURL(file);
});

trySampleBtn.addEventListener('click', () => sampleDialog.showModal());
trySampleClose.addEventListener('click', () => sampleDialog.close());
document.querySelectorAll<HTMLButtonElement>('.sample').forEach((b) =>
  b.addEventListener('click', () => {
    const src = b.dataset.sample;
    sampleDialog.close();
    if (!src) return;
    idleView.hidden = true;
    liveView.hidden = false;
    frameStatus.textContent = 'Loading sample…';
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      showFrozen(c.toDataURL('image/jpeg', 0.85));
      ask('Describe this for someone who cannot see it, including any text.');
    };
    img.onerror = () => { frameStatus.textContent = 'Could not load the sample.'; };
    img.src = src;
  })
);

// release the camera when the tab is hidden or closed
document.addEventListener('visibilitychange', () => {
  if (document.hidden && phase === 'live') { stopStream(); video.hidden = true; }
});
window.addEventListener('pagehide', stopStream);
