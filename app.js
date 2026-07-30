/* ════════════════════════════════════════════
   ListAI — app.js v2.0
   Redesign + Logica IA Avanzata (Fase 2)
   ════════════════════════════════════════════ */

let files = [], pendingKey = '';

/* ── Scroll progress bar ── */
window.addEventListener('scroll', function() {
  var el = document.getElementById('scroll-progress');
  if (!el) return;
  var pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  el.style.width = Math.min(pct, 100) + '%';
});

/* ── Toast notification ── */
function showToast(msg, duration) {
  duration = duration || 2500;
  var t = document.getElementById('toast');
  var m = document.getElementById('toast-msg');
  if (!t || !m) return;
  m.textContent = msg;
  t.style.display = 'flex';
  clearTimeout(t._timeout);
  t._timeout = setTimeout(function() { t.style.display = 'none'; }, duration);
}

/* ── Chiave salvata ── */
(function() {
  try {
    var k = localStorage.getItem('lai_k'), e = localStorage.getItem('lai_e');
    if (k && e && Date.now() < +e) document.getElementById('apiKey').value = k;
  } catch (_) {}
})();

function toggleKey() {
  var i = document.getElementById('apiKey');
  i.type = i.type === 'password' ? 'text' : 'password';
}
function promptSave(k) { pendingKey = k; document.getElementById('saveModal').classList.add('open'); }
function saveKey(yes) {
  document.getElementById('saveModal').classList.remove('open');
  if (yes && pendingKey) {
    try { localStorage.setItem('lai_k', pendingKey); localStorage.setItem('lai_e', Date.now() + 30*24*60*60*1000); } catch (_) {}
    showToast('✅ Chiave API salvata per 1 mese');
  }
  pendingKey = '';
}

/* ── Modello custom ── */
function onModelChange() {
  var v = document.getElementById('modelSelect').value;
  var ci = document.getElementById('customModel');
  ci.style.display = v === 'custom' ? 'block' : 'none';
  if (v === 'custom') ci.focus();
}
function getModel() {
  var v = document.getElementById('modelSelect').value;
  if (v === 'custom') { var c = document.getElementById('customModel').value.trim(); return c || 'google/gemini-3.1-flash-lite'; }
  return v;
}

/* ── Lingue ── */
var LANG_MAP = {
  it: { name: 'Italiano',   flag: '🇮🇹', negotiable: '🤝 Prezzo trattabile!',      label: 'Italian'    },
  en: { name: 'English',    flag: '🇬🇧', negotiable: '🤝 Price negotiable!',        label: 'English'    },
  fr: { name: 'Français',   flag: '🇫🇷', negotiable: '🤝 Prix négociable!',         label: 'French'     },
  de: { name: 'Deutsch',    flag: '🇩🇪', negotiable: '🤝 Preis verhandelbar!',      label: 'German'     },
  es: { name: 'Español',    flag: '🇪🇸', negotiable: '🤝 Precio negociable!',       label: 'Spanish'    },
  pt: { name: 'Português',  flag: '🇵🇹', negotiable: '🤝 Preço negociável!',        label: 'Portuguese' },
  nl: { name: 'Nederlands', flag: '🇳🇱', negotiable: '🤝 Prijs bespreekbaar!',      label: 'Dutch'      },
  pl: { name: 'Polski',     flag: '🇵🇱', negotiable: '🤝 Cena do negocjacji!',      label: 'Polish'     },
  sv: { name: 'Svenska',    flag: '🇸🇪', negotiable: '🤝 Pris förhandlingsbart!',   label: 'Swedish'    },
  ro: { name: 'Română',     flag: '🇷🇴', negotiable: '🤝 Preț negociabil!',         label: 'Romanian'   },
};

var selectedLangs = ['it', 'en'];

function loadLangs() {
  try {
    var saved = localStorage.getItem('lai_langs');
    if (saved) { var p = JSON.parse(saved); if (Array.isArray(p) && p.length > 0) selectedLangs = p; }
  } catch (_) {}
  renderLangTags();
}
function saveLangs() { try { localStorage.setItem('lai_langs', JSON.stringify(selectedLangs)); } catch (_) {} }

function renderLangTags() {
  var container = document.getElementById('langTags');
  container.innerHTML = '';
  var canRemove = selectedLangs.length > 1;
  selectedLangs.forEach(function(code, i) {
    var info = LANG_MAP[code] || { name: code, flag: '🌐' };
    var tag = document.createElement('span');
    tag.className = 'lang-tag';
    tag.innerHTML = info.flag + ' ' + info.name +
      (canRemove ? '<button class="lang-rm" onclick="removeLang(' + i + ')" title="Rimuovi ' + info.name + '">&#x2715;</button>' : '');
    container.appendChild(tag);
  });
  var addSel = document.getElementById('langAdd');
  if (addSel) {
    [...addSel.options].forEach(function(opt) { if (opt.value) opt.disabled = selectedLangs.includes(opt.value); });
  }
}
function addLangFromSelect() {
  var sel = document.getElementById('langAdd');
  var code = sel.value;
  if (!code || selectedLangs.includes(code)) { sel.value = ''; return; }
  selectedLangs.push(code); sel.value = '';
  saveLangs(); renderLangTags();
}
function removeLang(index) {
  if (selectedLangs.length <= 1) return;
  selectedLangs.splice(index, 1); saveLangs(); renderLangTags();
}

/* ══════════════════════════════════════════════
   FASE 2 — STAGIONALITÀ & BRAND TIER
   ══════════════════════════════════════════════ */

/* Calcolo stagionalità avanzato */
function getSeasonalityInfo(category, currentDate) {
  currentDate = currentDate || new Date();
  var month = currentDate.getMonth(); // 0-11
  var day = currentDate.getDate();

  // Periodi saldi IT
  var isWinterSales = month === 0 || (month === 11 && day > 26);
  var isSummerSales = month === 6;
  var isBlackFriday = month === 10 && day >= 25 && day <= 30;
  var isChristmas = month === 11 && day >= 1 && day <= 25;

  var seasons = {
    spring: [2, 3, 4],
    summer: [5, 6, 7],
    autumn: [8, 9, 10],
    winter: [11, 0, 1]
  };
  var seasonNames = { spring: 'Primavera', summer: 'Estate', autumn: 'Autunno', winter: 'Inverno' };
  var currentSeason = 'spring';
  Object.entries(seasons).forEach(function(kv) {
    if (kv[1].includes(month)) currentSeason = kv[0];
  });

  var seasonMatrix = {
    // Abbigliamento
    'cappotti':    { winter: 1.45, autumn: 1.25, spring: 0.80, summer: 0.40 },
    'piumini':     { winter: 1.55, autumn: 1.30, spring: 0.65, summer: 0.30 },
    'giacche':     { autumn: 1.20, winter: 1.15, spring: 1.05, summer: 0.75 },
    'maglieria':   { winter: 1.30, autumn: 1.15, spring: 0.90, summer: 0.60 },
    'vestiti':     { summer: 1.35, spring: 1.20, autumn: 0.95, winter: 0.65 },
    'shorts':      { summer: 1.40, spring: 1.10, autumn: 0.55, winter: 0.30 },
    'jeans':       { spring: 1.05, autumn: 1.05, winter: 1.00, summer: 0.90 },
    'swimwear':    { summer: 1.50, spring: 1.20, autumn: 0.40, winter: 0.25 },
    'scarpe':      { spring: 1.15, summer: 1.05, autumn: 1.10, winter: 0.95 },
    'stivali':     { autumn: 1.30, winter: 1.25, spring: 0.80, summer: 0.35 },
    'sandali':     { summer: 1.45, spring: 1.20, autumn: 0.60, winter: 0.30 },
    // Accessori
    'borse':       { spring: 1.15, summer: 1.10, autumn: 1.10, winter: 1.05 },
    'sciarpe':     { winter: 1.35, autumn: 1.20, spring: 0.75, summer: 0.30 },
    'cappelli':    { winter: 1.20, autumn: 1.10, spring: 0.90, summer: 1.05 },
    // Elettronica
    'smartphone':  { winter: 1.10, autumn: 1.05, spring: 1.00, summer: 0.95 },
    'laptop':      { autumn: 1.10, winter: 1.05, spring: 1.05, summer: 0.90 },
    'console':     { winter: 1.20, autumn: 1.10, spring: 0.95, summer: 0.85 },
    // Default
    'default':     { spring: 1.00, summer: 1.00, autumn: 1.00, winter: 1.00 }
  };

  var catKey = category ? category.toLowerCase() : 'default';
  var matrixEntry = seasonMatrix[catKey] || seasonMatrix['default'];
  var multiplier = matrixEntry[currentSeason] || 1.0;

  var events = [];
  if (isWinterSales)  { multiplier *= 0.85; events.push('Saldi invernali'); }
  if (isSummerSales)  { multiplier *= 0.85; events.push('Saldi estivi'); }
  if (isBlackFriday)  { multiplier *= 0.90; events.push('Black Friday'); }
  if (isChristmas)    { multiplier *= 1.10; events.push('Periodo Natale'); }

  var impactPct = Math.round((multiplier - 1) * 100);
  var impactStr = impactPct >= 0 ? '+' + impactPct + '%' : impactPct + '%';

  return {
    season: currentSeason,
    seasonName: seasonNames[currentSeason],
    multiplier: multiplier,
    events: events,
    impactStr: impactStr,
    month: month,
    day: day
  };
}

