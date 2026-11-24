// Gym your Life – Freies Training: dokumentieren, was man gemacht hat – auch wenn es jedes Mal etwas anderes ist
(function () {
  const G = window.G, I = G.I, esc = G.esc;
  const ACTS = ['Krafttraining', 'Laufen', 'Radfahren', 'Wandern', 'Yoga', 'Dehnen', 'Crosstrainer', 'Tanzen', 'Ballsport', 'Sonstiges'];
  const FEEL = ['Locker', 'Leicht', 'Mittel', 'Hart', 'Sehr hart'];
  const byDateDesc = (a, b) => new Date(b.date) - new Date(a.date);

  G.freeEntries = () => G.load(G.K.free, []);
  const myActs = () => ACTS.concat(G.load(G.K.acts, []).filter((a) => ACTS.indexOf(a) === -1));
  const actsOf = (x) => (x.acts && x.acts.length ? x.acts : ['Sonstiges']);
  const title = (x) => {
    if (x.acts && x.acts.length) return x.acts.join(' · ');
    const l = (x.text || '').split('\n')[0].trim(); return l.length > 44 ? l.slice(0, 43) + '…' : l || 'Freies Training';
  };
  const times = (x) => G.freeEntries().filter((y) => y.from === x.id).length;
  G.freeTitle = title;

  // Inhalt eines Eintrags: Aktivitäten, Dauer, Anstrengung, Notiz
  G.freeBody = (x) => {
    const chips = (x.acts || []).map((a) => `<span style="border:1px solid var(--amber);color:var(--amber);border-radius:999px;padding:3px 10px;font-size:13px;font-weight:600">${esc(a)}</span>`).join('');
    const meta = [x.min ? x.min + ' Min.' : '', x.feel ? 'Anstrengung: ' + FEEL[x.feel - 1] : ''].filter(Boolean).join(' · ');
    return `${chips ? `<div class="row" style="flex-wrap:wrap;gap:6px">${chips}</div>` : ''}${meta ? `<span class="small" style="font-size:14px">${meta}</span>` : ''}${x.text ? `<span style="font-size:15px;line-height:1.5;white-space:pre-wrap">${esc(x.text)}</span>` : ''}`;
  };
  // Stern + "Nochmal machen"
  G.freeButtons = (x) => `<div class="row" style="gap:8px"><button type="button" class="btn sec sm" data-a="frAgain" data-id="${x.id}">${I.repeat(16)}Nochmal machen</button><span class="grow"></span>
    <button type="button" class="icon-btn plain" style="color:${x.fav ? 'var(--amber)' : 'var(--muted)'}" data-a="frFav" data-id="${x.id}" aria-pressed="${!!x.fav}" aria-label="${x.fav ? 'Favorit entfernen' : 'Als Favorit speichern – hat sich gelohnt'}">${I.star(24, !!x.fav)}</button></div>`;
  // Ganze Karte (Verlauf, Tagesansicht, Fortschritt)
  G.freeCard = (x, o) => { o = o || {}; const d = new Date(x.date), n = times(x);
    return `<div class="card${o.sm ? ' sm' : ''}" style="gap:8px;border-color:var(--amber)"><div class="row-between"><span style="display:flex;flex-direction:column;gap:2px"><span class="num" style="font-size:${o.sm ? 20 : 24}px;line-height:1.05;text-transform:uppercase">${G.WDL[d.getDay()]}, ${d.getDate()}.${d.getMonth() + 1}.</span>
      <span class="small"><span class="amber" style="font-weight:600">Freies Training</span>${x.fav ? ' · Favorit' : ''}${n ? ' · ' + n + '× wiederholt' : ''} · ${G.agoText(x.date)}</span></span>
      <a href="#/notiz" class="icon-btn plain" style="color:var(--muted)" aria-label="Alle freien Einträge ansehen oder bearbeiten">${I.pencil(20)}</a></div>
      ${G.freeBody(x)}${G.freeButtons(x)}</div>`; };

  // Kasten für die Startseite
  G.freeBox = () => {
    const today = G.freeEntries().filter((x) => G.daysAgo(x.date) === 0);
    const sub = today.length ? 'Heute notiert: ' + title(today[today.length - 1]) : 'Festhalten, was du gemacht hast – ohne Plan';
    return `<a href="#/notiz" class="card amber sm row" style="color:var(--text);text-decoration:none;min-height:64px;flex-direction:row;align-items:center">
      <span class="ico-box" style="background:var(--amber);color:var(--bg)">${I.note(22)}</span>
      <span class="grow" style="display:flex;flex-direction:column;gap:2px"><span class="h3" style="font-size:20px">Freies Training notieren</span><span class="small ellipsis">${esc(sub)}</span></span>
      <span class="muted">${I.next(20)}</span></a>`;
  };

  // ---------- Seite ----------
  const blank = () => ({ date: null, text: '', acts: [], min: '', feel: 0, newAct: '', editId: null, del: null, from: null });
  G.ui.free = blank();
  G.freeStart = (date) => { G.ui.free = blank(); G.ui.free.date = date; };

  G.screens.notiz = () => {
    const u = G.ui.free, today = G.ymd(new Date());
    if (!u.date) u.date = today;
    const all = G.freeEntries().slice().sort(byDateDesc);
    const favs = all.filter((x) => x.fav);
    const favHtml = favs.length ? `<div class="list"><h2 class="h2" style="padding:0 4px">${I.star(20, true).replace('<svg ', '<svg style="color:var(--amber);vertical-align:-3px" ')} Meine Favoriten</h2>
      <span class="tiny" style="padding:0 4px">Trainings, die dir gefallen haben. Tippen = nochmal machen.</span>
      ${favs.map((x) => { const n = times(x); return `<button type="button" class="card amber sm row" style="flex-direction:row;align-items:center;min-height:64px;text-align:left;color:var(--text)" data-a="frAgain" data-id="${x.id}">
        <span class="ico-box" style="background:var(--amber);color:var(--bg)">${I.repeat(22)}</span>
        <span class="grow" style="display:flex;flex-direction:column;gap:2px"><span class="h3 ellipsis" style="font-size:19px">${esc(title(x))}</span><span class="small">${x.min ? x.min + ' Min. · ' : ''}${n ? n + '× wiederholt · ' : ''}zuletzt ${G.agoText(x.date)}</span></span>
        <span class="muted">${I.next(20)}</span></button>`; }).join('')}</div>` : '';
    const list = all.map((x) => `<div class="card" style="gap:8px">
        <div class="row-between"><span class="num" style="font-size:22px;line-height:1.05;text-transform:uppercase">${G.WDL[new Date(x.date).getDay()]}, ${new Date(x.date).getDate()}.${new Date(x.date).getMonth() + 1}.</span><span class="small">${G.agoText(x.date)}</span></div>
        ${G.freeBody(x)}
        ${G.freeButtons(x)}
        <div class="row" style="gap:8px"><button type="button" class="btn ghost sm" data-a="frEdit" data-id="${x.id}">${I.pencil(16)}Bearbeiten</button><span class="grow"></span>
          ${u.del === x.id ? `<button type="button" class="btn ghost sm" data-a="frDelCancel">Behalten</button><button type="button" class="btn danger sm" data-a="frDelDo" data-id="${x.id}">Wirklich löschen</button>`
            : `<button type="button" class="btn danger-ghost sm" data-a="frDelAsk" data-id="${x.id}">Löschen</button>`}</div></div>`).join('');
    const chips = myActs().map((a) => { const on = u.acts.indexOf(a) !== -1; return `<button type="button" class="chip${on ? ' on' : ''}" style="height:44px;${on ? 'border-color:var(--amber);background:var(--amber-soft,#3a2d0c);color:var(--amber)' : ''}" data-a="frAct" data-v="${esc(a)}" aria-pressed="${on}">${esc(a)}</button>`; }).join('');
    const feel = FEEL.map((f, i) => { const on = u.feel === i + 1; return `<button type="button" class="chip${on ? ' on' : ''}" style="height:44px;flex:1;min-width:0;padding:0 4px;font-size:13px;${on ? 'border-color:var(--amber);background:var(--amber-soft,#3a2d0c);color:var(--amber)' : ''}" data-a="frFeel" data-v="${i + 1}" aria-pressed="${on}">${f}</button>`; }).join('');
    return `<div class="screen">${G.header()}
      <div class="row" style="padding:0 4px"><a href="#/home" class="icon-btn" aria-label="Zurück zur Startseite">${I.back()}</a>
        <div style="display:flex;flex-direction:column;gap:2px"><span class="eyebrow">Ohne Plan, ohne Stress</span><h1 class="h1" style="font-size:34px">Freies Training</h1></div></div>
      ${u.editId || u.from || !favHtml ? '' : favHtml}
      <div class="card" style="border:2px solid var(--amber);border-radius:18px;padding:14px">
        <span class="h2" style="font-size:22px">${u.editId ? 'Eintrag bearbeiten' : u.from ? 'Nochmal machen' : 'Neuer Eintrag'}</span>
        ${u.from ? '<span class="small">Alles ist aus deinem früheren Training übernommen. Passe es an, falls heute etwas anders war, und speichere.</span>' : ''}
        <div class="field"><label class="label" for="frdate">Datum</label>${G.dateField('frdate', u.date, 'frIn', 'date', today)}</div>
        <div class="field"><span class="label">Was hast du gemacht? (mehrere möglich)</span><div class="chips">${chips}</div>
          <div class="row" style="gap:8px;margin-top:4px"><input id="fract" class="input" style="flex:1;min-width:0" maxlength="20" placeholder="Andere Aktivität, z. B. Klettern" value="${esc(u.newAct)}" data-in="frIn" data-k="newAct" data-enter="frActAdd" aria-label="Andere Aktivität"><button type="button" class="btn sec md" style="width:auto;padding:0 16px" data-a="frActAdd">Hinzufügen</button></div></div>
        <div class="field"><label class="label" for="frmin">Wie lange? (Minuten, optional)</label><input id="frmin" class="input" inputmode="numeric" pattern="[0-9]*" maxlength="3" placeholder="z. B. 45" value="${esc(u.min)}" data-in="frIn" data-k="min"></div>
        <div class="field"><span class="label">Wie anstrengend? (optional)</span><div class="row" style="gap:6px">${feel}</div></div>
        <div class="field"><label class="label amber" for="frtext">Notizen (optional)</label>
          <textarea id="frtext" class="input" rows="4" maxlength="800" placeholder="z. B. 5 km locker, danach 3 Sätze Hip Thrust" data-in="frIn" data-k="text">${esc(u.text)}</textarea></div>
        <div class="btns">${u.editId || u.from ? '<button type="button" class="btn ghost md" data-a="frCancel">Abbrechen</button>' : ''}<button type="button" class="btn md" style="background:var(--amber);flex:2" data-a="frSave">${I.check(18)}Eintrag speichern</button></div>
      </div>
      ${u.editId || u.from ? favHtml : ''}
      ${list ? `<div class="list"><h2 class="h2" style="padding:0 4px">Deine Einträge</h2>${list}</div>` : '<div class="card empty">Noch kein Eintrag. Wähle oben aus, was du gemacht hast.</div>'}
    </div>`;
  };

  // ---------- Aktionen ----------
  const A = G.actions, IN = G.inputs, U = () => G.ui.free;
  IN.frIn = (v, el) => {
    const k = el.dataset.k;
    U()[k] = k === 'min' ? v.replace(/\D/g, '') : v;
    if (el.type === 'date') G.dateSync(el);
  };
  A.frAct = (el) => { const u = U(), a = el.dataset.v, i = u.acts.indexOf(a); if (i === -1) u.acts.push(a); else u.acts.splice(i, 1); G.render(); };
  A.frFeel = (el) => { const u = U(), v = +el.dataset.v; u.feel = u.feel === v ? 0 : v; G.render(); };
  A.frActAdd = () => {
    const u = U(), a = u.newAct.trim();
    if (!a) { G.toast('Bitte erst eine Aktivität eintippen'); return; }
    const known = myActs().find((x) => x.toLowerCase() === a.toLowerCase()), name = known || a;
    if (!known) G.save(G.K.acts, G.load(G.K.acts, []).concat([name]));
    if (u.acts.indexOf(name) === -1) u.acts.push(name);
    u.newAct = ''; G.render();
  };
  A.frSave = () => {
    const u = U(), text = u.text.trim();
    if (!u.acts.length && !text) { G.toast('Bitte eine Aktivität wählen oder etwas aufschreiben'); return; }
    if (!u.date) { G.toast('Bitte ein Datum wählen'); return; }
    const p = u.date.split('-').map(Number);
    const old = u.editId ? G.freeEntries().find((y) => y.id === u.editId) : null;
    const x = { id: u.editId || G.uid('f'), date: new Date(p[0], p[1] - 1, p[2], 12).toISOString(), text, acts: u.acts.slice() };
    if (+u.min > 0) x.min = Math.min(+u.min, 999);
    if (u.feel) x.feel = u.feel;
    if (old && old.fav) x.fav = true;
    if (old && old.from) x.from = old.from; else if (!u.editId && u.from) x.from = u.from;
    const list = G.freeEntries();
    const next = u.editId ? list.map((y) => (y.id === u.editId ? x : y)) : list.concat([x]);
    if (!G.save(G.K.free, next)) return;
    G.ui.free = blank(); G.toast('Eintrag gespeichert'); G.render(); window.scrollTo(0, 0);
  };
  const load = (x, extra) => Object.assign(blank(), { text: x.text || '', acts: (x.acts || []).slice(), min: x.min ? String(x.min) : '', feel: x.feel || 0 }, extra);
  A.frEdit = (el) => {
    const x = G.freeEntries().find((y) => y.id === el.dataset.id); if (!x) return;
    G.ui.free = load(x, { editId: x.id, date: G.ymd(new Date(x.date)) }); G.render(); window.scrollTo(0, 0);
  };
  A.frAgain = (el) => {
    const x = G.freeEntries().find((y) => y.id === el.dataset.id); if (!x) return;
    G.ui.free = load(x, { date: G.ymd(new Date()), from: x.from || x.id });
    if (location.hash === '#/notiz') { G.render(); window.scrollTo(0, 0); } else location.hash = '#/notiz';
  };
  A.frFav = (el) => {
    const list = G.freeEntries().map((y) => (y.id === el.dataset.id ? Object.assign({}, y, { fav: !y.fav }) : y));
    G.save(G.K.free, list); const f = list.find((y) => y.id === el.dataset.id);
    G.toast(f && f.fav ? 'Als Favorit gespeichert' : 'Favorit entfernt'); G.render();
  };
  A.frCancel = () => { G.ui.free = blank(); G.render(); };
  A.frDelAsk = (el) => { U().del = el.dataset.id; G.render(); };
  A.frDelCancel = () => { U().del = null; G.render(); };
  A.frDelDo = (el) => { G.save(G.K.free, G.freeEntries().filter((x) => x.id !== el.dataset.id)); U().del = null; G.toast('Eintrag gelöscht'); G.render(); };

  // ---------- Bereich für die Fortschritt-Seite ----------
  G.freeProgress = () => {
    const all = G.freeEntries().slice().sort(byDateDesc);
    if (!all.length) return '';
    const ws = G.weekStart(new Date()), favs = all.filter((x) => x.fav).length;
    const minWeek = all.filter((x) => new Date(x.date) >= ws).reduce((s, x) => s + (x.min || 0), 0);
    const totalMin = all.reduce((s, x) => s + (x.min || 0), 0);
    // Wofür habe ich meine Zeit genutzt?
    const by = {};
    all.forEach((x) => actsOf(x).forEach((a) => { const o = by[a] || (by[a] = { name: a, n: 0, min: 0, last: x.date }); o.n++; o.min += x.min || 0; if (new Date(x.date) > new Date(o.last)) o.last = x.date; }));
    const rows = Object.keys(by).map((k) => by[k]).sort((a, b) => b.n - a.n || b.min - a.min);
    const maxN = rows[0].n;
    const actRows = rows.map((r) => `<div style="display:flex;flex-direction:column;gap:5px"><div class="row-between"><span style="font-size:15px;font-weight:600">${esc(r.name)}</span><span class="small">${r.n}×${r.min ? ' · ' + r.min + ' Min.' : ''}</span></div>
      <div style="height:10px;border-radius:6px;background:var(--card2)"><div style="height:100%;width:${Math.max(8, Math.round(r.n / maxN * 100))}%;border-radius:6px;background:var(--amber)"></div></div></div>`).join('');
    // Letzte 6 Wochen
    const useMin = totalMin > 0, wk = [];
    for (let i = 5; i >= 0; i--) { const a = new Date(ws); a.setDate(a.getDate() - 7 * i); const b = new Date(a); b.setDate(b.getDate() + 7);
      const inW = all.filter((x) => { const d = new Date(x.date); return d >= a && d < b; });
      wk.push({ v: useMin ? inW.reduce((s, x) => s + (x.min || 0), 0) : inW.length, d: G.pad(a.getDate()) + '.' + G.pad(a.getMonth() + 1) + '.', cur: i === 0 }); }
    const maxW = Math.max.apply(null, wk.map((w) => w.v).concat([1]));
    const bars = wk.map((w) => `<div style="flex:1;min-width:0;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px"><span class="num" style="font-size:13px;color:${w.cur ? 'var(--amber)' : 'var(--muted)'}">${w.v || ''}</span><div style="width:100%;height:${w.v ? Math.max(8, Math.round(w.v / maxW * 80)) : 3}%;border-radius:6px 6px 0 0;background:${w.cur ? 'var(--amber)' : 'var(--line)'}"></div></div>`).join('');
    return `<div class="list" style="padding-top:6px"><h2 class="h2" style="padding:0 4px">Freies Training</h2>
      <div class="stats">
        <div class="stat" style="border-color:var(--amber)"><span class="num amber">${all.length}</span><span>${all.length === 1 ? 'Eintrag' : 'Einträge'}</span></div>
        <div class="stat" style="border-color:var(--amber)"><span class="num">${minWeek}</span><span>Min. diese Woche</span></div>
        <div class="stat" style="border-color:var(--amber)"><span class="num amber">${rows.length}</span><span>${rows.length === 1 ? 'Aktivität' : 'Aktivitäten'}</span></div></div>
      <div class="card" style="gap:12px"><span class="label" style="font-size:12px">Was ich so mache</span>${actRows}</div>
      <div class="card" style="gap:8px"><span class="label" style="font-size:12px">${useMin ? 'Aktive Minuten' : 'Einträge'} pro Woche</span>
        <div style="display:flex;align-items:flex-end;gap:8px;height:100px">${bars}</div>
        <div style="display:flex;gap:8px;border-top:1px solid var(--line);padding-top:6px">${wk.map((w) => `<span style="flex:1;min-width:0;text-align:center;font-size:11px;color:var(--muted)">${w.d}</span>`).join('')}</div></div>
      ${all.slice(0, 3).map((x) => G.freeCard(x, { sm: true })).join('')}
      <a href="#/notiz" class="btn ghost sm" style="align-self:center">Alle Einträge ansehen${favs ? ' · ' + favs + (favs === 1 ? ' Favorit' : ' Favoriten') : ''}</a></div>`;
  };
})();
