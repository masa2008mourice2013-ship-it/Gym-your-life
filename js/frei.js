// Gym your Life – Freies Training: nur Notizen, was man gemacht hat – ohne Plan
(function () {
  const G = window.G, I = G.I, esc = G.esc;

  G.freeEntries = () => G.load(G.K.free, []);
  const byDateDesc = (a, b) => new Date(b.date) - new Date(a.date);

  const title = (x) => { const l = x.text.split('\n')[0].trim(); return l.length > 44 ? l.slice(0, 43) + '…' : l; };
  const times = (x) => G.freeEntries().filter((y) => y.from === x.id).length;
  // Stern + "Nochmal machen" (auch im Verlauf und bei Fortschritt benutzt)
  G.freeButtons = (x) => `<div class="row" style="gap:8px"><button type="button" class="btn sec sm" data-a="frAgain" data-id="${x.id}">${I.repeat(16)}Nochmal machen</button><span class="grow"></span>
    <button type="button" class="icon-btn plain" style="color:${x.fav ? 'var(--amber)' : 'var(--muted)'}" data-a="frFav" data-id="${x.id}" aria-pressed="${!!x.fav}" aria-label="${x.fav ? 'Favorit entfernen' : 'Als Favorit speichern – hat sich gelohnt'}">${I.star(24, !!x.fav)}</button></div>`;

  // Kasten für die Startseite
  G.freeBox = () => {
    const today = G.freeEntries().filter((x) => G.daysAgo(x.date) === 0);
    const sub = today.length ? 'Heute notiert: ' + today[today.length - 1].text.replace(/\s+/g, ' ').slice(0, 60) : 'Nur kurz festhalten, was du gemacht hast – ohne Plan';
    return `<a href="#/notiz" class="card amber sm row" style="color:var(--text);text-decoration:none;min-height:64px;flex-direction:row;align-items:center">
      <span class="ico-box" style="background:var(--amber);color:var(--bg)">${I.note(22)}</span>
      <span class="grow" style="display:flex;flex-direction:column;gap:2px"><span class="h3" style="font-size:20px">Freies Training notieren</span><span class="small ellipsis">${esc(sub)}</span></span>
      <span class="muted">${I.next(20)}</span></a>`;
  };

  G.ui.free = { date: null, text: '', editId: null, del: null, from: null };

  G.screens.notiz = () => {
    const u = G.ui.free, today = G.ymd(new Date());
    if (!u.date) u.date = today;
    const all = G.freeEntries().slice().sort(byDateDesc);
    const favs = all.filter((x) => x.fav);
    const favHtml = favs.length ? `<div class="list"><h2 class="h2" style="padding:0 4px">${I.star(20, true).replace('<svg ', '<svg style="color:var(--amber);vertical-align:-3px" ')} Meine Favoriten</h2>
      <span class="tiny" style="padding:0 4px">Trainings, die dir gefallen haben. Tippen = nochmal machen.</span>
      ${favs.map((x) => { const n = times(x); return `<button type="button" class="card amber sm row" style="flex-direction:row;align-items:center;min-height:64px;text-align:left;color:var(--text)" data-a="frAgain" data-id="${x.id}">
        <span class="ico-box" style="background:var(--amber);color:var(--bg)">${I.repeat(22)}</span>
        <span class="grow" style="display:flex;flex-direction:column;gap:2px"><span class="h3 ellipsis" style="font-size:19px">${esc(title(x))}</span><span class="small">${n ? n + '× wiederholt · ' : ''}zuletzt ${G.agoText(x.date)}</span></span>
        <span class="muted">${I.next(20)}</span></button>`; }).join('')}</div>` : '';
    const list = all.map((x) => {
      const d = new Date(x.date);
      return `<div class="card" style="gap:8px">
        <div class="row-between"><span class="num" style="font-size:22px;line-height:1.05;text-transform:uppercase">${G.WDL[d.getDay()]}, ${d.getDate()}.${d.getMonth() + 1}.</span><span class="small">${G.agoText(x.date)}</span></div>
        <span style="font-size:15px;line-height:1.5;white-space:pre-wrap">${esc(x.text)}</span>
        ${G.freeButtons(x)}
        <div class="row" style="gap:8px"><button type="button" class="btn ghost sm" data-a="frEdit" data-id="${x.id}">${I.pencil(16)}Bearbeiten</button><span class="grow"></span>
          ${u.del === x.id ? `<button type="button" class="btn ghost sm" data-a="frDelCancel">Behalten</button><button type="button" class="btn danger sm" data-a="frDelDo" data-id="${x.id}">Wirklich löschen</button>`
            : `<button type="button" class="btn danger-ghost sm" data-a="frDelAsk" data-id="${x.id}">Löschen</button>`}</div></div>`;
    }).join('');
    return `<div class="screen">${G.header()}
      <div class="row" style="padding:0 4px"><a href="#/home" class="icon-btn" aria-label="Zurück zur Startseite">${I.back()}</a>
        <div style="display:flex;flex-direction:column;gap:2px"><span class="eyebrow">Ohne Plan, ohne Stress</span><h1 class="h1" style="font-size:34px">Freies Training</h1></div></div>
      ${u.editId || u.from || !favHtml ? '' : favHtml}
      <div class="card" style="border:2px solid var(--amber);border-radius:18px;padding:14px">
        <span class="h2" style="font-size:22px">${u.editId ? 'Eintrag bearbeiten' : u.from ? 'Nochmal machen' : 'Neuer Eintrag'}</span>
        ${u.from ? '<span class="small">Der Text ist aus deinem früheren Training übernommen. Passe ihn an, falls heute etwas anders war, und speichere.</span>' : ''}
        <div class="field"><label class="label" for="frdate">Datum</label>${G.dateField('frdate', u.date, 'frIn', 'date', today)}</div>
        <div class="field"><label class="label amber" for="frtext">Was hast du heute trainiert?</label>
          <textarea id="frtext" class="input" rows="6" maxlength="800" placeholder="z. B. 30 Min. Crosstrainer, Beine locker gedehnt, 3 Sätze Hip Thrust" data-in="frIn" data-k="text">${esc(u.text)}</textarea></div>
        <div class="btns">${u.editId || u.from ? '<button type="button" class="btn ghost md" data-a="frCancel">Abbrechen</button>' : ''}<button type="button" class="btn md" style="background:var(--amber);flex:2" data-a="frSave">${I.check(18)}Eintrag speichern</button></div>
      </div>
      ${u.editId || u.from ? favHtml : ''}
      ${list ? `<div class="list"><h2 class="h2" style="padding:0 4px">Deine Einträge</h2>${list}</div>` : '<div class="card empty">Noch kein Eintrag. Schreib oben auf, was du trainiert hast.</div>'}
    </div>`;
  };

  G.freeProgress = () => {
    const all = G.freeEntries().slice().sort(byDateDesc);
    if (!all.length) return '';
    const favs = all.filter((x) => x.fav).length, month = all.filter((x) => { const d = new Date(x.date), n = new Date(); return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth(); }).length;
    return `<div class="list" style="padding-top:6px"><h2 class="h2" style="padding:0 4px">Freies Training</h2>
      <div class="stats">
        <div class="stat" style="border-color:var(--amber)"><span class="num amber">${all.length}</span><span>${all.length === 1 ? 'Eintrag' : 'Einträge'}</span></div>
        <div class="stat" style="border-color:var(--amber)"><span class="num">${month}</span><span>diesen Monat</span></div>
        <div class="stat" style="border-color:var(--amber)"><span class="num amber">${favs}</span><span>${favs === 1 ? 'Favorit' : 'Favoriten'}</span></div></div>
      ${all.slice(0, 5).map((x) => { const d = new Date(x.date), n = times(x);
        return `<div class="card sm" style="gap:8px;border-color:var(--amber)"><div class="row-between"><span class="num" style="font-size:20px;line-height:1.05;text-transform:uppercase">${G.fmtD(x.date)}</span>
          <span class="small"><span class="amber" style="font-weight:600">Freies Training</span>${n ? ' · ' + n + '× wiederholt' : ''}</span></div>
          <span style="font-size:14px;line-height:1.5;white-space:pre-wrap;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${esc(x.text)}</span>${G.freeButtons(x)}</div>`; }).join('')}
      <a href="#/notiz" class="btn ghost sm" style="align-self:center">Alle Einträge ansehen</a></div>`;
  };

  const A = G.actions, IN = G.inputs;
  IN.frIn = (v, el) => { G.ui.free[el.dataset.k] = v; if (el.type === 'date') G.dateSync(el); };
  A.frSave = () => {
    const u = G.ui.free, text = u.text.trim();
    if (!text) { G.toast('Bitte erst etwas aufschreiben'); return; }
    if (!u.date) { G.toast('Bitte ein Datum wählen'); return; }
    const p = u.date.split('-').map(Number);
    const old = u.editId ? G.freeEntries().find((y) => y.id === u.editId) : null;
    const x = { id: u.editId || G.uid('f'), date: new Date(p[0], p[1] - 1, p[2], 12).toISOString(), text };
    if (old && old.fav) x.fav = true;
    if (old && old.from) x.from = old.from; else if (!u.editId && u.from) x.from = u.from;
    const list = G.freeEntries();
    const next = u.editId ? list.map((y) => (y.id === u.editId ? x : y)) : list.concat([x]);
    if (!G.save(G.K.free, next)) return;
    Object.assign(u, { date: null, text: '', editId: null, del: null, from: null }); G.toast('Eintrag gespeichert'); G.render(); window.scrollTo(0, 0);
  };
  A.frEdit = (el) => {
    const x = G.freeEntries().find((y) => y.id === el.dataset.id); if (!x) return;
    Object.assign(G.ui.free, { editId: x.id, text: x.text, date: G.ymd(new Date(x.date)), del: null, from: null }); G.render(); window.scrollTo(0, 0);
  };
  A.frFav = (el) => {
    const list = G.freeEntries().map((y) => (y.id === el.dataset.id ? Object.assign({}, y, { fav: !y.fav }) : y));
    G.save(G.K.free, list); const f = list.find((y) => y.id === el.dataset.id);
    G.toast(f && f.fav ? 'Als Favorit gespeichert' : 'Favorit entfernt'); G.render();
  };
  A.frAgain = (el) => {
    const x = G.freeEntries().find((y) => y.id === el.dataset.id); if (!x) return;
    Object.assign(G.ui.free, { editId: null, text: x.text, date: G.ymd(new Date()), del: null, from: x.from || x.id });
    if (location.hash === '#/notiz') { G.render(); window.scrollTo(0, 0); } else location.hash = '#/notiz';
  };
  A.frCancel = () => { Object.assign(G.ui.free, { date: null, text: '', editId: null, from: null }); G.render(); };
  A.frDelAsk = (el) => { G.ui.free.del = el.dataset.id; G.render(); };
  A.frDelCancel = () => { G.ui.free.del = null; G.render(); };
  A.frDelDo = (el) => { G.save(G.K.free, G.freeEntries().filter((x) => x.id !== el.dataset.id)); G.ui.free.del = null; G.toast('Eintrag gelöscht'); G.render(); };
})();
