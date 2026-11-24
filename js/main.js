// Gym your Life – Start der App: Seitenwechsel, Klicks, Eingaben, Uhr
(function () {
  const G = window.G, app = document.getElementById('app');
  const ROUTES = ['start', 'home', 'plan', 'plaene', 'training', 'verlauf', 'fortschritt', 'routinen', 'essen', 'schwimmen', 'notiz', 'nachtrag', 'wissen', 'einstellungen'];

  const parse = () => {
    const parts = (location.hash || '').replace(/^#\/?/, '').split('/').filter(Boolean);
    const r = ROUTES.indexOf(parts[0]) !== -1 ? parts[0] : 'start';
    return { route: r, params: parts.slice(1) };
  };

  G.render = () => {
    const { route, params } = parse();
    G.route = route;
    app.innerHTML = G.screens[route](params) || '';
    if (G.afterRender) G.afterRender();
    const af = app.querySelector('[autofocus]');
    if (af) { af.focus(); try { const n = af.value.length; af.setSelectionRange(n, n); } catch (e) {} }
  };
  G.renderKeepFocus = () => {
    const a = document.activeElement, id = a && a.id, pos = a && a.selectionStart;
    const sc = document.getElementById('pickerList'), st = sc ? sc.scrollTop : 0;
    G.render();
    const sc2 = document.getElementById('pickerList'); if (sc2) sc2.scrollTop = st;
    if (id) { const e = document.getElementById(id); if (e) { e.focus(); try { e.setSelectionRange(pos, pos); } catch (x) {} } }
  };

  let prevRoute = null;
  window.addEventListener('hashchange', () => {
    const { route } = parse();
    if (prevRoute === 'training' && route !== 'training') G.keepAwake(false);
    if (route === 'training' && G.ui.tr && G.ui.tr.finished) G.ui.tr = null;
    if (route === 'start') { clearTimeout(G.ui.start.timer); G.ui.start = { phase: 'quote', idx: 0, timer: null }; }
    prevRoute = route;
    G.render(); window.scrollTo(0, 0);
  });

  // Klicks
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-a]');
    if (!el) return;
    if (el.dataset.self && e.target !== el) return;
    const fn = G.actions[el.dataset.a];
    if (fn) { if (el.tagName === 'BUTTON') e.preventDefault(); fn(el, e); }
  });
  // Eingaben
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-in]');
    if (el && G.inputs[el.dataset.in]) G.inputs[el.dataset.in](el.value, el);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const el = e.target.closest('[data-enter]');
    if (el && el.tagName !== 'TEXTAREA' && G.actions[el.dataset.enter]) { e.preventDefault(); G.actions[el.dataset.enter](el); }
  });
  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-file]');
    if (el && el.files && el.files[0] && G.files[el.dataset.file]) G.files[el.dataset.file](el.files[0]);
  });

  // Uhr & Timer
  setInterval(() => {
    const c = G.clockParts();
    document.querySelectorAll('[data-clock]').forEach((n) => { n.textContent = c[n.dataset.clock]; });
  }, 1000);
  setInterval(() => G.ticks.forEach((t) => t()), 250);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (G.route === 'training' && G.ui.tr && !G.ui.tr.finished) G.keepAwake(true);
      if (G.route === 'routinen' && G.ui.rt.play && !G.ui.rt.play.done) G.keepAwake(true);
    }
  });

  // Installieren
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); G.installEvt = e; if (G.route === 'einstellungen') G.render(); });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  prevRoute = parse().route;
  G.render();
})();
