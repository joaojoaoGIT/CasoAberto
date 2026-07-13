/* ============================================================
   CASO ABERTO — Lógica principal do jogo
   ============================================================ */

// ---------- Estado global ----------
const state = {
  currentSuspectId: null,
  typing: false,
  fullText: "",
  typeTimer: null,
  askedByS: { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set() },
  selectedAccused: null,
  audioReady: false
};

const CULPRIT_ID = 4; // 4º da esquerda para a direita

// ---------- Elementos ----------
const $ = (id) => document.getElementById(id);
const titleScreen   = $("title-screen");
const gameScreen    = $("game-screen");
const startBtn      = $("start-btn");
const accuseBtn     = $("accuse-btn");
const dlgOverlay    = $("dialogue-overlay");
const dlgName       = $("dlg-name");
const dlgQuestions  = $("dlg-questions");
const dlgTextWrap   = document.querySelector(".dialogue-text-wrap");
const dlgText       = $("dlg-text");
const dlgIndicator  = $("dlg-indicator");
const dlgClose      = $("dlg-close");
const dlgBack       = $("dlg-back");
const accuseScreen  = $("accuse-screen");
const accuseCancel  = $("accuse-cancel");
const accuseConfirm = $("accuse-confirm");
const resultScreen  = $("result-screen");
const resultStamp   = $("result-stamp");
const resultTitle   = $("result-title");
const resultText    = $("result-text");
const resultRestart = $("result-restart");

// ============================================================
// ÁUDIO — sintetizado via WebAudio (sem dependências externas)
// ============================================================
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { /* ignore */ }
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  state.audioReady = !!audioCtx;
}

function beep({ freq = 440, dur = 0.05, type = "square", vol = 0.05 } = {}) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = vol;
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
  osc.stop(audioCtx.currentTime + dur);
}

const sfx = {
  type: () => beep({ freq: 620 + Math.random() * 80, dur: 0.02, type: "square", vol: 0.015 }),
  click: () => beep({ freq: 280, dur: 0.06, type: "triangle", vol: 0.05 }),
  open: () => { beep({ freq: 220, dur: 0.08, type: "sawtooth", vol: 0.04 }); setTimeout(() => beep({ freq: 380, dur: 0.09, type: "sawtooth", vol: 0.03 }), 60); },
  close: () => { beep({ freq: 380, dur: 0.06, type: "sawtooth", vol: 0.03 }); setTimeout(() => beep({ freq: 200, dur: 0.08, type: "sawtooth", vol: 0.04 }), 50); },
  confirm: () => { beep({ freq: 520, dur: 0.08, type: "square", vol: 0.05 }); setTimeout(() => beep({ freq: 720, dur: 0.12, type: "square", vol: 0.05 }), 80); },
  accuse: () => { beep({ freq: 180, dur: 0.15, type: "sawtooth", vol: 0.07 }); setTimeout(() => beep({ freq: 120, dur: 0.2, type: "sawtooth", vol: 0.06 }), 120); },
  success: () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep({ freq: f, dur: 0.18, type: "triangle", vol: 0.06 }), i * 130)); },
  fail: () => { [400, 300, 200, 120].forEach((f, i) => setTimeout(() => beep({ freq: f, dur: 0.22, type: "sawtooth", vol: 0.07 }), i * 170)); }
};

// Ambiente sonoro discreto (zumbido de sala)
function startAmbient() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  osc.type = "sawtooth";
  osc.frequency.value = 55;
  filter.type = "lowpass";
  filter.frequency.value = 120;
  gain.gain.value = 0.012;
  osc.connect(filter).connect(gain).connect(audioCtx.destination);
  osc.start();
}

// ============================================================
// FLUXO DE TELAS
// ============================================================
startBtn.addEventListener("click", () => {
  ensureAudio();
  sfx.confirm();
  startAmbient();
  titleScreen.classList.remove("active");
  gameScreen.classList.add("active");
});

// ============================================================
// INTERROGATÓRIO
// ============================================================
document.querySelectorAll(".suspect-hit").forEach((el) => {
  el.addEventListener("mouseenter", () => { ensureAudio(); });
  el.addEventListener("click", () => {
    ensureAudio();
    const id = parseInt(el.dataset.id, 10);
    openDialogue(id);
  });
});

function openDialogue(id) {
  state.currentSuspectId = id;
  const s = SUSPECTS[id];
  dlgName.textContent = `${s.name.toUpperCase()} · ${s.role.toUpperCase()}`;
  renderQuestions(id);
  dlgTextWrap.classList.remove("visible");
  dlgText.textContent = "";
  dlgIndicator.classList.remove("show");
  dlgOverlay.classList.remove("hidden");
  sfx.open();
}

function closeDialogue() {
  stopTyping(true);
  dlgOverlay.classList.add("hidden");
  state.currentSuspectId = null;
  sfx.close();
}