/* Brand tiers */
var BRAND_TIERS = {
  luxury:       { brands: ['gucci','louis vuitton','prada','chanel','hermès','hermes','bottega','versace','valentino','dior','fendi','burberry','givenchy','saint laurent'], multiplier: 2.0, label: 'Luxury' },
  premium:      { brands: ['max mara','cos','arket','weekend','boss','ralph lauren','tommy hilfiger','calvin klein','lacoste','polo','gant','stone island','moncler lite','woolrich'], multiplier: 1.4, label: 'Premium' },
  mid:          { brands: ['zara','mango','h&m','pull&bear','massimo dutti','bershka','stradivarius','reserved','sinsay','uniqlo','gap','levi'], multiplier: 1.0, label: 'Mid Market' },
  fast_fashion: { brands: ['shein','primark','temu','asos','kiabi','terranova','ovs'], multiplier: 0.5, label: 'Fast Fashion' }
};

function getBrandTier(brandName) {
  if (!brandName) return { tier: 'mid', label: 'Mid Market', multiplier: 1.0 };
  var bn = brandName.toLowerCase();
  for (var tier in BRAND_TIERS) {
    var t = BRAND_TIERS[tier];
    if (t.brands.some(function(b) { return bn.includes(b) || b.includes(bn); })) {
      return { tier: tier, label: t.label, multiplier: t.multiplier };
    }
  }
  return { tier: 'mid', label: 'Mid Market', multiplier: 1.0 };
}

/* ══════════════════════════════════════════════
   FASE 2.1 — NUOVE UTILITY (Prompt Overhaul)
   ══════════════════════════════════════════════ */

/* ── Timing ottimale (calcolo deterministico) ── */
function getNextOptimalSlot() {
  var now = new Date();
  var bestDays = [4, 5, 0]; // Giovedì, Venerdì, Domenica
  var bestHour = 19;
  var dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  for (var i = 0; i <= 7; i++) {
    var d = new Date(now.getTime() + i * 86400000);
    if (bestDays.includes(d.getDay())) {
      if (i === 0 && now.getHours() >= 22) continue;
      d.setHours(bestHour, 0, 0, 0);
      if (d <= now) continue;
      return dayNames[d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1) + ' alle ' + bestHour + ':00';
    }
  }
  return 'Prossimo giovedì alle 19:00';
}

/* ── Commissione Vinted (buyer protection) ── */
function calcVintedFee(price) {
  if (!price || price <= 0) return 0;
  return Math.round((price * 0.05 + 0.70) * 100) / 100;
}

/* ── Confidence score (deterministico, no AI) ── */
function calcConfidence(hasMarketData, hasBrand, hasExtraInfo) {
  var score = 20; // base: abbiamo le foto
  if (hasMarketData) score += 40;
  if (hasBrand) score += 15;
  if (hasExtraInfo) score += 10;
  score += 10; // condizione sempre specificata
  return Math.min(score, 95);
}

/* ── Rilevamento brand dalle foto (mini-call economica) ── */
async function detectBrandFromPhotos(apiKey, imgs) {
  try {
    var resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
        'HTTP-Referer': location.href,
        'X-Title': 'ListAI Vinted'
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-lite',
        messages: [{ role: 'user', content: [
          { type: 'text', text: 'Identifica il brand/marchio visibile nelle foto. Rispondi SOLO con JSON valido: {"brand":"NOME"} oppure {"brand":null} se non identificabile.' }
        ].concat(imgs.slice(0, 3)) }],
        temperature: 0.0,
        max_tokens: 50
      })
    });
    if (!resp.ok) return null;
    var data = await resp.json();
    var raw = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
    var match = raw.match(/\{[\s\S]*?\}/);
    if (match) {
      var p = JSON.parse(match[0]);
      return p.brand || null;
    }
    return null;
  } catch (_) { return null; }
}

/* ── Ricerca prezzi di mercato (Perplexity Sonar con web search) ── */
async function researchMarketPrices(apiKey, brand, categoria, condizione, taglia) {
  try {
    var prompt =
      'Cerca i prezzi ATTUALI per questo articolo second-hand:\n' +
      (brand ? '- Brand: ' + brand + '\n' : '') +
      '- Categoria: ' + categoria + '\n' +
      '- Condizione: ' + condizione + '\n' +
      (taglia && taglia !== 'da identificare dalle foto' ? '- Taglia: ' + taglia + '\n' : '') +
      '\nCerca su vinted.it, amazon.it, zalando.it.\n' +
      'Rispondi SOLO con JSON valido:\n' +
      '{"retail":{"min":null,"max":null,"fonte":""},"vinted":{"min":null,"max":null,"num_annunci":null,"fonte":""},"note":""}';

    var resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
        'HTTP-Referer': location.href,
        'X-Title': 'ListAI Vinted'
      },
      body: JSON.stringify({
        model: 'perplexity/sonar',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.0,
        max_tokens: 400
      })
    });
    if (!resp.ok) return null;
    var data = await resp.json();
    var raw = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
    var match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return null;
  } catch (_) { return null; }
}

