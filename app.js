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
  max = max || 640;
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
   ANALYZE — Prompt IA avanzato (Fase 2)
   ══════════════════════════════════════════════ */
async function analyze() {
  var apiKey = document.getElementById('apiKey').value.trim();
  var model = getModel();
  if (!apiKey) { showErr('Inserisci la tua OpenRouter API Key.'); return; }
  if (!files.length) { showErr("Carica almeno un'immagine."); return; }
  hideErr();

  var btn = document.getElementById('go');
  btn.disabled = true;
  btn.innerHTML = '<span class="sp"></span> Analisi in corso…';
  document.getElementById('results').style.display = 'none';

  var savedKey = (function() { try { return localStorage.getItem('lai_k'); } catch (_) { return null; } })();

  try {
    var imgs = await Promise.all(files.map(async function(f) {
      var b64 = await resEnc(f, 640);
      return { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + b64 } };
    }));

    var cond = getCondLabel();
    var taglia = getTagliaIT();
    var discount = getCondDiscount();
    var categoria = getCategoria();
    var isCloth = isClothingCat();
    var sottocat = getSottocategoria();
    var extra = getExtraInfo();
    var extraFields = getExtraFields();

    /* Stagionalità (calcolata nel frontend, passata al prompt) */
    var catForSeason = isCloth ? (document.getElementById('categoria').value) : 'default';
    var seasonInfo = getSeasonalityInfo(catForSeason);

    /* Blocco info aggiuntive completo */
    var extraBlock = '';
    if (extra) extraBlock += '\nINFO AGGIUNTIVE: "' + extra + '"';
    if (extraFields.color) extraBlock += '\nColore specificato: ' + extraFields.color;
    if (extraFields.material) extraBlock += '\nMateriale specificato: ' + extraFields.material;
    if (extraFields.purchasedYear) extraBlock += '\nAnno acquisto: ' + extraFields.purchasedYear;
    if (extraFields.hasTags) extraBlock += '\nHa ancora il cartellino originale: SÌ';
    if (extraFields.hasBox) extraBlock += '\nHa scatola/imballo originale: SÌ';
    if (extraFields.shippingIncluded) extraBlock += '\nSpedizione INCLUSA nel prezzo consigliato';

    var schedaCampi = isCloth
      ? '"Brand":"","Tipo":"","Colore":"' + (extraFields.color || '') + '","Materiale":"' + (extraFields.material || '') + '","Taglia IT":"' + (taglia === 'da identificare dalle foto' ? '[da foto]' : taglia) + '","Condizione":"' + cond.split('(')[0].trim() + '"'
      : '"Brand":"","Sottocategoria":"' + (sottocat || '[da foto]') + '","Colore/Variante":"' + (extraFields.color || '') + '","Specifiche tecniche":"","Stato":"' + cond.split('(')[0].trim() + '"';

    var tagliaLabel = isCloth ? 'Taglia IT' : 'Sottocategoria';
    var tagliaValore = isCloth ? taglia : (sottocat || 'da identificare dalle foto');
    var schedaTemplate = '{' + schedaCampi + '}';

    var contentDesc = isCloth
      ? 'Materiale, colore, stile, fit, punti forza, condizione'
      : 'Caratteristiche tecniche, stato, compatibilità, punti forza';

    var langRules = selectedLangs.map(function(code, i) {
      var info = LANG_MAP[code] || { negotiable: '🤝 Price negotiable!', label: code };
      var ruleNum = i + 2;
      if (i === 0) {
        return ruleNum + '. langs.' + code + ': 380-420 chars. Lingua: ' + info.label + '. Inizia "' + info.negotiable + '\\n". ' + contentDesc + '. Includi ' + tagliaLabel + '.' + (extra ? ' Usa info aggiuntive.' : '') + ' NO hashtag.';
      }
      return ruleNum + '. langs.' + code + ': 380-420 chars. Lingua: ' + info.label + '. Inizia "' + info.negotiable + '\\n". Stessa descrizione tradotta, adattata. Includi ' + tagliaLabel + '. NO hashtag.';
    }).join('\n');

    var htRuleNum = selectedLangs.length + 2;
    var langJsonTemplate = selectedLangs.map(function(c) { return '"' + c + '":""'; }).join(',');
    var maxTokens = Math.max(1600, 800 + selectedLangs.length * 400);

    /* ══ PROMPT POTENZIATO v4 ══ */
    var oggi = new Date();
    var dataStr = oggi.toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    var oraStr = oggi.getHours() + ':' + String(oggi.getMinutes()).padStart(2, '0');

    var prompt =
      // ═══════════════════════════════════════════
      // IDENTITÀ E OBIETTIVO
      // ═══════════════════════════════════════════
      'Sei LISTAI, il più preciso generatore di annunci ottimizzati per Vinted Italia. ' +
      'Il tuo unico obiettivo: creare un annuncio che si venda entro 7 giorni al prezzo migliore possibile. ' +
      'Ogni parola dell\'annuncio ha uno scopo. Ogni prezzo è basato su dati reali, non su formule astratte. ' +
      'REGOLA ASSOLUTA: se un dato non è visibile o non conosci il prezzo reale di mercato, ' +
      'dilo esplicitamente nel campo "note" invece di inventare. ZERO allucinazioni sui prezzi.\n\n' +

      // ═══════════════════════════════════════════
      // CONTESTO TEMPORALE E DI MERCATO
      // ═══════════════════════════════════════════
      'DATA ANALISI: ' + dataStr + ' ore ' + oraStr + '\n' +
      'MERCATO TARGET: Vinted.it (mercato italiano)\n' +
      'VALUTA: Euro (€)\n\n' +

      // ═══════════════════════════════════════════
      // INPUT DELL'UTENTE
      // ═══════════════════════════════════════════
      'OGGETTO DA ANALIZZARE:\n' +
      '- Categoria: ' + categoria + '\n' +
      '- Condizione dichiarata: ' + cond + '\n' +
      '- ' + tagliaLabel + ': ' + tagliaValore + '\n' +
      '- Stagione corrente: ' + seasonInfo.seasonName + ' · Impatto prezzo stimato: ' + seasonInfo.impactStr + '\n' +
      (seasonInfo.events.length ? '- Evento mercato attivo: ' + seasonInfo.events.join(', ') + '\n' : '') +
      (extraBlock ? extraBlock + '\n' : '') +

      // ═══════════════════════════════════════════
      // FASE 1 — ANALISI VISIVA
      // ═══════════════════════════════════════════
      '\n═══ FASE 1: ANALISI VISIVA ═══\n' +
      'Esamina TUTTE le immagini con la massima attenzione. Identifica con certezza:\n\n' +
      '1. BRAND/MARCHIO:\n' +
      '   → Cerca logo, etichette interne, stampe, ricami, caratteristiche costruttive distintive\n' +
      '   → Se non visibile: "non determinabile dalle foto"\n\n' +
      '2. MODELLO/STAGIONE:\n' +
      '   → Modello specifico se leggibile (es. "Air Force 1", "501", "Dionysus")\n' +
      '   → Anno/stagione se deducibile da etichette o caratteristiche stilistiche\n' +
      '   → Se non visibile: "non determinabile"\n\n' +
      '3. COLORE ESATTO:\n' +
      '   → NON scrivere "nero" se è antracite, "marrone" se è cognac, "blu" se è navy\n' +
      '   → Usa sempre il termine cromatico preciso\n\n' +
      '4. MATERIALE/COMPOSIZIONE:\n' +
      '   → Leggi l\'etichetta di composizione se visibile (es. "100% lana vergine")\n' +
      '   → Se non visibile: stima dal tessuto visivo\n\n' +
      '5. CONDIZIONE REALE:\n' +
      '   → Confronta la condizione dichiarata dall\'utente con ciò che vedi nelle foto\n' +
      '   → Elenca TUTTI i difetti visibili: macchie, usura, pilling, graffi, sfilacciature\n' +
      '   → Se condizione reale ≠ condizione dichiarata → aggiungi WARNING\n\n' +
      '6. TAGLIA/MISURA:\n' +
      '   → Leggi l\'etichetta taglia se visibile nelle foto\n' +
      '   → Segnala se la taglia sull\'etichetta ≠ taglia dichiarata dall\'utente\n\n' +
      '7. PREZZO ORIGINALE:\n' +
      '   → Se il cartellino è visibile nelle foto, leggi e riporta il prezzo originale esatto\n\n' +
      'REGOLE AGGIUNTIVE ANALISI VISIVA:\n' +
      '- Leggi le etichette interne CON CURA: taglia, composizione, stagione, paese produzione\n' +
      '- Cerca il modello/stagione nella trama o nel pattern se il brand lo inserisce (es: Zara SS25)\n' +
      '- Valuta l\'usura REALE delle foto: pelliccia consumata, pilling, scoloriture, asimmetrie\n' +
      '- Se la condizione dichiarata NON corrisponde alle foto, inserisci un WARNING nel campo warning[]\n' +
      '- Se il cartellino è visibile nelle foto, leggi il prezzo originale dal cartellino stesso\n' +
      '- Per scarpe: controlla la suola (usura), la tomaia (graffi) e l\'interno (odori non visibili → nota)\n' +
      '- Per borse: controlla angoli, cerniere, tracolla, interno (se visibile), hardware (ossidazione)\n\n' +

      // ═══════════════════════════════════════════
      // FASE 2 — RICERCA PREZZI
      // ═══════════════════════════════════════════
      '\n═══ FASE 2: ANALISI PREZZI DI MERCATO ═══\n\n' +

      'A) PREZZO NUOVO — RETAIL ATTUALE:\n' +
      '   Cerca il prezzo di vendita ATTUALE (non storico) per questo esatto articolo/modello:\n' +
      '   - Amazon.it: prezzo attuale o più recente disponibile\n' +
      '   - Zalando.it: prezzo di listino corrente\n' +
      '   - Sito ufficiale brand: prezzo full-price attuale\n' +
      '   → Indica la fonte per ogni stima (es. "Zalando ~€89", "sito brand ~€95")\n' +
      '   → Se il brand non è venduto in Italia, usa prezzi EU del brand\n' +
      '   → Se non hai dati: scrivi "prezzo nuovo non determinabile — stimato €X basato su categoria/brand tier"\n\n' +

      'B) PREZZI SU VINTED ITALIA — MERCATO REALE:\n' +
      '   Analizza cosa è attualmente in vendita su Vinted.it per questo articolo:\n' +
      '   - Range prezzi attivi (min - max) per stesso brand/modello/condizione simile\n' +
      '   - Stima della concorrenza: pochi annunci (<5) / media (5-20) / alta (>20)\n' +
      '   - Velocità di vendita percepita per questa categoria in questo periodo\n\n' +

      'C) CALCOLO FASCE PREZZO VINTED — METODOLOGIA PRECISA:\n' +
      '   Calcola le 3 fasce usando dati reali Vinted trovati in B), non formule astratte:\n\n' +
      '   prezzo_rapido = percentile 20° degli annunci attivi simili\n' +
      '     → Obiettivo: vendere entro 24-72 ore\n' +
      '     → Minimo assoluto: €3 (soglia logistica Vinted)\n\n' +
      '   prezzo_ideale = percentile 40°-50° degli annunci attivi simili\n' +
      '     → Aggiusta +10% se condizione è migliore della media\n' +
      '     → Aggiusta -10% se concorrenza alta (>20 annunci simili)\n' +
      '     → Aggiusta per stagionalità: ' + seasonInfo.impactStr + '\n\n' +
      '   prezzo_massimo = percentile 70° degli annunci attivi + 15% margine trattativa\n' +
      '     → Giustificato se: NWT/NWOT, brand premium, taglia rara, pochi concorrenti\n' +
      '     → Cap: max 40% del prezzo nuovo per EUC/GUC, max 60% per NWT/NWOT\n' +
      '     → Exception: luxury/vintage/limited edition → nessun cap\n\n' +
      (extraFields.shippingIncluded ? '   NOTA SPEDIZIONE INCLUSA: aggiungi €4-6 al prezzo ideale e massimo\n\n' : '') +

      '   Timing ottimale:\n' +
      '   - Giorni migliori per pubblicare su Vinted IT: giovedì, venerdì, domenica\n' +
      '   - Orario migliore: 19:00-22:00 (picco traffico utenti dopo lavoro/cena)\n' +
      '   - Evitare: lunedì mattina, sabato pomeriggio\n' +
      '   - Vinted mostra gli annunci NUOVI per prime 24h → pubblicare subito prima del weekend = massima esposizione\n' +
      '   → Nel campo timing_ottimale scrivi il prossimo giorno+ora consigliata basandoti su data/ora corrente: ' + dataStr + ' ' + oraStr + '\n\n' +

      // ═══════════════════════════════════════════
      // FASE 3 — CREAZIONE ANNUNCIO
      // ═══════════════════════════════════════════
      '\n═══ FASE 3: CREAZIONE ANNUNCIO ═══\n\n' +

      '--- TITOLO SEO (campo "t") ---\n' +
      'Regole INVIOLABILI:\n' +
      '- Max 50 caratteri TOTALI (inclusi spazi)\n' +
      '- Formula: [Brand] [TipoProdotto] [ColoreEsatto/Materiale] [KeywordDifferenziante]\n' +
      '- NON iniziare con articoli: Il, La, Un, Una, I, Le, Gli\n' +
      '- NON includere: "usato", "ottimo stato", "spedisco" (sprecano caratteri SEO)\n' +
      '- Usa keyword ad alto volume Vinted IT: vintage, oversize, y2k, crop, blazer, etc.\n' +
      '- Se c\'è spazio: includi la taglia IT\n\n' +

      '--- DESCRIZIONI MULTILINGUA (campo "langs") ---\n' +
      langRules + '\n\n' +
      'STRUTTURA OBBLIGATORIA per OGNI descrizione:\n' +
      '  Riga 1: "🤝 Prezzo trattabile!" (IT) o equivalente lingua\n' +
      '  Riga 2: [Apertura identificativa: capo + punto forza principale]\n' +
      '  Riga 3-4: [Dettagli fisici: materiale esatto, colore preciso, fit/vestibilità]\n' +
      '  Riga 5: [Condizione reale + difetti se presenti — sii onesto]\n' +
      '  Riga 6: [CTA naturale: spedizione rapida, sconto multipli, risposta veloce]\n' +
      'NON scrivere mai "Vendo" o "Cedo" (ovvio su Vinted)\n\n' +

      '--- HASHTAG (campo "ht") ---\n' +
      'Esattamente 7 hashtag, separati da spazio:\n' +
      '  #1 Brand IT · #2 TipoProdotto IT · #3 KeywordPrincipale EN\n' +
      '  #4 Colore IT · #5 Trend/Stile · #6 Taglia · #7 CategoriaAmpia IT\n' +
      'Evita hashtag generici: #usato, #secondhand, #vendo\n\n' +

      // ═══════════════════════════════════════════
      // OUTPUT JSON
      // ═══════════════════════════════════════════
      '\n═══ OUTPUT: SOLO JSON VALIDO ═══\n' +
      'Zero markdown. Zero testo fuori dal JSON. Zero commenti.\n' +
      'Schema completo:\n' +
      '{\n' +
      '  "t": "[Titolo SEO ≤50 char]",\n' +
      '  "langs": {' + langJsonTemplate + '},\n' +
      '  "ht": "[#tag1 #tag2 #tag3 #tag4 #tag5 #tag6 #tag7]",\n' +
      '  "p": {\n' +
      '    "nMin": "€X",\n' +
      '    "nMax": "€X",\n' +
      '    "vMin": "€X",\n' +
      '    "vMax": "€X",\n' +
      '    "note": "Fonte prezzi nuovo: [fonti]. Vinted articoli simili: [range]. Giustificazione in 1-2 frasi.",\n' +
      '    "advanced": {\n' +
      '      "prezzo_rapido": "€X",\n' +
      '      "prezzo_ideale": "€X",\n' +
      '      "prezzo_massimo": "€X",\n' +
      '      "commissione_stimata": "€X (5% + €0.70 sull\'importo acquirente)",\n' +
      '      "confidence_score": 85,\n' +
      '      "difficolta_vendita": "facile",\n' +
      '      "difficolta_motivo": "[1 frase motivazione]",\n' +
      '      "breakdown_fattori": [\n' +
      '        {"fattore": "Brand", "impatto": "+X%", "spiegazione": "[1 frase]"},\n' +
      '        {"fattore": "Stagionalità", "impatto": "+X%", "spiegazione": "[1 frase]"},\n' +
      '        {"fattore": "Concorrenza Vinted", "impatto": "-X%", "spiegazione": "[1 frase]"},\n' +
      '        {"fattore": "Condizione", "impatto": "+X%", "spiegazione": "[1 frase]"}\n' +
      '      ],\n' +
      '      "stima_velocita_vendita": {\n' +
      '        "al_prezzo_rapido": "24-48 ore",\n' +
      '        "al_prezzo_ideale": "3-7 giorni",\n' +
      '        "al_prezzo_massimo": "1-3 settimane"\n' +
      '      },\n' +
      '      "timing_ottimale": "[Prossimo giorno+ora ottimale basato su ' + dataStr + ' ' + oraStr + ']",\n' +
      '      "consigli_annuncio": [\n' +
      '        "[Consiglio specifico 1 per questo articolo]",\n' +
      '        "[Consiglio specifico 2]",\n' +
      '        "[Consiglio specifico 3]"\n' +
      '      ],\n' +
      '      "warning": []\n' +
      '    }\n' +
      '  },\n' +
      '  "s": ' + schedaTemplate + '\n' +
      '}';


    var body = {
      model: model,
      messages: [{ role: 'user', content: [{ type: 'text', text: prompt }].concat(imgs) }],
      temperature: 0.10,  // Maggiore precisione
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

    if (!parsed.t || parsed.t.length > 50) parsed.t = (parsed.t || '').slice(0, 50);
    if (!parsed.langs || typeof parsed.langs !== 'object') throw new Error('Risposta AI non valida (langs mancante). Riprova.');
    for (var ci = 0; ci < selectedLangs.length; ci++) {
      var code = selectedLangs[ci];
      var desc = parsed.langs[code];
      if (!desc || desc.length < 100) throw new Error('Descrizione ' + (LANG_MAP[code] || { name: code }).name + ' incompleta. Riprova.');
    }

    /* Inietta stagionalità nel parsed per renderResults */
    parsed._seasonInfo = seasonInfo;

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
    if (adv.confidence_score !== undefined) {
      document.getElementById('confidenceBadge').style.display = 'inline-flex';
      document.getElementById('confidenceText').textContent = 'Affidabilità ' + adv.confidence_score + '%';
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
    if (adv.commissione_stimata) {
      var commEl = document.getElementById('commissioneDisplay');
      if (commEl) {
        commEl.style.display = 'block';
        commEl.textContent = '💳 Commissione acquirente: ' + adv.commissione_stimata;
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
    if (adv.timing_ottimale) {
      var tb = document.getElementById('timingBanner');
      tb.style.display = 'block';
      tb.innerHTML = '📅 <strong>Timing consigliato:</strong> ' + escHtml(adv.timing_ottimale);
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
