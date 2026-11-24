// Gym your Life – Startbildschirm (Spruch + Splash) und Startseite
(function () {
  const G = window.G, D = G.D, I = G.I, esc = G.esc;

  // ---------- Spruch & Splash ----------
  G.ui.start = { phase: 'quote', idx: 0, timer: null };
  G.screens.start = () => {
    const s = G.settings(), st = G.ui.start;
    if (st.phase === 'quote' && !s.quote) st.phase = 'splash';
    if (st.phase === 'quote') {
      if (!st.timer) {
        st.idx = Math.floor(Math.random() * D.QUOTES.length);
        st.timer = setTimeout(() => { st.phase = 'splash'; G.render(); }, s.quoteSec * 1000);
      }
      return `<button type="button" class="quote" data-a="skipQuote" aria-label="Spruch überspringen">
        <span class="teal pop">${I.quote(40)}</span>
        <p>${esc(D.QUOTES[st.idx])}</p>
        <div class="barwrap"><div style="animation-duration:${s.quoteSec}s"></div></div>
        <span class="tiny" style="position:absolute;left:0;right:0;bottom:calc(28px + var(--safe-bottom))">Tippen zum Überspringen</span>
      </button>`;
    }
    const dirs = [[-160, -220, -40], [120, -260, 35], [-220, 40, -60], [200, 120, 50], [0, 0, 0], [-140, 240, 30], [180, -180, -45], [-60, -280, 25], [240, 60, -30]];
    const letters = 'YOUR LIFE'.split('').map((ch, i) => `<span style="--fx:${dirs[i][0]}px;--fy:${dirs[i][1]}px;--fr:${dirs[i][2]}deg;animation-delay:${(1.2 + i * 0.12).toFixed(2)}s">${ch}</span>`).join('');
    return `<div class="splash"><div class="splash-in">
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;width:100%">
        <img src="icons/logo.png" alt="Gym your Life Logo" class="pop" style="width:min(340px,80vw);height:auto">
        <div class="gym">GYM</div>
        <div class="yl" aria-label="Your Life"><div class="line"></div><div class="word" aria-hidden="true">${letters}</div><div class="line"></div></div>
      </div>
      <a href="#/home" class="btn" data-a="unlockAudio">Get started ${I.arrowRight(20)}</a>
    </div></div>`;
  };
  G.actions.skipQuote = () => { clearTimeout(G.ui.start.timer); G.ui.start.phase = 'splash'; G.render(); };
  G.actions.unlockAudio = () => G.unlockAudio();

  // ---------- Statistik-Helfer ----------
  G.bestOf = (rows) => Math.max.apply(null, rows.map((r) => r[0]));
  G.weekStart = (d) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const wd = (x.getDay() + 6) % 7; x.setDate(x.getDate() - wd); return x; };
  G.sessionRecords = (hist) => hist.map((x, i) => {
    let rec = 0;
    Object.keys(x.ex).forEach((name) => {
      if (x.modes && x.modes[name] === 'time') return;
      const before = hist.slice(0, i).filter((y) => y.ex[name] && y.ex[name].length && !(y.modes && y.modes[name] === 'time')).map((y) => G.bestOf(y.ex[name]));
      if (before.length && G.bestOf(x.ex[name]) > Math.max.apply(null, before)) rec++;
    });
    return rec;
  });

  // ---------- Startseite ----------
  G.ui.home = { editingId: null, draft: '', showDays: false, dayWd: null, dayI: 0 };
  G.screens.home = () => {
    const u = G.ui.home, s = G.settings(), plans = G.plans(), days = G.load(G.K.days, [1, 3, 5]), hist = G.history();
    const dpl = G.load(G.K.dayplan, {}), dpPlan = (d) => plans.find((p) => p.id === dpl[G.ymd(d)]) || null;
    const today = new Date();
    // Woche
    let next = null;
    const week = [];
    // Was ist an welchem Tag schon eingetragen? (Punkte auf vergangenen Kacheln)
    const dayMap = {}, put = (date, k) => { const key = G.ymd(new Date(date)); (dayMap[key] || (dayMap[key] = {}))[k] = true; };
    hist.forEach((x) => put(x.date, 'gym')); G.swimSessions().forEach((x) => put(x.date, 'swim')); G.freeEntries().forEach((x) => put(x.date, 'free'));
    const startOff = 28 + ((today.getDay() + 6) % 7);              // Tage zwischen Streifen-Anfang (Montag) und heute
    for (let i = 0; i < 63; i++) {
      const off = i - startOff, d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + off), key = G.ymd(d);
      const isToday = off === 0, past = off < 0, kind = dpl[key] === 'swim' || dpl[key] === 'free' ? dpl[key] : '';
      const dp = past ? null : dpPlan(d), train = !past && (days.indexOf(d.getDay()) !== -1 || !!dp);
      if (train && off >= 0 && !next) next = { i: off, d };
      const m = dayMap[key];
      const dots = past && m ? '<span class="tag tagdots">' + (m.gym ? '<span class="cal-dot" style="background:var(--teal)"></span>' : '') + (m.swim ? '<span class="cal-dot" style="background:var(--blue)"></span>' : '') + (m.free ? '<span class="cal-dot" style="background:var(--amber)"></span>' : '') + '</span>' : '';
      const tag = dp ? dp.name : kind === 'swim' ? 'Schwimmen' : kind === 'free' ? 'Freies' : isToday ? 'Heute' : train ? 'Training' : '';
      const label = G.WDL[d.getDay()] + ', ' + d.getDate() + '.' + (d.getMonth() + 1) + '.' + (isToday ? ' (heute)' : '') + (dp ? ', Plan: ' + dp.name : kind === 'swim' ? ', Schwimmen geplant' : kind === 'free' ? ', Freies Training geplant' : '') + (m ? ', schon eingetragen' : '');
      week.push(`<button type="button" class="day${train ? ' train' : ''}${kind === 'swim' ? ' sw' : kind === 'free' ? ' fr' : ''}${past ? ' past' : ''}${isToday ? ' today' : ''}${i % 7 === 0 ? ' snap' : ''}" data-a="dayOpen" data-wd="${d.getDay()}" data-i="${off}" aria-label="${esc(label)} – öffnen"><span class="wd">${G.WD[d.getDay()]}</span><span class="dn">${d.getDate()}</span>${dots || `<span class="tag${dp ? ' plan' : ''}">${esc(tag)}</span>`}</button>`);
    }
    const nextLabel = !next ? 'kein Trainingstag gewählt' : next.i === 0 ? 'heute' : next.i === 1 ? 'morgen' : G.WDL[next.d.getDay()] + ', ' + next.d.getDate() + '.' + (next.d.getMonth() + 1) + '.';
    // nächster Plan
    const lastPlan = hist.length ? hist[hist.length - 1].plan : null;
    const li = plans.findIndex((p) => p.name === lastPlan);
    const fixed = next ? dpPlan(next.d) : null;
    const nextP = fixed || (li === -1 ? plans[0] : plans[(li + 1) % plans.length]);
    const lastOfNext = hist.filter((h) => h.plan === nextP.name).pop();
    // Zahlen
    const ws = G.weekStart(today);
    const recs = G.sessionRecords(hist);
    let thisWeek = 0, recWeek = 0;
    hist.forEach((h, i) => { if (new Date(h.date) >= ws) { thisWeek++; recWeek += recs[i]; } });
    let streak = 0;
    for (let w = 0; w < 104; w++) {
      const a = new Date(ws); a.setDate(a.getDate() - 7 * w); const b = new Date(a); b.setDate(b.getDate() + 7);
      const has = hist.some((h) => { const d = new Date(h.date); return d >= a && d < b; });
      if (has) streak++; else if (w === 0) continue; else break;
    }
    const daySheet = u.showDays ? `<div class="overlay" data-a="homeDaysClose" data-self="1"><div class="sheet" role="dialog" aria-label="Trainingstage einstellen">
      <div class="grip"></div>
      <div><h2 class="h2" style="font-size:28px">Trainingstage</h2><span class="small">An welchen Tagen trainierst du? Diese Tage werden auf der Startseite türkis markiert.</span></div>
      <div class="week">${[1, 2, 3, 4, 5, 6, 0].map((wd) => { const on = days.indexOf(wd) !== -1; return `<button type="button" class="chip${on ? ' on' : ''}" style="height:56px;padding:0;font-size:14px;font-weight:700" data-a="toggleDay" data-wd="${wd}" aria-pressed="${on}" aria-label="${G.WDL[wd]}">${G.WD[wd]}</button>`; }).join('')}</div>
      <span class="small">${days.length === 1 ? '1 Trainingstag' : days.length + ' Trainingstage'} pro Woche</span>
      <button type="button" class="btn" data-a="homeDaysClose">Fertig</button>
    </div></div>` : '';
    let dayOne = '';
    if (u.dayWd !== null) {
      const wd = u.dayWd, dd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + u.dayI), key = G.ymd(dd);
      const isToday = u.dayI === 0, past = u.dayI < 0, future = u.dayI > 0, cur = past ? null : dpPlan(dd), kind = dpl[key];
      const opt = (id, title, sub, on, color) => `<button type="button" class="row" style="min-height:60px;width:100%;flex-shrink:0;border-radius:14px;background:var(--card2);border:${on ? '2px solid ' + (color || 'var(--teal)') : '1px solid var(--line)'};padding:0 14px;color:var(--text);text-align:left" data-a="daySetPlan" data-id="${id}" aria-pressed="${on}">
        <span class="grow" style="display:flex;flex-direction:column;gap:2px"><span class="h3 ellipsis">${esc(title)}</span><span class="small">${sub}</span></span>${on ? `<span style="color:${color || 'var(--teal)'}">${I.check(22)}</span>` : ''}</button>`;
      const m = dayMap[key] || {};
      const done = [m.gym ? 'Training' : '', m.swim ? 'Schwimmen' : '', m.free ? 'Freies Training' : ''].filter(Boolean);
      const doneHtml = done.length ? `<div class="inset" style="padding:10px 12px;border-radius:12px;display:flex;align-items:center;gap:10px;flex-shrink:0"><span class="grow" style="display:flex;flex-direction:column;gap:2px"><span class="label teal" style="font-size:12px">Schon eingetragen</span><span style="font-size:15px;font-weight:600">${done.join(' · ')}</span></span><button type="button" class="btn sec sm" data-a="dayHist">Ansehen</button></div>` : '';
      const intro = past ? 'Dieser Tag liegt hinter dir. Trag hier nach, was du gemacht hast – zum Beispiel wenn du dein Handy nicht dabei hattest.'
        : isToday ? 'Was hast du heute vor? Die Wahl gilt nur für heute – du entscheidest jeden Tag neu. Du musst auch nichts wählen.'
        : 'Was möchtest du an diesem Tag machen? Die Wahl gilt nur für diesen Tag. Du musst auch nichts wählen.';
      const entry = !future ? `${past ? `<button type="button" class="btn sm" style="flex-shrink:0" data-a="dayGym">${I.dumbbell ? I.dumbbell(18) : ''}Krafttraining nachtragen</button>` : ''}<div class="row" style="gap:8px;flex-wrap:wrap;flex-shrink:0"><button type="button" class="btn sm" style="background:var(--blue);color:var(--bg);flex:1" data-a="daySwim">${I.swim(18)}Schwimmen ${past ? 'nachtragen' : 'eintragen'}</button><button type="button" class="btn sm" style="background:var(--amber);color:var(--bg);flex:1" data-a="dayFree">${I.note(18)}Freies Training ${past ? 'nachtragen' : 'eintragen'}</button></div>` : '';
      dayOne = `<div class="overlay" data-a="dayClose" data-self="1"><div class="sheet" role="dialog" aria-label="${G.WDL[wd]} öffnen">
        <div class="grip"></div>
        <div><h2 class="h2" style="font-size:28px">${G.WDL[wd]}, ${dd.getDate()}.${dd.getMonth() + 1}.${past ? '' : isToday ? ' · heute' : ''}</h2>
          <span class="small">${intro}</span></div>
        ${doneHtml}
        ${past ? '' : `<div class="scroll" style="gap:8px">
          ${opt('', 'Noch offen', 'Die App schlägt den nächsten Plan vor', !cur && !kind)}
          ${plans.map((p) => opt(p.id, p.name, p.exercises.length + ' Übungen', !!cur && cur.id === p.id)).join('')}
          ${opt('swim', 'Schwimmen', 'Ich gehe schwimmen', kind === 'swim', 'var(--blue)')}
          ${opt('free', 'Freies Training', 'Etwas ohne festen Plan', kind === 'free', 'var(--amber)')}
        </div>`}
        ${isToday && cur ? `<a href="#/training" class="btn md" data-a="setActive" data-id="${cur.id}">${I.play(18)}${esc(cur.name)} jetzt starten</a>` : ''}
        ${entry}
        ${future ? '<span class="tiny">Eintragen, was du gemacht hast, kannst du am Tag selbst oder danach.</span>' : ''}
        <button type="button" class="btn ghost md" data-a="dayClose">Fertig</button>
      </div></div>`;
    }
    return `<div class="screen with-nav">
      ${G.header()}
      <div class="row-between" style="align-items:center;gap:12px"><div class="title-block"><span class="eyebrow">Schön, dass du da bist</span><h1 class="h1" style="font-size:38px">Hallo ${esc(s.name.trim() || 'Josi')}</h1></div>${s.photo ? `<a href="#/einstellungen" aria-label="Profil bearbeiten" style="display:flex">${G.avatar(s, 56)}</a>` : ''}</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div class="row-between" style="padding:0 4px"><h2 class="h2" style="font-size:22px">Deine Trainingstage</h2>
          <button type="button" class="pill white" data-a="homeDaysOpen"><span class="teal">${I.sliders(18)}</span>Tage einstellen</button></div>
        <div class="weekstrip" id="weekStrip">${week.join('')}</div>
        <span class="tiny" style="padding:0 4px;text-align:center">Wischen: andere Wochen · Tippen: Tag wählen oder nachtragen</span>
      </div>
      <div class="card accent" style="gap:14px">
        <span class="label teal" style="font-size:12px">Als Nächstes · ${nextLabel}</span>
        <div style="display:flex;flex-direction:column;gap:4px"><span class="num" style="font-size:34px;line-height:1;text-transform:uppercase">${esc(nextP.name)}</span>
          <span class="small" style="font-size:14px">${nextP.exercises.length} Übungen · ${lastOfNext ? 'zuletzt ' + G.agoText(lastOfNext.date) : 'noch nicht trainiert'}</span></div>
        <a href="#/training" class="btn" data-a="setActive" data-id="${nextP.id}">${I.play(20)}Training starten</a>
      </div>
      ${G.swimSaturdayBox()}
      <div class="stats">
        <div class="stat"><span class="num">${thisWeek}</span><span>Trainings diese Woche</span></div>
        <div class="stat"><span class="num amber">${recWeek}</span><span>${recWeek === 1 ? 'neuer Rekord' : 'neue Rekorde'}</span></div>
        <div class="stat"><span class="num teal">${streak}</span><span>${streak === 1 ? 'Woche' : 'Wochen'} am Stück</span></div>
      </div>
      ${G.freeBox()}
      ${G.swimPlanBox()}
    </div>${G.nav('home')}${daySheet}${dayOne}`;
  };
  document.addEventListener('scroll', (e) => { if (e.target && e.target.id === 'weekStrip') G.ui.home.sx = e.target.scrollLeft; }, true);
  G.afterRender = () => {
    const w = document.getElementById('weekStrip'); if (!w) return;
    if (G.ui.home.sx == null && w.children.length > 28) G.ui.home.sx = w.children[28].offsetLeft - w.children[0].offsetLeft;   // aktuelle Woche zeigen
    w.scrollLeft = G.ui.home.sx || 0;
  };
  G.actions.homeDaysOpen = () => { G.ui.home.showDays = true; G.render(); };
  G.actions.homeDaysClose = () => { G.ui.home.showDays = false; G.render(); };
  G.actions.toggleDay = (el) => {
    const wd = +el.dataset.wd; let days = G.load(G.K.days, [1, 3, 5]);
    days = days.indexOf(wd) !== -1 ? days.filter((x) => x !== wd) : days.concat([wd]);
    G.save(G.K.days, days); G.render();
  };
  G.actions.dayOpen = (el) => { Object.assign(G.ui.home, { dayWd: +el.dataset.wd, dayI: +el.dataset.i }); G.render(); };
  G.actions.dayClose = () => { G.ui.home.dayWd = null; G.render(); };
  const dayKey = () => { const n = new Date(); return G.ymd(new Date(n.getFullYear(), n.getMonth(), n.getDate() + G.ui.home.dayI)); };
  G.actions.dayGym = () => { const k = dayKey(); G.ui.home.dayWd = null; G.ntStart(k); location.hash = '#/nachtrag'; };
  G.actions.dayFree = () => { const k = dayKey(); G.ui.home.dayWd = null; G.freeStart(k); location.hash = '#/notiz'; };
  G.actions.daySwim = () => { const k = dayKey(); G.ui.home.dayWd = null; G.actions.swNew(); G.ui.swim.f.date = k; location.hash = '#/schwimmen'; };
  G.actions.dayHist = () => { const k = dayKey(); G.ui.home.dayWd = null; Object.assign(G.ui.verlauf, { sel: k, month: k.slice(0, 7), calOpen: true }); location.hash = '#/verlauf'; };
  G.actions.daySetPlan = (el) => {
    const h = G.ui.home, now = new Date(), d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + h.dayI), key = G.ymd(d), id = el.dataset.id;
    const dpl = G.load(G.K.dayplan, {}), cut = G.ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
    Object.keys(dpl).forEach((k) => { if (k < cut) delete dpl[k]; });   // alte Tage aufräumen
    if (h.dayI < 0) return;
    const when = G.WDL[d.getDay()] + ', ' + d.getDate() + '.' + (d.getMonth() + 1) + '.';
    if (id === 'swim' || id === 'free') { dpl[key] = id; G.toast(when + ': ' + (id === 'swim' ? 'Schwimmen' : 'Freies Training')); }
    else if (id) { dpl[key] = id; G.toast(when + ': ' + G.plans().find((p) => p.id === id).name); }
    else { delete dpl[key]; G.toast(when + ': noch offen'); }
    G.save(G.K.dayplan, dpl); G.render();
  };
  G.actions.homeRename = (el) => { const p = G.plans().find((x) => x.id === el.dataset.id); G.ui.home.editingId = p.id; G.ui.home.draft = p.name; G.render(); };
  G.inputs.homeDraft = (v) => { G.ui.home.draft = v; };
  G.actions.homeCancel = () => { G.ui.home.editingId = null; G.render(); };
  G.actions.homeSave = () => {
    const u = G.ui.home, name = u.draft.trim();
    if (name) G.savePlans(G.plans().map((p) => (p.id === u.editingId ? Object.assign({}, p, { name }) : p)));
    u.editingId = null; G.render();
  };
  G.actions.setActive = (el) => { G.setActive(el.dataset.id); G.unlockAudio(); };
  G.actions.newPlan = () => {
    const np = { id: G.uid('p'), name: 'Neuer Plan', exercises: [] };
    G.savePlans(G.plans().concat([np])); G.setActive(np.id);
    G.ui.plan = null; location.hash = '#/plan/' + np.id;
  };
})();