/* ── System Prompt Builder (identità + regole + few-shot) ── */
function buildSystemPrompt(isCloth) {
  var fsEl = document.getElementById('fastShipping');
  var hasFastShipping = fsEl ? fsEl.checked : true;
  var ctaRule = hasFastShipping ? 'spedizione in 24h, sconto multipli' : 'spedizione rapida (NON menzionare 24h), sconto multipli';
  var ctaIt = hasFastShipping ? 'Spedisco in 24h 📦' : 'Spedizione rapida 📦';
  var ctaEn = hasFastShipping ? 'Ships within 24h 📦' : 'Fast shipping 📦';

  return 'Sei LISTAI, generatore di annunci Vinted Italia. Obiettivo: annuncio venduto entro 7 giorni al miglior prezzo.\n\n' +
    'REGOLE ASSOLUTE:\n' +
    '1. Output: SOLO JSON valido. Zero testo/markdown fuori dal JSON.\n' +
    '2. Prezzi: usa ESCLUSIVAMENTE i dati in DATI_MERCATO forniti sotto. Se assenti, stima con massima cautela e dichiaralo nelle note.\n' +
    '3. Dato non visibile nelle foto → "non determinabile dalle foto".\n' +
    '4. Condizione foto ≠ dichiarata → aggiungi stringa in warning[].\n\n' +

    'ANALISI VISIVA — dalle foto identifica:\n' +
    '• Brand/marchio (logo, etichette, ricami). Non visibile → "non determinabile".\n' +
    '• Modello/stagione se leggibile (es. Air Force 1, 501, Dionysus).\n' +
    '• Colore ESATTO: antracite non "nero", cognac non "marrone", navy non "blu".\n' +
    '• Materiale: leggi etichetta composizione, altrimenti stima dal tessuto.\n' +
    '• Condizione REALE: TUTTI i difetti visibili (macchie, usura, pilling, graffi, sfilacciature).\n' +
    '• Taglia da etichetta se visibile (segnala se ≠ dichiarata). Prezzo cartellino se visibile.\n' +
    '• Dimensione pacco Vinted suggerita (Piccola, Media, Grande, Extra).\n' +
    (isCloth
      ? '• Scarpe: suola (usura), tomaia (graffi), interno. Borse: angoli, cerniere, tracolla, hardware (ossidazione).\n\n'
      : '• Stato funzionamento, completezza accessori, compatibilità, segni di usura.\n\n') +

    'TITOLO SEO (campo "t"):\n' +
    '≤50 char totali. Formula: [Brand] [Tipo] [Colore/Materiale] [Keyword].\n' +
    'No articoli iniziali (Il/La/Un/Una). No "usato"/"ottimo stato"/"spedisco".\n' +
    'Keyword Vinted: vintage, oversize, y2k, crop, premium, limited, blazer…\n' +
    'Se c\'è spazio: includi taglia IT.\n\n' +

    'DESCRIZIONI (380-420 char ciascuna, struttura obbligatoria):\n' +
    'Riga 1: emoji negoziazione (da regola lingua)\n' +
    'Riga 2: Identificazione capo + punto forza principale\n' +
    'Riga 3-4: Materiale esatto, colore preciso, fit/vestibilità\n' +
    'Riga 5: Condizione reale + difetti se presenti (onestà)\n' +
    'Riga 6: CTA naturale (' + ctaRule + ')\n' +
    'NO "Vendo"/"Cedo". NO hashtag nella descrizione.\n\n' +

    (isCloth
      ? 'ESEMPIO CORRETTO ABBIGLIAMENTO (IT, ~395 char — usa la STRUTTURA, non il contenuto):\n' +
        '"🤝 Prezzo trattabile!\n' +
        'Blazer oversize Zara in misto lana bouclé, colore écru/panna.\n' +
        'Spalle scese, vestibilità comoda TG M. Fodera interna viscosa, chiusura bottone singolo dorato.\n' +
        'Condizione eccellente: indossato 2 volte, nessun difetto visibile.\n' +
        ctaIt + ' Sconto per acquisti multipli!"\n\n' +
        'ESEMPIO CORRETTO (EN, ~380 char):\n' +
        '"🤝 Price negotiable!\n' +
        'Zara oversized bouclé wool-blend blazer, ecru/cream.\n' +
        'Dropped shoulders, relaxed fit size M. Viscose lining, single gold button closure.\n' +
        'Excellent condition: worn twice, zero visible flaws.\n' +
        ctaEn + ' Bundle discount available!"\n\n'
      : 'ESEMPIO CORRETTO ELETTRONICA (IT, ~390 char — usa la STRUTTURA, non il contenuto):\n' +
        '"🤝 Prezzo trattabile!\n' +
        'Sony WH-1000XM4 cuffie wireless noise-cancelling, nero opaco.\n' +
        '30h batteria, Bluetooth 5.0 multipoint, comandi touch. Custodia rigida inclusa.\n' +
        'Ottime condizioni: leggera usura archetto, ANC perfettamente funzionante.\n' +
        ctaIt + ' Sconto per acquisti multipli!"\n\n' +
        'ESEMPIO CORRETTO (EN, ~380 char):\n' +
        '"🤝 Price negotiable!\n' +
        'Sony WH-1000XM4 wireless noise-cancelling headphones, matte black.\n' +
        '30h battery, Bluetooth 5.0 multipoint, touch controls. Hard case included.\n' +
        'Excellent condition: minimal headband wear, fully functional ANC.\n' +
        ctaEn + ' Bundle discount available!"\n\n') +

    'HASHTAG (campo "ht"): esattamente 7 separati da spazio.\n' +
    '#1_Brand_IT · #2_TipoProdotto_IT · #3_Keyword_EN · #4_Colore_IT · #5_Trend/Stile · #6_Taglia · #7_CategoriaAmpia_IT\n' +
    'Evita generici: #usato, #secondhand, #vendo.';
}



/* ── Categoria ── */
var CLOTHING_CATS = ['donna', 'uomo', 'unisex', 'griffati'];

function isClothingCat() {
  var cat = document.getElementById('categoria').value;
  if (cat !== 'bambini') return CLOTHING_CATS.includes(cat);
  var bt = document.getElementById('bambiniTipo');
  return bt ? bt.value === 'vestiti' : false;
}

function onCategoriaChange() {
  var cat = document.getElementById('categoria').value;
  var isBambini = cat === 'bambini';
  document.getElementById('bambiniSub').classList.toggle('open', isBambini);
  if (!isBambini) {
    _showTagliaOrSottocat(CLOTHING_CATS.includes(cat));
  } else {
    _showTagliaOrSottocat(true);
  }
  document.getElementById('sottocatVal').value = '';
}
function onBambiniTipoChange() {
  var v = document.getElementById('bambiniTipo').value;
  _showTagliaOrSottocat(v === 'vestiti');
  document.getElementById('sottocatVal').value = '';
}
function _showTagliaOrSottocat(isCloth) {
  document.getElementById('blockTaglia').style.display = isCloth ? '' : 'none';
  document.getElementById('blockSottocat').style.display = isCloth ? 'none' : '';
}

/* ── Taglia ── */
function onT() {
  var v = document.getElementById('tagliaTipo').value;
  document.getElementById('tsub').classList.toggle('open', v === 'manual');
}
function toggleSz() { document.getElementById('szwrap').classList.toggle('open'); }
function showSz(n, b) {
  document.querySelectorAll('.szp').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.sztab').forEach(function(t) { t.classList.remove('active'); });
  document.getElementById('szp-' + n).classList.add('active');
  b.classList.add('active');
}
function getTagliaIT() {
  if (!isClothingCat()) return document.getElementById('sottocatVal').value.trim() || 'da identificare dalle foto';
  var t = document.getElementById('tagliaTipo').value;
  if (t === 'unica') return 'Taglia Unica';
  if (t === 'photo') return 'da identificare dalle foto';
  if (t === 'na') return 'non applicabile';
  var cat = document.getElementById('catCapo').value;
  var val = document.getElementById('tagliaVal').value.trim();
  return cat + ' – taglia IT: ' + (val || '?');
}
function getSottocategoria() {
  if (isClothingCat()) return null;
  return document.getElementById('sottocatVal').value.trim() || null;
}
function getCategoria() {
  var cat = document.getElementById('categoria').value;
  if (cat === 'bambini') {
    var bt = document.getElementById('bambiniTipo');
    var tipo = bt ? bt.value : 'vestiti';
    return tipo === 'vestiti' ? 'Bambini – Abbigliamento' : 'Bambini – Giochi e Oggetti';
  }
  var map = {
    donna: 'Abbigliamento Donna', unisex: 'Abbigliamento Unisex', uomo: 'Abbigliamento Uomo',
    griffati: 'Articoli Griffati', casa: 'Casa', elettronica: 'Elettronica',
    intrattenimento: 'Intrattenimento', hobby: 'Hobby e Collezionismo', sport: 'Sport'
  };
  return map[cat] || 'Generico';
}
function getCondLabel() {
  return { NWT: 'Nuovo con cartellino (brand new with tag)', NWOT: 'Nuovo senza cartellino (new without tag)', EUC: 'Usato – ottime condizioni (used, excellent)', GUC: 'Usato – buone condizioni (used, good)', POOR: 'Usato – pessime condizioni (used, poor)' }
    [document.getElementById('condizione').value] || 'N/D';
}
function getCondDiscount() {
  return { NWT: 0.65, NWOT: 0.55, EUC: 0.45, GUC: 0.30, POOR: 0.15 }
    [document.getElementById('condizione').value] || 0.40;
}
function getExtraInfo() { return document.getElementById('extraInfo').value.trim(); }

