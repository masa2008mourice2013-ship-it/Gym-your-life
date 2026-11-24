// Gym your Life – Wissen: Ernährung, Körper und Training mit Artikeln aus der Wikipedia
(function () {
  const G = window.G, I = G.I, esc = G.esc;
  const API = 'https://de.wikipedia.org/w/api.php';
  const CKEY = 'gyl-wiki-v1', CMAX = 12;

  // [Anzeigename, Wikipedia-Titel, eigener Kurzsatz: warum das für dich wichtig ist]
  const GROUPS = [
    ['Nährstoffe', [
      ['Eiweiß (Protein)', 'Protein', 'Baustoff für Muskeln, Haut, Enzyme und Hormone. Nach dem Training hilft es der Muskulatur, sich zu reparieren und aufzubauen.'],
      ['Kohlenhydrate', 'Kohlenhydrate', 'Der wichtigste schnelle Treibstoff für Muskeln und Gehirn. Sie füllen die Speicher, die beim Training leer werden.'],
      ['Fett', 'Fett', 'Energiespeicher, Baustoff für Zellen und Hormone, Träger der Vitamine A, D, E und K.'],
      ['Aminosäuren', 'Aminosäuren', 'Die Bausteine, aus denen Eiweiße bestehen. Der Körper setzt sie nach Bauplan zu neuen Muskeleiweißen zusammen.'],
      ['Essentielle Aminosäuren', 'Essentielle Aminosäure', 'Diese Aminosäuren kann der Körper nicht selbst herstellen – sie müssen über das Essen kommen.'],
      ['Leucin', 'Leucin', 'Eine essentielle Aminosäure, die den Aufbau von Muskeleiweiß besonders stark anstößt.'],
      ['Ballaststoffe', 'Ballaststoff', 'Sättigen, füttern die Darmbakterien und halten den Blutzucker gleichmäßiger.'],
      ['Omega-3-Fettsäuren', 'Omega-3-Fettsäuren', 'Gelten als entzündungshemmend und gut für Herz und Gehirn. Stecken in Fisch, Leinöl und Walnüssen.'],
      ['Vitamine', 'Vitamine', 'Kleine Helfer, die der Körper nicht selbst bauen kann und in winzigen Mengen für den Stoffwechsel braucht.'],
      ['Mineralstoffe', 'Mineralstoff', 'Zum Beispiel Calcium, Magnesium, Eisen oder Natrium: wichtig für Knochen, Nerven und Muskelarbeit.'],
      ['Magnesium', 'Magnesium', 'Beteiligt an der Muskelentspannung und am Energiestoffwechsel.'],
      ['Eisenmangel', 'Eisenmangel', 'Eisen transportiert Sauerstoff im Blut. Fehlt es, fühlen sich Training und Alltag schnell schwer an.'],
      ['Vitamin D', 'Vitamin D', 'Wichtig für Knochen und Muskeln. Im Winter bildet der Körper kaum selbst welches.'],
      ['Kreatin', 'Kreatin', 'Hilft den Muskeln, bei kurzen, harten Belastungen schnell Energie bereitzustellen.'],
      ['Koffein', 'Koffein', 'Wirkt anregend und kann die gefühlte Anstrengung senken – spät am Tag aber den Schlaf stören.']
    ]],
    ['Energie und Stoffwechsel', [
      ['Brennwert (Kalorien)', 'Brennwert', 'Die Energiemenge, die in Essen steckt. Eiweiß und Kohlenhydrate liefern etwa 4 kcal pro Gramm, Fett etwa 9.'],
      ['Grundumsatz', 'Grundumsatz', 'So viel Energie braucht dein Körper in Ruhe, nur um am Leben zu bleiben.'],
      ['Stoffwechsel', 'Stoffwechsel', 'Alle chemischen Vorgänge, mit denen der Körper Nahrung in Energie und Baustoffe umwandelt.'],
      ['Glykämischer Index', 'Glykämischer Index', 'Zeigt, wie schnell ein Lebensmittel den Blutzucker ansteigen lässt.'],
      ['ATP – die Energiewährung', 'Adenosintriphosphat', 'Jede Muskelkontraktion läuft auf ATP. Der Körper gewinnt es aus Kohlenhydraten, Fetten und Kreatinphosphat.'],
      ['Zellatmung', 'Zellatmung', 'Wie Zellen mit Sauerstoff aus Nährstoffen ATP herstellen – die Grundlage für Ausdauer.'],
      ['Glykogen', 'Glykogen', 'Der Kohlenhydratspeicher in Muskeln und Leber. Er leert sich bei längerem oder hartem Training.'],
      ['Insulin', 'Insulin', 'Hormon, das Zucker aus dem Blut in die Zellen schleust und den Aufbau von Speichern fördert.'],
      ['Cortisol', 'Cortisol', 'Stresshormon. Kurzfristig nützlich, dauerhaft hoch stört es Regeneration und Schlaf.']
    ]],
    ['Muskeln und Training', [
      ['Skelettmuskulatur', 'Skelettmuskulatur', 'Die Muskeln, die du willentlich bewegst und beim Training forderst.'],
      ['Muskelwachstum (Hypertrophie)', 'Muskelhypertrophie', 'Muskeln wachsen, wenn Training einen Reiz setzt und danach Ruhe und Eiweiß zum Aufbau da sind.'],
      ['Proteinbiosynthese', 'Proteinbiosynthese', 'Wie die Zelle aus Aminosäuren neue Eiweiße baut – auch neues Muskeleiweiß.'],
      ['Superkompensation', 'Superkompensation', 'Nach der Erholung ist der Körper etwas leistungsfähiger als vorher. Deshalb brauchst du Pausen.'],
      ['Muskelkater', 'Muskelkater', 'Winzige Verletzungen und Entzündungsreaktionen im Muskel nach ungewohnter Belastung – harmlos, aber ein Zeichen für Erholungsbedarf.'],
      ['Krafttraining', 'Krafttraining', 'Training gegen Widerstand für stärkere Muskeln, Knochen und Sehnen.'],
      ['Herzfrequenz', 'Herzfrequenz', 'Zeigt, wie stark der Kreislauf gerade arbeitet.'],
      ['Maximale Sauerstoffaufnahme (VO₂max)', 'Maximale Sauerstoffaufnahme', 'Ein Maß für deine Ausdauerleistungsfähigkeit.'],
      ['Schlaf', 'Schlaf', 'In der Nacht erholt sich der Körper, Wachstumshormone werden ausgeschüttet und Muskeln repariert.'],
      ['Menstruationszyklus', 'Menstruationszyklus', 'Hormone im Zyklus beeinflussen Energie, Regeneration und Wohlbefinden beim Training.']
    ]]
  ];
  const FLAT = []; GROUPS.forEach((g) => g[1].forEach((t) => FLAT.push(t)));
  G.ui.wiki = { cur: null, q: '', st: 'idle', data: null, err: '' };

  // ---------- Zwischenspeicher (nur geöffnete Artikel, für unterwegs ohne Netz) ----------
  const cacheAll = () => { try { return JSON.parse(localStorage.getItem(CKEY) || '{}'); } catch (e) { return {}; } };
  const cachePut = (key, data) => {
    try {
      const c = cacheAll(); c[key] = { t: Date.now(), d: data };
      Object.keys(c).sort((a, b) => c[b].t - c[a].t).slice(CMAX).forEach((k) => delete c[k]);
      localStorage.setItem(CKEY, JSON.stringify(c));
    } catch (e) {}
  };

  // ---------- Wikipedia abfragen ----------
  const qs = (o) => Object.keys(o).map((k) => k + '=' + encodeURIComponent(o[k])).join('&');
  const getJson = (o) => fetch(API + '?' + qs(Object.assign({ format: 'json', origin: '*' }, o))).then((r) => { if (!r.ok) throw new Error('http'); return r.json(); });
  const fetchArticle = (title, retry) => getJson({ action: 'query', redirects: 1, prop: 'extracts|pageimages|info', inprop: 'url', explaintext: 1, exsectionformat: 'wiki', piprop: 'thumbnail', pithumbsize: 640, titles: title })
    .then((j) => {
      const pages = (j.query && j.query.pages) || {}, p = pages[Object.keys(pages)[0]];
      if (!p || p.missing !== undefined || !p.extract) {
        if (retry) throw new Error('missing');
        return getJson({ action: 'query', list: 'search', srsearch: title, srlimit: 1, srnamespace: 0 }).then((s) => {
          const hit = s.query && s.query.search && s.query.search[0]; if (!hit) throw new Error('missing');
          return fetchArticle(hit.title, true);
        });
      }
      return { title: p.title, text: p.extract, img: p.thumbnail ? p.thumbnail.source : '', url: p.fullurl || 'https://de.wikipedia.org/wiki/' + encodeURIComponent(p.title.replace(/ /g, '_')) };
    });

  // Text in Abschnitte teilen
  const DROP = /^(Einzelnachweise|Literatur|Weblinks|Siehe auch|Anmerkungen|Quellen|Fußnoten|Belege|Referenzen|Nachweise)$/i;
  const parse = (text) => {
    const parts = text.split(/\n*^(={2,4})\s*(.+?)\s*\1\s*$\n*/m);
    const intro = parts[0].trim(), secs = [];
    for (let i = 1; i + 2 < parts.length + 1; i += 3) {
      const lvl = parts[i].length, head = parts[i + 1], body = (parts[i + 2] || '').trim();
      if (lvl === 2) { if (DROP.test(head)) { secs.push({ drop: true }); continue; } secs.push({ head, body, subs: [] }); }
      else { const last = secs[secs.length - 1]; if (last && !last.drop) last.subs.push({ head, body }); }
    }
    return { intro, secs: secs.filter((s) => !s.drop && (s.body || s.subs.some((x) => x.body))) };
  };
  const paras = (t) => t.split(/\n{1,}/).filter((x) => x.trim()).map((x) => `<p style="margin:0;font-size:15px;line-height:1.6">${esc(x.trim())}</p>`).join('');

  // ---------- Seiten ----------
  const open = (title, label) => {
    const w = G.ui.wiki; w.cur = { title, label: label || title }; w.st = 'load'; w.data = null; w.err = '';
    const c = cacheAll()[title]; if (c) { w.data = c.d; w.st = 'ok'; w.cached = true; } else w.cached = false;
    location.hash = '#/wissen/a'; G.render(); window.scrollTo(0, 0);
    fetchArticle(title).then((d) => {
      cachePut(title, d);
      if (G.ui.wiki.cur && G.ui.wiki.cur.title === title) { G.ui.wiki.data = d; G.ui.wiki.st = 'ok'; G.ui.wiki.cached = false; if (G.route === 'wissen') G.render(); }
    }).catch((e) => {
      if (G.ui.wiki.cur && G.ui.wiki.cur.title === title && !G.ui.wiki.data) { G.ui.wiki.st = 'err'; G.ui.wiki.err = e.message === 'missing' ? 'missing' : 'net'; if (G.route === 'wissen') G.render(); }
    });
  };

  const article = () => {
    const w = G.ui.wiki, hint = FLAT.find((t) => t[1] === w.cur.title);
    let body = '';
    if (w.st === 'load') body = '<div class="card empty" style="padding:24px">Artikel wird geladen …</div>';
    else if (w.st === 'err') body = `<div class="card empty" style="padding:20px">${w.err === 'missing' ? 'Dazu habe ich in der Wikipedia nichts gefunden.' : 'Der Artikel konnte nicht geladen werden. Du brauchst dafür Internet – einmal geöffnete Artikel kannst du danach auch ohne Netz lesen.'}</div>`;
    else {
      const d = w.data, P = parse(d.text);
      const sec = (s, i) => `<details class="wk-sec"${i === 0 && !P.intro ? ' open' : ''}><summary>${esc(s.head)}</summary><div class="wk-body">${paras(s.body)}${s.subs.map((x) => `<span style="font-weight:700;font-size:15px;margin-top:4px">${esc(x.head)}</span>${paras(x.body)}`).join('')}</div></details>`;
      body = `${d.img ? `<img src="${esc(d.img)}" alt="" style="width:100%;max-height:260px;object-fit:cover;border-radius:14px" onerror="this.remove()">` : ''}
        ${hint ? `<div class="card soft sm row" style="flex-direction:row;align-items:flex-start"><span class="teal" style="flex-shrink:0">${I.info(22)}</span><span style="font-size:14px;line-height:1.5">${esc(hint[2])}</span></div>` : ''}
        <div class="card" style="gap:10px">${paras(d.intro || P.secs[0] && P.secs[0].body || '')}</div>
        ${P.secs.length ? `<div class="list" style="gap:8px"><span class="label" style="padding:0 4px;font-size:12px">Weiterlesen</span>${P.secs.map(sec).join('')}</div>` : ''}
        <div class="card soft sm" style="gap:6px"><a href="${esc(d.url)}" target="_blank" rel="noopener" class="row" style="gap:6px;font-weight:600;text-decoration:none;min-height:40px">${I.ext(16)}Ganzen Artikel auf Wikipedia öffnen</a>
          <span class="tiny">Quelle: Wikipedia, „${esc(d.title)}“ – Text unter der Lizenz CC BY-SA 4.0, Autorinnen und Autoren in der Versionsgeschichte des Artikels. Bilder haben eigene Lizenzen (siehe Artikel).${w.cached ? ' Gespeicherte Fassung, wird bei Netz aktualisiert.' : ''}</span></div>
        <span class="tiny" style="padding:0 4px">Allgemeine Information, keine Ernährungs- oder Medizinberatung.</span>`;
    }
    return `<div class="screen">${G.header()}
      <div class="row" style="padding:0 4px"><a href="#/wissen" class="icon-btn" aria-label="Zurück zur Wissensliste">${I.back()}</a>
        <div style="display:flex;flex-direction:column;gap:2px;min-width:0"><span class="eyebrow">Wissen · aus der Wikipedia</span><h1 class="h1" style="font-size:30px;line-height:1.05">${esc(w.cur.label)}</h1></div></div>
      ${body}</div>`;
  };

  G.screens.wissen = (params) => {
    const w = G.ui.wiki;
    if (params && params[0] === 'a' && w.cur) return article();
    const cached = cacheAll();
    return `<div class="screen">${G.header()}
      <div class="row" style="padding:0 4px"><a href="#/essen" class="icon-btn" aria-label="Zurück zu Essen">${I.back()}</a>
        <div style="display:flex;flex-direction:column;gap:2px"><span class="eyebrow">Eiweiß, Kohlenhydrate, Fette und mehr</span><h1 class="h1" style="font-size:34px">Wissen</h1></div></div>
      <span class="small" style="padding:0 4px">Kurz erklärt von mir, die ganzen Artikel kommen live aus der Wikipedia. Einmal geöffnete Artikel kannst du auch ohne Netz lesen.</span>
      <div class="card sm" style="gap:8px"><label class="label" for="wq">Etwas anderes nachschlagen</label>
        <div class="row" style="gap:8px"><input id="wq" class="input" style="flex:1;min-width:0" maxlength="40" placeholder="z. B. Whey, Zink, Laktat" value="${esc(w.q)}" data-in="wkQ" data-enter="wkSearch"><button type="button" class="btn md" style="width:auto;padding:0 18px" data-a="wkSearch">${I.next(18)}</button></div></div>
      ${GROUPS.map((g) => `<section class="list"><h2 class="label teal" style="font-size:12px;letter-spacing:1.5px;padding:0 4px">${g[0]}</h2>
        ${g[1].map((t) => `<button type="button" class="card sm row" style="flex-direction:row;align-items:center;gap:10px;text-align:left;color:var(--text);min-height:60px" data-a="wkOpen" data-t="${esc(t[1])}" data-l="${esc(t[0])}">
          <span class="grow" style="display:flex;flex-direction:column;gap:2px;min-width:0"><span class="h3" style="font-size:18px">${esc(t[0])}</span><span class="small" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(t[2])}</span></span>
          ${cached[t[1]] ? `<span class="tiny teal" style="flex-shrink:0">offline</span>` : ''}<span class="muted">${I.next(20)}</span></button>`).join('')}</section>`).join('')}
      <span class="tiny" style="padding:0 4px">Texte und Bilder: Wikipedia (CC BY-SA 4.0). Allgemeine Information, keine Ernährungs- oder Medizinberatung.</span>
    </div>`;
  };

  const A = G.actions, IN = G.inputs;
  IN.wkQ = (v) => { G.ui.wiki.q = v; };
  A.wkOpen = (el) => open(el.dataset.t, el.dataset.l);
  A.wkSearch = () => { const q = G.ui.wiki.q.trim(); if (!q) { G.toast('Bitte einen Begriff eintippen'); return; } open(q, q); };

  // Für den Bild-Finder bei den Rezepten
  G.wikiImages = (q) => getJson({ action: 'query', generator: 'search', gsrsearch: q, gsrnamespace: 0, gsrlimit: 8, prop: 'pageimages|info', inprop: 'url', piprop: 'thumbnail', pithumbsize: 500 })
    .then((j) => Object.keys((j.query && j.query.pages) || {}).map((k) => j.query.pages[k]).filter((p) => p.thumbnail).sort((a, b) => a.index - b.index)
      .map((p) => ({ title: p.title, thumb: p.thumbnail.source, url: p.fullurl })));
})();
