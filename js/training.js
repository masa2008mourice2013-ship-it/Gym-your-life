// Gym your Life – Training live
(function () {
  const G = window.G, D = G.D, I = G.I, esc = G.esc;

  // Training vorbereiten (oder angefangenes fortsetzen)
  G.trainingInit = () => {
    const plans = G.plans(), active = plans.find((p) => p.id === G.activeId());
    const last = G.load(G.K.last, {});
    const plan = active.exercises.map((e) => {
      const mode = e.mode === 'time' ? 'time' : 'reps', key = G.exKey(e);
      return { name: e.name, key, group: e.group, mode, sets: e.sets, reps: mode === 'time' ? (e.hold || 60) : e.reps, pause: e.pause, pauseOn: e.pauseOn !== false, last: (last[key] || []).filter(Boolean) };
    });
    const log = plan.map((p) => {
      const rows = [];
      for (let i = 0; i < p.sets; i++) { const l = p.last[i] || p.last[p.last.length - 1]; rows.push({ kg: l ? l[0] : 0, reps: l ? l[1] : p.reps, done: false }); }
      return rows;
    });
    const t = {
      planId: active.id, planName: active.name, plan, log, exIdx: 0, fromStore: plan.some((p) => p.last.length),
      exPauseOn: !!active.exPauseOn, exPause: active.exPause || 120, kgStep: G.settings().kgStep,
      timerEnd: 0, timerTotal: 0, timerKind: null, holdEnd: 0, holdTotal: 0, holdRef: null, pauseDoneUntil: 0,
      finished: false, tipDone: {}, noteEdit: false, noteDraft: '', resumed: false, summary: null
    };
    const run = G.load(G.K.run, null);
    if (run && run.planId === active.id && run.day === new Date().toDateString() && run.log) {
      if (run.plan && run.plan.length === run.log.length) {           // mit Übungen, die heute dazugekommen sind
        t.plan = run.plan; t.log = run.log; t.exIdx = Math.min(run.exIdx || 0, run.plan.length - 1); t.resumed = true;
      } else if (run.log.length === plan.length) {
        t.log = run.log; t.exIdx = Math.min(run.exIdx || 0, plan.length - 1); t.resumed = true;
      }
    }
    G.ui.tr = t;
  };
  const T = () => G.ui.tr;
  const persistRun = () => {
    const t = T();
    if (t.finished) { G.remove(G.K.run); return; }
    if (t.log.some((rows) => rows.some((r) => r.done))) G.save(G.K.run, { planId: t.planId, day: new Date().toDateString(), exIdx: t.exIdx, log: t.log, plan: t.plan.some((p) => p.temp) ? t.plan : undefined });
  };
  const bestLast = (p) => (p.last.length ? G.bestOf(p.last) : null);
  const saveSet = (ei, si, kg, reps) => {
    const t = T(), p = t.plan[ei], data = G.load(G.K.last, {});
    const arr = (data[p.key] || p.last || []).slice(); arr[si] = [kg, reps]; data[p.key] = arr; G.save(G.K.last, data);
  };
  const checkSet = (ei, si) => {
    const t = T(), p = t.plan[ei], r = t.log[ei][si];
    r.done = true; saveSet(ei, si, r.kg, r.reps);
    t.log[ei].forEach((x, j) => { if (j > si && !x.done && !p.last[j]) { x.kg = r.kg; x.reps = r.reps; } });
    const remaining = t.log[ei].filter((x) => !x.done).length, now = Date.now();
    t.pauseDoneUntil = 0; t.holdEnd = 0; t.savedFlash = now + 2000;
    if (remaining === 0) {
      if (ei < t.plan.length - 1 && t.exPauseOn) { t.exIdx = ei + 1; t.timerEnd = now + t.exPause * 1000; t.timerTotal = t.exPause * 1000; t.timerKind = 'wechsel'; t.noteEdit = false; }
      else { t.timerEnd = 0; t.timerKind = null; }
    } else if (p.pauseOn) { t.timerEnd = now + p.pause * 1000; t.timerTotal = p.pause * 1000; t.timerKind = 'satz'; }
    else { t.timerEnd = 0; t.timerKind = null; }
    persistRun(); G.render();
  };
  const finish = () => {
    const t = T(), ex = {}, modes = {};
    let sets = 0, vol = 0, recs = 0;
    t.log.forEach((rows, i) => {
      const p = t.plan[i], done = rows.filter((r) => r.done);
      if (!done.length) return;
      ex[p.name] = done.map((r) => [r.kg, r.reps]); if (p.mode === 'time') modes[p.name] = 'time';
      sets += done.length;
      if (p.mode !== 'time') { done.forEach((r) => { vol += r.kg * r.reps; }); const b = bestLast(p); if (b !== null && done.some((r) => r.kg > b)) recs++; }
    });
    if (sets) { const h = G.history().concat([{ date: new Date().toISOString(), plan: t.planName, ex, modes }]).slice(-500); G.save(G.K.hist, h); }
    // Erfolgsspruch: jedes Mal ein anderer (nie derselbe wie beim letzten Mal)
    const qs = G.D.DONE_QUOTES, lastQ = G.load('gyl-letzter-erfolgsspruch', -1);
    let qi = Math.floor(Math.random() * qs.length); if (qs.length > 1 && qi === lastQ) qi = (qi + 1 + Math.floor(Math.random() * (qs.length - 1))) % qs.length;
    G.save('gyl-letzter-erfolgsspruch', qi);
    t.summary = { sets, vol, recs, quote: qs[qi] }; t.finished = true; t.timerEnd = 0; t.holdEnd = 0;
    G.remove(G.K.run); G.keepAwake(false); G.render();
  };

  G.screens.training = () => {
    if (!G.ui.tr || G.ui.tr.planId !== G.activeId() || G.ui.tr.finishedAndLeft) G.trainingInit();
    const t = T(), now = Date.now();
    if (!t.finished) G.keepAwake(true);
    if (!t.plan.length) return `<div class="screen">${G.header()}<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:32px;text-align:center">
      <h1 class="h1" style="font-size:36px">${esc(t.planName)}</h1><span class="small" style="font-size:15px">In diesem Plan sind noch keine Übungen. Füge zuerst Übungen hinzu, dann kann es losgehen.</span>
      <a href="#/plan/${t.planId}" class="btn" style="width:auto">Übungen hinzufügen</a><a href="#/home" class="btn ghost sm">Zur Startseite</a></div></div>`;
    if (t.finished) {
      const s = t.summary;
      return `<div class="screen">${G.header()}<div class="pop" style="flex:1;display:flex;flex-direction:column;gap:20px">
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center">
          <div style="width:96px;height:96px;border-radius:999px;background:var(--teal);color:var(--bg);display:flex;align-items:center;justify-content:center">${I.check(52)}</div>
          <h1 class="h1" style="font-size:44px;line-height:1">Training geschafft!</h1>
          <span class="small" style="font-size:15px">Stark, ${esc(G.settings().name.trim() || 'Josi')}. Alles ist gespeichert.</span>
          <div class="card soft pop" style="width:100%;align-items:center;gap:8px;padding:16px;margin-top:4px"><span class="teal">${I.quote(28)}</span>
            <p class="num" style="margin:0;font-size:26px;line-height:1.15;text-transform:uppercase;text-align:center">${esc(s.quote || '')}</p></div>
          <div class="stats" style="width:100%;padding-top:12px">
            <div class="stat" style="align-items:center"><span class="num" style="font-size:32px">${s.sets}</span><span>Sätze</span></div>
            <div class="stat" style="align-items:center"><span class="num teal" style="font-size:32px">${G.fmtVol(s.vol)}</span><span>kg bewegt</span></div>
            <div class="stat" style="align-items:center"><span class="num amber" style="font-size:32px">${s.recs}</span><span>Rekorde</span></div>
          </div>
        </div>
        <a href="#/essen" class="btn outline">Was esse ich jetzt?</a>
        <a href="#/home" class="btn" data-a="trLeave">Zur Startseite</a>
      </div></div>`;
    }
    const ei = t.exIdx, p = t.plan[ei], rows = t.log[ei], isTime = p.mode === 'time';
    const activeIdx = rows.findIndex((r) => !r.done), act = activeIdx >= 0 ? rows[activeIdx] : null;
    const allDone = activeIdx === -1, isLastEx = ei === t.plan.length - 1;
    const best = bestLast(p), isRec = (r) => !isTime && r.done && best !== null && r.kg > best;
    const timerOn = !!t.timerEnd, holdOn = !!t.holdEnd, pauseDone = !timerOn && t.pauseDoneUntil > now;
    const notes = G.load(G.K.notes, {}), noteText = (notes[p.key] || '').trim();

    // Steigerungs-Tipp
    let tip = '';
    if (rows.every((r) => !r.done) && !t.tipDone[ei]) {
      const sess = G.history().filter((x) => x.ex[p.name] && x.ex[p.name].length).slice(-2);
      const ok = sess.length === 2 && sess.every((x) => x.ex[p.name].length >= p.sets && x.ex[p.name].every((r) => r[1] >= p.reps));
      if (ok) {
        const lastRows = sess[1].ex[p.name];
        let title = '', text = '', yes = '';
        if (isTime) {
          const sug = Math.max.apply(null, lastRows.map((r) => r[1])) + 15;
          if (rows.some((r) => r.reps < sug)) { title = 'Heute ' + G.fmtT(sug) + ' halten?'; text = 'Du hast die Zeit die letzten 2 Male in allen Sätzen geschafft.'; yes = 'Ja, ' + G.fmtT(sug); t.tipVal = sug; }
        } else {
          const top = G.bestOf(lastRows), sug = Math.round((top + t.kgStep) * 100) / 100;
          if (top > 0 && rows.some((r) => r.kg < sug)) { title = 'Heute ' + G.fmtKg(sug) + ' kg probieren?'; text = 'Du hast die letzten 2 Male alle ' + p.sets + ' × ' + p.reps + ' geschafft – Zeit für ' + G.fmtKg(t.kgStep) + ' kg mehr.'; yes = 'Ja, ' + G.fmtKg(sug) + ' kg'; t.tipVal = sug; }
        }
        if (title) tip = `<div class="card soft sm pop" style="border-width:2px;gap:10px">
          <div class="row" style="align-items:flex-start"><span class="teal">${I.trend(24)}</span><div style="display:flex;flex-direction:column;gap:2px">
            <span class="label teal" style="font-size:12px">Steigerungs-Tipp</span><span style="font-size:15px;font-weight:600;line-height:1.35">${title}</span><span style="font-size:13px;color:var(--muted2);line-height:1.4">${text}</span></div></div>
          <div class="btns"><button type="button" class="btn ghost sm" data-a="tipNo">Heute nicht</button><button type="button" class="btn sm" data-a="tipYes">${yes}</button></div></div>`;
      }
    }
    const note = t.noteEdit ? `<div class="inset" style="display:flex;flex-direction:column;gap:8px;padding:10px;border:1px solid var(--amber)">
        <label class="label amber" for="trnote" style="font-size:12px">Notiz zu ${esc(p.name)}</label>
        <textarea id="trnote" class="input" rows="2" maxlength="160" style="background:var(--card);font-size:15px" placeholder="z. B. Sitz auf Stufe 4, Griff eng" data-in="trNoteDraft">${esc(t.noteDraft)}</textarea>
        <div class="btns"><button type="button" class="btn ghost sm" data-a="trNoteCancel">Abbrechen</button><button type="button" class="btn sm" style="background:var(--amber)" data-a="trNoteSave">Speichern</button></div></div>`
      : noteText ? `<button type="button" class="row" style="border:1px solid var(--amber);border-radius:12px;background:var(--amber-soft);color:var(--text);text-align:left;padding:10px 12px;align-items:flex-start;min-height:44px" data-a="trNoteEdit" aria-label="Notiz bearbeiten">
          <span class="amber" style="flex-shrink:0">${I.note(18)}</span><span class="grow" style="font-size:14px;line-height:1.4;white-space:pre-line">${esc(noteText)}</span><span class="muted">${I.pencil(16)}</span></button>`
      : `<button type="button" class="pill white" style="align-self:center;height:40px;border:1px dashed var(--line);background:transparent;color:var(--muted);font-size:13px" data-a="trNoteEdit">${I.note(16)}Notiz hinzufügen</button>`;

    const rowHtml = rows.map((r, j) => {
      const l = p.last[j], cls = r.done ? 'done' + (isRec(r) ? ' rec' : '') : j === activeIdx ? 'active' : '';
      const lastL = l ? (isTime ? G.fmtT(l[1]) : G.fmtKg(l[0]) + '×' + l[1]) : '–';
      const btn = r.done ? `<button type="button" class="check on" data-a="trUndo" data-j="${j}" aria-label="Satz ${j + 1} wieder öffnen">${I.check(20)}</button>`
        : j === activeIdx ? `<button type="button" class="check" data-a="trCheck" data-j="${j}" aria-label="Satz ${j + 1} abhaken"></button>` : `<span class="check off"></span>`;
      return `<div class="set-row ${cls}"><span class="n">${j + 1}</span><span class="l">${lastL}</span><span class="v kg">${G.fmtKg(r.kg)}</span><span class="v">${isTime ? G.fmtT(r.reps) : r.reps}</span>${btn}</div>`;
    }).join('');

    let mainLabel = 'Satz ' + (activeIdx + 1) + ' abhaken', mainIcon = I.check(22), mainA = 'trMainCheck';
    if (!allDone && isTime && !holdOn) { mainLabel = 'Halten starten (' + G.fmtT(act.reps) + ')'; mainIcon = I.play(20); mainA = 'trHold'; }
    else if (!allDone && isTime && holdOn) { mainLabel = 'Satz jetzt abhaken'; mainA = 'trHoldDone'; }
    else if (allDone && !isLastEx) { mainLabel = 'Nächste Übung'; mainIcon = I.arrowRight(22); mainA = 'trNextEx'; }
    else if (allDone) { mainLabel = 'Training beenden'; mainA = 'trFinish'; }

    const hl = holdOn ? Math.max(0, t.holdEnd - now) : 0, hp = holdOn && t.holdTotal ? Math.round(hl / t.holdTotal * 100) : 0;
    const tl = timerOn ? Math.max(0, t.timerEnd - now) : 0, tp = timerOn && t.timerTotal ? Math.round(tl / t.timerTotal * 100) : 0;
    const idle = isTime ? 'Tippe auf „Halten starten“ – der Timer zählt ' + (act ? G.fmtT(act.reps) : '') + ' herunter und hakt den Satz danach selbst ab.'
      : p.pauseOn ? 'Nach dem Haken startet die Pause automatisch (' + G.fmtT(p.pause) + ').' : 'Für diese Übung ist keine Pause eingestellt.';
    const storeNote = t.resumed ? 'Training fortgesetzt – deine Haken sind noch da' : t.fromStore ? 'Werte aus deinem letzten Training übernommen' : 'Erstes Training – ab dem ersten Haken merkt sich die App deine Werte';

    return `<div class="screen with-bar">
      ${G.header()}
      <div style="display:flex;flex-direction:column;gap:6px;padding:0 4px">
        <div class="row-between"><span class="eyebrow">Übung ${ei + 1} von ${t.plan.length}</span><div class="row" style="gap:8px"><button type="button" class="pill" data-a="trPickOpen">${I.plus(16)}Übung</button><button type="button" class="pill white" data-a="trFinish">Beenden</button></div></div>
        <div class="row"><h1 class="h1 grow ellipsis" style="font-size:38px">${esc(t.planName)}</h1>
          <a href="#/routinen" class="pill outline" aria-label="Zu den Routinen, z. B. Aufwärmen oder Dehnen">${I.routine(18)}Routine</a></div>
        <div class="segbar" style="padding-top:6px">${t.plan.map((x, i) => `<div class="${i === ei ? 'cur' : t.log[i].every((r) => r.done) ? 'done' : ''}"></div>`).join('')}</div>
        <div class="row" style="gap:6px;padding-top:4px;min-height:20px"><span style="color:${t.resumed || t.fromStore ? 'var(--teal)' : 'var(--muted)'}">${I.routine(14)}</span>
          <span style="font-size:12px;color:${t.resumed || t.fromStore ? 'var(--teal)' : 'var(--muted)'}">${storeNote}</span>
          <span id="savedFlash" style="margin-left:auto;font-size:12px;font-weight:600;color:var(--teal);${(t.savedFlash || 0) > now ? '' : 'display:none'}">Gespeichert ✓</span></div>
      </div>
      <div class="card" style="padding:14px 12px;gap:10px">
        <div class="row" style="gap:6px">
          <button type="button" class="icon-btn plain" style="color:${ei > 0 ? 'var(--text)' : 'var(--line)'}" data-a="trPrevEx" aria-label="Vorherige Übung">${I.back(20)}</button>
          <div class="grow" style="display:flex;flex-direction:column;align-items:center;gap:2px;text-align:center">
            <h2 class="num" style="margin:0;font-size:28px;line-height:1.05">${esc(p.name)}</h2>
            <span style="font-size:12px;color:var(--muted)">Ziel ${p.sets} × ${isTime ? G.fmtT(p.reps) + ' halten' : p.reps} · ${p.pauseOn ? 'Pause ' + G.fmtT(p.pause) : 'ohne Pause'}${p.temp ? ' · nur heute' : ''}</span>
          </div>
          <button type="button" class="icon-btn plain" style="color:${isLastEx ? 'var(--line)' : 'var(--text)'}" data-a="trNextExNav" aria-label="Nächste Übung">${I.next(20)}</button>
        </div>
        ${note}${tip}
        <div class="set-head"><span>Satz</span><span>Zuletzt</span><span>kg</span><span>${isTime ? 'Zeit' : 'Wdh.'}</span><span></span></div>
        ${rowHtml}
        ${rows.some(isRec) ? `<div class="card amber sm pop row" style="flex-direction:row;padding:10px 12px"><span class="amber">${I.trophy(22)}</span><span style="font-size:14px;font-weight:600;color:var(--amber)">Neuer Rekord bei ${esc(p.name)}!</span></div>` : ''}
        ${act ? `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding-top:4px">
          <div class="field"><span class="label" style="text-align:center">Gewicht (kg)</span>${G.stepper({ lg: 1, a: 'trKg', v: G.fmtKg(act.kg), minus: 'Gewicht verringern', plusL: 'Gewicht erhöhen' })}</div>
          <div class="field"><span class="label" style="text-align:center">${isTime ? 'Dauer' : 'Wiederholungen'}</span>${G.stepper({ lg: 1, a: 'trReps', v: isTime ? G.fmtT(act.reps) : act.reps, minus: isTime ? 'Kürzer' : 'Weniger Wiederholungen', plusL: isTime ? 'Länger' : 'Mehr Wiederholungen' })}</div>
        </div>` : ''}
      </div>
      ${holdOn ? `<div class="card soft pop" style="border-width:2px;align-items:center">
        <span class="label teal" style="font-size:13px;letter-spacing:2px">Halten!</span>
        <div class="ring" id="holdRing" style="${G.ring(hp, 150)}"><div style="width:128px;height:128px;background:var(--teal-soft)"><span class="num" id="holdLeft" role="timer" style="font-size:52px;font-variant-numeric:tabular-nums">${G.fmtT(Math.ceil(hl / 1000))}</span></div></div>
        <button type="button" class="pill white" data-a="trHoldCancel">Abbrechen</button></div>` : ''}
      ${timerOn ? `<div class="card accent pop row" style="flex-direction:row;align-items:center;padding:14px 16px;gap:14px">
        <div class="ring" id="pauseRing" style="${G.ring(tp, 64)}"><div style="width:52px;height:52px;background:var(--card)"></div></div>
        <div class="grow" style="display:flex;flex-direction:column;gap:2px"><span class="label" style="font-size:12px">${t.timerKind === 'wechsel' ? 'Wechselpause · jetzt: ' + esc(p.name) : 'Pause läuft'}</span>
          <span class="num" id="pauseLeft" role="timer" style="font-size:36px;line-height:1;font-variant-numeric:tabular-nums">${G.fmtT(Math.ceil(tl / 1000))}</span></div>
        <div style="display:flex;flex-direction:column;gap:6px"><button type="button" class="pill white" style="height:40px;font-size:13px" data-a="trPlus15">+15 s</button><button type="button" class="pill white" style="height:40px;font-size:13px;background:transparent;color:var(--muted)" data-a="trSkip">Überspringen</button></div></div>` : ''}
      ${pauseDone ? `<div class="card soft pop num" style="text-align:center;font-size:24px;text-transform:uppercase;color:var(--teal)">Pause vorbei – weiter geht's!</div>` : ''}
      ${!timerOn && !pauseDone && !allDone && !holdOn ? `<div class="small" style="text-align:center;padding:4px 12px">${idle}</div>` : ''}
    </div>
    <div class="bottom-bar"><button type="button" class="btn" data-a="${mainA}">${mainIcon}${mainLabel}</button></div>${t.pick ? pickerHtml(t) : ''}`;
  };

  // ---------- Übung während des Trainings hinzufügen ----------
  const allLib = () => D.LIB.concat(G.load(G.K.own, []).map((c) => Object.assign({}, c, { custom: true })));
  function pickerHtml(t) {
    const k = t.pick, lib = allLib(), q = k.query.trim().toLowerCase(), g = k.group;
    const exact = lib.some((l) => l.name.toLowerCase() === q);
    const list = lib.filter((l) => (g === 'Alle' || l.group === g) && (!q || l.name.toLowerCase().indexOf(q) !== -1));
    const groups = ['Alle'].concat(D.GROUPS).map((label) => `<button type="button" class="chip${label === g ? ' on' : ''}" data-a="trPickGroup" data-g="${label}" aria-pressed="${label === g}">${label}</button>`).join('');
    const form = `<div class="card active sm" style="background:var(--bg);gap:14px;flex-shrink:0">
      <span class="h2" style="font-size:22px">Eigene Übung anlegen</span>
      <div class="field"><label class="label" for="cname">Name der Übung</label><input id="cname" class="input" value="${esc(k.cName)}" maxlength="32" placeholder="z. B. Kabelzug seitlich" data-in="trPickCName"></div>
      <div class="field"><span class="label">Körperbereich</span><div class="chips">${D.GROUPS.map((x) => `<button type="button" class="chip${k.cGroup === x ? ' on' : ''}" data-a="trPickCGroup" data-g="${x}">${x}</button>`).join('')}</div></div>
      <div class="seg"><button type="button" class="${k.cMode === 'reps' ? 'on' : ''}" data-a="trPickCMode" data-m="reps">Wiederholungen</button><button type="button" class="${k.cMode === 'time' ? 'on' : ''}" data-a="trPickCMode" data-m="time">Zeit halten</button></div>
      <div class="btns"><button type="button" class="btn ghost md" data-a="trPickFormClose">Abbrechen</button><button type="button" class="btn md" style="flex:2" data-a="trPickFormSave">Speichern &amp; hinzufügen</button></div></div>`;
    const ownLabel = q.length > 1 && !exact ? '„' + esc(k.query.trim()) + '“ als eigene Übung anlegen' : 'Eigene Übung anlegen';
    const items = list.map((l) => `<button type="button" class="link-area row" style="min-height:56px;padding:0 6px 0 14px;gap:12px;flex-direction:row;align-items:center;border-radius:14px;background:var(--card2);flex-shrink:0" data-a="trPickAdd" data-name="${esc(l.name)}">
        <span class="grow" style="display:flex;flex-direction:column;gap:2px"><span style="font-size:16px;font-weight:600">${esc(l.name)}</span>
        <span style="font-size:12px;color:${l.custom ? 'var(--teal)' : 'var(--muted)'}">${l.custom ? 'Eigene Übung · ' : ''}${esc(l.group)}${l.mode === 'time' ? ' · Zeit ' + G.fmtT(l.hold || 60) : ''}</span></span>
        <span style="width:32px;height:32px;border-radius:999px;background:var(--teal);color:var(--bg);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:8px">${I.plus(16)}</span></button>`).join('');
    return `<div class="overlay" data-a="trPickClose" data-self="1"><div class="sheet" style="height:92vh" role="dialog" aria-label="Übung hinzufügen">
      <div class="grip"></div>
      <div class="row-between" style="padding:0 4px"><h2 class="h2" style="font-size:28px">Übung hinzufügen</h2><button type="button" class="icon-btn" data-a="trPickClose" aria-label="Schließen">${I.x(20)}</button></div>
      <button type="button" class="switch-row inset" style="padding:8px 12px;flex-shrink:0" role="switch" aria-checked="${k.save}" data-a="trPickSave">
        <span class="grow"><span class="t">Auch dauerhaft im Plan speichern</span><span class="h">${k.save ? 'Die Übung bleibt im Plan „' + esc(t.planName) + '“' : 'Nur für das heutige Training'}</span></span>${G.sw(k.save)}</button>
      <div class="field"><label class="label" for="psearch">Suchen oder eigene Übung eintippen</label><input id="psearch" class="input" value="${esc(k.query)}" placeholder="z. B. Hip Thrust" data-in="trPickQuery"></div>
      <div class="chips" style="flex-shrink:0">${groups}</div>
      <div class="scroll" id="pickerList">${k.form ? form : `<button type="button" class="btn dashed" style="height:52px;font-size:15px;justify-content:flex-start;padding:0 14px;flex-shrink:0" data-a="trPickFormOpen">${I.plus(18)}${ownLabel}</button>${items}${list.length ? '' : '<div class="empty">Keine passende Übung gefunden – leg sie oben als eigene Übung an.</div>'}`}</div>
    </div></div>`;
  }

  // Uhr-Takt fürs Training: Timer-Anzeigen aktualisieren, Übergänge auslösen
  G.ticks.push(() => {
    const t = G.ui.tr; if (!t || t.finished || G.route !== 'training') return;
    const now = Date.now();
    if (t.holdEnd && now >= t.holdEnd) { const h = t.holdRef; t.holdEnd = 0; G.signal(); checkSet(h[0], h[1]); return; }
    if (t.timerEnd && now >= t.timerEnd) { t.timerEnd = 0; t.timerKind = null; t.pauseDoneUntil = now + 2500; G.signal(); G.render(); return; }
    if (t.pauseDoneUntil && now >= t.pauseDoneUntil) { t.pauseDoneUntil = 0; G.render(); return; }
    const set = (id, txt) => { const e = document.getElementById(id); if (e) e.textContent = txt; };
    const ring = (id, pct, size) => { const e = document.getElementById(id); if (e) e.setAttribute('style', G.ring(pct, size)); };
    if (t.timerEnd) { const l = t.timerEnd - now; set('pauseLeft', G.fmtT(Math.ceil(l / 1000))); ring('pauseRing', Math.round(l / t.timerTotal * 100), 64); }
    if (t.holdEnd) { const l = t.holdEnd - now; set('holdLeft', G.fmtT(Math.ceil(l / 1000))); ring('holdRing', Math.round(l / t.holdTotal * 100), 150); }
    const sf = document.getElementById('savedFlash'); if (sf && (t.savedFlash || 0) <= now) sf.style.display = 'none';
  });

  const A = G.actions, IN = G.inputs;
  const act = () => { const t = T(), rows = t.log[t.exIdx], i = rows.findIndex((r) => !r.done); return i >= 0 ? { i, r: rows[i] } : null; };
  A.trCheck = (el) => { G.unlockAudio(); checkSet(T().exIdx, +el.dataset.j); };
  A.trMainCheck = () => { G.unlockAudio(); const a = act(); if (a) checkSet(T().exIdx, a.i); };
  A.trUndo = (el) => { const t = T(); t.log[t.exIdx][+el.dataset.j].done = false; persistRun(); G.render(); };
  A.trKg = (el) => { const a = act(); if (!a) return; a.r.kg = Math.max(0, Math.round((a.r.kg + +el.dataset.d * T().kgStep) * 100) / 100); persistRun(); G.render(); };
  A.trReps = (el) => { const a = act(); if (!a) return; const time = T().plan[T().exIdx].mode === 'time'; a.r.reps = time ? Math.max(5, a.r.reps + +el.dataset.d * 15) : Math.max(1, a.r.reps + +el.dataset.d); persistRun(); G.render(); };
  A.trHold = () => { G.unlockAudio(); const t = T(), a = act(); if (!a) return; Object.assign(t, { holdEnd: Date.now() + a.r.reps * 1000, holdTotal: a.r.reps * 1000, holdRef: [t.exIdx, a.i], timerEnd: 0, timerKind: null, pauseDoneUntil: 0 }); G.render(); };
  A.trHoldDone = () => { const t = T(), a = act(); t.holdEnd = 0; if (a) checkSet(t.exIdx, a.i); };
  A.trHoldCancel = () => { T().holdEnd = 0; G.render(); };
  A.trPlus15 = () => { const t = T(); t.timerEnd += 15000; t.timerTotal += 15000; G.render(); };
  A.trSkip = () => { const t = T(); t.timerEnd = 0; t.timerKind = null; t.pauseDoneUntil = 0; G.render(); };
  A.trNextEx = () => { const t = T(); t.exIdx++; t.timerEnd = 0; t.pauseDoneUntil = 0; t.noteEdit = false; persistRun(); G.render(); window.scrollTo(0, 0); };
  A.trNextExNav = () => { const t = T(); if (t.exIdx < t.plan.length - 1) { t.exIdx++; t.noteEdit = false; persistRun(); G.render(); } };
  A.trPrevEx = () => { const t = T(); if (t.exIdx > 0) { t.exIdx--; t.noteEdit = false; persistRun(); G.render(); } };
  A.trFinish = () => finish();
  A.trLeave = () => { G.ui.tr = null; };
  A.tipNo = () => { const t = T(); t.tipDone[t.exIdx] = true; G.render(); };
  A.tipYes = () => {
    const t = T(), p = t.plan[t.exIdx], v = t.tipVal;
    t.log[t.exIdx].forEach((r) => { if (!r.done) { if (p.mode === 'time') r.reps = Math.max(r.reps, v); else r.kg = Math.max(r.kg, v); } });
    t.tipDone[t.exIdx] = true; G.render();
  };
  A.trPickOpen = () => { T().pick = { query: '', group: 'Alle', form: false, cName: '', cGroup: 'Beine', cMode: 'reps', save: false }; G.render(); };
  A.trPickClose = () => { T().pick = null; G.render(); };
  A.trPickSave = () => { const k = T().pick; k.save = !k.save; G.render(); };
  IN.trPickQuery = (v) => { T().pick.query = v; G.renderKeepFocus(); };
  A.trPickGroup = (el) => { T().pick.group = el.dataset.g; G.render(); };
  A.trPickFormOpen = () => {
    const k = T().pick, q = k.query.trim(), exact = allLib().some((l) => l.name.toLowerCase() === q.toLowerCase());
    Object.assign(k, { form: true, cName: q.length > 1 && !exact ? q : '', cGroup: k.group === 'Alle' ? 'Beine' : k.group, cMode: 'reps' }); G.render();
  };
  A.trPickFormClose = () => { T().pick.form = false; G.render(); };
  IN.trPickCName = (v) => { T().pick.cName = v; };
  A.trPickCGroup = (el) => { T().pick.cGroup = el.dataset.g; G.render(); };
  A.trPickCMode = (el) => { T().pick.cMode = el.dataset.m; G.render(); };
  A.trPickFormSave = () => {
    const k = T().pick, name = k.cName.trim();
    if (!name) { G.toast('Bitte einen Namen eingeben'); return; }
    const item = { name, group: k.cGroup };
    if (k.cMode === 'time') { item.mode = 'time'; item.hold = 60; }
    G.save(G.K.own, G.load(G.K.own, []).filter((c) => c.name !== name).concat([item]));
    addToTraining(name, item.group, item);
  };
  A.trPickAdd = (el) => { const l = allLib().find((x) => x.name === el.dataset.name); if (l) addToTraining(l.name, l.group, l); };
  // Neue Übung direkt nach der aktuellen einfügen und dorthin springen
  const addToTraining = (name, group, d) => {
    const t = T(), save = t.pick.save, dup = t.plan.findIndex((p) => p.name === name);
    t.pick = null;
    t.timerEnd = 0; t.timerKind = null; t.holdEnd = 0; t.pauseDoneUntil = 0; t.noteEdit = false;
    if (dup !== -1) { t.exIdx = dup; G.toast(name + ' ist schon im Training'); G.render(); window.scrollTo(0, 0); return; }
    const mode = d.mode === 'time' ? 'time' : 'reps', sets = 3, hold = d.hold || 60, pause = G.settings().defaultPause;
    const last = (G.load(G.K.last, {})[name] || []).filter(Boolean);
    const entry = { name, key: name, group, mode, sets, reps: mode === 'time' ? hold : 10, pause, pauseOn: true, last, temp: !save };
    const at = t.exIdx + 1, rows = [];
    for (let i = 0; i < sets; i++) { const l = last[i] || last[last.length - 1]; rows.push({ kg: l ? l[0] : 0, reps: l ? l[1] : entry.reps, done: false }); }
    if (save) {
      const pos = t.plan.slice(0, at).filter((p) => !p.temp).length;
      const item = { id: G.uid('x'), name, group, sets, reps: 10, pause };
      if (mode === 'time') { item.mode = 'time'; item.hold = hold; }
      G.savePlans(G.plans().map((p) => (p.id === t.planId ? Object.assign({}, p, { exercises: p.exercises.slice(0, pos).concat([item], p.exercises.slice(pos)) }) : p)));
    }
    t.plan.splice(at, 0, entry); t.log.splice(at, 0, rows); t.exIdx = at;
    persistRun(); G.toast(name + (save ? ' hinzugefügt und im Plan gespeichert' : ' für heute hinzugefügt')); G.render(); window.scrollTo(0, 0);
  };
  A.trNoteEdit = () => { const t = T(); t.noteEdit = true; t.noteDraft = (G.load(G.K.notes, {})[t.plan[t.exIdx].key] || ''); G.render(); setTimeout(() => { const e = document.getElementById('trnote'); if (e) e.focus(); }, 0); };
  IN.trNoteDraft = (v) => { T().noteDraft = v; };
  A.trNoteCancel = () => { T().noteEdit = false; G.render(); };
  A.trNoteSave = () => { const t = T(), n = G.load(G.K.notes, {}); n[t.plan[t.exIdx].key] = t.noteDraft.trim(); G.save(G.K.notes, n); t.noteEdit = false; G.render(); };
})();