/* Nuovi campi */
function getExtraFields() {
  return {
    color: document.getElementById('colorField').value.trim(),
    material: document.getElementById('materialField').value.trim(),
    purchasedYear: document.getElementById('purchasedYear').value,
    hasTags: document.getElementById('hasTags').checked,
    hasBox: document.getElementById('hasBox').checked,
    shippingIncluded: document.getElementById('shippingIncluded').value === 'yes'
  };
}

/* ── File upload ── */
var dz = document.getElementById('dz');
dz.addEventListener('dragover', function(e) { e.preventDefault(); dz.classList.add('over'); });
dz.addEventListener('dragleave', function() { dz.classList.remove('over'); });
dz.addEventListener('drop', function(e) { e.preventDefault(); dz.classList.remove('over'); addFiles([...e.dataTransfer.files]); });
document.getElementById('fi').addEventListener('change', function(e) { addFiles([...e.target.files]); });

function addFiles(f) {
  var v = f.filter(function(x) { return x.type === 'image/jpeg' || x.type === 'image/png'; });
  files = [...files, ...v].slice(0, 10);
  renderP();
  document.getElementById('go').disabled = files.length === 0;
  hideErr();
}
function removeFile(i) { files.splice(i, 1); renderP(); document.getElementById('go').disabled = files.length === 0; }
function renderP() {
  var g = document.getElementById('pg'); g.innerHTML = '';
  files.forEach(function(f, i) {
    var u = URL.createObjectURL(f), d = document.createElement('div');
    d.className = 'pi';
    d.innerHTML = '<img src="' + u + '"/><button class="pr" onclick="removeFile(' + i + ')">&#x2715;</button>';
    g.appendChild(d);
  });
  document.getElementById('pc').textContent = files.length ? files.length + '/10 immagini' : '';
}
function showErr(m) { var e = document.getElementById('em'); e.textContent = m; e.style.display = 'block'; }
function hideErr() { document.getElementById('em').style.display = 'none'; }

/* ── Resize immagini ── */
function resEnc(file, max) {
  max = max || 512;
  return new Promise(function(res, rej) {
    var img = new Image(), url = URL.createObjectURL(file);
    img.onload = function() {
      var sc = Math.min(1, max / Math.max(img.width, img.height));
      var w = Math.round(img.width * sc), h = Math.round(img.height * sc);
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.82).split(',')[1]);
    };
    img.onerror = function() { rej(new Error('Errore lettura immagine')); };
    img.src = url;
  });
}

/* ── Copy ── */
function cp(id, btn) {
  navigator.clipboard.writeText(document.getElementById(id).textContent).then(function() {
    btn.textContent = 'copiato!'; btn.classList.add('ok');
    setTimeout(function() { btn.textContent = 'copia'; btn.classList.remove('ok'); }, 2000);
    showToast('📋 Testo copiato negli appunti');
  });
}

/* ══════════════════════════════════════════════
   ANALYZE — Architettura a 2 Fasi (v5)
   Fase 0: Brand detect + Ricerca prezzi (Perplexity)
   Fase 1: System+User prompt con dati reali
   ══════════════════════════════════════════════ */
