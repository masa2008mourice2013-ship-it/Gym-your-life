// Gym your Life – Pläne: alle Trainingspläne an einem Ort, von hier aus starten oder bearbeiten
(function () {
  const G = window.G, I = G.I, esc = G.esc;

  G.screens.plaene = () => {
    const u = G.ui.home, plans = G.plans(), dpl = G.load(G.K.dayplan, {}), todayKey = G.ymd(new Date());
    const fixedDays = (p) => (dpl[todayKey] === p.id ? 'für heute gewählt' : 'bearbeiten');
    const planCards = plans.map((p) => u.editingId === p.id ? `
      <div class="card active sm" style="gap:10px">
        <label class="label" for="pname">Plan umbenennen</label>
        <input id="pname" class="input big" value="${esc(u.draft)}" maxlength="28" data-in="homeDraft" data-enter="homeSave" autofocus>
        <div class="btns"><button type="button" class="btn ghost md" data-a="homeCancel">Abbrechen</button><button type="button" class="btn md" data-a="homeSave">Speichern</button></div>
      </div>` : `
      <div class="plan-card">
        <span class="ico-box">${I.dumbbell(22)}</span>
        <a href="#/plan/${p.id}" class="link-area" aria-label="${esc(p.name)} bearbeiten"><span class="h3 ellipsis">${esc(p.name)}</span><span class="small">${p.exercises.length} Übungen · ${fixedDays(p)}</span></a>
        <button type="button" class="icon-btn plain" data-a="homeRename" data-id="${p.id}" aria-label="${esc(p.name)} umbenennen" style="color:var(--muted)">${I.pencil(20)}</button>
        <a href="#/training" class="play" data-a="setActive" data-id="${p.id}" aria-label="${esc(p.name)} starten">${I.play(18)}</a>
      </div>`).join('');

    const favs = G.freeEntries().filter((x) => x.fav).sort((a, b) => new Date(b.date) - new Date(a.date));
    const favBox = `<div class="list"><h2 class="h2" style="padding:0 4px;font-size:22px">${I.star(20, true).replace('<svg ', '<svg style="color:var(--amber);vertical-align:-3px" ')} Favoriten</h2>
      ${favs.length ? '<span class="tiny" style="padding:0 4px">Trainings, die dir gefallen haben. Tippen = an einem anderen Tag nochmal machen.</span>' + favs.map((x) => { const n = G.freeEntries().filter((y) => y.from === x.id).length; return `<button type="button" class="card amber sm row" style="flex-direction:row;align-items:center;min-height:64px;text-align:left;color:var(--text)" data-a="frAgain" data-id="${x.id}">
        <span class="ico-box" style="background:var(--amber);color:var(--bg)">${I.repeat(22)}</span>
        <span class="grow" style="display:flex;flex-direction:column;gap:2px;min-width:0"><span class="h3 ellipsis" style="font-size:19px">${esc(G.freeTitle(x))}</span><span class="small">${x.min ? x.min + ' Min. · ' : ''}${n ? n + '× wiederholt · ' : ''}zuletzt ${G.agoText(x.date)}</span></span><span class="muted">${I.next(20)}</span></button>`; }).join('')
      : '<div class="card empty" style="padding:16px">Noch keine Favoriten. Markiere ein freies Training mit dem Stern – dann liegt es hier zum erneuten Starten bereit.</div>'}</div>`;
    return `<div class="screen with-nav">${G.header()}
      <div class="row-between" style="padding:0 4px;align-items:flex-end">
        <div class="title-block" style="padding:0"><span class="eyebrow">Training starten oder bearbeiten</span><h1 class="h1" style="font-size:38px">Deine Pläne</h1></div>
        <button type="button" class="pill" data-a="newPlan">+ Neuer Plan</button></div>
      <span class="small" style="padding:0 4px">Tippe auf den Pfeil, um einen Plan sofort zu starten – auch wenn er nicht dein Plan für heute ist.</span>
      <div class="list">${planCards}</div>
      ${favBox}
    </div>${G.nav('plaene')}`;
  };
})();
