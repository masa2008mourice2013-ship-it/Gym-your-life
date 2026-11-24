// Gym your Life – Essen nach dem Training
(function () {
  const G = window.G, D = G.D, I = G.I, esc = G.esc;
  const nowTab = () => { const h = new Date().getHours(); return h < 11 ? 'morgens' : h < 15 ? 'mittags' : h < 18 ? 'snack' : 'abends'; };
  G.ui.essen = { tab: null, diet: 'alle', form: false, f: null, pick: null };
  const TABS = [['morgens', 'Morgens'], ['mittags', 'Mittags'], ['snack', 'Snack'], ['abends', 'Abends']];
  const DIETS = { veg: 'Vegetarisch', vegan: 'Vegan', fisch: 'Fisch', fleisch: 'Fleisch' };

  G.screens.essen = () => {
    const u = G.ui.essen; if (!u.tab) u.tab = nowTab();
    const own = G.load(G.K.food, []), tab = u.tab, diet = u.diet, nt = nowTab();
    const meals = own.filter((o) => o.tab === tab).map((o) => Object.assign({ own: true }, o)).reverse().concat(D.FOOD[tab])
      .filter((m) => diet === 'alle' || (diet === 'veg' ? (m.diet === 'veg' || m.diet === 'vegan') : m.diet === diet));
    const imgs = G.load(G.K.foodimg, {});
    const card = (m) => {
      const ph = m.photo || (imgs[m.name] && imgs[m.name].photo), src = m.photo ? m.photoSrc : (imgs[m.name] && imgs[m.name].src);
      const pk = m.own ? `own:${m.id}` : `std:${m.name}`;
      const tags = [];
      if (m.own) tags.push(`<span class="badge" style="background:var(--amber-soft);color:var(--amber)">Eigene Idee</span>`);
      if (m.diet === 'veg' || m.diet === 'vegan') tags.push(`<span class="badge" style="background:var(--teal-soft);color:var(--teal)">${DIETS[m.diet]}</span>`);
      if (m.quick) tags.push(`<span class="badge" style="background:var(--card2)">Schnell</span>`);
      return `<div class="card" style="border-radius:18px;padding:14px;gap:10px">
        ${ph ? `<img src="${ph}" alt="" style="width:100%;max-height:220px;object-fit:cover;border-radius:12px">` : ''}
        ${src ? `<a href="${esc(src)}" target="_blank" rel="noopener" class="tiny" style="margin-top:-4px">Bild: Wikipedia – Quelle und Lizenz öffnen</a>` : ''}
        <div class="row-between" style="align-items:flex-start"><span class="num" style="font-size:23px;line-height:1.1">${esc(m.name)}</span><div class="row" style="gap:4px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end">${tags.join('')}</div></div>
        ${m.text ? `<span style="font-size:14px;color:var(--muted2);line-height:1.5">${esc(m.text)}</span>` : ''}
        ${m.protein && m.protein.length ? `<div class="row" style="flex-wrap:wrap;gap:6px"><span class="label">Eiweiß aus</span>${m.protein.map((p) => `<span class="tagp">${esc(p)}</span>`).join('')}</div>` : ''}
        ${!m.photo || m.photoSrc ? `<div class="row" style="gap:8px"><button type="button" class="btn ghost sm" data-a="pkOpen" data-t="${esc(pk)}" data-q="${esc(m.name)}">${I.camera(16)}${ph ? 'Anderes Bild' : 'Bild aus Wikipedia'}</button>${!m.own && ph ? `<button type="button" class="btn danger-ghost sm" data-a="pkClear" data-n="${esc(m.name)}">Bild entfernen</button>` : ''}</div>` : ''}
        ${m.own ? `<div class="row" style="border-top:1px solid var(--line);padding-top:8px">${m.link ? `<a href="${esc(m.link)}" target="_blank" rel="noopener" class="row" style="height:44px;gap:6px;font-size:13px;font-weight:600;text-decoration:none">${I.ext(16)}Quelle öffnen</a>` : ''}<span class="grow"></span>
          <button type="button" class="btn danger-ghost sm" data-a="foodDel" data-id="${m.id}">Löschen</button></div>` : ''}
      </div>`;
    };
    const f = u.f;
    const form = u.form ? `<div class="card active pop" style="border-radius:18px;padding:14px">
      <span class="h2" style="font-size:22px">Neue Essens-Idee</span>
      <div class="field"><label class="label" for="fname">Name *</label><input id="fname" class="input" value="${esc(f.name)}" maxlength="40" placeholder="z. B. Protein-Pancakes" data-in="foodF" data-k="name"></div>
      <div class="field"><span class="label">Wann?</span><div class="seg">${TABS.map((t) => `<button type="button" class="${f.tab === t[0] ? 'on' : ''}" data-a="foodFSet" data-k="tab" data-v="${t[0]}">${t[1]}</button>`).join('')}</div></div>
      <div class="field"><span class="label">Art</span><div class="chips">${[['alle', 'Egal'], ['veg', 'Vegetarisch'], ['vegan', 'Vegan'], ['fisch', 'Fisch'], ['fleisch', 'Fleisch']].map((d) => `<button type="button" class="chip${f.diet === d[0] ? ' on' : ''}" data-a="foodFSet" data-k="diet" data-v="${d[0]}">${d[1]}</button>`).join('')}</div></div>
      <div class="field"><label class="label" for="ftext">Kurz beschrieben</label><textarea id="ftext" class="input" rows="3" maxlength="240" placeholder="Was kommt rein, wie geht's?" data-in="foodF" data-k="text">${esc(f.text)}</textarea></div>
      <div class="field"><label class="label" for="fprot">Eiweiß aus (mit Komma trennen)</label><input id="fprot" class="input" value="${esc(f.protein)}" maxlength="80" placeholder="z. B. Eier, Magerquark" data-in="foodF" data-k="protein"></div>
      <div class="field"><label class="label" for="flink">Wo gesehen? Link (optional)</label><input id="flink" class="input" inputmode="url" value="${esc(f.link)}" placeholder="Link von Instagram, Website …" data-in="foodF" data-k="link"></div>
      <div class="field"><span class="label">Foto (optional)</span>
        ${f.photo ? `<img src="${f.photo}" alt="Vorschau" style="width:100%;max-height:200px;object-fit:cover;border-radius:12px"><button type="button" class="btn danger-ghost sm" data-a="foodPhotoDel">Foto entfernen</button>`
        : `<label class="btn sec md" style="cursor:pointer">${I.camera(20)}Foto oder Screenshot wählen<input type="file" accept="image/*" class="sr" data-file="foodPhoto"></label><button type="button" class="btn ghost md" data-a="pkOpen" data-t="form" data-q="${esc(f.name)}">Bild aus Wikipedia suchen</button>`}</div>
      <div class="btns"><button type="button" class="btn ghost md" data-a="foodFormClose">Abbrechen</button><button type="button" class="btn md" style="flex:2" data-a="foodSave">Idee speichern</button></div>
    </div>` : `<button type="button" class="btn dashed" style="height:56px;font-size:15px" data-a="foodFormOpen">${I.plus(18)}Eigene Idee hinzufügen</button>`;
    const pk = u.pick, pkHtml = !pk ? '' : `<div class="overlay" data-a="pkClose" data-self="1"><div class="sheet" role="dialog" aria-label="Bild aus Wikipedia wählen" style="max-height:88vh;overflow:auto">
      <div class="grip"></div><h2 class="h2" style="font-size:24px">Bild aus Wikipedia</h2>
      <div class="row" style="gap:8px"><input id="pkq" class="input" style="flex:1;min-width:0" maxlength="40" value="${esc(pk.q)}" placeholder="Suchbegriff, z. B. Haferbrei" data-in="pkQ" data-enter="pkSearch" aria-label="Suchbegriff"><button type="button" class="btn md" style="width:auto;padding:0 16px" data-a="pkSearch">Suchen</button></div>
      ${pk.st === 'load' ? '<span class="small">Suche läuft …</span>' : pk.st === 'err' ? '<span class="small">Das hat nicht geklappt – du brauchst dafür Internet.</span>' : pk.st === 'ok' && !pk.res.length ? '<span class="small">Nichts mit Bild gefunden. Versuch einen einfacheren Begriff, z. B. nur „Haferflocken“.</span>' : ''}
      ${pk.st === 'saving' ? '<span class="small">Bild wird gespeichert …</span>' : ''}
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">${pk.res.map((r, i) => `<button type="button" class="card sm" style="padding:0;gap:0;overflow:hidden;text-align:left;color:var(--text)" data-a="pkPick" data-i="${i}"><img src="${esc(r.thumb)}" alt="" style="width:100%;height:110px;object-fit:cover"><span class="small" style="padding:8px 10px;font-weight:600">${esc(r.title)}</span></button>`).join('')}</div>
      <span class="tiny">Die Bilder stammen aus der Wikipedia. Passt dein Gericht nicht genau, nimm ein ähnliches oder lade ein eigenes Foto hoch. Lizenz und Urheber stehen über den Quell-Link beim Bild.</span>
      <button type="button" class="btn ghost md" data-a="pkClose">Schließen</button></div></div>`;
    const max = D.PROTEIN_CHEAT[0][1];
    return `<div class="screen">${G.header()}
      <div class="row" style="padding:0 4px"><a href="#/home" class="icon-btn" aria-label="Zurück zur Startseite">${I.back()}</a>
        <div style="display:flex;flex-direction:column;gap:2px"><span class="eyebrow">Ideen mit viel Eiweiß</span><h1 class="h1" style="font-size:34px">Essen nach dem Training</h1></div></div>
      <div class="seg tall" style="background:var(--card)">${TABS.map((t) => `<button type="button" class="${tab === t[0] ? 'on' : ''}" data-a="foodTab" data-v="${t[0]}" aria-pressed="${tab === t[0]}">${t[1]}<small>${t[0] === nt ? 'jetzt' : t[0] === 'snack' ? 'direkt danach' : ''}</small></button>`).join('')}</div>
      <div class="chips">${[['alle', 'Alle'], ['veg', 'Vegetarisch'], ['vegan', 'Vegan']].map((d) => `<button type="button" class="chip${diet === d[0] ? ' on' : ''}" data-a="foodDiet" data-v="${d[0]}">${d[1]}</button>`).join('')}</div>
      <div class="card soft sm row" style="flex-direction:row;align-items:flex-start"><span class="teal" style="flex-shrink:0">${I.info(22)}</span><span style="font-size:13px;line-height:1.5;color:var(--muted2)">${D.FOOD_TIPS[tab]}</span></div>
      <a href="#/wissen" class="card sm row" style="color:var(--text);text-decoration:none;min-height:64px;flex-direction:row;align-items:center"><span class="ico-box">${I.info(22)}</span><span class="grow" style="display:flex;flex-direction:column;gap:2px"><span class="h3" style="font-size:19px">Wissen: Eiweiß, Kohlenhydrate &amp; Co.</span><span class="small">Was im Körper passiert – mit Artikeln aus der Wikipedia</span></span><span class="muted">${I.next(20)}</span></a>
      ${form}
      ${meals.map(card).join('') || '<div class="empty">Keine Idee für diesen Filter.</div>'}
      <section class="list" style="padding-top:6px">
        <h2 class="h2" style="padding:0 4px">Eiweiß-Spickzettel</h2>
        <span class="tiny" style="padding:0 4px">Ungefähre Richtwerte pro 100 g – je nach Produkt etwas anders, genau steht's auf der Packung.</span>
        <div class="card sm divide" style="gap:0;padding:4px 14px">${D.PROTEIN_CHEAT.map((c) => `<div class="row" style="min-height:40px"><span class="grow" style="font-size:14px">${c[0]}</span><div class="bar" style="width:90px"><div style="width:${Math.round(c[1] / max * 100)}%"></div></div><span class="num teal" style="width:56px;text-align:right;font-size:17px">ca. ${String(c[1]).replace('.', ',')} g</span></div>`).join('')}</div>
        <span class="tiny" style="padding:0 4px">Allgemeine Ideen, keine Ernährungsberatung. Wer Allergien oder besondere Bedürfnisse hat, sollte das mit einer Fachperson abstimmen.</span>
      </section>
    </div>${pkHtml}`;
  };

  const A = G.actions, IN = G.inputs;
  A.foodTab = (el) => { G.ui.essen.tab = el.dataset.v; G.render(); };
  A.foodDiet = (el) => { G.ui.essen.diet = el.dataset.v; G.render(); };
  A.foodFormOpen = () => { const u = G.ui.essen; u.form = true; u.f = { name: '', tab: u.tab, diet: 'alle', text: '', protein: '', link: '', photo: '' }; G.render(); setTimeout(() => { const e = document.getElementById('fname'); if (e) e.focus(); }, 0); };
  A.foodFormClose = () => { G.ui.essen.form = false; G.render(); };
  IN.foodF = (v, el) => { G.ui.essen.f[el.dataset.k] = v; };
  A.foodFSet = (el) => { G.ui.essen.f[el.dataset.k] = el.dataset.v; G.render(); };
  A.foodPhotoDel = () => { G.ui.essen.f.photo = ''; G.ui.essen.f.photoSrc = ''; G.render(); };
  G.files.foodPhoto = (file) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, 800 / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      G.ui.essen.f.photo = c.toDataURL('image/jpeg', 0.72); URL.revokeObjectURL(url); G.render();
    };
    img.onerror = () => G.toast('Das Bild konnte nicht gelesen werden');
    img.src = url;
  };
  // Bild-Finder (Wikipedia)
  const PK = () => G.ui.essen.pick;
  A.pkOpen = (el) => { G.ui.essen.pick = { t: el.dataset.t, q: el.dataset.q || '', st: 'idle', res: [] }; G.render(); if (PK().q) A.pkSearch(); };
  A.pkClose = () => { G.ui.essen.pick = null; G.render(); };
  IN.pkQ = (v) => { PK().q = v; };
  A.pkSearch = () => {
    const pk = PK(), q = pk.q.trim(); if (!q) return;
    pk.st = 'load'; pk.res = []; G.render();
    G.wikiImages(q).then((r) => { if (PK() === pk) { pk.res = r; pk.st = 'ok'; G.render(); } }).catch(() => { if (PK() === pk) { pk.st = 'err'; G.render(); } });
  };
  const toDataUrl = (url) => fetch(url).then((r) => r.blob()).then((b) => new Promise((res, rej) => {
    const img = new Image(), u = URL.createObjectURL(b);
    img.onload = () => { const s = Math.min(1, 800 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u); res(c.toDataURL('image/jpeg', 0.72)); };
    img.onerror = rej; img.src = u;
  }));
  A.pkPick = (el) => {
    const pk = PK(), r = pk.res[+el.dataset.i]; if (!r) return;
    pk.st = 'saving'; G.render();
    toDataUrl(r.thumb).then((photo) => {
      if (pk.t === 'form') { G.ui.essen.f.photo = photo; G.ui.essen.f.photoSrc = r.url; }
      else if (pk.t.indexOf('own:') === 0) { const id = pk.t.slice(4); G.save(G.K.food, G.load(G.K.food, []).map((o) => (o.id === id ? Object.assign({}, o, { photo, photoSrc: r.url }) : o))); }
      else { const m = G.load(G.K.foodimg, {}); m[pk.t.slice(4)] = { photo, src: r.url }; G.save(G.K.foodimg, m); }
      G.ui.essen.pick = null; G.toast('Bild gespeichert'); G.render();
    }).catch(() => { pk.st = 'err'; G.render(); });
  };
  A.pkClear = (el) => { const m = G.load(G.K.foodimg, {}); delete m[el.dataset.n]; G.save(G.K.foodimg, m); G.render(); };
  A.foodSave = () => {
    const u = G.ui.essen, f = u.f, name = f.name.trim();
    if (!name) { G.toast('Bitte einen Namen eingeben'); return; }
    let link = f.link.trim(); if (link && !/^https?:\/\//i.test(link)) link = 'https://' + link;
    const idea = { id: G.uid('i'), name, tab: f.tab, diet: f.diet, text: f.text.trim(), protein: f.protein.split(',').map((x) => x.trim()).filter(Boolean), link, photo: f.photo, photoSrc: f.photoSrc || '', quick: false };
    if (G.save(G.K.food, G.load(G.K.food, []).concat([idea]))) { u.form = false; u.tab = idea.tab; u.diet = 'alle'; G.render(); G.toast('Idee gespeichert'); }
  };
  A.foodDel = (el) => { G.save(G.K.food, G.load(G.K.food, []).filter((o) => o.id !== el.dataset.id)); G.render(); };
})();
