// Gym your Life – Krafttraining nachtragen (für vergangene Tage)
(function () {
  const G = window.G, I = G.I, esc = G.esc;
  G.ui.nt = null;

  const loadPlan = (planId) => {
    const plan = G.plans().find((p) => p.id === planId) || G.plans()[0], last = G.load(G.K.last, {});
    return { planId: plan.id, ex: plan.exercises.map((e) => {
      const mode = e.mode === 'time' ? 'time' : 'reps', l = (last[G.exKey(e)] || []).filter(Boolean), rows = [];
      for (let i = 0; i < e.sets; i++) { const s = l[i] || l[l.length - 1]; rows.push({ kg: s ? s[0] : 0, reps: s ? s[1] : (mode === 'time' ? (e.hold || 60) : e.reps) }); }
      return { name: e.name, mode, on: true, rows };
    }) };
  };
  G.ntStart = (date) => {
    const dp = G.load(G.K.dayplan, {})[date], plans = G.plans();
    const id = plans.some((p) => p.id === dp) ? dp : G.activeId();
    G.ui.nt = Object.assign({ date }, loadPlan(id));
  };

  G.screens.nachtrag = () => {
    if (!G.ui.nt) G.ntStart(G.ymd(new Date(Date.now() - 864e5)));
    const u = G.ui.nt, today = G.ymd(new Date());
    const plans = G.plans().map((p) => `<button type="button" class="chip${p.id === u.planId ? ' on' : ''}" style="height:44px" data-a="ntPlan" data-id="${p.id}" aria-pressed="${p.id === u.planId}">${esc(p.name)}</button>`).join('');
    const ex = u.ex.map((e, i) => {
      const rows = e.on ? e.rows.map((r, j) => `<div class="row" style="gap:8px;align-items:center"><span class="small" style="width:44px">Satz ${j + 1}</span>
        ${e.mode === 'time' ? '' : `<input class="input" style="flex:1;min-width:0;text-align:center" inputmode="decimal" aria-label="kg Satz ${j + 1}" value="${r.kg ? G.fmtKg(r.kg) : ''}" placeholder="kg" data-in="ntIn" data-i="${i}" data-j="${j}" data-k="kg"><span class="muted">kg ×</span>`}
        <input class="input" style="flex:1;min-width:0;text-align:center" inputmode="numeric" aria-label="${e.mode === 'time' ? 'Sekunden' : 'Wiederholungen'} Satz ${j + 1}" value="${r.reps || ''}" placeholder="${e.mode === 'time' ? 'Sek.' : 'Wdh.'}" data-in="ntIn" data-i="${i}" data-j="${j}" data-k="reps"><span class="muted">${e.mode === 'time' ? 'Sek.' : 'Wdh.'}</span></div>`).join('')
        + `<div class="row" style="gap:8px"><button type="button" class="btn ghost sm" data-a="ntSet" data-i="${i}" data-d="1">+ Satz</button>${e.rows.length > 1 ? `<button type="button" class="btn ghost sm" data-a="ntSet" data-i="${i}" data-d="-1">− Satz</button>` : ''}</div>` : '';
      return `<div class="card" style="gap:10px;${e.on ? '' : 'opacity:.6'}"><div class="row-between"><span style="font-size:17px;font-weight:600">${esc(e.name)}</span>
        <button type="button" class="chip${e.on ? ' on' : ''}" data-a="ntOn" data-i="${i}" aria-pressed="${e.on}">${e.on ? 'gemacht' : 'nicht gemacht'}</button></div>${rows}</div>`;
    }).join('');
    return `<div class="screen">${G.header()}
      <div class="row" style="padding:0 4px"><a href="#/home" class="icon-btn" aria-label="Zurück">${I.back()}</a>
        <div style="display:flex;flex-direction:column;gap:2px"><span class="eyebrow">Für einen vergangenen Tag</span><h1 class="h1" style="font-size:34px">Training nachtragen</h1></div></div>
      <div class="card" style="border:2px solid var(--teal);border-radius:18px;padding:14px">
        <div class="field"><label class="label" for="ntdate">Datum</label>${G.dateField('ntdate', u.date, 'ntIn', 'date', today)}</div>
        <div class="field"><span class="label">Welcher Plan?</span><div class="chips">${plans}</div></div>
        <span class="small">Die Werte sind mit deinen letzten vorbelegt. Passe Gewicht und Wiederholungen an und stell bei Übungen, die du ausgelassen hast, auf „nicht gemacht“.</span>
      </div>
      ${ex}
      <div class="btns"><a href="#/home" class="btn ghost md">Abbrechen</a><button type="button" class="btn md" style="flex:2" data-a="ntSave">${I.check(18)}Training speichern</button></div>
    </div>`;
  };

  const A = G.actions, IN = G.inputs;
  IN.ntIn = (v, el) => {
    const u = G.ui.nt, k = el.dataset.k;
    if (k === 'date') { u.date = v; G.dateSync(el); return; }
    const r = u.ex[+el.dataset.i].rows[+el.dataset.j];
    r[k] = k === 'kg' ? (parseFloat(v.replace(',', '.')) || 0) : (parseInt(v, 10) || 0);
  };
  A.ntPlan = (el) => { const d = G.ui.nt.date; G.ui.nt = Object.assign({ date: d }, loadPlan(el.dataset.id)); G.render(); };
  A.ntOn = (el) => { const e = G.ui.nt.ex[+el.dataset.i]; e.on = !e.on; G.render(); };
  A.ntSet = (el) => {
    const e = G.ui.nt.ex[+el.dataset.i];
    if (+el.dataset.d > 0) e.rows.push(Object.assign({}, e.rows[e.rows.length - 1])); else if (e.rows.length > 1) e.rows.pop();
    G.render();
  };
  A.ntSave = () => {
    const u = G.ui.nt, ex = {}, modes = {};
    if (!u.date) { G.toast('Bitte ein Datum wählen'); return; }
    u.ex.forEach((e) => {
      if (!e.on) return;
      const rows = e.rows.filter((r) => r.reps > 0).map((r) => [e.mode === 'time' ? 0 : r.kg, r.reps]);
      if (!rows.length) return;
      ex[e.name] = rows; if (e.mode === 'time') modes[e.name] = 'time';
    });
    if (!Object.keys(ex).length) { G.toast('Bitte mindestens einen Satz eintragen'); return; }
    const p = G.plans().find((x) => x.id === u.planId), d = new Date(u.date + 'T12:00:00');
    const h = G.history().concat([{ date: d.toISOString(), plan: p ? p.name : 'Training', ex, modes, nachtrag: true }])
      .sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-500);
    G.save(G.K.hist, h);
    G.ui.verlauf.sel = u.date; G.ui.verlauf.month = u.date.slice(0, 7); G.ui.verlauf.calOpen = true;
    G.ui.nt = null; G.toast('Training nachgetragen'); location.hash = '#/verlauf';
  };
})();
