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
    'cappotti': { winter: 1.4, summer: 0.5, spring: 0.9, autumn: 1.2 },
    'piumini':  { winter: 1.5, summer: 0.3, spring: 0.7, autumn: 1.3 },
    'vestiti':  { summer: 1.3, spring: 1.2, winter: 0.7, autumn: 1.0 },
    'scarpe':   { spring: 1.1, summer: 1.0, autumn: 1.1, winter: 1.0 },
    'borse':    { spring: 1.15, summer: 1.1, autumn: 1.1, winter: 1.05 },
    'default':  { spring: 1.0, summer: 1.0, autumn: 1.0, winter: 1.0 }
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

    /* ══ PROMPT POTENZIATO v3 ══ */
    var prompt =
      // ═══ IDENTITÀ E MISSIONE ═══
      'Sei LISTAI, un analista di prezzi d\'élite per Vinted Italia con accesso a dati di mercato in tempo reale. ' +
      'La tua analisi deve essere IMPECCABILE: zero stime vaghe, zero valori generici. ' +
      'Ogni prezzo che fornisci deve essere difendibile con dati reali di mercato.\n\n' +

      // ═══ CONTESTO ANALISI ═══
      'OGGETTO DA ANALIZZARE:\n' +
      '- Categoria: ' + categoria + '\n' +
      '- Condizione dichiarata: ' + cond + '\n' +
      '- ' + tagliaLabel + ': ' + tagliaValore + '\n' +
      '- Stagione attuale: ' + seasonInfo.seasonName + ' (moltiplicatore: ' + seasonInfo.impactStr + ')\n' +
      (seasonInfo.events.length ? '- Evento di mercato attivo: ' + seasonInfo.events.join(', ') + '\n' : '') +
      (extraBlock ? extraBlock + '\n' : '') +

      // ═══ ISTRUZIONI ANALISI VISIVA ═══
      '\nFASE 1 — ANALISI VISIVA OBBLIGATORIA (da immagini):\n' +
      'Esamina TUTTE le immagini caricate con la massima attenzione. Identifica con certezza:\n' +
      '1. Brand/marchio (cerca logo, etichette, stampe, tag interni, caratteristiche distintive del brand)\n' +
      '2. Modello specifico se identificabile (es. "Nike Air Force 1", "Levi\'s 501", "iPhone 13 Pro")\n' +
      '3. Colore esatto e materiale (non scrivere "nero" se è antracite, non "cotone" se è jersey)\n' +
      '4. Condizione reale dalle foto (confronta con condizione dichiarata, segnala discrepanze)\n' +
      '5. Difetti visibili (macchie, usura, sfilacciature, graffi, ammaccature)\n' +
      '6. Taglia/misura se visibile su etichette nelle foto\n' +
      '7. Anno/stagione di produzione se desumibile da caratteristiche stilistiche\n' +
      'NON INVENTARE nulla che non sia visibile. Se un dato non è desumibile, scrivi "non determinabile dalle foto".\n\n' +

      // ═══ ISTRUZIONI RICERCA PREZZI ═══
      '\nFASE 2 — RICERCA PREZZI DI MERCATO (obbligatoria e precisa):\n' +
      'Per il prodotto identificato, stima i prezzi nei seguenti canali. Usa dati reali, non formule generiche:\n\n' +

      'A) PREZZO NUOVO (retail):\n' +
      '   - Amazon.it: cerca il prezzo attuale o più recente per questo esatto articolo/modello\n' +
      '   - Zalando.it / ASOS / sito ufficiale brand: prezzo di listino corrente o medio storico\n' +
      '   - Indica da quale fonte proviene ogni stima (es. "Amazon IT ~€89", "Zalando ~€95")\n\n' +

      'B) PREZZI SU VINTED ITALIA (analisi competitiva):\n' +
      '   - Stima il range di prezzi attualmente su Vinted.it per questo articolo in condizione simile\n' +
      '   - Considera: concorrenza alta/media/bassa, prezzo mediano, prezzo venduto\n' +
      '   - Considera stagionalità e domanda attuale per questa categoria\n\n' +

      'C) CALCOLO FASCE PREZZO VINTED (3 livelli obbligatori):\n' +
      '   Formula base: prezzo_nuovo × sconto_condizione × moltiplicatore_stagionale\n' +
      '   Sconti per condizione: NWT=55-65%, NWOT=45-55%, EUC=35-45%, GUC=25-35%, POOR=10-20%\n' +
      '   Poi aggiusta in base a brand tier, rarità taglia, concorrenza Vinted, domanda attuale\n\n' +
      '   - prezzo_rapido: prezzo per vendere entro 24-48h. 20° percentile Vinted per questo articolo.\n' +
      '   - prezzo_ideale: miglior equilibrio tra valore e velocità. Batte il 60% della concorrenza.\n' +
      '   - prezzo_massimo: massimo realistico con margine per trattativa (+15%). Max 35% del nuovo.\n\n' +
      '   IMPORTANTE: I prezzi devono essere COMPETITIVI su Vinted, non solo teorici.\n\n' +

      // ═══ REGOLE LISTING ═══
      '\nFASE 3 — CREAZIONE ANNUNCIO:\n' +
      'Regole INVIOLABILI per il listing:\n' +
      '1. t (titolo SEO): ≤50 caratteri. Formula: [Brand] + [tipo prodotto] + [caratteristica chiave] + [keyword ricercata su Vinted]\n' +
      '   NO articoli iniziali (non iniziare con "Un", "Una", "Il", "La")\n' +
      langRules + '\n' +
      htRuleNum + '. ht: esattamente 7 hashtag, separati da spazio, mix IT+EN, pertinenti al prodotto specifico.\n\n' +

      // ═══ OUTPUT JSON ═══
      '\nOUTPUT: SOLO JSON VALIDO, zero markdown, zero testo extra.\n' +
      'Schema obbligatorio:\n' +
      '{' +
      '"t":"",' +
      '"langs":{' + langJsonTemplate + '},' +
      '"ht":"",' +
      '"p":{' +
        '"nMin":"€X","nMax":"€X",' +
        '"vMin":"€X","vMax":"€X",' +
        '"note":"Fonte prezzi nuovo: [fonti]. Su Vinted articoli simili: [range]. Giustificazione fascia consigliata in 1-2 frasi.",' +
        '"advanced":{' +
          '"prezzo_rapido":"€X",' +
          '"prezzo_ideale":"€X",' +
          '"prezzo_massimo":"€X",' +
          '"confidence_score":85,' +
          '"breakdown_fattori":[' +
            '{"fattore":"Brand","impatto":"+20%","spiegazione":"Brand premium riconoscibile"},' +
            '{"fattore":"Stagionalità","impatto":"+15%","spiegazione":"Stagione favorevole per questo capo"},' +
            '{"fattore":"Concorrenza Vinted","impatto":"-10%","spiegazione":"Alta offerta articoli simili"},' +
            '{"fattore":"Condizione","impatto":"+5%","spiegazione":"Condizione eccellente rispetto media"}' +
          '],' +
          '"stima_velocita_vendita":{"al_prezzo_rapido":"24-48 ore","al_prezzo_ideale":"3-7 giorni","al_prezzo_massimo":"2-4 settimane"},' +
          '"consigli_annuncio":["consiglio specifico 1","consiglio specifico 2","consiglio specifico 3"],' +
          '"timing_ottimale":"Esempio: pubblica giovedì-domenica 18-21, traffico Vinted IT +35%",' +
          '"warning":[]' +
        '}' +
      '},' +
      '"s":' + schedaTemplate +
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
  /* Titolo SEO */
  var t = d.t || '—';
  document.getElementById('seoTitle').textContent = t;
  var tl = document.getElementById('titleLen');
  tl.textContent = t.length + '/50 caratteri' + (t.length > 50 ? ' ⚠️ troppo lungo' : '');
  tl.style.color = t.length > 50 ? 'var(--color-danger)' : 'var(--color-text-muted)';

  /* Descrizioni */
  var langs = d.langs || {};
  var ht = d.ht || '';
  var parts = selectedLangs.map(function(code) { return langs[code] || ''; }).filter(Boolean);
  var full = parts.join('\n\n') + (ht ? '\n\n' + ht : '');
  document.getElementById('descFull').textContent = full;
  document.getElementById('descFullLen').textContent = full.length + ' caratteri totali';

  var langGrid = document.getElementById('descLangCards');
  langGrid.innerHTML = '';
  selectedLangs.forEach(function(code) {
    var info = LANG_MAP[code] || { flag: '🌐', name: code };
    var text = langs[code] || '—';
    var elId = 'descLang_' + code;
    var card = document.createElement('div');
    card.className = 'dc';
    card.innerHTML =
      '<div class="clbl">' + info.flag + ' ' + escHtml(info.name) +
      ' <span style="font-weight:400;text-transform:none;letter-spacing:0">(senza hashtag)</span>' +
      '<button class="cpbtn" onclick="cp(\'' + elId + '\',this)">copia</button></div>' +
      '<div class="dtxt" id="' + elId + '">' + escHtml(text) + '</div>' +
      '<div class="dlen">' + (text === '—' ? '' : text.length + ' caratteri') + '</div>';
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
    document.getElementById('barLabelFast').textContent  = pFast;
    document.getElementById('barLabelIdeal').textContent = pIdeal;
    document.getElementById('barLabelMax').textContent   = pMax;

    /* Barra animata — riempie fino al 80% (max visivo) */
    var barFill = document.getElementById('priceBarFill');
    barFill.style.width = '0%';
    setTimeout(function() { barFill.style.width = '80%'; }, 100);

    /* Confidence score */
    if (adv.confidence_score !== undefined) {
      document.getElementById('confidenceBadge').style.display = 'inline-flex';
      document.getElementById('confidenceText').textContent = 'Affidabilità ' + adv.confidence_score + '%';
    }

    /* Velocità di vendita */
    if (adv.stima_velocita_vendita) {
      document.getElementById('velocityRow').style.display = 'grid';
      var vel = adv.stima_velocita_vendita;
      document.getElementById('velFastPrice').textContent  = pFast;
      document.getElementById('velFastTime').textContent   = vel.al_prezzo_rapido || '24-48 ore';
      document.getElementById('velIdealPrice').textContent = pIdeal;
      document.getElementById('velIdealTime').textContent  = vel.al_prezzo_ideale || '3-7 giorni';
      document.getElementById('velMaxPrice').textContent   = pMax;
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
  document.getElementById('detailTable').innerHTML =
    Object.entries(s).map(function(kv) {
      return '<tr><td>' + escHtml(kv[0]) + '</td><td>' + escHtml(kv[1] || '—') + '</td></tr>';
    }).join('');

  var r = document.getElementById('results');
  r.style.display = 'block';
  r.scrollIntoView({ behavior: 'smooth', block: 'start' });

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

/* ── Init ── */
loadLangs();
renderHistoryList();
