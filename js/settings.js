// Gym your Life – Einstellungen
(function () {
  const G = window.G, I = G.I, esc = G.esc;
  G.ui.set = { confirm: false };
  const BODY = [['height', 'Größe', 'cm'], ['weight', 'Gewicht', 'kg'], ['chest', 'Brust', 'cm'], ['waist', 'Taille', 'cm'], ['hips', 'Hüfte', 'cm'], ['arm', 'Oberarm', 'cm'], ['thigh', 'Oberschenkel', 'cm']];
  G.avatar = (s, px) => s.photo ? `<img src="${s.photo}" alt="Profilbild" style="width:${px}px;height:${px}px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid var(--teal)">`
    : `<span aria-hidden="true" style="width:${px}px;height:${px}px;border-radius:50%;flex-shrink:0;border:2px solid var(--line);background:var(--card2);color:var(--teal);display:flex;align-items:center;justify-content:center;font-family:var(--head);font-weight:700;font-size:${Math.round(px*0.45)}px">${esc((s.name || 'J').trim().charAt(0).toUpperCase() || 'J')}</span>`;
  const ALL_KEYS = () => Object.keys(G.K).map((k) => G.K[k]);

  G.screens.einstellungen = () => {
    const s = G.settings(), u = G.ui.set, days = G.load(G.K.days, [1, 3, 5]);
    const hist = G.history(), own = G.load(G.K.own, []);
    const sw = (key, t, h) => `<button type="button" class="switch-row" role="switch" aria-checked="${!!s[key]}" data-a="setToggle" data-k="${key}"><span class="grow"><span class="t">${t}</span><span class="h">${h}</span></span>${G.sw(!!s[key])}</button>`;
    const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    return `<div class="screen">${G.header(true)}
      <div class="row" style="padding:0 4px;border-bottom:1px solid var(--line);padding-bottom:12px"><a href="#/home" class="icon-btn" aria-label="Zurück zur Startseite">${I.back()}</a><h1 class="h1" style="font-size:36px;line-height:1">Einstellungen</h1></div>

      ${standalone ? '' : `<section class="list"><h2 class="label teal" style="font-size:12px;letter-spacing:1.5px;padding:0 4px">Als App installieren</h2>
        <div class="card sm" style="gap:10px">${G.installEvt ? `<span class="small">Leg Gym your Life auf deinen Startbildschirm – dann öffnet sie sich wie eine echte App.</span><button type="button" class="btn md" data-a="install">${I.download(20)}Auf Startbildschirm legen</button>`
          : isIOS ? `<span style="font-size:14px;line-height:1.5">So kommt die App auf deinen Startbildschirm:<br>1. Unten in Safari auf <b>Teilen</b> tippen (Quadrat mit Pfeil).<br>2. <b>„Zum Home-Bildschirm“</b> wählen.<br>3. <b>Hinzufügen</b> tippen.</span>`
          : `<span style="font-size:14px;line-height:1.5">Im Browser-Menü (⋮ oben rechts) <b>„App installieren“</b> oder <b>„Zum Startbildschirm hinzufügen“</b> wählen.</span>`}</div></section>`}

      <section class="list"><h2 class="label teal" style="font-size:12px;letter-spacing:1.5px;padding:0 4px">Profil</h2>
        <div class="card sm" style="gap:14px">
          <div class="row" style="gap:14px">
            ${G.avatar(s, 84)}
            <div style="display:flex;flex-direction:column;gap:8px;min-width:0">
              <label class="btn sec sm" style="cursor:pointer;width:auto;padding:0 16px">${I.camera(18)}${s.photo ? 'Foto ändern' : 'Foto wählen'}<input type="file" accept="image/*" class="sr" data-file="profilePhoto" aria-label="Profilbild wählen"></label>
              ${s.photo ? `<button type="button" class="btn danger-ghost sm" style="width:auto;padding:0 16px" data-a="photoDel">Foto entfernen</button>` : ''}
            </div></div>
          <div class="field"><label for="sname" style="font-size:14px;font-weight:600">Dein Name</label><input id="sname" class="input" value="${esc(s.name)}" maxlength="20" data-in="setName"><span class="tiny">Erscheint in der Begrüßung auf der Startseite.</span></div>
        </div></section>

      <section class="list"><h2 class="label teal" style="font-size:12px;letter-spacing:1.5px;padding:0 4px">Meine Maße</h2>
        <div class="card sm" style="gap:12px">
          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">${BODY.map((f) => `<div class="field" style="gap:4px"><label for="b-${f[0]}" style="font-size:13px;font-weight:600">${f[1]}</label>
            <div style="position:relative"><input id="b-${f[0]}" class="input" style="padding-right:44px" inputmode="decimal" maxlength="6" value="${esc((s.body || {})[f[0]] || '')}" placeholder="–" data-in="setBody" data-k="${f[0]}"><span class="muted" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:13px;pointer-events:none">${f[2]}</span></div></div>`).join('')}</div>
          <span class="tiny" id="bodyStand">${(s.body || {}).date ? 'Zuletzt geändert am ' + G.dateLabel(s.body.date) + '.' : 'Alles optional – nur für dich, bleibt auf diesem Handy.'}</span>
        </div></section>

      <section class="list"><h2 class="label teal" style="font-size:12px;letter-spacing:1.5px;padding:0 4px">Training</h2>
        <div class="card sm divide" style="gap:0;padding:4px 14px">
          <div style="padding:10px 0;display:flex;flex-direction:column;gap:10px"><span><span style="font-size:14px;font-weight:600;display:block">Gewichts-Schritte</span><span class="tiny">So viel ändert sich das Gewicht pro Tipp auf + oder −</span></span>
            <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px">${[1, 1.25, 2.5, 5].map((v) => `<button type="button" class="chip${s.kgStep === v ? ' on' : ''} num" style="height:44px;font-size:18px" data-a="setStep" data-v="${v}">${G.fmtKg(v)}</button>`).join('')}</div></div>
          <div class="row" style="padding:10px 0"><span class="grow"><span style="font-size:14px;font-weight:600;display:block">Standard-Pause</span><span class="tiny">für neu hinzugefügte Übungen</span></span>
            <div style="width:140px">${G.stepper({ a: 'setPause', v: G.fmtT(s.defaultPause), minus: 'Kürzere Standard-Pause', plusL: 'Längere Standard-Pause' })}</div></div>
          ${sw('sound', 'Ton am Pausenende', 'kurzer Signalton (Handy nicht auf lautlos)')}
          ${sw('vibrate', 'Vibration am Pausenende', 'funktioniert auf Android-Handys')}
          ${sw('keepAwake', 'Bildschirm beim Training anlassen', 'Display geht während Training und Routinen nicht aus')}
          <div style="padding:10px 0"><button type="button" class="pill white" data-a="setTest">${I.sound(18)}Signal testen</button></div>
        </div></section>

      <section class="list"><h2 class="label teal" style="font-size:12px;letter-spacing:1.5px;padding:0 4px">Trainingstage</h2>
        <div class="card sm" style="gap:10px"><span style="font-size:14px;font-weight:600">An diesen Tagen trainierst du</span>
          <div class="week">${[1, 2, 3, 4, 5, 6, 0].map((wd) => { const on = days.indexOf(wd) !== -1; return `<button type="button" class="chip${on ? ' on' : ''}" style="height:44px;padding:0;font-weight:700" data-a="toggleDay" data-wd="${wd}" aria-pressed="${on}" aria-label="${G.WDL[wd]}">${G.WD[wd]}</button>`; }).join('')}</div></div></section>

      <section class="list"><h2 class="label teal" style="font-size:12px;letter-spacing:1.5px;padding:0 4px">App-Start</h2>
        <div class="card sm" style="gap:4px">${sw('quote', 'Motivationsspruch zeigen', 'vor dem Startbildschirm')}
          ${s.quote ? `<div class="row" style="padding-bottom:8px"><span class="grow" style="font-size:14px;color:var(--muted2)">Anzeigedauer</span>${[2, 3, 5].map((v) => `<button type="button" class="chip${s.quoteSec === v ? ' on' : ''} num" style="height:44px;width:56px;font-size:18px" data-a="setQuoteSec" data-v="${v}">${v} s</button>`).join('')}</div>` : ''}</div></section>

      <section class="list"><h2 class="label teal" style="font-size:12px;letter-spacing:1.5px;padding:0 4px">Deine Daten</h2>
        <div class="card sm" style="gap:10px">
          <span class="small">${G.plans().length} Pläne · ${hist.length} gespeicherte Trainings · ${own.length} eigene Übungen. Alles liegt nur auf diesem Handy – sichere es ab und zu.</span>
          <button type="button" class="btn outline md" data-a="exportData">${I.download(18)}Daten sichern (Datei)</button>
          <label class="btn sec md" style="cursor:pointer">${I.upload(18)}Sicherung wiederherstellen<input type="file" accept="application/json,.json" class="sr" data-file="importData"></label>
          ${u.confirm ? `<div class="card sm" style="border-color:var(--coral);gap:10px;background:var(--bg)"><span style="font-size:14px;line-height:1.5">Wirklich alles löschen? Pläne, Verlauf, Rekorde, Notizen und eigene Übungen sind danach weg. Tipp: Vorher sichern.</span>
            <div class="btns"><button type="button" class="btn sec sm" data-a="resetCancel">Abbrechen</button><button type="button" class="btn danger sm" data-a="resetDo">Alles löschen</button></div></div>`
          : `<button type="button" class="btn danger-ghost sm" style="align-self:center" data-a="resetAsk">Alle Daten löschen …</button>`}
        </div></section>

      <section style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:4px 0 12px">
        <img src="icons/logo.png" alt="" style="width:72px;opacity:.8"><span class="num" style="font-size:18px;letter-spacing:1px;text-transform:uppercase">Gym your Life</span><span class="tiny">Version 1.0 · gemacht für Josi</span></section>
    </div>`;
  };

  const A = G.actions, IN = G.inputs;
  IN.setName = (v) => G.setSettings({ name: v });
  IN.setBody = (v, el) => {
    const s = G.settings(), body = Object.assign({}, s.body || {}), k = el.dataset.k;
    body[k] = v.replace(/[^0-9.,]/g, ''); body.date = G.ymd(new Date());
    G.setSettings({ body });
    const t = document.getElementById('bodyStand'); if (t) t.textContent = 'Zuletzt geändert am ' + G.dateLabel(body.date) + '.';
  };
  A.photoDel = () => { G.setSettings({ photo: '' }); G.render(); };
  G.files.profilePhoto = (file) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const S = 320, m = Math.min(img.width, img.height), c = document.createElement('canvas'); c.width = c.height = S;
      c.getContext('2d').drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S);
      URL.revokeObjectURL(url); G.setSettings({ photo: c.toDataURL('image/jpeg', 0.8) }); G.toast('Profilbild gespeichert'); G.render();
    };
    img.onerror = () => G.toast('Das Bild konnte nicht gelesen werden');
    img.src = url;
  };
  A.setStep = (el) => { G.setSettings({ kgStep: +el.dataset.v }); G.render(); };
  A.setPause = (el) => { const s = G.settings(); G.setSettings({ defaultPause: G.clamp(s.defaultPause + +el.dataset.d * 15, 15, 300) }); G.render(); };
  A.setToggle = (el) => { const k = el.dataset.k, s = G.settings(); G.setSettings({ [k]: !s[k] }); G.render(); };
  A.setQuoteSec = (el) => { G.setSettings({ quoteSec: +el.dataset.v }); G.render(); };
  A.setTest = () => { G.unlockAudio(); G.signal(); };
  A.install = async () => { const e = G.installEvt; if (!e) return; e.prompt(); try { await e.userChoice; } catch (x) {} G.installEvt = null; G.render(); };
  A.exportData = () => {
    const data = { app: 'Gym your Life', version: 1, exportiert: new Date().toISOString() };
    ALL_KEYS().forEach((k) => { data[k] = G.load(k, null); });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'), d = new Date();
    a.href = URL.createObjectURL(blob); a.download = 'gym-your-life-sicherung-' + d.getFullYear() + '-' + G.pad(d.getMonth() + 1) + '-' + G.pad(d.getDate()) + '.json';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    G.toast('Sicherung wird gespeichert');
  };
  G.files.importData = (file) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (data.app !== 'Gym your Life') throw new Error('x');
        ALL_KEYS().forEach((k) => { if (data[k] !== undefined && data[k] !== null) G.save(k, data[k]); else G.remove(k); });
        G.ui.tr = null; G.ui.plan = null; G.toast('Sicherung wiederhergestellt'); G.render();
      } catch (e) { G.toast('Diese Datei ist keine Gym-your-Life-Sicherung'); }
    };
    r.readAsText(file);
  };
  A.resetAsk = () => { G.ui.set.confirm = true; G.render(); };
  A.resetCancel = () => { G.ui.set.confirm = false; G.render(); };
  A.resetDo = () => { ALL_KEYS().forEach(G.remove); G.ui.set.confirm = false; G.ui.tr = null; G.ui.plan = null; G.toast('Alle Daten gelöscht'); location.hash = '#/home'; G.render(); };
})();