function renderQuestions(id) {
  dlgQuestions.innerHTML = "";
  QUESTIONS.forEach((q) => {
    const btn = document.createElement("button");
    btn.className = "question-btn";
    if (state.askedByS[id].has(q.id)) btn.classList.add("asked");
    btn.textContent = q.label;
    btn.addEventListener("click", () => {
      sfx.click();
      state.askedByS[id].add(q.id);
      btn.classList.add("asked");
      const answer = SUSPECTS[id].dialogues[q.id];
      showAnswer(answer);
    });
    dlgQuestions.appendChild(btn);
  });
}

// ---------- Efeito máquina de escrever ----------
function showAnswer(text) {
  state.fullText = text;
  dlgText.textContent = "";
  dlgTextWrap.classList.add("visible");
  dlgIndicator.classList.remove("show");
  typeText(text);
}

function typeText(text) {
  stopTyping(false);
  state.typing = true;
  let i = 0;
  const tick = () => {
    if (!state.typing) return;
    if (i >= text.length) {
      state.typing = false;
      dlgIndicator.classList.add("show");
      return;
    }
    const ch = text[i++];
    dlgText.textContent += ch;
    if (ch !== " " && Math.random() > 0.35) sfx.type();
    state.typeTimer = setTimeout(tick, ch === "." || ch === "," ? 180 : 28);
  };
  tick();
}

function stopTyping(clear) {
  if (state.typeTimer) clearTimeout(state.typeTimer);
  state.typeTimer = null;
  state.typing = false;
  if (clear) { dlgText.textContent = ""; state.fullText = ""; }
}

// Clique no texto → acelera / finaliza
dlgTextWrap.addEventListener("click", () => {
  if (state.typing) {
    stopTyping(false);
    dlgText.textContent = state.fullText;
    dlgIndicator.classList.add("show");
  } else {
    // ao terminar, esconde a resposta e mostra perguntas de novo
    dlgTextWrap.classList.remove("visible");
    dlgIndicator.classList.remove("show");
  }
});

dlgClose.addEventListener("click", closeDialogue);
dlgBack.addEventListener("click", () => {
  stopTyping(true);
  dlgTextWrap.classList.remove("visible");
  dlgIndicator.classList.remove("show");
  sfx.click();
});

// Fecha com ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!dlgOverlay.classList.contains("hidden")) closeDialogue();
    else if (!accuseScreen.classList.contains("hidden")) hideAccuse();
  }
});

// ============================================================
// ACUSAÇÃO
// ============================================================
accuseBtn.addEventListener("click", () => {
  ensureAudio();
  sfx.accuse();
  showAccuse();
});

function showAccuse() {
  state.selectedAccused = null;
  accuseConfirm.disabled = true;
  document.querySelectorAll(".accuse-card").forEach((c) => c.classList.remove("selected"));
  accuseScreen.classList.remove("hidden");
}

function hideAccuse() {
  accuseScreen.classList.add("hidden");
  sfx.close();
}

document.querySelectorAll(".accuse-card").forEach((card) => {
  card.addEventListener("click", () => {
    sfx.click();
    document.querySelectorAll(".accuse-card").forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
    state.selectedAccused = parseInt(card.dataset.id, 10);
    accuseConfirm.disabled = false;
  });
});

accuseCancel.addEventListener("click", hideAccuse);

accuseConfirm.addEventListener("click", () => {
  const chosen = state.selectedAccused;
  if (!chosen) return;
  hideAccuse();
  showResult(chosen === CULPRIT_ID);
});

// ============================================================
// RESULTADO
// ============================================================
function showResult(win) {
  if (win) {
    resultStamp.textContent = "CASO ENCERRADO";
    resultStamp.classList.remove("fail");
    resultTitle.textContent = "Você encontrou o assassino.";
    resultText.textContent =
      `João Pedro Arújo confessou o crime na delegacia. As pistas estavam nas próprias palavras dele: conhecia demais a rotina da vítima, andava perto do armazém à noite e quase disse "faca" durante o interrogatório. Bom trabalho, detetive. Além de sempre errar o Simple Present na 3ª pessoa, ele também não sabia conjugar o verbo "to know" corretamente.`;
    sfx.success();
  } else {
    resultStamp.textContent = "CASO FALHO";
    resultStamp.classList.add("fail");
    resultTitle.textContent = "Você acusou a pessoa errada.";
    resultText.textContent =
      `O verdadeiro culpado escapou pela porta dos fundos. Reveja as respostas — o Simple Present dos suspeitos revela hábitos, rotinas e pequenas contradições. Uma delas era a pista. O suspeito correto comete erros clássicos de Simple Present na 3ª pessoa do singular, como "He work" (falta o -s), "He take" (falta -s) e "He don't" (deveria ser doesn't).`;
    sfx.fail();
  }
  resultScreen.classList.remove("hidden");
}

resultRestart.addEventListener("click", () => {
  sfx.click();
  // Reset completo
  state.askedByS = { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set() };
  state.selectedAccused = null;
  resultScreen.classList.add("hidden");
  gameScreen.classList.remove("active");
  titleScreen.classList.add("active");
});