async function analyze() {
  var apiKey = document.getElementById('apiKey').value.trim();
  var model = getModel();
  if (!apiKey) { showErr('Inserisci la tua OpenRouter API Key.'); return; }
  if (!files.length) { showErr("Carica almeno un'immagine."); return; }
  hideErr();

  var btn = document.getElementById('go');
  btn.disabled = true;
  document.getElementById('results').style.display = 'none';

  var savedKey = (function() { try { return localStorage.getItem('lai_k'); } catch (_) { return null; } })();

  try {
    /* ── Encode immagini (512px per token efficiency) ── */
    btn.innerHTML = '<span class="sp"></span> Preparazione immagini…';
    var imgs = await Promise.all(files.map(async function(f) {
      var b64 = await resEnc(f, 512);
      return { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + b64 } };
    }));

    /* ── Raccolta input utente ── */
    var cond = getCondLabel();
    var taglia = getTagliaIT();
    var discount = getCondDiscount();
    var categoria = getCategoria();
    var isCloth = isClothingCat();
    var sottocat = getSottocategoria();
    var extra = getExtraInfo();
    var extraFields = getExtraFields();

    /* Stagionalità */
    var catForSeason = isCloth ? (document.getElementById('categoria').value) : 'default';
    var seasonInfo = getSeasonalityInfo(catForSeason);

    /* Toggle ricerca prezzi */
    var priceResearchOn = document.getElementById('priceResearch') ? document.getElementById('priceResearch').checked : true;

    /* ══════════════════════════════════════════
       FASE 0: BRAND DETECTION + RICERCA PREZZI
       ══════════════════════════════════════════ */

    /* Brand: campo utente → priorità. Se vuoto e ricerca attiva → rilevamento AI */
    var brandInput = document.getElementById('brandField') ? document.getElementById('brandField').value.trim() : '';
    var brand = brandInput;
    var brandDetected = false;

    if (!brand && priceResearchOn) {
      btn.innerHTML = '<span class="sp"></span> 🔍 Identificazione brand…';
      brand = await detectBrandFromPhotos(apiKey, imgs);
      if (brand) brandDetected = true;
    }

    /* Ricerca prezzi di mercato con Perplexity Sonar */
    var marketData = null;
    if (priceResearchOn) {
      btn.innerHTML = '<span class="sp"></span> 🔍 Ricerca prezzi di mercato…';
      marketData = await researchMarketPrices(apiKey, brand, categoria, cond, taglia);
    }

    /* ── Calcoli deterministici (frontend, non AI) ── */
    var timingOttimale = getNextOptimalSlot();
    var oggi = new Date();
    var dataStr = oggi.toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    var oraStr = oggi.getHours() + ':' + String(oggi.getMinutes()).padStart(2, '0');

    /* Blocco info aggiuntive */
    var extraBlock = '';
    if (extra) extraBlock += '\nINFO AGGIUNTIVE: "' + extra + '"';
    if (extraFields.color) extraBlock += '\nColore: ' + extraFields.color;
    if (extraFields.material) extraBlock += '\nMateriale: ' + extraFields.material;
    if (extraFields.purchasedYear) extraBlock += '\nAnno acquisto: ' + extraFields.purchasedYear;
    if (extraFields.hasTags) extraBlock += '\nCartellino originale: SÌ';
    if (extraFields.hasBox) extraBlock += '\nScatola/imballo originale: SÌ';
    if (extraFields.shippingIncluded) extraBlock += '\nSpedizione INCLUSA nel prezzo';

    /* Template scheda tecnica */
    var schedaCampi = isCloth
      ? '"Brand":"","Tipo":"","Colore":"' + (extraFields.color || '') + '","Materiale":"' + (extraFields.material || '') + '","Taglia IT":"' + (taglia === 'da identificare dalle foto' ? '[da foto]' : taglia) + '","Condizione":"' + cond.split('(')[0].trim() + '"'
      : '"Brand":"","Sottocategoria":"' + (sottocat || '[da foto]') + '","Colore/Variante":"' + (extraFields.color || '') + '","Specifiche tecniche":"","Stato":"' + cond.split('(')[0].trim() + '"';

    var tagliaLabel = isCloth ? 'Taglia IT' : 'Sottocategoria';
    var tagliaValore = isCloth ? taglia : (sottocat || 'da identificare dalle foto');
    var schedaTemplate = '{' + schedaCampi + '}';
    var contentDesc = isCloth
      ? 'Materiale, colore, stile, fit, punti forza, condizione'
      : 'Caratteristiche tecniche, stato, compatibilità, punti forza';

    /* Regole lingue */
    var langRules = selectedLangs.map(function(code, i) {
      var info = LANG_MAP[code] || { negotiable: '🤝 Price negotiable!', label: code };
      var ruleNum = i + 1;
      if (i === 0) {
        return ruleNum + '. langs.' + code + ': 380-420 chars. Lingua: ' + info.label + '. Inizia "' + info.negotiable + '\\n". ' + contentDesc + '. Includi ' + tagliaLabel + '.' + (extra ? ' Usa info aggiuntive.' : '') + ' NO hashtag.';
      }
      return ruleNum + '. langs.' + code + ': 380-420 chars. Lingua: ' + info.label + '. Inizia "' + info.negotiable + '\\n". Stessa descrizione tradotta, adattata. Includi ' + tagliaLabel + '. NO hashtag.';
    }).join('\n');

    var langJsonTemplate = selectedLangs.map(function(c) { return '"' + c + '":"' + '"'; }).join(',');
    var maxTokens = Math.max(1600, 800 + selectedLangs.length * 400);

    /* ══════════════════════════════════════════
       FASE 1: SYSTEM + USER PROMPT
       ══════════════════════════════════════════ */

    var systemPrompt = buildSystemPrompt(isCloth);

    var marketDataStr = marketData
      ? JSON.stringify(marketData)
      : 'NON DISPONIBILI — stima con massima cautela basandoti su conoscenze generali, e dichiaralo esplicitamente nel campo note';

    var userPrompt =
      'ARTICOLO DA ANALIZZARE:\n' +
      '- Categoria: ' + categoria + '\n' +
      '- Condizione dichiarata: ' + cond + '\n' +
      '- ' + tagliaLabel + ': ' + tagliaValore + '\n' +
      '- Stagione corrente: ' + seasonInfo.seasonName + ' · Impatto prezzo: ' + seasonInfo.impactStr + '\n' +
      (seasonInfo.events.length ? '- Evento mercato attivo: ' + seasonInfo.events.join(', ') + '\n' : '') +
      (brand ? '- Brand ' + (brandDetected ? '(identificato da AI)' : '(confermato)') + ': ' + brand + '\n' : '') +
      (extraBlock ? extraBlock + '\n' : '') +
      '\nDATA ANALISI: ' + dataStr + ' ore ' + oraStr + '\n' +
      'MERCATO: Vinted.it · VALUTA: Euro (€)\n' +

      '\n═══ DATI_MERCATO (da ricerca web reale) ═══\n' +
      marketDataStr + '\n' +

      '\n═══ CALCOLO PREZZI VINTED (usa SOLO DATI_MERCATO sopra) ═══\n' +
      '• prezzo_rapido: ~percentile 20° annunci Vinted simili (min assoluto €3)\n' +
      '• prezzo_ideale: ~percentile 40-50° (±10% per condizione/concorrenza, stagionalità ' + seasonInfo.impactStr + ')\n' +
      '• prezzo_massimo: ~percentile 70° + 15% margine trattativa\n' +
      '  Cap: max 40% prezzo nuovo per EUC/GUC, max 60% per NWT/NWOT\n' +
      '  Exception: luxury/vintage/limited edition → nessun cap\n' +
      (extraFields.shippingIncluded ? '• NOTA: spedizione inclusa → aggiungi €4-6 a ideale/massimo\n' : '') +

      '\n═══ DESCRIZIONI RICHIESTE ═══\n' +
      langRules + '\n' +

      '\n═══ OUTPUT JSON (schema completo) ═══\n' +
      '{\n' +
      '  "t": "[Titolo SEO ≤50 char]",\n' +
      '  "langs": {' + langJsonTemplate + '},\n' +
      '  "ht": "#tag1 #tag2 #tag3 #tag4 #tag5 #tag6 #tag7",\n' +
      '  "p": {\n' +
      '    "nMin": "€X", "nMax": "€X",\n' +
      '    "vMin": "€X", "vMax": "€X",\n' +
      '    "note": "Fonti prezzi: [fonti reali o disclaimer stima]. Giustificazione in 1-2 frasi.",\n' +
      '    "advanced": {\n' +
      '      "prezzo_rapido": "€X",\n' +
      '      "prezzo_ideale": "€X",\n' +
      '      "prezzo_massimo": "€X",\n' +
      '      "difficolta_vendita": "facile|media|difficile",\n' +
      '      "difficolta_motivo": "[1 frase]",\n' +
      '      "breakdown_fattori": [\n' +
      '        {"fattore":"Brand","impatto":"+X%","spiegazione":"[1 frase]"},\n' +
      '        {"fattore":"Stagionalità","impatto":"' + seasonInfo.impactStr + '","spiegazione":"[1 frase]"},\n' +
      '        {"fattore":"Concorrenza","impatto":"-X%","spiegazione":"[1 frase]"},\n' +
      '        {"fattore":"Condizione","impatto":"+X%","spiegazione":"[1 frase]"}\n' +
      '      ],\n' +
      '      "stima_velocita_vendita": {\n' +
      '        "al_prezzo_rapido": "24-48 ore",\n' +
      '        "al_prezzo_ideale": "3-7 giorni",\n' +
      '        "al_prezzo_massimo": "1-3 settimane"\n' +
      '      },\n' +
      '      "dimensione_pacco": "Piccola|Media|Grande|Extra",\n' +
      '      "consigli_annuncio": ["[consiglio 1]","[consiglio 2]","[consiglio 3]"],\n' +
      '      "warning": []\n' +
      '    }\n' +
      '  },\n' +
      '  "s": ' + schedaTemplate + '\n' +
      '}';

    btn.innerHTML = '<span class="sp"></span> ✨ Generazione annuncio…';

    /* ── API Call (system + user separati) ── */
    var body = {
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: [{ type: 'text', text: userPrompt }].concat(imgs) }
      ],
      temperature: 0.10,
      max_tokens: maxTokens
    };

    async function fetchR(url, opts, n) {
      n = n || 3;
      for (var i = 1; i <= n; i++) {
        var r = await fetch(url, opts);
        if ((r.status === 429 || r.status === 503) && i < n) {
          var w = i * 10;
          btn.innerHTML = '<span class="sp"></span> Occupato, riprovo tra ' + w + 's…';
          await new Promise(function(res) { setTimeout(res, w * 1000); });
          continue;
        }
        return r;
      }
    }

    var resp = await fetchR('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
        'HTTP-Referer': location.href,
        'X-Title': 'ListAI Vinted'
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      var err = await resp.json().catch(function() { return {}; });
      if (resp.status === 401) throw new Error('API Key non valida — controlla su openrouter.ai/keys');
      if (resp.status === 429) throw new Error('Modello sovraccarico — prova un altro dal menu!');
      if (resp.status === 503) throw new Error('Modello non disponibile — prova un altro dal menu!');
      throw new Error((err && err.error && err.error.message) || 'Errore API (' + resp.status + ')');
    }

    var data = await resp.json();
    var raw = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
    var parsed;
    try {
      var clean = raw.replace(/```json|```/g, '').replace(/^[^{]*/, '').replace(/[^}]*$/, '').trim();
      parsed = JSON.parse(clean);
    } catch (e) {
      var match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); }
        catch (_) { throw new Error('Risposta AI non valida. Riprova o cambia modello.'); }
      } else {
        throw new Error('Risposta AI non valida. Riprova o cambia modello.');
      }
    }

    /* ── Validazione output ── */
    if (!parsed.t || parsed.t.length > 50) parsed.t = (parsed.t || '').slice(0, 50);
    if (!parsed.langs || typeof parsed.langs !== 'object') throw new Error('Risposta AI non valida (langs mancante). Riprova.');
    for (var ci = 0; ci < selectedLangs.length; ci++) {
      var code = selectedLangs[ci];
      var desc = parsed.langs[code];
      if (!desc || desc.length < 100) throw new Error('Descrizione ' + (LANG_MAP[code] || { name: code }).name + ' incompleta. Riprova.');
    }

    /* ── Inietta dati calcolati dal frontend ── */
    parsed._seasonInfo = seasonInfo;
    parsed._marketData = marketData;
    parsed._priceVerified = !!marketData;
    parsed._brand = brand;
    parsed._brandDetected = brandDetected;

    /* Confidence score deterministico */
    var hasExtraInfo = !!(extraFields.color || extraFields.material || extraFields.purchasedYear || extraFields.hasTags || extraFields.hasBox);
    parsed._confidenceScore = calcConfidence(!!marketData, !!brand, hasExtraInfo);

    /* Timing e commissione dal frontend */
    parsed._timingOttimale = timingOttimale;
    if (parsed.p && parsed.p.advanced && parsed.p.advanced.prezzo_ideale) {
      var idealNum = parseEuro(parsed.p.advanced.prezzo_ideale);
      if (idealNum) {
        parsed._commissione = '€' + calcVintedFee(idealNum).toFixed(2) + ' (5% + €0.70)';
      }
    }

    renderResults(parsed);
    if (apiKey !== savedKey) promptSave(apiKey);
    showToast('✅ Analisi completata!');

  } catch (e) {
    showErr(e.message || 'Errore imprevisto.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg> Analizza di nuovo';
  }
}


