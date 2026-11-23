// Gym your Life – Plan bearbeiten
(function () {
  const G = window.G, D = G.D, I = G.I, esc = G.esc;

  const ensure = (id) => {
    let u = G.ui.plan;
    if (!u || u.planId !== id) {
      const plan = G.plans().find((p) => p.id === id);
      if (!plan) return null;
      u = G.ui.plan = {
        planId: id, openId: plan.exercises.length ? plan.exercises[0].id : null, editingId: null, draft: '',
        titleEditing: plan.name === 'Neuer Plan' && !plan.exercises.length, titleDraft: plan.name === 'Neuer Plan' ? '' : plan.name,
        confirmDelete: false, picker: false, query: '', group: 'Alle', form: false, cName: '', cGroup: 'Beine', cMode: 'reps'
      };
    }
    return u;
  };
  const getPlan = () => G.plans().find((p) => p.id === G.ui.plan.planId);
  const updatePlan = (fn) => { const id = G.ui.plan.planId; G.savePlans(G.plans().map((p) => (p.id === id ? fn(Object.assign({}, p)) : p))); };
  const updateEx = (exId, fn) => updatePlan((p) => Object.assign(p, { exercises: p.exercises.map((x) => (x.id === exId ? Object.assign({}, x, fn(x)) : x)) }));
  const lastBest = (x) => {
    const arr = (G.load(G.K.last, {})[G.exKey(x)] || []).filter(Boolean);
    if (!arr.length) return '';
    return x.mode === 'time' ? G.fmtT(Math.max.apply(null, arr.map((r) => r[1]))) : G.fmtKg(G.bestOf(arr)) + ' kg';
  };
  const allLib = () => D.LIB.concat(G.load(G.K.own, []).map((c) => Object.assign({}, c, { custom: true })));

  G.screens.plan = (params) => {
    const id = params[0] || G.activeId();
    const u = ensure(id);
    if (!u) { location.hash = '#/plaene'; return ''; }
    G.setActive(id);
    const plan = getPlan(), notes = G.load(G.K.notes, {});
    const n = plan.exercises.length;
    const exCards = plan.exercises.map((x, i) => {
      const open = u.openId === x.id, isTime = x.mode === 'time', hold = x.hold || 60, pauseOn = x.pauseOn !== false;
      const lb = lastBest(x);
      const line = x.sets + ' × ' + (isTime ? G.fmtT(hold) + ' halten' : x.reps) + ' · ' + (pauseOn ? 'Pause ' + G.fmtT(x.pause) : 'ohne Pause') + ' · ' + (lb ? 'zuletzt ' + lb : 'noch keine Werte');
      if (u.editingId === x.id) return `<div class="card active sm" style="gap:10px">
        <label class="label" for="exname">Übung umbenennen</label>
        <input id="exname" class="input big" value="${esc(u.draft)}" maxlength="32" data-in="planExDraft" data-enter="planExSave" autofocus>
        <div class="btns"><button type="button" class="btn ghost md" data-a="planExCancel">Abbrechen</button><button type="button" class="btn md" data-a="planExSave">Speichern</button></div></div>`;
      return `<div class="card sm${open ? ' active' : ''}" style="padding:0;gap:0">
        <div class="row" style="padding-right:6px">
          <button type="button" class="link-area row" style="padding:12px 6px 12px 14px;gap:12px;flex-direction:row;align-items:center;min-height:68px" data-a="planToggle" data-id="${x.id}" aria-expanded="${open}">
            <span class="num" style="width:30px;height:30px;border-radius:999px;background:var(--teal-soft);color:var(--teal);font-size:17px;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i + 1}</span>
            <span class="grow" style="display:flex;flex-direction:column;gap:3px"><span class="h3 ellipsis">${esc(x.name)}</span><span class="small" style="line-height:1.3">${esc(line)}</span></span>
          </button>
          <button type="button" class="icon-btn plain" style="color:var(--muted)" data-a="planExRename" data-id="${x.id}" aria-label="${esc(x.name)} umbenennen">${I.pencil(20)}</button>
          <button type="button" class="icon-btn plain" style="color:var(--muted);width:36px" data-a="planToggle" data-id="${x.id}" aria-label="${open ? 'Details zuklappen' : 'Details aufklappen'}">${open ? I.up(20) : I.down(20)}</button>
        </div>
        ${open ? `<div style="padding:4px 14px 14px;display:flex;flex-direction:column;gap:10px">
          ${G.figure(G.muscles(x))}
          <div class="seg" role="group" aria-label="Art der Übung">
            <button type="button" class="${isTime ? '' : 'on'}" data-a="planMode" data-id="${x.id}" data-m="reps" aria-pressed="${!isTime}">Wiederholungen</button>
            <button type="button" class="${isTime ? 'on' : ''}" data-a="planMode" data-id="${x.id}" data-m="time" aria-pressed="${isTime}" style="flex-direction:row">${I.timer(16)}Zeit halten</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">
            <div class="field"><span class="label" style="text-align:center">Sätze</span>${G.stepper({ a: 'planStep', data: `data-id="${x.id}" data-f="sets"`, v: x.sets, minus: 'Weniger Sätze', plusL: 'Mehr Sätze' })}</div>
            <div class="field"><span class="label" style="text-align:center">${isTime ? 'Dauer' : 'Wdh.'}</span>${G.stepper({ a: 'planStep', data: `data-id="${x.id}" data-f="${isTime ? 'hold' : 'reps'}"`, v: isTime ? G.fmtT(hold) : x.reps, minus: isTime ? 'Kürzer halten' : 'Weniger Wiederholungen', plusL: isTime ? 'Länger halten' : 'Mehr Wiederholungen' })}</div>
            <div class="field"><span class="label" style="text-align:center">Pause</span>${G.stepper({ a: 'planStep', data: `data-id="${x.id}" data-f="pause"`, v: pauseOn ? G.fmtT(x.pause) : '<span class="muted">aus</span>', minus: 'Kürzere Pause', plusL: 'Längere Pause' })}</div>
          </div>
          <button type="button" class="switch-row inset" style="padding:8px 12px" role="switch" aria-checked="${pauseOn}" data-a="planPauseSw" data-id="${x.id}">
            <span class="grow"><span class="t">Pause nach jedem Satz</span><span class="h">${pauseOn ? 'Timer startet nach dem Haken automatisch' : 'Kein Timer – direkt weiter zum nächsten Satz'}</span></span>${G.sw(pauseOn)}</button>
          <div class="field"><label class="label amber" for="note-${x.id}">Notiz (erscheint im Training)</label>
            <input id="note-${x.id}" class="input" style="height:44px;font-size:14px" value="${esc(notes[G.exKey(x)] || '')}" maxlength="160" placeholder="z. B. Sitz auf Stufe 4, Griff eng" data-in="planNote" data-key="${esc(G.exKey(x))}"></div>
          <div class="row">
            <button type="button" class="icon-btn" style="width:48px" data-a="planMove" data-i="${i}" data-d="-1" aria-label="Nach oben schieben">${I.arrowUp(20)}</button>
            <button type="button" class="icon-btn" style="width:48px" data-a="planMove" data-i="${i}" data-d="1" aria-label="Nach unten schieben">${I.arrowDown(20)}</button>
            <span class="grow"></span>
            <button type="button" class="btn danger-ghost sm" data-a="planRemoveEx" data-id="${x.id}">Entfernen</button>
          </div>
        </div>` : ''}
      </div>`;
    }).join('');

    const exPauseOn = !!plan.exPauseOn, exPause = plan.exPause || 120;
    const title = u.titleEditing ? `<div class="field" style="padding:4px 0">
        <label class="label" for="ptitle">Name des Plans</label>
        <input id="ptitle" class="input big" style="height:52px;border:2px solid var(--teal);background:var(--card2);text-transform:uppercase;font-weight:700;font-size:26px" value="${esc(u.titleDraft)}" maxlength="28" placeholder="z. B. Beine & Po" data-in="planTitleDraft" data-enter="planTitleSave" autofocus>
        <div class="btns"><button type="button" class="btn ghost sm" data-a="planTitleCancel">Abbrechen</button><button type="button" class="btn sm" data-a="planTitleSave">Speichern</button></div>
      </div>` : `<div class="row" style="gap:6px"><h1 class="h1 ellipsis" style="min-width:0">${esc(plan.name)}</h1>
        <button type="button" class="icon-btn plain" style="color:var(--muted)" data-a="planTitleEdit" aria-label="Plan umbenennen">${I.pencil(22)}</button></div>`;

    return `<div class="screen with-bar">
      ${G.header()}
      <div style="display:flex;flex-direction:column;gap:10px;border-bottom:1px solid var(--line);padding-bottom:12px">
        <div class="row-between"><a href="#/plaene" class="icon-btn" aria-label="Zurück zu den Plänen">${I.back()}</a><span class="eyebrow">Plan bearbeiten</span><span style="width:44px"></span></div>
        <div class="title-block">${title}<span class="small" style="font-size:14px">${n} ${n === 1 ? 'Übung' : 'Übungen'} · ${plan.exercises.reduce((s, x) => s + x.sets, 0)} Sätze gesamt</span></div>
      </div>
      <div class="list">${exCards}
        <button type="button" class="btn dashed" data-a="pickerOpen">${I.plus(20)}Übung hinzufügen</button>
        ${!n ? '<div class="empty">Dein Plan ist noch leer. Füge oben deine erste Übung hinzu.</div>' : ''}
        <div class="card sm" style="gap:10px">
          <button type="button" class="switch-row" role="switch" aria-checked="${exPauseOn}" data-a="planExPauseSw">
            <span class="teal">${I.arrowRight(24)}</span>
            <span class="grow"><span class="t" style="font-size:15px">Pause zwischen den Übungen</span><span class="h">${exPauseOn ? 'Timer läuft nach der letzten Serie einer Übung' : 'Aus – nach einer Übung geht es direkt weiter'}</span></span>${G.sw(exPauseOn)}</button>
          ${exPauseOn ? G.stepper({ a: 'planExPause', v: G.fmtT(exPause), minus: 'Kürzere Wechselpause', plusL: 'Längere Wechselpause' }) : ''}
        </div>
        ${G.plans().length > 1 ? (u.confirmDelete ? `<div class="card sm" style="border-color:var(--coral);gap:10px"><span style="font-size:14px;line-height:1.5">„${esc(plan.name)}“ wirklich löschen? Deine bisherigen Trainings im Verlauf bleiben erhalten.</span>
            <div class="btns"><button type="button" class="btn sec md" data-a="planDelCancel">Behalten</button><button type="button" class="btn danger md" data-a="planDelDo">Löschen</button></div></div>`
          : `<button type="button" class="btn danger-ghost sm" style="align-self:center" data-a="planDelAsk">Plan löschen</button>`) : ''}
      </div>
    </div>
    <div class="bottom-bar"><a href="#/training" class="btn${n ? '' : ' sec'}" data-a="setActive" data-id="${plan.id}">${I.play(20)}Training starten</a></div>
    ${u.picker ? picker(u) : ''}`;
  };

  function picker(u) {
    const lib = allLib(), q = u.query.trim().toLowerCase(), g = u.group;
    const exact = lib.some((l) => l.name.toLowerCase() === q);
    const list = lib.filter((l) => (g === 'Alle' || l.group === g) && (!q || l.name.toLowerCase().indexOf(q) !== -1));
    const groups = ['Alle'].concat(D.GROUPS).map((label) => {
      const c = label === 'Alle' ? lib.length : lib.filter((l) => l.group === label).length;
      return `<button type="button" class="chip${label === g ? ' on' : ''}" data-a="pickerGroup" data-g="${label}" aria-pressed="${label === g}">${label}<span class="cnt">${c}</span></button>`;
    }).join('');
    const form = `<div class="card active sm" style="background:var(--bg);gap:14px">
      <span class="h2" style="font-size:22px">Eigene Übung anlegen</span>
      <div class="field"><label class="label" for="cname">Name der Übung</label><input id="cname" class="input" value="${esc(u.cName)}" maxlength="32" placeholder="z. B. Kabelzug seitlich" data-in="pickerCName"></div>
      <div class="field"><span class="label">Körperbereich</span><div class="chips">${D.GROUPS.map((x) => `<button type="button" class="chip${u.cGroup === x ? ' on' : ''}" data-a="pickerCGroup" data-g="${x}">${x}</button>`).join('')}</div></div>
      <div class="seg"><button type="button" class="${u.cMode === 'reps' ? 'on' : ''}" data-a="pickerCMode" data-m="reps">Wiederholungen</button><button type="button" class="${u.cMode === 'time' ? 'on' : ''}" data-a="pickerCMode" data-m="time">Zeit halten</button></div>
      <span class="tiny">Die Übung wird im Bereich gespeichert und steht dir auch in allen anderen Plänen zur Verfügung.</span>
      <div class="btns"><button type="button" class="btn ghost md" data-a="pickerFormClose">Abbrechen</button><button type="button" class="btn md" style="flex:2" data-a="pickerFormSave">Speichern &amp; hinzufügen</button></div>
    </div>`;
    const ownLabel = q.length > 1 && !exact ? '„' + esc(u.query.trim()) + '“ als eigene Übung anlegen' : g === 'Alle' ? 'Eigene Übung anlegen' : 'Eigene Übung bei ' + g + ' anlegen';
    const items = list.map((l) => `<div class="row" style="gap:6px;border-radius:14px;background:var(--card2);flex-shrink:0">
        <button type="button" class="link-area row" style="min-height:56px;padding:0 6px 0 14px;gap:12px;flex-direction:row;align-items:center" data-a="pickerAdd" data-name="${esc(l.name)}">
          <span class="grow" style="display:flex;flex-direction:column;gap:2px"><span style="font-size:16px;font-weight:600">${esc(l.name)}</span>
          <span style="font-size:12px;color:${l.custom ? 'var(--teal)' : 'var(--muted)'}">${l.custom ? 'Eigene Übung · ' : ''}${esc(l.group)}${l.mode === 'time' ? ' · Zeit ' + G.fmtT(l.hold) : ''}</span></span>
          <span style="width:32px;height:32px;border-radius:999px;background:var(--teal);color:var(--bg);display:flex;align-items:center;justify-content:center;flex-shrink:0">${I.plus(16)}</span>
        </button>
        ${l.custom ? `<button type="button" class="icon-btn plain coral" style="margin-right:6px" data-a="pickerOwnDel" data-name="${esc(l.name)}" aria-label="${esc(l.name)} aus deinen Übungen löschen">${I.trash(18)}</button>` : ''}
      </div>`).join('');
    return `<div class="overlay" data-a="pickerClose" data-self="1"><div class="sheet" style="height:92vh" role="dialog" aria-label="Übung hinzufügen">
      <div class="grip"></div>
      <div class="row-between" style="padding:0 4px"><h2 class="h2" style="font-size:28px">Übung hinzufügen</h2><button type="button" class="icon-btn" data-a="pickerClose" aria-label="Schließen">${I.x(20)}</button></div>
      <div class="field"><label class="label" for="psearch">Suchen oder eigene Übung eintippen</label><input id="psearch" class="input" value="${esc(u.query)}" placeholder="z. B. Hip Thrust" data-in="pickerQuery" data-live="1"></div>
      <div class="chips" style="flex-shrink:0">${groups}</div>
      <div class="scroll" id="pickerList">${u.form ? form : `<button type="button" class="btn dashed" style="height:52px;font-size:15px;justify-content:flex-start;padding:0 14px;flex-shrink:0" data-a="pickerFormOpen">${I.plus(18)}${ownLabel}</button>${items}${list.length ? '' : '<div class="empty">Keine passende Übung gefunden – leg sie oben als eigene Übung an.</div>'}`}</div>
    </div></div>`;
  }

  const A = G.actions, IN = G.inputs;
  A.planToggle = (el) => { const u = G.ui.plan; u.openId = u.openId === el.dataset.id ? null : el.dataset.id; G.render(); };
  A.planExRename = (el) => { const x = getPlan().exercises.find((e) => e.id === el.dataset.id); G.ui.plan.editingId = x.id; G.ui.plan.draft = x.name; G.render(); };
  IN.planExDraft = (v) => { G.ui.plan.draft = v; };
  A.planExCancel = () => { G.ui.plan.editingId = null; G.render(); };
  A.planExSave = () => {
    const u = G.ui.plan, name = u.draft.trim();
    if (name) updateEx(u.editingId, (o) => ({ name, origin: o.origin || o.name }));
    u.editingId = null; G.render();
  };
  A.planMode = (el) => { updateEx(el.dataset.id, (o) => (el.dataset.m === 'time' ? { mode: 'time', hold: o.hold || 60 } : { mode: 'reps' })); G.render(); };
  A.planStep = (el) => {
    const d = +el.dataset.d, f = el.dataset.f;
    updateEx(el.dataset.id, (o) => {
      if (f === 'sets') return { sets: G.clamp(o.sets + d, 1, 10) };
      if (f === 'reps') return { reps: G.clamp(o.reps + d, 1, 50) };
      if (f === 'hold') return { hold: G.clamp((o.hold || 60) + d * 15, 15, 600) };
      if (f === 'pause') return o.pauseOn === false ? { pauseOn: true } : { pause: G.clamp(o.pause + d * 15, 15, 300) };
      return {};
    });
    G.render();
  };
  A.planPauseSw = (el) => { updateEx(el.dataset.id, (o) => ({ pauseOn: o.pauseOn === false })); G.render(); };
  IN.planNote = (v, el) => { const n = G.load(G.K.notes, {}); n[el.dataset.key] = v; G.save(G.K.notes, n); };
  A.planMove = (el) => {
    const i = +el.dataset.i, j = i + +el.dataset.d;
    updatePlan((p) => { const l = p.exercises.slice(); if (j < 0 || j >= l.length) return p; const t = l[i]; l[i] = l[j]; l[j] = t; p.exercises = l; return p; });
    G.render();
  };
  A.planRemoveEx = (el) => { updatePlan((p) => Object.assign(p, { exercises: p.exercises.filter((x) => x.id !== el.dataset.id) })); G.render(); };
  A.planTitleEdit = () => { G.ui.plan.titleEditing = true; G.ui.plan.titleDraft = getPlan().name; G.render(); };
  IN.planTitleDraft = (v) => { G.ui.plan.titleDraft = v; };
  A.planTitleCancel = () => { G.ui.plan.titleEditing = false; G.render(); };
  A.planTitleSave = () => { const t = G.ui.plan.titleDraft.trim(); if (t) updatePlan((p) => Object.assign(p, { name: t })); G.ui.plan.titleEditing = false; G.render(); };
  A.planExPauseSw = () => { updatePlan((p) => Object.assign(p, { exPauseOn: !p.exPauseOn, exPause: p.exPause || 120 })); G.render(); };
  A.planExPause = (el) => { updatePlan((p) => Object.assign(p, { exPause: G.clamp((p.exPause || 120) + +el.dataset.d * 15, 15, 600) })); G.render(); };
  A.planDelAsk = () => { G.ui.plan.confirmDelete = true; G.render(); };
  A.planDelCancel = () => { G.ui.plan.confirmDelete = false; G.render(); };
  A.planDelDo = () => {
    const rest = G.plans().filter((p) => p.id !== G.ui.plan.planId);
    G.savePlans(rest); G.setActive(rest[0].id); G.ui.plan = null; location.hash = '#/plaene'; G.toast('Plan gelöscht');
  };
  // Auswahl
  A.pickerOpen = () => { Object.assign(G.ui.plan, { picker: true, query: '', group: 'Alle', form: false }); G.render(); };
  A.pickerClose = () => { G.ui.plan.picker = false; G.ui.plan.form = false; G.render(); };
  IN.pickerQuery = (v) => { G.ui.plan.query = v; G.renderKeepFocus(); };
  A.pickerGroup = (el) => { G.ui.plan.group = el.dataset.g; G.render(); };
  const addEx = (name, group, d) => {
    d = d || {};
    const item = { id: G.uid('x'), name, group, sets: d.sets || 3, reps: 10, pause: d.pause || G.settings().defaultPause };
    if (d.mode === 'time') { item.mode = 'time'; item.hold = d.hold || 60; }
    if (d.pauseOn === false) item.pauseOn = false;
    updatePlan((p) => Object.assign(p, { exercises: p.exercises.concat([item]) }));
    Object.assign(G.ui.plan, { picker: false, form: false, openId: item.id });
    G.render(); G.toast(name + ' hinzugefügt');
  };
  A.pickerAdd = (el) => { const l = allLib().find((x) => x.name === el.dataset.name); addEx(l.name, l.group, l); };
  A.pickerOwnDel = (el) => { G.save(G.K.own, G.load(G.K.own, []).filter((c) => c.name !== el.dataset.name)); G.render(); };
  A.pickerFormOpen = () => {
    const u = G.ui.plan, q = u.query.trim(), exact = allLib().some((l) => l.name.toLowerCase() === q.toLowerCase());
    Object.assign(u, { form: true, cName: q.length > 1 && !exact ? q : '', cGroup: u.group === 'Alle' ? 'Beine' : u.group, cMode: 'reps' }); G.render();
  };
  A.pickerFormClose = () => { G.ui.plan.form = false; G.render(); };
  IN.pickerCName = (v) => { G.ui.plan.cName = v; };
  A.pickerCGroup = (el) => { G.ui.plan.cGroup = el.dataset.g; G.render(); };
  A.pickerCMode = (el) => { G.ui.plan.cMode = el.dataset.m; G.render(); };
  A.pickerFormSave = () => {
    const u = G.ui.plan, name = u.cName.trim();
    if (!name) { G.toast('Bitte einen Namen eingeben'); return; }
    const item = { name, group: u.cGroup };
    if (u.cMode === 'time') { item.mode = 'time'; item.hold = 60; }
    G.save(G.K.own, G.load(G.K.own, []).filter((c) => c.name !== name).concat([item]));
    addEx(name, item.group, item);
  };
})();
