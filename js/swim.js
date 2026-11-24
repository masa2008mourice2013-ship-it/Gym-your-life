// Gym your Life – Schwimmen: Seite zum Eintragen, Kästen für Startseite/Pläne, Bausteine für Verlauf und Fortschritt
(function () {
  const G = window.G, I = G.I, esc = G.esc;
  const TECH = ['Kraul', 'Brust', 'Rücken', 'Schmetterling', 'Lagen', 'Beinschlag', 'Armzug', 'Sonstiges'];

  // ---------- Hilfen ----------
  G.swimSessions = () => G.load(G.K.swim, []);
  G.fmtM = (m) => m.toLocaleString('de-DE') + ' m';
  G.fmtKm = (m) => (m >= 1000 ? String(Math.round(m / 10) / 100).replace('.', ',') + ' km' : m + ' m');
  const byDateDesc = (a, b) => new Date(b.date) - new Date(a.date);
  const ymd = G.ymd;
  const paceOf = (sec, dist) => G.fmtT(Math.round(sec / dist * 100));

  // Summen einer Einheit. Gesamtzeit nur, wenn für JEDEN Abschnitt eine Zeit eingetragen ist.
  const tot = (x) => {
    let dist = 0, sec = 0, pd = 0, timed = 0;
    x.blocks.forEach((b) => { dist += b.dist; if (b.sec > 0) { sec += b.sec; pd += b.dist; timed++; } });
    return { dist, time: timed === x.blocks.length && sec > 0 ? sec : 0, pace: pd ? Math.round(sec / pd * 100) : 0 };
  };

  // Die drei Kästchen oben auf einer Schwimm-Karte
  const statsRow = (t) => {
    const box = (v, l, cls) => `<span class="inset" style="display:flex;flex-direction:column;gap:2px;padding:8px 10px;border-radius:12px"><span class="num ${cls || ''}" style="font-size:22px;line-height:1">${v}</span><span style="font-size:11px;color:var(--muted)">${l}</span></span>`;
    return `<span style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;width:100%">
      ${box(G.fmtKm(t.dist), 'Strecke', 'txt-blue')}${box(t.time ? G.fmtT(t.time) : '–', 'Zeit')}${box(t.pace ? G.fmtT(t.pace) : '–', 'pro 100 m')}</span>`;
  };
  const details = (x) => `<div style="padding:0 14px 14px;display:flex;flex-direction:column;gap:6px">
    ${x.blocks.map((b) => `<div class="inset" style="display:grid;grid-template-columns:1fr auto;gap:4px 10px;padding:10px 12px;border-radius:12px">
      <span style="font-size:15px;font-weight:600">${esc(b.tech)}</span><span class="num" style="font-size:18px">${G.fmtM(b.dist)}</span>
      <span style="grid-column:1/-1;font-size:13px;color:var(--muted2)">${b.sec > 0 ? G.fmtT(b.sec) + ' · ' + paceOf(b.sec, b.dist) + ' pro 100 m' : 'keine Zeit eingetragen'}</span></div>`).join('')}
    ${x.notes ? `<div class="inset" style="padding:10px 12px;border-radius:12px;display:flex;flex-direction:column;gap:4px"><span class="label amber">Notiz</span><span style="font-size:14px;line-height:1.5;white-space:pre-wrap">${esc(x.notes)}</span></div>` : ''}</div>`;

  // Eine Schwimm-Karte (wird auf der Schwimm-Seite und im Verlauf benutzt)
  // o: { open, toggle (Attribute fürs Aufklappen), more (HTML unter den Details) }
  G.swimCard = (x, o) => {
    const t = tot(x), d = new Date(x.date), n = x.blocks.length;
    return `<div class="card" style="padding:0;gap:0;${o.open ? 'border:2px solid var(--blue)' : ''}">
      ${o.toggle ? `<button type="button" class="link-area" style="padding:14px 14px 12px;gap:10px" ${o.toggle} aria-expanded="${o.open}">` : '<div class="link-area" style="padding:14px 14px 12px;gap:10px;cursor:default">'}
        <span class="row-between" style="width:100%"><span style="display:flex;flex-direction:column;gap:2px"><span class="num" style="font-size:24px;line-height:1.05;text-transform:uppercase">${G.WDL[d.getDay()]}, ${d.getDate()}.${d.getMonth() + 1}.</span>
          <span class="small"><span class="txt-blue" style="font-weight:600">Schwimmen</span> · ${n} ${n === 1 ? 'Abschnitt' : 'Abschnitte'} · ${G.agoText(x.date)}</span></span><span class="muted">${o.open ? I.up(20) : I.down(20)}</span></span>
        ${statsRow(t)}
      ${o.toggle ? '</button>' : '</div>'}
      ${o.open ? details(x) + (o.more || '') : ''}
    </div>`;
  };

  // ---------- Kästen für Startseite und Pläne ----------
  G.swimSaturdayBox = () => {
    if (new Date().getDay() !== 6) return '';
    const today = G.swimSessions().filter((x) => G.daysAgo(x.date) === 0);
    const done = today.length > 0, m = today.reduce((s, x) => s + tot(x).dist, 0);
    return `<a href="#/schwimmen" ${done ? '' : 'data-a="swNew"'} class="card blue" style="color:var(--text);text-decoration:none;flex-direction:row;align-items:center;gap:12px;min-height:76px">
      <span class="ico-box blue">${I.swim(24)}</span>
      <span class="grow" style="display:flex;flex-direction:column;gap:2px"><span class="label txt-blue" style="font-size:12px">Heute ist Samstag</span>
        <span class="num" style="font-size:26px;line-height:1.05;text-transform:uppercase">${done ? 'Schwimmen eingetragen' : 'Schwimmen gehen'}</span>
        <span class="small">${done ? G.fmtM(m) + ' heute – tippen zum Ansehen' : 'Strecke, Zeit und Technik eintragen'}</span></span>
      <span class="muted">${I.next(20)}</span></a>`;
  };
  G.swimPlanBox = () => {
    const all = G.swimSessions().slice().sort(byDateDesc), n = all.length;
    const sub = n ? `${n} ${n === 1 ? 'Einheit' : 'Einheiten'} · zuletzt ${G.agoText(all[0].date)}` : 'Strecke, Zeit und Technik eintragen';
    return `<div class="plan-card blue">
      <span class="ico-box">${I.swim(22)}</span>
      <a href="#/schwimmen" class="link-area" aria-label="Schwimmen öffnen"><span class="h3 ellipsis">Schwimmen</span><span class="small">${sub}</span></a>
      <a href="#/schwimmen" class="play blue" aria-label="Schwimmen öffnen">${I.arrowRight(18)}</a>
    </div>`;
  };

  // ---------- Schwimm-Seite ----------
  G.ui.swim = { form: false, editId: null, f: null, open: null, del: null };
  const blk = (o) => Object.assign({ id: G.uid('b'), tech: 'Kraul', dist: '', min: '', sec: '' }, o || {});
  const freshForm = () => ({ date: ymd(new Date()), notes: '', blocks: [blk()] });

  G.screens.schwimmen = () => {
    const u = G.ui.swim, all = G.swimSessions().slice().sort(byDateDesc);
    const totalM = all.reduce((s, x) => s + tot(x).dist, 0);
    const stats = all.length ? `<div class="stats">
      <div class="stat"><span class="num txt-blue">${all.length}</span><span>${all.length === 1 ? 'Einheit' : 'Einheiten'}</span></div>
      <div class="stat"><span class="num">${G.fmtKm(totalM)}</span><span>geschwommen</span></div>
      <div class="stat"><span class="num">${G.fmtKm(Math.round(totalM / all.length))}</span><span>pro Einheit</span></div></div>` : '';

    let form;
    if (u.form) {
      const f = u.f;
      const blocks = f.blocks.map((b, i) => `<div class="card sm" style="gap:10px;background:var(--bg)">
        <div class="row-between"><span class="label txt-blue">Abschnitt ${i + 1}</span>
          <div class="row" style="gap:2px"><button type="button" class="btn ghost sm" data-a="swDup" data-id="${b.id}">Kopieren</button>
          ${f.blocks.length > 1 ? `<button type="button" class="icon-btn plain" style="color:var(--coral)" data-a="swRemove" data-id="${b.id}" aria-label="Abschnitt ${i + 1} entfernen">${I.trash(18)}</button>` : ''}</div></div>
        <div class="field"><span class="label">Technik</span><div class="chips">${TECH.map((t) => `<button type="button" class="chip b${b.tech === t ? ' on' : ''}" style="height:44px" data-a="swTech" data-id="${b.id}" data-v="${t}" aria-pressed="${b.tech === t}">${t}</button>`).join('')}</div></div>
        <div style="display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr) minmax(0,1fr);gap:8px">
          <div class="field"><label class="label" for="swd-${b.id}">Strecke (m)</label><input id="swd-${b.id}" class="input" inputmode="numeric" pattern="[0-9]*" maxlength="5" value="${esc(b.dist)}" placeholder="z. B. 400" data-in="swB" data-id="${b.id}" data-k="dist"></div>
          <div class="field"><label class="label" for="swm-${b.id}">Min</label><input id="swm-${b.id}" class="input" inputmode="numeric" pattern="[0-9]*" maxlength="3" value="${esc(b.min)}" placeholder="0" data-in="swB" data-id="${b.id}" data-k="min"></div>
          <div class="field"><label class="label" for="sws-${b.id}">Sek</label><input id="sws-${b.id}" class="input" inputmode="numeric" pattern="[0-9]*" maxlength="2" value="${esc(b.sec)}" placeholder="0" data-in="swB" data-id="${b.id}" data-k="sec"></div>
        </div></div>`).join('');
      form = `<div class="card pop" style="border:2px solid var(--blue);border-radius:18px;padding:14px">
        <span class="h2" style="font-size:22px">${u.editId ? 'Einheit bearbeiten' : 'Neue Einheit'}</span>
        <div class="field"><label class="label" for="swdate">Datum</label>${G.dateField('swdate', f.date, 'swF', 'date')}</div>
        ${blocks}
        <button type="button" class="btn dashed blue" style="height:52px;font-size:15px" data-a="swAdd">${I.plus(18)}Weiteren Abschnitt hinzufügen</button>
        <span class="tiny">Ein Abschnitt = eine Strecke mit einer Technik, z. B. 400 m Kraul in 7:30. Die Zeit ist freiwillig.</span>
        <div class="field"><label class="label amber" for="swnotes">Notizen (optional)</label><textarea id="swnotes" class="input" rows="3" maxlength="400" placeholder="z. B. Atmung links, Armzug länger ziehen" data-in="swF" data-k="notes">${esc(f.notes)}</textarea></div>
        <div class="btns"><button type="button" class="btn ghost md" data-a="swCancel">Abbrechen</button><button type="button" class="btn blue md" style="flex:2" data-a="swSave">Einheit speichern</button></div>
      </div>`;
    } else {
      form = `<button type="button" class="btn dashed blue" style="height:56px;font-size:15px" data-a="swNew">${I.plus(18)}Neue Einheit eintragen</button>`;
    }

    const cards = all.map((x) => {
      const open = u.open === x.id;
      const more = `<div class="row" style="padding:0 14px 14px;gap:8px">
        <button type="button" class="btn sec sm" data-a="swEdit" data-id="${x.id}">${I.pencil(16)}Bearbeiten</button><span class="grow"></span>
        ${u.del === x.id ? `<button type="button" class="btn ghost sm" data-a="swDelCancel">Behalten</button><button type="button" class="btn danger sm" data-a="swDelDo" data-id="${x.id}">Wirklich löschen</button>`
          : `<button type="button" class="btn danger-ghost sm" data-a="swDelAsk" data-id="${x.id}">Löschen</button>`}</div>`;
      return G.swimCard(x, { open, toggle: `data-a="swToggle" data-id="${x.id}"`, more });
    }).join('');

    return `<div class="screen">${G.header()}
      <div class="row" style="padding:0 4px"><a href="#/home" class="icon-btn" aria-label="Zurück zur Startseite">${I.back()}</a>
        <div style="display:flex;flex-direction:column;gap:2px"><span class="eyebrow">Dein Schwimmtraining</span><h1 class="h1" style="font-size:34px">Schwimmen</h1></div></div>
      ${stats}
      ${form}
      ${cards || (u.form ? '' : '<div class="card empty">Noch keine Einheit eingetragen. Tippe oben auf „Neue Einheit eintragen“.</div>')}
    </div>`;
  };

  // ---------- Aktionen ----------
  const A = G.actions, IN = G.inputs, u = () => G.ui.swim;
  const blockOf = (id) => u().f.blocks.find((b) => b.id === id);
  A.swNew = () => { const s = u(); s.form = true; s.editId = null; s.f = freshForm(); s.del = null; if (G.route === 'schwimmen') G.render(); };
  A.swCancel = () => { u().form = false; u().editId = null; G.render(); };
  A.swToggle = (el) => { const s = u(); s.open = s.open === el.dataset.id ? null : el.dataset.id; s.del = null; G.render(); };
  A.swAdd = () => { u().f.blocks.push(blk()); G.render(); };
  A.swDup = (el) => {
    const f = u().f, i = f.blocks.findIndex((b) => b.id === el.dataset.id);
    f.blocks.splice(i + 1, 0, blk({ tech: f.blocks[i].tech, dist: f.blocks[i].dist, min: f.blocks[i].min, sec: f.blocks[i].sec })); G.render();
  };
  A.swRemove = (el) => { const f = u().f; if (f.blocks.length > 1) f.blocks = f.blocks.filter((b) => b.id !== el.dataset.id); G.render(); };
  A.swTech = (el) => { blockOf(el.dataset.id).tech = el.dataset.v; G.render(); };
  IN.swF = (v, el) => { u().f[el.dataset.k] = v; if (el.type === 'date') G.dateSync(el); };
  IN.swB = (v, el) => { blockOf(el.dataset.id)[el.dataset.k] = v.replace(/\D/g, ''); };

  A.swEdit = (el) => {
    const x = G.swimSessions().find((y) => y.id === el.dataset.id); if (!x) return;
    const s = u(); s.form = true; s.editId = x.id; s.del = null;
    s.f = { date: ymd(new Date(x.date)), notes: x.notes || '', blocks: x.blocks.map((b) => blk({ tech: b.tech, dist: String(b.dist), min: b.sec ? String(Math.floor(b.sec / 60)) : '', sec: b.sec ? String(b.sec % 60) : '' })) };
    G.render(); window.scrollTo(0, 0);
  };
  A.swSave = () => {
    const s = u(), f = s.f;
    if (!f.date) { G.toast('Bitte ein Datum wählen'); return; }
    let missing = false;
    const blocks = [];
    f.blocks.forEach((b) => {
      const dist = parseInt(b.dist, 10) || 0, sec = (parseInt(b.min, 10) || 0) * 60 + (parseInt(b.sec, 10) || 0);
      if (dist > 0) blocks.push({ tech: b.tech, dist, sec });
      else if (sec > 0) missing = true;
    });
    if (missing) { G.toast('Bitte bei jedem Abschnitt die Strecke eintragen'); return; }
    if (!blocks.length) { G.toast('Bitte mindestens eine Strecke eintragen'); return; }
    const p = f.date.split('-').map(Number);
    const x = { id: s.editId || G.uid('s'), date: new Date(p[0], p[1] - 1, p[2], 12).toISOString(), blocks, notes: f.notes.trim() };
    const list = G.swimSessions();
    const next = s.editId ? list.map((y) => (y.id === s.editId ? x : y)) : list.concat([x]);
    if (!G.save(G.K.swim, next)) return;
    s.form = false; s.editId = null; s.open = x.id; G.toast('Einheit gespeichert'); G.render();
  };
  A.swDelAsk = (el) => { u().del = el.dataset.id; G.render(); };
  A.swDelCancel = () => { u().del = null; G.render(); };
  A.swDelDo = (el) => { G.save(G.K.swim, G.swimSessions().filter((x) => x.id !== el.dataset.id)); u().del = null; u().open = null; G.toast('Einheit gelöscht'); G.render(); };

  // ---------- Bereich für die Fortschritt-Seite ----------
  G.swimProgress = () => {
    const all = G.swimSessions().slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    if (!all.length) return '';
    const techs = {};
    let totalM = 0;
    all.forEach((x) => x.blocks.forEach((b) => {
      totalM += b.dist;
      const t = techs[b.tech] || (techs[b.tech] = { name: b.tech, dist: 0, n: 0, best: null, bestDate: '' });
      t.dist += b.dist; t.n++;
      if (b.sec > 0 && b.dist >= 50) { const p = Math.round(b.sec / b.dist * 100); if (t.best === null || p < t.best) { t.best = p; t.bestDate = x.date; } }
    }));
    const list = Object.keys(techs).map((k) => techs[k]).sort((a, b) => b.dist - a.dist);
    const last = all.slice(-8), vals = last.map((x) => tot(x).dist), maxV = Math.max.apply(null, vals), minV = Math.min.apply(null, vals);
    const bars = last.map((x, i) => {
      const h = maxV === minV ? 80 : 25 + Math.round((vals[i] - minV) / (maxV - minV) * 55), lst = i === last.length - 1;
      return `<div style="flex:1;min-width:0;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px"><span class="num" style="font-size:14px;color:${lst ? 'var(--blue)' : 'var(--muted)'}">${String(Math.round(vals[i] / 100) / 10).replace('.', ',')}</span><div style="width:100%;height:${h}%;border-radius:6px 6px 0 0;background:${lst ? 'var(--blue)' : 'var(--blue-deep)'}"></div></div>`;
    }).join('');
    const labels = last.map((x) => `<span style="flex:1;min-width:0;text-align:center;font-size:11px;color:var(--muted)">${G.fmtD(x.date)}</span>`).join('');
    const rows = list.map((t) => `<div class="card sm row" style="flex-direction:row;align-items:center;gap:12px;min-height:60px">
      <span class="grow" style="display:flex;flex-direction:column;gap:2px"><span style="font-size:15px;font-weight:600">${esc(t.name)}</span><span style="font-size:12px;color:var(--muted)">${G.fmtKm(t.dist)} · ${t.n}× geschwommen</span></span>
      <span style="display:flex;flex-direction:column;align-items:flex-end;gap:2px">${t.best !== null ? `<span class="num amber" style="font-size:22px;line-height:1">${G.fmtT(t.best)} / 100 m</span><span style="font-size:12px;color:var(--muted)">Bestes Tempo · ${G.fmtD(t.bestDate)}</span>` : `<span style="font-size:12px;color:var(--muted)">noch kein Tempo</span>`}</span></div>`).join('');
    return `<div class="list">
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">
        <div class="card blue sm" style="gap:6px"><span class="label txt-blue" style="font-size:12px">Einheiten</span><span class="num" style="font-size:28px;line-height:1">${all.length}</span><span class="tiny">zuletzt ${G.agoText(all[all.length - 1].date)}</span></div>
        <div class="card blue sm" style="gap:6px"><span class="label txt-blue" style="font-size:12px">Geschwommen</span><span class="num" style="font-size:28px;line-height:1">${G.fmtKm(totalM)}</span><span class="tiny">insgesamt</span></div>
      </div>
      <div class="card" style="gap:8px"><div class="row-between"><span class="label" style="font-size:12px">Strecke pro Einheit (km)</span></div>
        <div style="display:flex;align-items:flex-end;gap:8px;height:110px">${bars}</div>
        <div style="display:flex;gap:8px;border-top:1px solid var(--line);padding-top:6px">${labels}</div></div>
      ${rows}
      <span class="tiny" style="padding:0 4px">Tempo = Zeit pro 100 m, nur Abschnitte ab 50 m mit eingetragener Zeit. Gelb = schnellstes Tempo pro Technik.</span></div>`;
  };
})();