/* ── Helpers ── */
function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function parseEuro(s) {
  if (!s || s === '—') return null;
  var n = parseFloat(String(s).replace(/[€\s]/g, '').replace(',', '.'));
  return isNaN(n) ? null : n;
}
function fmtEuro(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  var r = Math.round(n * 2) / 2;
  return '€' + (r % 1 === 0 ? r.toFixed(0) : r.toFixed(2));
}

/* ══════════════════════════════════════════════
   RENDER RESULTS — con nuova UI avanzata
   ══════════════════════════════════════════════ */
function renderResults(d, skipHistory) {
  /* Save for quick copy */
  window._lastResult = d;

  /* Titolo SEO */
  var t = d.t || '—';
  document.getElementById('seoTitle').textContent = t;
  var tl = document.getElementById('titleLen');
  tl.textContent = t.length + '/50 caratteri' + (t.length > 50 ? ' ⚠️ troppo lungo' : '');
  tl.style.color = t.length > 50 ? 'var(--color-danger)' : 'var(--color-text-muted)';

  /* Descrizioni — tutte le lingue + hashtag integrati */
  var langs = d.langs || {};
  var ht = d.ht || '';

  /* Main description: tutte le lingue, ognuna con hashtag */
  var fullParts = selectedLangs.map(function(code) {
    var info = LANG_MAP[code] || { flag: '🌐', name: code };
    var text = langs[code] || '';
    if (!text) return '';
    return info.flag + ' ' + info.name.toUpperCase() + '\n' + text + (ht ? '\n\n' + ht : '');
  }).filter(Boolean);
  var fullText = fullParts.join('\n\n────────────────────\n\n');
  document.getElementById('descFull').textContent = fullText || '—';
  document.getElementById('descFullLen').textContent = fullText.length + ' caratteri totali';

  /* Lang cards nella sezione collapsabile — ogni lingua con hashtag */
  var langGrid = document.getElementById('descLangCards');
  langGrid.innerHTML = '';
  selectedLangs.forEach(function(code) {
    var info = LANG_MAP[code] || { flag: '🌐', name: code };
    var text = langs[code] || '—';
    var textWithHt = text + (ht && text !== '—' ? '\n\n' + ht : '');
    var elId = 'descLang_' + code;
    var card = document.createElement('div');
    card.className = 'dc';
    card.innerHTML =
      '<div class="clbl">' + info.flag + ' ' + escHtml(info.name) +
      '<button class="cpbtn" onclick="cp(\'' + elId + '\',this)">copia</button></div>' +
      '<div class="dtxt" id="' + elId + '">' + escHtml(textWithHt) + '</div>' +
      '<div class="dlen">' + (text === '—' ? '' : textWithHt.length + ' caratteri') + '</div>';
    langGrid.appendChild(card);
  });

  /* Prezzi base */
  var p = d.p || {};
  document.getElementById('pNMin').textContent = p.nMin || '—';
  document.getElementById('pNMax').textContent = p.nMax || '—';
  document.getElementById('pVMin').textContent = p.vMin || '—';
  document.getElementById('pVMax').textContent = p.vMax || '—';
  var NEGO_MARGIN = 0.15;
  var vMinN = parseEuro(p.vMin), vMaxN = parseEuro(p.vMax);
  document.getElementById('pCMin').textContent = fmtEuro(vMinN !== null ? vMinN * (1 + NEGO_MARGIN) : null);
  document.getElementById('pCMax').textContent = fmtEuro(vMaxN !== null ? vMaxN * (1 + NEGO_MARGIN) : null);
  document.getElementById('priceNote').textContent = p.note || '—';

  /* ══ RENDER PREZZI AVANZATI ══ */
  var adv = (p && p.advanced) ? p.advanced : null;

  if (adv && (adv.prezzo_rapido || adv.prezzo_ideale || adv.prezzo_massimo)) {
    document.getElementById('priceSliderWrap').style.display = 'block';
    document.getElementById('legacyPrices').style.display = 'none';

    var pFast  = adv.prezzo_rapido  || p.vMin || '—';
    var pIdeal = adv.prezzo_ideale  || p.vMax || '—';
    var pMax   = adv.prezzo_massimo || fmtEuro(vMaxN !== null ? vMaxN * 1.15 : null) || '—';

    document.getElementById('ptFast').textContent  = pFast;
    document.getElementById('ptIdeal').textContent = pIdeal;
    document.getElementById('ptMax').textContent   = pMax;

    /* Confidence score */
    var confScore = d._confidenceScore || (adv && adv.confidence_score !== undefined ? adv.confidence_score : null);
    if (confScore !== null) {
      document.getElementById('confidenceBadge').style.display = 'inline-flex';
      document.getElementById('confidenceText').textContent = 'Affidabilità ' + confScore + '%';
    }

    /* Difficoltà vendita */
    if (adv.difficolta_vendita) {
      var diffWrap = document.getElementById('difficultyWrap');
      if (diffWrap) {
        diffWrap.style.display = 'flex';
        var diffLevel = (adv.difficolta_vendita || '').toLowerCase();
        var diffEmoji = diffLevel === 'facile' ? '🟢' : (diffLevel === 'media' ? '🟡' : '🔴');
        var diffLabel = diffLevel === 'facile' ? 'Facile da vendere' : (diffLevel === 'media' ? 'Difficoltà media' : 'Difficile da vendere');
        document.getElementById('difficultyBadge').className = 'diff-badge diff-' + diffLevel;
        document.getElementById('difficultyBadge').innerHTML = diffEmoji + ' ' + diffLabel;
        document.getElementById('difficultyMotivo').textContent = adv.difficolta_motivo || '';
      }
    }

    /* Commissione stimata */
    var commStr = d._commissione || (adv && adv.commissione_stimata) || null;
    if (commStr) {
      var commEl = document.getElementById('commissioneDisplay');
      if (commEl) {
        commEl.style.display = 'block';
        commEl.textContent = '💳 Commissione acquirente: ' + commStr;
      }
    }

    /* Velocità di vendita (solo tempi, prezzi già nelle tier cards) */
    if (adv.stima_velocita_vendita) {
      document.getElementById('velocityRow').style.display = 'grid';
      var vel = adv.stima_velocita_vendita;
      document.getElementById('velFastTime').textContent   = vel.al_prezzo_rapido || '24-48 ore';
      document.getElementById('velIdealTime').textContent  = vel.al_prezzo_ideale || '3-7 giorni';
      document.getElementById('velMaxTime').textContent    = vel.al_prezzo_massimo || '2-4 settimane';
    }

    /* Timing ottimale */
    var timingStr = d._timingOttimale || (adv && adv.timing_ottimale) || null;
    if (timingStr) {
      var tb = document.getElementById('timingBanner');
      tb.style.display = 'block';
      tb.innerHTML = '📅 <strong>Timing consigliato:</strong> ' + escHtml(timingStr);
    }

    /* Dimensione pacco */
    if (adv && adv.dimensione_pacco) {
      var pb = document.getElementById('packageBanner');
      if (pb) {
        pb.style.display = 'block';
        pb.innerHTML = '📦 <strong>Dimensione pacco consigliata:</strong> ' + escHtml(adv.dimensione_pacco);
      }
    }

  } else {
    document.getElementById('priceSliderWrap').style.display = 'none';
    document.getElementById('legacyPrices').style.display = 'grid';
  }

  /* ══ RENDER BREAKDOWN FATTORI ══ */
  var factors = adv && adv.breakdown_fattori;
  if (factors && factors.length) {
    document.getElementById('breakdownWrap').style.display = 'block';
    var html = '';
    factors.forEach(function(f, idx) {
      var impact = f.impatto || '0%';
      var num = parseFloat(impact.replace('%', '')) || 0;
      var cls = num > 0 ? 'factor-positive' : (num < 0 ? 'factor-negative' : 'factor-neutral');
      var barWidth = Math.min(Math.abs(num) * 2.5, 100); /* Max 40% = 100% bar */
      html +=
        '<div class="factor-row ' + cls + '" style="animation-delay:' + (idx * 80) + 'ms">' +
        '<div class="factor-name">' + escHtml(f.fattore || '') + '</div>' +
        '<div class="factor-bar-wrap"><div class="factor-bar-bg"><div class="factor-bar-inner" style="width:' + barWidth + '%"></div></div></div>' +
        '<div class="factor-impact">' + escHtml(impact) + '</div>' +
        '<div class="factor-note">' + escHtml((f.spiegazione || '').slice(0, 35)) + '</div>' +
        '</div>';
    });
    document.getElementById('factorsList').innerHTML = html;
  } else {
    document.getElementById('breakdownWrap').style.display = 'none';
  }

  /* ══ CONSIGLI ANNUNCIO ══ */
  var consigli = adv && adv.consigli_annuncio;
  if (consigli && consigli.length) {
    document.getElementById('consigliCard').style.display = 'block';
    document.getElementById('consigliList').innerHTML = consigli.map(function(c) {
      return '<li>' + escHtml(c) + '</li>';
    }).join('');
  } else {
    document.getElementById('consigliCard').style.display = 'none';
  }

  /* ══ WARNINGS ══ */
  var warnings = adv && adv.warning;
  if (warnings && warnings.length) {
    document.getElementById('warningsWrap').style.display = 'block';
    document.getElementById('warningsList').innerHTML = warnings.map(function(w) {
      return '<div class="warning-item">⚠️ ' + escHtml(w) + '</div>';
    }).join('');
  } else {
    document.getElementById('warningsWrap').style.display = 'none';
  }

  /* ══ BADGE STAGIONALITÀ ══ */
  var seasonInfo = d._seasonInfo;
  if (seasonInfo) {
    var seasonEmoji = { spring: '🌸', summer: '☀️', autumn: '🍂', winter: '❄️' }[seasonInfo.season] || '📅';
    var seasonBadgeHtml = '<div class="season-info"><div class="dot"></div>' + seasonEmoji + ' ' + escHtml(seasonInfo.seasonName) + ' · ' + escHtml(seasonInfo.impactStr) + '</div>';
    document.getElementById('seasonBadgeWrap').innerHTML = seasonBadgeHtml;
  }

  /* Badge prezzi verificati/stimati */
  var pvBadge = document.getElementById('priceSourceBadge');
  if (pvBadge) {
    if (d._priceVerified) {
      pvBadge.className = 'price-source-badge verified';
      pvBadge.innerHTML = '🌐 Prezzi verificati via web';
    } else {
      pvBadge.className = 'price-source-badge estimated';
      pvBadge.innerHTML = '⚠️ Prezzi stimati (AI)';
    }
    pvBadge.style.display = 'inline-flex';
  }

  /* Scheda prodotto */
  var s = d.s || {};
  var detailTable = document.getElementById('detailTable');
  var missingCount = 0;
  detailTable.innerHTML =
    Object.entries(s).map(function(kv) {
      var val = kv[1];
      var isMissing = !val || val === '—' || val === '';
      if (isMissing) missingCount++;
      var cls = isMissing ? ' class="missing-val"' : '';
      return '<tr><td>' + escHtml(kv[0]) + '</td><td' + cls + '>' + escHtml(val || '⚠️ non determinato') + '</td></tr>';
    }).join('');

  if (missingCount >= 2) {
    detailTable.insertAdjacentHTML('beforeend',
      '<tr><td colspan="2" style="color:var(--color-warning);font-size:.75rem;padding-top:.5rem">' +
      '⚠️ ' + missingCount + ' campi non determinabili dalle foto — aggiungi più immagini o usa le "Info aggiuntive"' +
      '</td></tr>'
    );
  }

  var r = document.getElementById('results');
  r.style.display = 'block';
  r.scrollIntoView({ behavior: 'smooth', block: 'start' });

  /* Render new UI components */
  showQuickCopyBar(d);

  if (!skipHistory) saveToHistory(d);
}

