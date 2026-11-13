/*
 * TORRAIS EVENT — animations du site public
 *  - « Travelling » dans la salle piloté par le défilement (GSAP + ScrollTrigger)
 *  - Apparitions douces des sections
 *  - Défilement fluide sur ordinateur (Lenis)
 * Rien ne bouge si la personne a demandé de réduire les animations, ou si les bibliothèques manquent.
 */
(function () {
  'use strict';

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  var header = $('.header');
  function headerH() { return header ? header.offsetHeight : 0; }

  /* ---------- défilement fluide (ordinateur uniquement) ---------- */
  var lenis = null;
  var desktop = window.matchMedia && window.matchMedia('(pointer: fine) and (min-width: 900px)').matches;
  if (desktop && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    // Liens vers une section de la même page : défilement fluide sous l'en-tête
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href*="#"]');
      if (!a || e.defaultPrevented) return;
      var url = new URL(a.href, window.location.href);
      if (url.pathname !== window.location.pathname || !url.hash || url.hash === '#') return;
      var target = document.querySelector(url.hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target); // l'espace sous l'en-tête vient de scroll-padding-top (site.css)
      history.pushState(null, '', url.hash);
    });
  }

  /* ---------- travelling dans la salle ---------- */
  var hero = $('.hero[data-walk]');
  if (hero) {
    var layers = $$('.walk__layer', hero);
    var inner = $('.hero__inner', hero);
    var endCard = $('.walk__end', hero);
    var cue = $('.hero__scroll', hero);
    var IMG_RATIO = 1672 / 941;

    function ease(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
    function lerp(a, b, t) { return a + (b - a) * t; }
    // Mêmes mouvements que la vidéo : centre (x, y) et zoom, du début à la fin de chaque plan
    var SHOTS = [
      { t0: 0.0, t1: 6.5, a: [0.44, 0.55, 1.00], b: [0.70, 0.53, 1.46], curve: 'in' },
      { t0: 5.4, t1: 11.1, a: [0.50, 0.52, 1.40], b: [0.50, 0.52, 1.62], curve: 'linear' },
      { t0: 10.0, t1: 14.8, a: [0.28, 0.48, 1.62], b: [0.56, 0.54, 1.10], curve: 'out' }
    ];
    var FADES = [[5.4, 6.5], [10.0, 11.1]];
    var END = 14.8;

    function camera(shot, t) {
      var u = Math.max(0, Math.min(1, (t - shot.t0) / (shot.t1 - shot.t0)));
      var k = shot.curve === 'in' ? 1 - Math.cos(u * Math.PI / 2) : shot.curve === 'out' ? Math.sin(u * Math.PI / 2) : u;
      return [lerp(shot.a[0], shot.b[0], k), lerp(shot.a[1], shot.b[1], k), lerp(shot.a[2], shot.b[2], k)];
    }
    function place(el, cam) {
      // La photo couvre le héros (background-size: cover) : on convertit le point visé en position dans le cadre
      var LW = hero.clientWidth, LH = hero.clientHeight;
      var s = Math.max(LW / (IMG_RATIO * 1000), LH / 1000);
      var iw = IMG_RATIO * 1000 * s, ih = 1000 * s;
      var fx = (cam[0] * iw + (LW - iw) / 2) / LW;
      var fy = (cam[1] * ih + (LH - ih) / 2) / LH;
      var z = cam[2];
      var lim = (1 - 1 / z) / 2;
      var tx = Math.max(-lim, Math.min(lim, 0.5 - fx)) * 100;
      var ty = Math.max(-lim, Math.min(lim, 0.5 - fy)) * 100;
      el.style.transform = 'scale(' + z.toFixed(4) + ') translate(' + tx.toFixed(3) + '%, ' + ty.toFixed(3) + '%)';
    }
    function render(t) {
      var o = [0, 0, 0];
      if (t < FADES[0][0]) o = [1, 0, 0];
      else if (t < FADES[0][1]) { var a = ease((t - FADES[0][0]) / (FADES[0][1] - FADES[0][0])); o = [1, a, 0]; }
      else if (t < FADES[1][0]) o = [0, 1, 0];
      else if (t < FADES[1][1]) { var b = ease((t - FADES[1][0]) / (FADES[1][1] - FADES[1][0])); o = [0, 1, b]; }
      else o = [0, 0, 1];
      // Le calque du dessus apparaît en fondu ; ceux du dessous restent opaques pour éviter un voile clair
      layers.forEach(function (el, i) {
        el.style.opacity = o[i];
        el.style.visibility = o[i] > 0 ? 'visible' : 'hidden';
        if (o[i] > 0) place(el, camera(SHOTS[i], t));
      });
    }

    var state = { t: 0 };
    render(0);
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(state, { t: END, duration: END, onUpdate: function () { render(state.t); } }, 0);
    if (inner) tl.to(inner, { autoAlpha: 0, y: -60, duration: 3.2, ease: 'power1.in' }, 0.3);
    if (cue) tl.to(cue, { autoAlpha: 0, duration: 1 }, 0);
    // On éclaircit la salle pendant la marche, puis on assombrit pour le message final
    tl.fromTo(hero, { '--walk-dim': 1 }, { '--walk-dim': 0.35, duration: 2.6, ease: 'power1.inOut' }, 0.8);
    tl.to(hero, { '--walk-dim': 0.95, duration: 2.2, ease: 'power1.inOut' }, 11.2);
    if (endCard) tl.fromTo(endCard, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 2.2, ease: 'power1.out' }, 11.6);

    ScrollTrigger.create({
      trigger: hero,
      start: function () { return 'top ' + headerH(); },
      end: function () { return '+=' + Math.round(window.innerHeight * 2.2); },
      pin: true,
      scrub: 0.6,
      animation: tl,
      invalidateOnRefresh: true,
      onRefresh: function () { render(state.t); }
    });
    window.addEventListener('resize', function () { render(state.t); });
  }

  /* ---------- apparitions douces ---------- */
  var REVEAL = [
    '.section-head', '.about__visual', '.about__grid > div:last-child > *', '.occasion', '.service', '.dish', '.package', '.stat',
    '.steps li', '.review', '.faq__item', '.occ-intro > *', '.devis__intro', '#quoteMount', '.contact__list li', '.contact__map', '.cta-band__inner > *',
    '#galleryGrid .gallery__item', '.filters'
  ].join(',');
  var items = $$(REVEAL).filter(function (el) { return !el.closest('.hero'); });
  // Seulement l'opacité : les éléments restent utilisables (clavier, lecteurs d'écran) avant leur apparition
  gsap.set(items, { opacity: 0, y: 28 });
  ScrollTrigger.batch(items, {
    start: 'top 90%',
    once: true,
    onEnter: function (batch) {
      gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.08, overwrite: true, clearProps: 'transform' });
    }
  });
  // Les photos de la galerie sont redessinées quand on change de filtre : elles doivent rester visibles
  // Un élément qui reçoit le focus (clavier) apparaît tout de suite
  document.addEventListener('focusin', function (e) {
    var it = items.filter(function (el) { return el.contains(e.target); })[0];
    if (it) gsap.to(it, { opacity: 1, y: 0, duration: 0.3, overwrite: true });
  });
  var filters = $('#galleryFilters');
  if (filters) filters.addEventListener('click', function () { setTimeout(function () { gsap.set('#galleryGrid .gallery__item', { opacity: 1, y: 0 }); }, 0); });

  // Recalcul une fois les images et polices chargées
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });

  window.TorraisMotion = { lenis: lenis };
})();
