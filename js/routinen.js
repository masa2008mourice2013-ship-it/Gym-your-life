// Gym your Life – Routinen (Gewohnheiten + Abläufe mit Timer)
(function () {
  const G = window.G, D = G.D, I = G.I, esc = G.esc;
  G.ui.rt = { habitEdit: false, newHabit: '', editId: null, newStep: '', play: null };
  const habits = () => G.load(G.K.habits, D.DEFAULT_HABITS);
  const routines = () => G.load(G.K.routines, D.DEFAULT_ROUTINES);
  const setRoutines = (r) => G.save(G.K.routines, r);
  const patchRoutine = (fn) => setRoutines(routines().map((r) => (r.id === G.ui.rt.editId ? fn(Object.assign({}, r)) : r)));

  G.screens.routinen = () => {
    const u = G.ui.rt, hs = habits(), log = G.load(G.K.hlog, {}), today = new Date(), tKey = G.dayKey(today);
    const doneOn = (k, id) => (log[k] || []).indexOf(id) !== -1;
    const back = (n) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - n);
    let dDone = 0;
    const hHtml = hs.map((h) => {
      const done = doneOn(tKey, h.id); if (done) dDone++;
      let streak = 0; for (let i = done ? 0 : 1; i < 400; i++) { if (doneOn(G.dayKey(back(i)), h.id)) streak++; else break; }
      const dots = []; for (let i = 6; i >= 0; i--) { const d = back(i), ok = doneOn(G.dayKey(d), h.id); dots.push(`<span title="${G.WD[d.getDay()]}${ok ? ' erledigt' : ''}" style="width:8px;height:8px;border-radius:999px;background:${ok ? 'var(--teal)' : i === 0 ? 'var(--line)' : 'var(--card2)'}"></span>`); }
      return `<div class="row" style="min-height:64px;padding:8px 10px;border-radius:14px;background:${done ? 'var(--teal-soft)' : 'var(--bg)'}">
        <button type="button" class="check${done ? ' on' : ''}" data-a="habitToggle" data-id="${h.id}" aria-pressed="${done}" aria-label="${esc(h.name)}${done ? ' – wieder öffnen' : ' – erledigt'}">${I.check(20)}</button>
        <div class="grow" style="display:flex;flex-direction:column;gap:5px"><span class="ellipsis" style="font-size:15px;font-weight:600">${esc(h.name)}</span>
          <div class="row" style="gap:4px">${dots.join('')}<span style="margin-left:6px;font-size:12px;font-weight:600;color:${streak >= 3 ? 'var(--amber)' : 'var(--muted)'}">${streak > 1 ? streak + ' Tage am Stück' : streak === 1 ? '1 Tag' : ''}</span></div></div>
        ${u.habitEdit ? `<button type="button" class="icon-btn plain coral" data-a="habitDel" data-id="${h.id}" aria-label="${esc(h.name)} löschen">${I.trash(18)}</button>` : ''}
      </div>`;
    }).join('');
    const pct = hs.length ? Math.round(dDone / hs.length * 100) : 0;
    const rs = routines();
    const fmtTot = (r) => G.fmtT(r.steps.reduce((s, x) => s + x[1], 0));
    const rHtml = rs.map((r) => `<div class="plan-card"><span class="ico-box">${I.timer(22)}</span>
      <button type="button" class="link-area" data-a="rtEdit" data-id="${r.id}" aria-label="${esc(r.name)} bearbeiten"><span class="h3 ellipsis">${esc(r.name)}</span><span class="small">${r.steps.length} ${r.steps.length === 1 ? 'Schritt' : 'Schritte'} · ${fmtTot(r)} Min.</span></button>
      <button type="button" class="play" data-a="rtPlay" data-id="${r.id}" aria-label="${esc(r.name)} starten">${I.play(18)}</button></div>`).join('');

    // Bearbeiten
    const ed = rs.find((r) => r.id === u.editId);
    const editor = ed ? `<div class="overlay" data-a="rtClose" data-self="1"><div class="sheet" role="dialog" aria-label="Ablauf bearbeiten">
      <div class="grip"></div>
      <div class="row-between"><span class="label teal" style="font-size:12px">Ablauf bearbeiten</span><button type="button" class="icon-btn" data-a="rtClose" aria-label="Schließen">${I.x(20)}</button></div>
      <div class="field"><label class="label" for="rtname">Name</label><input id="rtname" class="input big" value="${esc(ed.name)}" maxlength="28" data-in="rtName"></div>
      <div class="scroll">${ed.steps.map((st, i) => `<div class="inset row" style="gap:6px;padding:6px 6px 6px 12px;border-radius:12px">
        <span class="num teal" style="width:22px;font-size:16px">${i + 1}</span><span class="grow ellipsis" style="font-size:14px;font-weight:600">${esc(st[0])}</span>
        <button type="button" style="width:32px;height:44px;border:none;background:none;font-size:18px" data-a="rtDur" data-i="${i}" data-d="-1" aria-label="${esc(st[0])} kürzer">−</button>
        <span class="num" style="width:40px;text-align:center;font-size:18px">${G.fmtT(st[1])}</span>
        <button type="button" style="width:32px;height:44px;border:none;background:none;font-size:18px;color:var(--teal)" data-a="rtDur" data-i="${i}" data-d="1" aria-label="${esc(st[0])} länger">+</button>
        <button type="button" class="coral" style="width:40px;height:44px;border:none;background:none;display:flex;align-items:center;justify-content:center" data-a="rtStepDel" data-i="${i}" aria-label="${esc(st[0])} entfernen">${I.x(16)}</button></div>`).join('')}</div>
      <div class="row" style="gap:8px"><label for="rtstep" class="sr">Neuer Schritt</label><input id="rtstep" class="input grow" style="font-size:15px" value="${esc(u.newStep)}" maxlength="30" placeholder="Neuer Schritt, z. B. Armkreisen" data-in="rtNewStep" data-enter="rtAddStep">
        <button type="button" class="icon-btn" style="width:48px;height:48px;border-radius:14px;background:var(--teal);color:var(--bg)" data-a="rtAddStep" aria-label="Schritt hinzufügen">${I.plus(20)}</button></div>
      <span style="font-size:12px;color:${ed.steps.length ? 'var(--muted)' : 'var(--amber)'}">${ed.steps.length ? 'Gesamt: ' + fmtTot(ed) + ' Min. · Dauer mit − / + in 5-Sekunden-Schritten' : 'Noch keine Schritte – füge oben den ersten hinzu.'}</span>
      <div class="btns"><button type="button" class="btn danger-ghost md" data-a="rtDelete">Ablauf löschen</button><button type="button" class="btn md" data-a="rtClose">Fertig</button></div>
    </div></div>` : '';

    // Abspielen
    let player = '';
    const p = u.play, pr = p ? rs.find((r) => r.id === p.id) : null;
    if (p && pr) {
      const now = Date.now(), cur = pr.steps[Math.min(p.idx, pr.steps.length - 1)], len = cur[1] * 1000;
      const left = p.paused ? p.left : Math.max(0, p.end - now), pp = Math.round(left / len * 100), nx = pr.steps[p.idx + 1];
      player = `<div class="fullscreen pop"><div class="in">
        <div class="row-between"><span class="eyebrow">${p.done ? 'Fertig' : 'Schritt ' + (p.idx + 1) + ' von ' + pr.steps.length}</span><button type="button" class="pill white" data-a="rtStop">Beenden</button></div>
        <h1 class="h1" style="font-size:32px">${esc(pr.name)}</h1>
        <div class="segbar">${pr.steps.map((x, i) => `<div class="${p.done || i < p.idx ? 'done' : i === p.idx ? 'cur' : ''}"></div>`).join('')}</div>
        ${p.done ? `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center">
            <div style="width:96px;height:96px;border-radius:999px;background:var(--teal);color:var(--bg);display:flex;align-items:center;justify-content:center">${I.check(52)}</div>
            <span class="h1">Geschafft!</span><span class="small" style="font-size:15px">${esc(pr.name)} · ${fmtTot(pr)} Min. erledigt</span></div>
            <button type="button" class="btn" data-a="rtStop">Zurück</button>`
        : `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;text-align:center">
            <span class="h1">${esc(cur[0])}</span>
            <div class="ring" id="rtRing" style="${G.ring(pp, 220)}"><div style="width:192px;height:192px;background:var(--bg)"><span class="num" id="rtLeft" role="timer" style="font-size:72px;font-variant-numeric:tabular-nums">${G.fmtT(Math.ceil(left / 1000))}</span></div></div>
            <span class="small" style="font-size:14px">${nx ? 'Danach: ' + esc(nx[0]) + ' (' + G.fmtT(nx[1]) + ')' : 'Letzter Schritt'}</span></div>
          <div style="display:grid;grid-template-columns:56px 1fr 56px;gap:10px">
            <button type="button" class="icon-btn" style="width:56px;height:56px" data-a="rtPrev" aria-label="Vorheriger Schritt">${I.back()}</button>
            <button type="button" class="btn" data-a="rtPause">${p.paused ? 'Weiter' : 'Pause'}</button>
            <button type="button" class="icon-btn" style="width:56px;height:56px" data-a="rtNext" aria-label="Nächster Schritt">${I.next()}</button></div>`}
      </div></div>`;
    }

    return `<div class="screen with-nav">${G.header()}
      <div class="title-block"><span class="eyebrow">Kleine Schritte, jeden Tag</span><h1 class="h1">Routinen</h1></div>
      <section class="card">
        <div class="row" style="gap:14px">
          <div class="ring" style="${G.ring(pct, 64)}"><div class="num" style="width:52px;height:52px;background:var(--card);font-size:20px">${dDone}/${hs.length}</div></div>
          <div class="grow"><h2 class="h2">Heute</h2><span style="font-size:13px;color:${hs.length && dDone === hs.length ? 'var(--teal)' : 'var(--muted)'}">${!hs.length ? 'Lege deine erste Gewohnheit an' : dDone === hs.length ? 'Alles erledigt – stark!' : 'Noch ' + (hs.length - dDone) + ' offen'}</span></div>
          <button type="button" class="pill" data-a="habitEditToggle">${u.habitEdit ? 'Fertig' : 'Bearbeiten'}</button>
        </div>
        ${hHtml}
        ${u.habitEdit || !hs.length ? `<div class="row" style="gap:8px"><label for="newhabit" class="sr">Neue Gewohnheit</label><input id="newhabit" class="input grow" style="font-size:15px" value="${esc(u.newHabit)}" maxlength="30" placeholder="Neue Gewohnheit, z. B. Vitamine" data-in="habitNew" data-enter="habitAdd">
          <button type="button" class="icon-btn" style="width:48px;height:48px;border-radius:14px;background:var(--teal);color:var(--bg)" data-a="habitAdd" aria-label="Gewohnheit hinzufügen">${I.plus(20)}</button></div>` : ''}
      </section>
      <section class="list">
        <div class="row-between" style="padding:0 4px"><h2 class="h2">Abläufe mit Timer</h2><button type="button" class="pill" data-a="rtNew">+ Neu</button></div>
        ${rHtml}
        <span class="tiny" style="padding:0 4px">Name antippen zum Bearbeiten, Play zum Starten. Der Timer führt Schritt für Schritt durch den Ablauf.</span>
      </section>
    </div>${G.nav('routinen')}${editor}${player}`;
  };

  G.ticks.push(() => {
    const p = G.ui.rt.play; if (!p || p.done || p.paused || G.route !== 'routinen') return;
    const now = Date.now();
    if (now >= p.end) { G.signal(); goStep(p.idx + 1); return; }
    const pr = routines().find((r) => r.id === p.id); if (!pr) return;
    const len = pr.steps[p.idx][1] * 1000, l = p.end - now;
    const e = document.getElementById('rtLeft'); if (e) e.textContent = G.fmtT(Math.ceil(l / 1000));
    const r = document.getElementById('rtRing'); if (r) r.setAttribute('style', G.ring(Math.round(l / len * 100), 220));
  });
  function goStep(i) {
    const p = G.ui.rt.play, pr = routines().find((r) => r.id === p.id);
    if (i < 0) i = 0;
    if (i >= pr.steps.length) { p.done = true; G.keepAwake(false); G.render(); return; }
    Object.assign(p, { idx: i, end: Date.now() + pr.steps[i][1] * 1000, paused: false, done: false }); G.render();
  }

  const A = G.actions, IN = G.inputs;
  A.habitToggle = (el) => {
    const log = G.load(G.K.hlog, {}), k = G.dayKey(new Date()), cur = (log[k] || []).slice(), id = el.dataset.id;
    log[k] = cur.indexOf(id) !== -1 ? cur.filter((x) => x !== id) : cur.concat([id]); G.save(G.K.hlog, log); G.render();
  };
  A.habitEditToggle = () => { G.ui.rt.habitEdit = !G.ui.rt.habitEdit; G.render(); };
  A.habitDel = (el) => { G.save(G.K.habits, habits().filter((h) => h.id !== el.dataset.id)); G.render(); };
  IN.habitNew = (v) => { G.ui.rt.newHabit = v; };
  A.habitAdd = () => { const n = G.ui.rt.newHabit.trim(); if (!n) return; G.save(G.K.habits, habits().concat([{ id: G.uid('h'), name: n }])); G.ui.rt.newHabit = ''; G.render(); };
  A.rtNew = () => { const r = { id: G.uid('r'), name: 'Neuer Ablauf', steps: [] }; setRoutines(routines().concat([r])); G.ui.rt.editId = r.id; G.ui.rt.newStep = ''; G.render(); };
  A.rtEdit = (el) => { G.ui.rt.editId = el.dataset.id; G.ui.rt.newStep = ''; G.render(); };
  A.rtClose = () => { const ed = routines().find((r) => r.id === G.ui.rt.editId); if (ed && !ed.name.trim()) patchRoutine((r) => Object.assign(r, { name: 'Ablauf' })); G.ui.rt.editId = null; G.render(); };
  IN.rtName = (v) => patchRoutine((r) => Object.assign(r, { name: v }));
  A.rtDur = (el) => { const i = +el.dataset.i, d = +el.dataset.d; patchRoutine((r) => Object.assign(r, { steps: r.steps.map((x, j) => (j === i ? [x[0], G.clamp(x[1] + d * 5, 5, 600)] : x)) })); G.render(); };
  A.rtStepDel = (el) => { const i = +el.dataset.i; patchRoutine((r) => Object.assign(r, { steps: r.steps.filter((x, j) => j !== i) })); G.render(); };
  IN.rtNewStep = (v) => { G.ui.rt.newStep = v; };
  A.rtAddStep = () => { const n = G.ui.rt.newStep.trim(); if (!n) return; patchRoutine((r) => Object.assign(r, { steps: r.steps.concat([[n, 30]]) })); G.ui.rt.newStep = ''; G.render(); setTimeout(() => { const e = document.getElementById('rtstep'); if (e) e.focus(); }, 0); };
  A.rtDelete = () => { setRoutines(routines().filter((r) => r.id !== G.ui.rt.editId)); G.ui.rt.editId = null; G.render(); };
  A.rtPlay = (el) => {
    G.unlockAudio();
    const r = routines().find((x) => x.id === el.dataset.id);
    if (!r.steps.length) { G.ui.rt.editId = r.id; G.render(); return; }
    G.ui.rt.play = { id: r.id, idx: 0, end: Date.now() + r.steps[0][1] * 1000, paused: false, left: 0, done: false }; G.keepAwake(true); G.render();
  };
  A.rtStop = () => { G.ui.rt.play = null; G.keepAwake(false); G.render(); };
  A.rtPrev = () => goStep(G.ui.rt.play.idx - 1);
  A.rtNext = () => goStep(G.ui.rt.play.idx + 1);
  A.rtPause = () => { const p = G.ui.rt.play; if (p.paused) { p.paused = false; p.end = Date.now() + p.left; } else { p.paused = true; p.left = Math.max(0, p.end - Date.now()); } G.render(); };
})();
