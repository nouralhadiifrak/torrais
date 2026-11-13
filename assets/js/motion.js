/*
 * TORRAIS EVENT — animations du site public
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
