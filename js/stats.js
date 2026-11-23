// Gym your Life – Verlauf und Fortschritt
(function () {
  const G = window.G, I = G.I, esc = G.esc;
  const isTimeEx = (x, name) => x.modes && x.modes[name] === 'time';

  // ---------- Verlauf ----------
  G.ui.verlauf = { openIdx: 0 };
  G.screens.verlauf = () => {
    const all = G.history(), swims = G.swimSessions(), frees = G.freeEntries();
    if (!all.length && !swims.length && !frees.length) return `<div class="screen with-nav">${G.header()}
      <div class="title-block"><span class="eyebrow">Deine letzten 5 Trainings</span><h1 class="h1">Verlauf</h1></div>
      <div class="card empty">Hier erscheinen deine Trainings, sobald du das erste mit „Beenden“ abgeschlossen hast.<br><br><a href="#/home" class="btn" style="margin-top:8px">Zum Training</a></div>
    </div>${G.nav('verlauf')}`;
    const info = all.map((x, i) => {
      let sets = 0, vol = 0, records = 0;
      const exercises = Object.keys(x.ex).map((name) => {
        const rows = x.ex[name], time = isTimeEx(x, name);
        sets += rows.length;
        if (time) return { name, sets: rows.map((r) => G.fmtT(r[1])).join(' · '), best: G.fmtT(Math.max.apply(null, rows.map((r) => r[1]))), trend: '', trendColor: '', rec: false };
        rows.forEach((r) => { vol += r[0] * r[1]; });
        const best = G.bestOf(rows);
        const before = all.slice(0, i).filter((y) => y.ex[name] && y.ex[name].length && !isTimeEx(y, name)).map((y) => G.bestOf(y.ex[name]));
        const prev = before.length ? before[before.length - 1] : null, top = before.length ? Math.max.apply(null, before) : null;
        const rec = top !== null && best > top; if (rec) records++;
        const up = prev !== null && best > prev, down = prev !== null && best < prev;
        return { name, sets: rows.map((r) => G.fmtKg(r[0]) + '×' + r[1]).join(' · '), best: G.fmtKg(best) + ' kg', trend: prev === null ? '' : up ? '↑' : down ? '↓' : '→', trendColor: up ? 'var(--teal)' : down ? 'var(--coral)' : 'var(--muted)', rec };
      });
      return { x, sets, vol, records, exercises };
    });
    const last5 = info.slice(-5), maxV = Math.max.apply(null, last5.map((s) => s.vol).concat([1])), minV = Math.min.apply(null, last5.map((s) => s.vol).concat([maxV]));
    const bars = last5.map((s, i) => { const h = maxV === minV ? 80 : 25 + Math.round((s.vol - minV) / (maxV - minV) * 55); const lst = i === last5.length - 1;
      return { v: G.fmtVol(s.vol), d: G.fmtD(s.x.date), h, c: lst ? 'var(--teal)' : 'var(--teal-deep)', lc: lst ? 'var(--teal)' : 'var(--muted)' }; });
    let trend = '';
    if (last5.length > 1 && last5[0].vol) { const p = Math.round((last5[last5.length - 1].vol - last5[0].vol) / last5[0].vol * 100); trend = `<span style="font-size:13px;font-weight:600;color:${p > 0 ? 'var(--teal)' : p < 0 ? 'var(--coral)' : 'var(--muted)'}">${p > 0 ? '+' : ''}${p} % seit ${bars[0].d}</span>`; }
    const nf = last5.slice().reverse();
    const items = nf.map((s, i) => ({ date: s.x.date, gym: s, prev: nf[i + 1] }))
      .concat(swims.map((x) => ({ date: x.date, swim: x })))
      .concat(frees.map((x) => ({ date: x.date, free: x })))
      .sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    const cards = items.map((it, i) => {
      if (it.free) { const d = new Date(it.free.date);
        return `<div class="card" style="gap:8px;border-color:var(--amber)"><div class="row-between"><span style="display:flex;flex-direction:column;gap:2px"><span class="num" style="font-size:24px;line-height:1.05;text-transform:uppercase">${G.WDL[d.getDay()]}, ${d.getDate()}.${d.getMonth() + 1}.</span>
          <span class="small"><span class="amber" style="font-weight:600">Freies Training</span>${it.free.fav ? ' · Favorit' : ''} · ${G.agoText(it.free.date)}</span></span><a href="#/notiz" class="icon-btn plain" style="color:var(--muted)" aria-label="Freies Training ansehen oder bearbeiten">${I.pencil(20)}</a></div>
          <span style="font-size:15px;line-height:1.5;white-space:pre-wrap">${esc(it.free.text)}</span>${G.freeButtons(it.free)}</div>`; }
      if (it.swim) return G.swimCard(it.swim, { open: G.ui.verlauf.openIdx === i, toggle: `data-a="verlaufToggle" data-i="${i}"` });
      const s = it.gym;
      const open = G.ui.verlauf.openIdx === i, prev = it.prev, d = new Date(s.x.date);
      const pct = prev && prev.vol ? Math.round((s.vol - prev.vol) / prev.vol * 100) : null;
      return `<div class="card" style="padding:0;gap:0;${open ? 'border:2px solid var(--teal)' : ''}">
        <button type="button" class="link-area" style="padding:14px 14px 12px;gap:10px" data-a="verlaufToggle" data-i="${i}" aria-expanded="${open}">
          <span class="row-between" style="width:100%"><span style="display:flex;flex-direction:column;gap:2px"><span class="num" style="font-size:24px;line-height:1.05;text-transform:uppercase">${G.WDL[d.getDay()]}, ${d.getDate()}.${d.getMonth() + 1}.</span>
            <span class="small">${esc(s.x.plan)} · ${G.agoText(s.x.date)}</span></span><span class="muted">${open ? I.up(20) : I.down(20)}</span></span>
          <span style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;width:100%">
            <span class="inset" style="display:flex;flex-direction:column;gap:2px;padding:8px 10px;border-radius:12px"><span class="num" style="font-size:22px;line-height:1">${s.sets}</span><span style="font-size:11px;color:var(--muted)">Sätze</span></span>
            <span class="inset" style="display:flex;flex-direction:column;gap:2px;padding:8px 10px;border-radius:12px"><span class="num teal" style="font-size:22px;line-height:1">${G.fmtVol(s.vol)}</span><span style="font-size:11px;color:${pct === null ? 'var(--muted)' : pct > 0 ? 'var(--teal)' : pct < 0 ? 'var(--coral)' : 'var(--muted)'}">${pct === null ? 'kg bewegt' : (pct > 0 ? '+' : '') + pct + ' % kg'}</span></span>
            <span class="inset" style="display:flex;flex-direction:column;gap:2px;padding:8px 10px;border-radius:12px"><span class="num${s.records ? ' amber' : ''}" style="font-size:22px;line-height:1">${s.records}</span><span style="font-size:11px;color:var(--muted)">Rekorde</span></span>
          </span>
        </button>
        ${open ? `<div style="padding:0 14px 14px;display:flex;flex-direction:column;gap:6px">${s.exercises.map((e) => `<div class="inset" style="display:grid;grid-template-columns:1fr auto;gap:4px 10px;padding:10px 12px;border-radius:12px">
          <span style="font-size:15px;font-weight:600">${esc(e.name)}</span><span class="num" style="font-size:18px;color:${e.rec ? 'var(--amber)' : 'var(--text)'}"><span style="font-family:var(--body);font-size:13px;color:${e.trendColor}">${e.trend}</span> ${e.best}</span>
          <span style="grid-column:1/-1;font-size:13px;color:var(--muted2)">${e.sets}</span></div>`).join('')}</div>` : ''}
      </div>`;
    }).join('');
    return `<div class="screen with-nav">${G.header()}
      <div class="title-block"><span class="eyebrow">Deine letzten 5 Trainings</span><h1 class="h1">Verlauf</h1></div>
      ${!last5.length ? '' : `<div class="card" style="gap:8px"><div class="row-between"><span class="label" style="font-size:12px">Bewegte kg pro Training</span>${trend}</div>
        <div style="display:flex;align-items:flex-end;gap:10px;height:110px">${bars.map((b) => `<div style="flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px"><span class="num" style="font-size:14px;color:${b.lc}">${b.v}</span><div style="width:100%;height:${b.h}%;border-radius:6px 6px 0 0;background:${b.c}"></div></div>`).join('')}</div>
        <div style="display:flex;gap:10px;border-top:1px solid var(--line);padding-top:6px">${bars.map((b) => `<span style="flex:1;text-align:center;font-size:11px;color:var(--muted)">${b.d}</span>`).join('')}</div></div>`}
      ${cards}
      <span class="tiny" style="padding:0 4px">Gelb = neuer Rekord, ↑ ↓ = Vergleich zum vorherigen Mal. Blau = Schwimmen, Orange = freies Training.</span>
    </div>${G.nav('verlauf')}`;
  };
  G.actions.verlaufToggle = (el) => { const i = +el.dataset.i; G.ui.verlauf.openIdx = G.ui.verlauf.openIdx === i ? -1 : i; G.render(); };

  // ---------- Fortschritt ----------
  G.ui.fort = { sel: null };
  G.screens.fortschritt = () => {
    const all = G.history();
    const names = [];
    all.forEach((x) => Object.keys(x.ex).forEach((n) => { if (names.indexOf(n) === -1 && x.ex[n].length && !isTimeEx(x, n)) names.push(n); }));
    const head = `${G.header()}<div class="title-block"><span class="eyebrow">So stark bist du geworden</span><h1 class="h1">Fortschritt</h1></div>`;
    if (!names.length) return `<div class="screen with-nav">${head}<div class="card empty">Sobald du Trainings mit Gewichten abgeschlossen hast, siehst du hier für jede Übung deine Kurve und deine Rekorde.</div>${G.swimProgress()}${G.freeProgress()}</div>${G.nav('fortschritt')}`;
    const sel = names.indexOf(G.ui.fort.sel) !== -1 ? G.ui.fort.sel : names[0];
    const statsFor = (name) => {
      const ses = all.filter((x) => x.ex[name] && x.ex[name].length && !isTimeEx(x, name));
      let pr = null, prDate = '', reps = 0;
      const bests = ses.map((x) => { let b = 0; x.ex[name].forEach((r) => { reps += r[1]; if (r[0] > b) b = r[0]; if (!pr || r[0] > pr[0] || (r[0] === pr[0] && r[1] > pr[1])) { pr = r; prDate = x.date; } }); return b; });
      return { ses, bests, pr, prDate, reps };
    };
    const st = statsFor(sel), shown = st.ses.slice(-8), vals = st.bests.slice(-8), n = vals.length;
    const W = 326, top = 30, bottom = 140, padX = 26, maxV = Math.max.apply(null, vals), minV = Math.min.apply(null, vals), span = maxV - minV || 1;
    const pts = vals.map((v, i) => [Math.round(n === 1 ? W / 2 : padX + i * (W - 2 * padX) / (n - 1)), Math.round(maxV === minV ? (top + bottom) / 2 : bottom - (v - minV) / span * (bottom - top))]);
    const line = 'M' + pts.map((p) => p[0] + ' ' + p[1]).join(' L');
    const area = line + ' L' + pts[n - 1][0] + ' ' + bottom + ' L' + pts[0][0] + ' ' + bottom + ' Z';
    const before = st.bests.slice(0, st.bests.length - n);
    let run = before.length ? Math.max.apply(null, before) : -1;
    const dots = pts.map((p, i) => {
      const isPr = vals[i] > run && (i > 0 || before.length > 0); if (vals[i] > run) run = vals[i];
      const lst = i === n - 1;
      return `<div style="position:absolute;left:${p[0]}px;top:${p[1]}px;width:0;height:0"><div style="position:absolute;left:-7px;top:-7px;width:14px;height:14px;border-radius:999px;background:${isPr ? 'var(--amber)' : 'var(--bg)'};border:3px solid ${isPr ? 'var(--amber)' : 'var(--teal)'}"></div>
        <span class="num" style="position:absolute;left:-24px;top:-30px;width:48px;text-align:center;font-size:15px;color:${lst ? 'var(--teal)' : isPr ? 'var(--amber)' : 'var(--muted)'}">${G.fmtKg(vals[i])}</span></div>
        <span style="position:absolute;left:${p[0] - 26}px;top:148px;width:52px;text-align:center;font-size:11px;color:var(--muted)">${G.fmtD(shown[i].date)}</span>`;
    }).join('');
    const first = st.bests[0], last = st.bests[st.bests.length - 1], diff = last - first, pct = first ? Math.round(diff / first * 100) : 0;
    const recs = names.map((name) => { const s = statsFor(name), g = s.bests[s.bests.length - 1] - s.bests[0];
      return `<button type="button" class="link-area row" style="min-height:60px;border:${name === sel ? '2px solid var(--teal)' : '1px solid var(--line)'};border-radius:14px;background:var(--card);padding:10px 14px;gap:12px;flex-direction:row;align-items:center" data-a="fortSel" data-n="${esc(name)}">
        <span class="grow" style="display:flex;flex-direction:column;gap:2px"><span style="font-size:15px;font-weight:600">${esc(name)}</span><span style="font-size:12px;color:var(--muted)">Rekord am ${G.fmtD(s.prDate)} · ${s.ses.length}× trainiert</span></span>
        <span style="display:flex;flex-direction:column;align-items:flex-end;gap:2px"><span class="num amber" style="font-size:22px;line-height:1">${G.fmtKg(s.pr[0])} kg × ${s.pr[1]}</span><span style="font-size:12px;font-weight:600;color:var(--teal)">${g > 0 ? '+' + G.fmtKg(g) + ' kg seit Start' : 'noch kein Plus'}</span></span></button>`; }).join('');
    return `<div class="screen with-nav">${head}
      <div class="chips">${names.map((nm) => `<button type="button" class="chip${nm === sel ? ' on' : ''}" style="height:44px" data-a="fortSel" data-n="${esc(nm)}">${esc(nm)}</button>`).join('')}</div>
      <div class="card">
        <div class="row-between" style="align-items:flex-end"><div style="display:flex;flex-direction:column;gap:2px"><span class="label" style="font-size:12px">Höchstes Gewicht</span>
          <div class="row" style="gap:6px;align-items:baseline"><span class="num teal" style="font-size:52px;line-height:1">${G.fmtKg(last)}</span><span class="num muted" style="font-size:22px;font-weight:600">kg</span></div></div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;padding-bottom:6px"><span class="num" style="font-size:24px;line-height:1;color:${diff > 0 ? 'var(--teal)' : diff < 0 ? 'var(--coral)' : 'var(--muted)'}">${diff > 0 ? '+' : diff < 0 ? '' : '± '}${G.fmtKg(diff)} kg</span><span style="font-size:12px;color:var(--muted)">${st.bests.length > 1 ? (pct > 0 ? '+' : '') + pct + ' % seit ' + G.fmtD(st.ses[0].date) : 'erst ein Training'}</span></div></div>
        <div style="position:relative;width:326px;height:170px;max-width:100%;align-self:center">
          <svg width="326" height="170" viewBox="0 0 326 170" aria-hidden="true" style="position:absolute;inset:0">
            <line x1="0" y1="30" x2="326" y2="30" stroke="#2A3A57" stroke-dasharray="3 5"/><line x1="0" y1="85" x2="326" y2="85" stroke="#2A3A57" stroke-dasharray="3 5"/><line x1="0" y1="140" x2="326" y2="140" stroke="#2A3A57"/>
            <path d="${area}" fill="#2DD4BF" fill-opacity=".12"/><path class="draw" d="${line}" fill="none" stroke="#2DD4BF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          ${dots}
        </div>
        <span class="tiny">Bestes Gewicht pro Training · Gelber Punkt = persönlicher Rekord</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">
        <div class="card amber sm" style="gap:6px"><span class="label amber row" style="gap:6px;font-size:12px">${I.trophy(16)}Rekord</span><span class="num" style="font-size:28px;line-height:1">${G.fmtKg(st.pr[0])} kg × ${st.pr[1]}</span><span style="font-size:12px;color:var(--muted2)">am ${G.fmtD(st.prDate)}</span></div>
        <div class="card sm" style="gap:6px"><span class="label" style="font-size:12px">Trainiert</span><span class="num" style="font-size:28px;line-height:1">${st.ses.length} ${st.ses.length === 1 ? 'Training' : 'Trainings'}</span><span class="tiny">${st.reps} Wiederholungen insgesamt</span></div>
      </div>
      <div class="list"><h2 class="h2" style="padding:0 4px">Alle Rekorde</h2>${recs}</div>
      ${G.swimProgress()}${G.freeProgress()}
    </div>${G.nav('fortschritt')}`;
  };
  G.actions.fortSel = (el) => { G.ui.fort.sel = el.dataset.n; G.render(); window.scrollTo(0, 0); };
})();
