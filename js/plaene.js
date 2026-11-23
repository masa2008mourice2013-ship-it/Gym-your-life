// Gym your Life – Pläne: alle Trainingspläne an einem Ort, von hier aus starten oder bearbeiten
(function () {
  const G = window.G, I = G.I, esc = G.esc;

  G.screens.plaene = () => {
    const u = G.ui.home, plans = G.plans(), wp = G.load(G.K.weekplan, {});
    const fixedDays = (p) => {
      const d = [1, 2, 3, 4, 5, 6, 0].filter((wd) => wp[wd] === p.id).map((wd) => G.WD[wd]);
      return d.length ? 'jeden ' + d.join(', ') : 'bearbeiten';
    };
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

    return `<div class="screen with-nav">${G.header()}
      <div class="row-between" style="padding:0 4px;align-items:flex-end">
        <div class="title-block" style="padding:0"><span class="eyebrow">Training starten oder bearbeiten</span><h1 class="h1" style="font-size:38px">Deine Pläne</h1></div>
        <button type="button" class="pill" data-a="newPlan">+ Neuer Plan</button></div>
      <span class="small" style="padding:0 4px">Tippe auf den Pfeil, um einen Plan sofort zu starten – auch wenn er nicht dein Plan für heute ist.</span>
      <div class="list">${planCards}</div>
    </div>${G.nav('plaene')}`;
  };
})();