/* ════════════════════════════════
   STORICO
   ════════════════════════════════ */
var HIST_KEY = 'lai_history';
var HIST_MAX = 50;

function loadHistory() { try { var raw = localStorage.getItem(HIST_KEY); return raw ? JSON.parse(raw) : []; } catch (_) { return []; } }
function saveHistory(arr) { try { localStorage.setItem(HIST_KEY, JSON.stringify(arr)); } catch (_) {} }

function saveToHistory(d) {
  var arr = loadHistory();
  var entry = { id: Date.now(), ts: new Date().toISOString(), title: d.t || '(senza titolo)', data: d };
  arr.unshift(entry);
  if (arr.length > HIST_MAX) arr = arr.slice(0, HIST_MAX);
  saveHistory(arr);
  renderHistoryList();
}

function clearHistory() {
  if (!confirm('Cancellare tutto lo storico delle ' + loadHistory().length + ' analisi?')) return;
  saveHistory([]); renderHistoryList();
}

function deleteHistoryEntry(id) {
  saveHistory(loadHistory().filter(function(e) { return e.id !== id; }));
  renderHistoryList();
}

function loadHistoryEntry(id) {
  var arr = loadHistory();
  var entry = null;
  for (var i = 0; i < arr.length; i++) { if (arr[i].id === id) { entry = arr[i]; break; } }
  if (!entry) return;
  renderResults(entry.data, true);
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toggleHistory() {
  var body = document.getElementById('histBody');
  var arrow = document.getElementById('histArrow');
  var open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  arrow.style.transform = open ? '' : 'rotate(180deg)';
}

function fmtDate(iso) {
  try {
    var d = new Date(iso);
    var day = String(d.getDate()).padStart(2, '0');
    var mon = String(d.getMonth() + 1).padStart(2, '0');
    var yr = d.getFullYear();
    var hh = String(d.getHours()).padStart(2, '0');
    var mm = String(d.getMinutes()).padStart(2, '0');
    return day + '/' + mon + '/' + yr + ' ' + hh + ':' + mm;
  } catch (_) { return iso; }
}

function renderHistoryList() {
  var arr = loadHistory();
  document.getElementById('histBadge').textContent = arr.length;
  var clearBtn = document.getElementById('histClearBtn');
  clearBtn.style.display = arr.length > 0 ? 'inline-flex' : 'none';

  var list = document.getElementById('histList');
  if (arr.length === 0) {
    list.innerHTML = '<div class="hist-empty">Nessuna analisi ancora — i risultati verranno salvati automaticamente qui.</div>';
    return;
  }

  list.innerHTML = arr.map(function(entry, idx) {
    var p = (entry.data && entry.data.p) || {};
    var adv = p.advanced || {};
    var priceStr = adv.prezzo_ideale ? (adv.prezzo_rapido + ' – ' + adv.prezzo_massimo) : ((p.vMin || '') + (p.vMax ? ' – ' + p.vMax : ''));
    var firstLang = '';
    if (entry.data && entry.data.langs) {
      var codes = Object.keys(entry.data.langs);
      if (codes.length) firstLang = (entry.data.langs[codes[0]] || '').slice(0, 90);
      if (firstLang.length === 90) firstLang += '…';
    }
    return '<div class="hist-item" id="hitem_' + entry.id + '">' +
      '<div class="hist-item-head" onclick="toggleHistItem(' + entry.id + ')">' +
        '<div class="hist-item-info">' +
          '<span class="hist-num">' + (idx + 1) + '</span>' +
          '<div>' +
            '<div class="hist-item-title">' + escHtml(entry.title) + '</div>' +
            '<div class="hist-item-meta">' + fmtDate(entry.ts) + (priceStr ? ' · ' + escHtml(priceStr) : '') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="hist-item-actions" onclick="event.stopPropagation()">' +
          '<button class="hist-load-btn" onclick="loadHistoryEntry(' + entry.id + ')">📂 Carica</button>' +
          '<button class="hist-del-btn" onclick="deleteHistoryEntry(' + entry.id + ')">✕</button>' +
        '</div>' +
      '</div>' +
      '<div class="hist-item-body" id="hbody_' + entry.id + '" style="display:none">' +
        (firstLang ? '<div class="hist-preview">' + escHtml(firstLang) + '</div>' : '') +
      '</div>' +
    '</div>';
  }).join('');
}

function toggleHistItem(id) {
  var body = document.getElementById('hbody_' + id);
  if (!body) return;
  body.style.display = body.style.display === 'none' ? 'block' : 'none';
}

/* ══════════════════════════════════════════════
   COPY FULL LISTING — Annuncio completo pronto
   ══════════════════════════════════════════════ */
function copyField(id) {
  var el = document.getElementById(id);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(function() {
    showToast('📋 Testo copiato negli appunti');
  });
}

function copyFullListing(lang) {
  lang = lang || selectedLangs[0];
  var lastResult = window._lastResult;
  if (!lastResult) return;

  var desc = (lastResult.langs && lastResult.langs[lang]) || '';
  var ht   = lastResult.ht || '';

  // Formato Vinted: descrizione + 2 righe vuote + hashtag
  var full = desc + '\n\n' + ht;

  navigator.clipboard.writeText(full).then(function() {
    var info = LANG_MAP[lang] || { flag: '🌐' };
    showToast('📋 Annuncio ' + info.flag + ' copiato — incollalo direttamente su Vinted!');
  });
}

/* ══════════════════════════════════════════════
   VINTED CHECKLIST — Pre-publish validation
   ══════════════════════════════════════════════ */
function renderVintedChecklist(d) {
  var wrap = document.getElementById('checklistWrap');
  if (!wrap) return;

  var items = [
    { ok: d.t && d.t.length <= 50,      text: 'Titolo ≤ 50 caratteri' },
    { ok: d.t && !d.t.match(/^(il|la|un|una|dei|le|i|gli)\s/i), text: 'Titolo non inizia con articolo' },
    { ok: d.ht && d.ht.split('#').length >= 7, text: '7+ hashtag presenti' },
    { ok: d.langs && d.langs.it && d.langs.it.length >= 380, text: 'Descrizione IT ≥ 380 caratteri' },
    { ok: d.langs && d.langs.it && d.langs.it.indexOf('🤝') >= 0, text: 'Descrizione include 🤝' },
    { ok: d.p && d.p.advanced && d.p.advanced.prezzo_ideale, text: 'Prezzo ideale calcolato' },
    { ok: !d.p || !d.p.advanced || !d.p.advanced.warning || d.p.advanced.warning.length === 0, text: 'Nessun warning critico' }
  ];

  var allOk = items.every(function(item) { return item.ok; });
  var passCount = items.filter(function(item) { return item.ok; }).length;

  wrap.style.display = 'block';
  wrap.innerHTML =
    '<div class="checklist-header">' +
      '<div class="clbl">' +
        '<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> ' +
        'Checklist Vinted' +
        '<span class="checklist-score ' + (allOk ? 'all-ok' : '') + '">' + passCount + '/' + items.length + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="checklist-items">' +
    items.map(function(item) {
      return '<div class="checklist-item ' + (item.ok ? 'check-ok' : 'check-warn') + '">' +
        '<span class="check-icon">' + (item.ok ? '✅' : '⚠️') + '</span>' +
        '<span>' + escHtml(item.text) + '</span>' +
      '</div>';
    }).join('') +
    '</div>';
}

/* ══════════════════════════════════════════════
   QUICK COPY STICKY BAR
   ══════════════════════════════════════════════ */
function showQuickCopyBar(d) {
  var bar = document.getElementById('quickCopyBar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'quickCopyBar';
    bar.className = 'quick-copy-bar';
    document.body.appendChild(bar);
  }

  var priceDisplay = (d.p && d.p.advanced && d.p.advanced.prezzo_ideale) || '—';

  bar.innerHTML =
    '<span class="qcb-info">' +
      '<strong>' + escHtml(d.t || '—') + '</strong> · ' + priceDisplay +
    '</span>' +
    '<div class="qcb-buttons">' +
      '<button onclick="copyField(\'seoTitle\')" class="cpbtn">📋 Titolo</button>' +
      '<button onclick="copyFullListing(\'it\')" class="cpbtn qcb-primary">📋 Annuncio IT</button>' +
      (selectedLangs.includes('en') ? '<button onclick="copyFullListing(\'en\')" class="cpbtn">📋 EN</button>' : '') +
    '</div>';

  bar.style.display = 'flex';
}

/* ── Init ── */
loadLangs();
renderHistoryList();
