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
  G.ui.home = { editingId: null, draft: '', showDays: false };
  G.screens.home = () => {
    const u = G.ui.home, s = G.settings(), plans = G.plans(), days = G.load(G.K.days, [1, 3, 5]), hist = G.history();
    const today = new Date();
    // Woche
    let next = null;
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const train = days.indexOf(d.getDay()) !== -1;
      if (train && !next) next = { i, d };
      week.push(`<div class="day${train ? ' train' : ''}${i === 0 ? ' today' : ''}"><span class="wd">${G.WD[d.getDay()]}</span><span class="dn">${d.getDate()}</span><span class="tag">${i === 0 ? 'Heute' : train ? 'Training' : ''}</span></div>`);
    }
    const nextLabel = !next ? 'kein Trainingstag gewählt' : next.i === 0 ? 'heute' : next.i === 1 ? 'morgen' : G.WDL[next.d.getDay()] + ', ' + next.d.getDate() + '.' + (next.d.getMonth() + 1) + '.';
    // nächster Plan
    const lastPlan = hist.length ? hist[hist.length - 1].plan : null;
    const li = plans.findIndex((p) => p.name === lastPlan);
    const nextP = li === -1 ? plans[0] : plans[(li + 1) % plans.length];
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
    const planCards = plans.map((p) => u.editingId === p.id ? `
      <div class="card active sm" style="gap:10px">
        <label class="label" for="pname">Plan umbenennen</label>
        <input id="pname" class="input big" value="${esc(u.draft)}" maxlength="28" data-in="homeDraft" data-enter="homeSave" autofocus>
        <div class="btns"><button type="button" class="btn ghost md" data-a="homeCancel">Abbrechen</button><button type="button" class="btn md" data-a="homeSave">Speichern</button></div>
      </div>` : `
      <div class="plan-card">
        <span class="ico-box">${I.dumbbell(22)}</span>
        <a href="#/plan/${p.id}" class="link-area" aria-label="${esc(p.name)} bearbeiten"><span class="h3 ellipsis">${esc(p.name)}</span><span class="small">${p.exercises.length} Übungen · bearbeiten</span></a>
        <button type="button" class="icon-btn plain" data-a="homeRename" data-id="${p.id}" aria-label="${esc(p.name)} umbenennen" style="color:var(--muted)">${I.pencil(20)}</button>
        <a href="#/training" class="play" data-a="setActive" data-id="${p.id}" aria-label="${esc(p.name)} starten">${I.play(18)}</a>
      </div>`).join('');
    const daySheet = u.showDays ? `<div class="overlay" data-a="homeDaysClose" data-self="1"><div class="sheet" role="dialog" aria-label="Trainingstage einstellen">
      <div class="grip"></div>
      <div><h2 class="h2" style="font-size:28px">Trainingstage</h2><span class="small">An welchen Tagen trainierst du? Diese Tage werden auf der Startseite türkis markiert.</span></div>
      <div class="week">${[1, 2, 3, 4, 5, 6, 0].map((wd) => { const on = days.indexOf(wd) !== -1; return `<button type="button" class="chip${on ? ' on' : ''}" style="height:56px;padding:0;font-size:14px;font-weight:700" data-a="toggleDay" data-wd="${wd}" aria-pressed="${on}" aria-label="${G.WDL[wd]}">${G.WD[wd]}</button>`; }).join('')}</div>
      <span class="small">${days.length === 1 ? '1 Trainingstag' : days.length + ' Trainingstage'} pro Woche</span>
      <button type="button" class="btn" data-a="homeDaysClose">Fertig</button>
    </div></div>` : '';
    return `<div class="screen with-nav">
      ${G.header()}
      <div class="title-block"><span class="eyebrow">Schön, dass du da bist</span><h1 class="h1" style="font-size:38px">Hallo ${esc(s.name.trim() || 'Josi')}</h1></div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div class="row-between" style="padding:0 4px"><h2 class="h2" style="font-size:22px">Deine Trainingstage</h2>
          <button type="button" class="pill white" data-a="homeDaysOpen"><span class="teal">${I.sliders(18)}</span>Tage einstellen</button></div>
        <div class="week">${week.join('')}</div>
      </div>
      <div class="card accent" style="gap:14px">
        <span class="label teal" style="font-size:12px">Als Nächstes · ${nextLabel}</span>
        <div style="display:flex;flex-direction:column;gap:4px"><span class="num" style="font-size:34px;line-height:1;text-transform:uppercase">${esc(nextP.name)}</span>
          <span class="small" style="font-size:14px">${nextP.exercises.length} Übungen · ${lastOfNext ? 'zuletzt ' + G.agoText(lastOfNext.date) : 'noch nicht trainiert'}</span></div>
        <a href="#/training" class="btn" data-a="setActive" data-id="${nextP.id}">${I.play(20)}Training starten</a>
      </div>
      <div class="stats">
        <div class="stat"><span class="num">${thisWeek}</span><span>Trainings diese Woche</span></div>
        <div class="stat"><span class="num amber">${recWeek}</span><span>${recWeek === 1 ? 'neuer Rekord' : 'neue Rekorde'}</span></div>
        <div class="stat"><span class="num teal">${streak}</span><span>${streak === 1 ? 'Woche' : 'Wochen'} am Stück</span></div>
      </div>
      <a href="#/essen" class="card sm row" style="color:var(--text);text-decoration:none;min-height:64px;flex-direction:row;align-items:center">
        <span class="ico-box">${I.food(22)}</span>
        <span class="grow" style="display:flex;flex-direction:column;gap:2px"><span class="h3" style="font-size:20px">Essen nach dem Training</span><span class="small">Ideen mit viel Eiweiß – morgens bis abends</span></span>
        <span class="muted">${I.next(20)}</span>
      </a>
      <div class="list">
        <div class="row-between" style="padding:0 4px"><h2 class="h2">Deine Pläne</h2><button type="button" class="pill" data-a="newPlan">+ Neuer Plan</button></div>
        ${planCards}
      </div>
    </div>${G.nav('home')}${daySheet}`;
  };
  G.actions.homeDaysOpen = () => { G.ui.home.showDays = true; G.render(); };
  G.actions.homeDaysClose = () => { G.ui.home.showDays = false; G.render(); };
  G.actions.toggleDay = (el) => {
    const wd = +el.dataset.wd; let days = G.load(G.K.days, [1, 3, 5]);
    days = days.indexOf(wd) !== -1 ? days.filter((x) => x !== wd) : days.concat([wd]);
    G.save(G.K.days, days); G.render();
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
