// Gym your Life – Grundgerüst: Speicher, Hilfsfunktionen, Icons, Kopfbereich, Leiste
(function () {
  const D = window.GYL_DATA;
  const G = (window.G = { D, screens: {}, actions: {}, inputs: {}, files: {}, ui: {}, ticks: [] });

  // ---------- Speicher ----------
  G.K = {
    plans: 'gyl-plaene-v1', active: 'gyl-aktiv-v1', days: 'gyl-tage-v1', last: 'gyl-letzte-werte-v1',
    hist: 'gyl-verlauf-v1', own: 'gyl-eigene-uebungen-v1', notes: 'gyl-notizen-v1', settings: 'gyl-einstellungen-v1',
    run: 'gyl-laufendes-training-v1', habits: 'gyl-gewohnheiten-v1', hlog: 'gyl-gewohnheiten-log-v1',
    routines: 'gyl-routinen-v1', food: 'gyl-essen-ideen-v1', swim: 'gyl-schwimmen-v1', dayplan: 'gyl-tagesplan-v1', free: 'gyl-freies-training-v1', acts: 'gyl-freie-aktivitaeten-v1', foodimg: 'gyl-essen-bilder-v1'
  };
  G.load = (k, fb) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch (e) { return fb; } };
  G.save = (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch (e) { G.toast('Speicher ist voll – bitte in den Einstellungen sichern'); return false; }
  };
  G.remove = (k) => { try { localStorage.removeItem(k); } catch (e) {} };

  G.SETTINGS_DEFAULT = { name: 'Josi', kgStep: 2.5, defaultPause: 90, sound: true, vibrate: true, keepAwake: true, quote: true, quoteSec: 3 };
  G.settings = () => Object.assign({}, G.SETTINGS_DEFAULT, G.load(G.K.settings, {}));
  G.setSettings = (patch) => G.save(G.K.settings, Object.assign(G.settings(), patch));

  // ---------- Hilfen ----------
  G.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  G.pad = (x) => (x < 10 ? '0' : '') + x;
  G.fmtKg = (v) => String(Math.round(v * 100) / 100).replace('.', ',');
  G.fmtT = (sec) => Math.floor(sec / 60) + ':' + G.pad(sec % 60);
  G.fmtVol = (v) => (v >= 1000 ? String(Math.round(v / 100) / 10).replace('.', ',') + ' t' : G.fmtKg(v));
  G.WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  G.WDL = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  G.fmtD = (iso) => { const d = new Date(iso); return G.WD[d.getDay()] + ' ' + d.getDate() + '.' + (d.getMonth() + 1) + '.'; };
  G.dayKey = (d) => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  G.daysAgo = (iso) => {
    const t = new Date(); const t0 = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    const d = new Date(iso); const d0 = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.round((t0 - d0) / 86400000);
  };
  G.agoText = (iso) => { const n = G.daysAgo(iso); return n === 0 ? 'heute' : n === 1 ? 'gestern' : 'vor ' + n + ' Tagen'; };
  G.uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  G.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  G.ymd = (d) => d.getFullYear() + '-' + G.pad(d.getMonth() + 1) + '-' + G.pad(d.getDate());
  G.dateLabel = (v) => { if (!v) return 'Datum wählen'; const p = v.split('-').map(Number); return G.WD[new Date(p[0], p[1] - 1, p[2]).getDay()] + ', ' + G.pad(p[2]) + '.' + G.pad(p[1]) + '.' + p[0]; };
  // Datumsfeld: sichtbar ist ein fester Kasten, das echte Datumsfeld liegt unsichtbar darüber.
  // So kann es auf keinem Handy über den Rand hinausragen.
  G.dateField = (id, value, inName, key, max) => `<div class="datef"><span class="datef-t" id="${id}-t">${G.dateLabel(value)}</span><span class="datef-i">${G.I.calendar(20)}</span>`
    + `<input id="${id}" type="date" class="datef-in" value="${value || ''}"${max ? ' max="' + max + '"' : ''} data-in="${inName}" data-k="${key}" data-a="datePick" aria-label="Datum wählen"></div>`;
  G.actions.datePick = (el) => { try { if (el.showPicker) el.showPicker(); } catch (e) {} };
  G.dateSync = (el) => { const t = document.getElementById(el.id + '-t'); if (t) t.textContent = G.dateLabel(el.value); };
  G.ring = (pct, size, inner, bg) => `background: conic-gradient(var(--teal) 0 ${pct}%, var(--card2) ${pct}% 100%); width:${size}px; height:${size}px`;

  let toastT;
  G.toast = (msg) => {
    const el = document.getElementById('toast'); if (!el) return;
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2400);
  };

  // ---------- Pläne ----------
  G.defaultPlans = () => {
    const ex = (n, g, s, r, p, extra) => Object.assign({ id: G.uid('x'), name: n, group: g, sets: s, reps: r, pause: p }, extra || {});
    return [
      { id: 'p1', name: 'Beine-Tag', exercises: [ex('Kniebeuge', 'Beine', 3, 10, 90), ex('Beinpresse', 'Beine', 3, 12, 90), ex('Hip Thrust', 'Po', 3, 10, 90), ex('Beinbeuger', 'Beine', 3, 12, 60), ex('Wadenheben', 'Waden', 3, 15, 60)] },
      { id: 'p2', name: 'Oberkörper', exercises: [ex('Bankdrücken', 'Brust', 3, 10, 90), ex('Latzug', 'Rücken', 3, 12, 90), ex('Schulterdrücken', 'Schultern', 3, 10, 90), ex('Rudern am Kabel', 'Rücken', 3, 12, 90), ex('Seitheben', 'Schultern', 3, 15, 60), ex('Trizepsdrücken am Kabel', 'Trizeps', 3, 12, 60)] },
      { id: 'p3', name: 'Rücken & Bizeps', exercises: [ex('Latzug', 'Rücken', 3, 12, 90), ex('Rudern am Kabel', 'Rücken', 3, 12, 90), ex('Kreuzheben', 'Rücken', 3, 8, 120), ex('Bizeps-Curls', 'Bizeps', 3, 12, 60)] },
      { id: 'p4', name: 'Ganzkörper', exercises: [ex('Kniebeuge', 'Beine', 3, 10, 90), ex('Bankdrücken', 'Brust', 3, 10, 90), ex('Latzug', 'Rücken', 3, 12, 90), ex('Hip Thrust', 'Po', 3, 10, 90), ex('Schulterdrücken', 'Schultern', 3, 10, 90), ex('Crunches', 'Bauch', 3, 15, 60), ex('Plank', 'Bauch', 3, 10, 60, { mode: 'time', hold: 45 }), ex('Wadenheben', 'Waden', 3, 15, 60)] }
    ];
  };
  G.plans = () => { const p = G.load(G.K.plans, null); if (p && p.length) return p; const d = G.defaultPlans(); G.save(G.K.plans, d); return d; };
  G.savePlans = (p) => G.save(G.K.plans, p);
  G.activeId = () => { const pl = G.plans(); const id = G.load(G.K.active, null); return pl.some((p) => p.id === id) ? id : pl[0].id; };
  G.setActive = (id) => G.save(G.K.active, id);
  G.history = () => G.load(G.K.hist, []);
  G.exKey = (e) => e.origin || e.name;

  // ---------- Icons ----------
  const svg = (d, o) => `<svg width="${(o && o.s) || 22}" height="${(o && o.s) || 22}" viewBox="0 0 24 24" fill="${(o && o.fill) || 'none'}" stroke="${(o && o.fill) ? 'none' : 'currentColor'}" stroke-width="${(o && o.w) || 2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  G.I = {
    swim: (s) => svg('<circle cx="17" cy="6" r="2"/><path d="M4 12l5-3.5 4 2 3-2M2 17c2 0 2-1.5 4-1.5S8 17 10 17s2-1.5 4-1.5S16 17 18 17s2-1.5 4-1.5M2 21c2 0 2-1.5 4-1.5S8 21 10 21s2-1.5 4-1.5S16 21 18 21s2-1.5 4-1.5"/>', { s }),
    star: (s, on) => svg('<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z"/>', on ? { s, fill: 'currentColor' } : { s }),
    repeat: (s) => svg('<path d="M17 3l3 3-3 3M4 11V9a3 3 0 0 1 3-3h13M7 21l-3-3 3-3M20 13v2a3 3 0 0 1-3 3H4"/>', { s }),
    calendar: (s) => svg('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>', { s }),
    dumbbell: (s) => svg('<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>', { s }),
    list: (s) => svg('<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>', { s }),
    routine: (s) => svg('<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4"/>', { s }),
    chart: (s) => svg('<path d="M3 20h18M6 16l4-5 3 3 5-7"/>', { s }),
    clock: (s) => svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', { s }),
    timer: (s) => svg('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/>', { s }),
    sliders: (s) => svg('<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>', { s }),
    back: (s) => svg('<path d="M15 6l-6 6 6 6"/>', { s, w: 2.2 }),
    next: (s) => svg('<path d="M9 6l6 6-6 6"/>', { s, w: 2.2 }),
    up: (s) => svg('<path d="M6 15l6-6 6 6"/>', { s }),
    down: (s) => svg('<path d="M6 9l6 6 6-6"/>', { s }),
    arrowUp: (s) => svg('<path d="M12 19V5M6 11l6-6 6 6"/>', { s }),
    arrowDown: (s) => svg('<path d="M12 5v14M6 13l6 6 6-6"/>', { s }),
    arrowRight: (s) => svg('<path d="M5 12h14M13 6l6 6-6 6"/>', { s, w: 2.2 }),
    play: (s) => svg('<path d="M8 5v14l11-7z"/>', { s, fill: 'currentColor' }),
    check: (s) => svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', { s, w: 2.6 }),
    plus: (s) => svg('<path d="M12 5v14M5 12h14"/>', { s, w: 2.4 }),
    x: (s) => svg('<path d="M6 6l12 12M18 6L6 18"/>', { s, w: 2.2 }),
    trash: (s) => svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', { s }),
    pencil: (s) => svg('<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4zM13.5 6.5l4 4"/>', { s }),
    note: (s) => svg('<path d="M5 4h14v12l-4 4H5zM15 20v-4h4"/>', { s }),
    trend: (s) => svg('<path d="M4 18l6-6 4 4 6-8M14 8h6v6"/>', { s, w: 2.2 }),
    trophy: (s) => svg('<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8"/>', { s }),
    info: (s) => svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', { s }),
    food: (s) => svg('<path d="M4 11h16a8 8 0 0 1-16 0zM8 7c0-2 2-2 2-4M12 7c0-2 2-2 2-4M3 21h18"/>', { s }),
    ext: (s) => svg('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>', { s }),
    download: (s) => svg('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', { s }),
    upload: (s) => svg('<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>', { s }),
    camera: (s) => svg('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>', { s }),
    sound: (s) => svg('<path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/>', { s }),
    quote: (s) => `<svg width="${s || 40}" height="${s || 40}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 18V12.5C4 8.5 6 6 9.5 5l.8 1.7C8.3 7.6 7.3 9 7.2 11H10v7H4zm10 0V12.5C14 8.5 16 6 19.5 5l.8 1.7c-2 .9-3 2.3-3.1 4.3H20v7h-6z"/></svg>`
  };

  // ---------- Kopfbereich & Leiste ----------
  G.clockParts = () => {
    const t = new Date();
    return { hm: G.pad(t.getHours()) + ':' + G.pad(t.getMinutes()), s: ':' + G.pad(t.getSeconds()), d: G.WD[t.getDay()] + ', ' + G.pad(t.getDate()) + '.' + G.pad(t.getMonth() + 1) + '.' };
  };
  G.header = (settingsActive) => {
    const c = G.clockParts();
    return `<div class="hdr">
      <a href="#/home" aria-label="Zur Startseite"><img class="hdr-logo" src="icons/logo.png" alt="Gym your Life"></a>
      <div class="hdr-right">
        <div class="clock" role="timer" aria-label="Aktuelle Uhrzeit">
          <div class="clock-t"><span class="clock-hm" data-clock="hm">${c.hm}</span><span class="clock-s" data-clock="s">${c.s}</span></div>
          <span class="clock-d" data-clock="d">${c.d}</span>
        </div>
        <a href="#/einstellungen" class="icon-btn${settingsActive ? ' on' : ''}" aria-label="Einstellungen"${settingsActive ? ' aria-current="page"' : ''}>${G.I.sliders()}</a>
      </div>
    </div>`;
  };
  G.nav = (active) => {
    const items = [['home', 'Training', G.I.dumbbell(24)], ['plaene', 'Pläne', G.I.list(24)], ['routinen', 'Routinen', G.I.routine(24)], ['essen', 'Ernährung', G.I.food(24)], ['fortschritt', 'Fortschritt', G.I.chart(24)], ['verlauf', 'Verlauf', G.I.clock(24)]];
    return `<nav class="nav" aria-label="Hauptnavigation"><div class="nav-in">${items.map((i) =>
      `<a href="#/${i[0]}" class="${active === i[0] ? 'on' : ''}"${active === i[0] ? ' aria-current="page"' : ''}>${i[2]}${i[1]}</a>`).join('')}</div></nav>`;
  };
  G.sw = (on) => `<span class="sw${on ? ' on' : ''}" aria-hidden="true"></span>`;
  G.stepper = (o) => `<div class="stepper${o.lg ? ' lg' : ''}">
    <button type="button" data-a="${o.a}" data-d="-1" ${o.data || ''} aria-label="${G.esc(o.minus)}">−</button>
    <span class="v">${o.v}</span>
    <button type="button" class="plus" data-a="${o.a}" data-d="1" ${o.data || ''} aria-label="${G.esc(o.plusL)}">+</button>
  </div>`;

  // ---------- Muskel-Figuren ----------
  G.muscles = (ex) => {
    const key = G.exKey(ex);
    return D.MUSCLE_MAP[key] || D.GROUP_MAP[ex.group] || [[], []];
  };
  G.figure = (mm) => {
    const c = {};
    Object.keys(D.MUSCLE_NAMES).forEach((k) => { c[k] = mm[0].indexOf(k) !== -1 ? '#2DD4BF' : mm[1].indexOf(k) !== -1 ? '#0F766E' : '#1A2842'; });
    const n = '#1A2842';
    const front = `<svg class="fig" width="72" height="137" viewBox="0 0 100 190" role="img" aria-label="Körper von vorne"><g>
      <circle cx="50" cy="14" r="9" fill="${n}"/><rect x="45.5" y="22" width="9" height="8" fill="${n}"/>
      <ellipse cx="31" cy="38" rx="8" ry="7" fill="${c.delts}"/><ellipse cx="69" cy="38" rx="8" ry="7" fill="${c.delts}"/>
      <ellipse cx="41.5" cy="44" rx="9" ry="7.5" fill="${c.chest}"/><ellipse cx="58.5" cy="44" rx="9" ry="7.5" fill="${c.chest}"/>
      <ellipse cx="25" cy="57" rx="5" ry="11" fill="${c.biceps}"/><ellipse cx="75" cy="57" rx="5" ry="11" fill="${c.biceps}"/>
      <ellipse cx="22" cy="81" rx="4.2" ry="11" fill="${c.forearms}"/><ellipse cx="78" cy="81" rx="4.2" ry="11" fill="${c.forearms}"/>
      <rect x="34" y="53" width="7" height="29" rx="3" fill="${n}"/><rect x="59" y="53" width="7" height="29" rx="3" fill="${n}"/>
      <rect x="42" y="53" width="16" height="30" rx="5" fill="${c.abs}"/><rect x="35" y="84" width="30" height="12" rx="5" fill="${n}"/>
      <ellipse cx="42" cy="118" rx="7.5" ry="20" fill="${c.quads}"/><ellipse cx="58" cy="118" rx="7.5" ry="20" fill="${c.quads}"/>
      <ellipse cx="42" cy="160" rx="5" ry="15" fill="${n}"/><ellipse cx="58" cy="160" rx="5" ry="15" fill="${n}"/>
      <rect x="36" y="176" width="11" height="6" rx="3" fill="${n}"/><rect x="53" y="176" width="11" height="6" rx="3" fill="${n}"/></g></svg>`;
    const back = `<svg class="fig" width="72" height="137" viewBox="0 0 100 190" role="img" aria-label="Körper von hinten"><g>
      <circle cx="50" cy="14" r="9" fill="${n}"/><path d="M38 29 L62 29 L57 46 L43 46 Z" fill="${c.upperback}"/>
      <ellipse cx="31" cy="38" rx="8" ry="7" fill="${c.delts}"/><ellipse cx="69" cy="38" rx="8" ry="7" fill="${c.delts}"/>
      <rect x="44" y="47" width="12" height="16" rx="3" fill="${c.upperback}"/>
      <ellipse cx="38.5" cy="60" rx="6" ry="15" fill="${c.lats}"/><ellipse cx="61.5" cy="60" rx="6" ry="15" fill="${c.lats}"/>
      <rect x="44" y="64" width="12" height="20" rx="4" fill="${c.lowback}"/>
      <ellipse cx="25" cy="57" rx="5" ry="11" fill="${c.triceps}"/><ellipse cx="75" cy="57" rx="5" ry="11" fill="${c.triceps}"/>
      <ellipse cx="22" cy="81" rx="4.2" ry="11" fill="${c.forearms}"/><ellipse cx="78" cy="81" rx="4.2" ry="11" fill="${c.forearms}"/>
      <ellipse cx="42" cy="96" rx="8.5" ry="9.5" fill="${c.glutes}"/><ellipse cx="58" cy="96" rx="8.5" ry="9.5" fill="${c.glutes}"/>
      <ellipse cx="42" cy="124" rx="7" ry="17" fill="${c.hams}"/><ellipse cx="58" cy="124" rx="7" ry="17" fill="${c.hams}"/>
      <ellipse cx="42" cy="158" rx="6" ry="13" fill="${c.calves}"/><ellipse cx="58" cy="158" rx="6" ry="13" fill="${c.calves}"/>
      <rect x="36" y="176" width="11" height="6" rx="3" fill="${n}"/><rect x="53" y="176" width="11" height="6" rx="3" fill="${n}"/></g></svg>`;
    const names = (ks) => ks.map((k) => D.MUSCLE_NAMES[k]).join(', ');
    return `<div class="inset row" style="padding:10px; gap:14px">
      <div class="row" style="gap:4px; flex-shrink:0">
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px">${front}<span class="label" style="font-size:10px">Vorne</span></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px">${back}<span class="label" style="font-size:10px">Hinten</span></div>
      </div>
      <div class="grow" style="display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;flex-direction:column;gap:3px"><span class="label row" style="gap:6px"><span style="width:10px;height:10px;border-radius:3px;background:var(--teal)"></span>Hauptmuskel</span>
          <span style="font-size:14px;font-weight:600;line-height:1.35">${mm[0].length ? names(mm[0]) : 'noch nicht zugeordnet'}</span></div>
        ${mm[1].length ? `<div style="display:flex;flex-direction:column;gap:3px"><span class="label row" style="gap:6px"><span style="width:10px;height:10px;border-radius:3px;background:var(--teal-deep)"></span>Hilft mit</span>
          <span style="font-size:13px;color:var(--muted2);line-height:1.35">${names(mm[1])}</span></div>` : ''}
      </div></div>`;
  };

  // ---------- Signal am Pausenende ----------
  let actx = null;
  G.unlockAudio = () => { try { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) {} };
  G.beep = () => {
    try {
      G.unlockAudio(); if (!actx) return;
      [0, 0.22].forEach((t) => {
        const o = actx.createOscillator(); const g = actx.createGain();
        o.type = 'sine'; o.frequency.value = 880; o.connect(g); g.connect(actx.destination);
        const s = actx.currentTime + t; g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.35, s + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.18);
        o.start(s); o.stop(s + 0.2);
      });
    } catch (e) {}
  };
  G.signal = () => {
    const s = G.settings();
    if (s.sound) G.beep();
    if (s.vibrate && navigator.vibrate) navigator.vibrate([200, 100, 200]);
  };

  // ---------- Bildschirm anlassen ----------
  let wakeLock = null;
  G.keepAwake = async (on) => {
    try {
      if (on && G.settings().keepAwake && 'wakeLock' in navigator) { if (!wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); } }
      else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
    } catch (e) { wakeLock = null; }
  };
})();
