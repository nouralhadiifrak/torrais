/*
 * TORRAIS EVENT — écran d'ouverture de la page d'accueil
 *  1. Les photos tournent en cercle (sens des aiguilles d'une montre)
 *  2. Les autres photos s'écartent, la photo de la salle s'agrandit
 *  3. Elle se pose exactement à la place du fond du héros, puis le texte apparaît
 * Un clic, une touche ou la molette passent l'animation.
 * Rien ne s'affiche si la personne a demandé de réduire les animations (voir le script en tête de index.html).
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var box = document.getElementById('intro');
  clearTimeout(window.__introSafety);
  if (!box) { window.__introDone = true; return; }
  var gsap = window.gsap;
  if (!root.classList.contains('is-intro') || !gsap) { finish(); return; }

  var lenis = window.TorraisMotion && window.TorraisMotion.lenis;
  if (lenis) lenis.stop();
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* ---------- les photos ---------- */
  var CROPS = ['c01', 'c02', 'c03', 'c04', 'c05', 'c06', 'c07', 'c08', 'c09', 'c10', 'c11'].map(function (n) { return 'assets/img/loader/' + n + '.webp'; });
  // Photos ajoutées par le gérant dans la galerie : elles passent en premier
  var own = [];
  try {
    var data = window.Torrais && window.Torrais.store.load();
    own = ((data && data.gallery) || []).filter(function (g) { return g.src; }).map(function (g) { return g.src; });
  } catch (e) { own = []; }
  var heroSlide = document.querySelector('#heroSlides .hero__slide.is-active') || document.querySelector('#heroSlides .hero__slide');
  var heroSrc = 'assets/img/salle.jpg';
  if (heroSlide) {
    var m = /url\(["']?(.*?)["']?\)/.exec(heroSlide.style.backgroundImage || '');
    if (m) heroSrc = m[1];
  }
  var N = 12;
  var pics = CROPS.slice(0, N - 1); // les 11 photos recadrées en carré pour le carrousel
  while (pics.length < N - 1) pics.push(CROPS[pics.length % CROPS.length]);
  pics.push(heroSrc); // la dernière carte (au-dessus des autres) est celle du héros

  var stage = document.createElement('div');
  stage.className = 'intro__stage';
  box.appendChild(stage);
  var logo = box.querySelector('.intro__logo');

  var cards = pics.map(function (src, i) {
    var el = document.createElement('div');
    el.className = 'intro__card';
    el.style.zIndex = String(i + 1); // chaque carte passe sur la précédente
    el.style.backgroundImage = 'url("' + src + '")';
    if (i === N - 1) el.innerHTML = '<span class="intro__shade"></span>';
    stage.appendChild(el);
    return { el: el, p: 0, o: 0, free: false };
  });
  var hero = cards[N - 1];

  /* ---------- géométrie ---------- */
  var vw, vh, R, S;
  function measure() {
    vw = window.innerWidth; vh = window.innerHeight;
    R = Math.min(vw, vh) * (vw < 640 ? 0.36 : 0.33);
    S = Math.round(R * 0.56);
    cards.forEach(function (c) {
      if (c.free) return;
      c.el.style.width = c.el.style.height = S + 'px';
      c.el.style.borderRadius = Math.round(S * 0.17) + 'px';
    });
  }
  measure();
  window.addEventListener('resize', measure);

  var state = { rot: -Math.PI / 2 - (N - 1) * (Math.PI * 2 / N), speed: 0.62 };
  var step = Math.PI * 2 / N;
  function draw() {
    var cx = vw / 2, cy = vh / 2;
    cards.forEach(function (c, i) {
      if (c.free) return;
      var a = state.rot + i * step;
      var r = R * c.p;
      var sc = 0.35 + 0.65 * Math.min(1, c.p);
      c.el.style.transform = 'translate3d(' + (cx + r * Math.cos(a) - S / 2).toFixed(1) + 'px,' + (cy + r * Math.sin(a) - S / 2).toFixed(1) + 'px,0) scale(' + sc.toFixed(3) + ')';
      c.el.style.opacity = c.o.toFixed(3);
    });
  }
  function tick(time, delta) {
    state.rot += state.speed * Math.min(delta, 50) / 1000;
    draw();
  }
  draw();
  gsap.ticker.add(tick);

  /* ---------- préchargement (sans bloquer plus de 3 s) ---------- */
  function preload(src) {
    return new Promise(function (res) { var im = new Image(); im.onload = im.onerror = res; im.src = src; });
  }
  var ready = Promise.race([
    Promise.all(pics.map(preload)),
    new Promise(function (res) { setTimeout(res, 3000); })
  ]);

  /* ---------- déroulé ---------- */
  var tl = gsap.timeline();
  tl.to(logo, { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' }, 0)
    .to(cards, { p: 1, o: 1, duration: 1.1, ease: 'power3.out', stagger: 0.07 }, 0.1);

  var minHold = new Promise(function (res) { setTimeout(res, 2600); });
  var skipped = false;
  Promise.all([ready, minHold]).then(function () { if (!skipped) land(); });

  function heroRect() {
    var target = document.getElementById('heroSlides') || document.querySelector('.hero');
    var r = target ? target.getBoundingClientRect() : null;
    if (!r || !r.width || !r.height) return { left: 0, top: 0, width: vw, height: vh };
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }

  function land() {
    var t = gsap.timeline({ onComplete: reveal });
    // la rotation ralentit, les autres photos s'écartent
    t.to(state, { speed: 0, duration: 0.7, ease: 'power2.out' }, 0)
      .to(logo, { opacity: 0, scale: 0.85, duration: 0.5, ease: 'power2.in' }, 0)
      .to(cards.slice(0, N - 1), { p: 1.9, o: 0, duration: 0.8, ease: 'power2.in', stagger: { each: 0.03, from: 'end' } }, 0.15)
      .add(function () {
        // la photo du héros se détache du cercle et s'agrandit jusqu'au fond du héros
        var b = hero.el.getBoundingClientRect();
        hero.free = true;
        gsap.set(hero.el, { transform: 'none', left: b.left, top: b.top, width: b.width, height: b.height, zIndex: 50 });
        var dest = heroRect();
        var split = document.querySelector('.hero--split') && window.innerWidth >= 900;
        if (split) {
          // même fondu que le héros, qui s'installe pendant que la photo s'agrandit (--f : 0 → 1)
          hero.el.style.setProperty('--f', '0');
          hero.el.style.webkitMaskImage = hero.el.style.maskImage = 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,calc(.08 * var(--f) + 1 - var(--f))) calc(10% * var(--f)), rgba(0,0,0,calc(.28 * var(--f) + 1 - var(--f))) calc(22% * var(--f)), rgba(0,0,0,calc(.58 * var(--f) + 1 - var(--f))) calc(36% * var(--f)), rgba(0,0,0,calc(.85 * var(--f) + 1 - var(--f))) calc(50% * var(--f)), #000 calc(62% * var(--f)))';
          gsap.to(hero.el, { '--f': 1, duration: 1.25, ease: 'power2.inOut' });
        }
        gsap.timeline()
          .to(hero.el, { left: dest.left, top: dest.top, width: dest.width, height: dest.height, borderRadius: 0, borderColor: 'rgba(216,191,138,0)', boxShadow: '0 0 0 rgba(0,0,0,0)', duration: 1.25, ease: 'power3.inOut' }, 0)
          .to(hero.el.firstChild, { opacity: 1, duration: 1.0, ease: 'power1.inOut' }, 0.25)
          .to(box.querySelector('.intro__bg'), { opacity: 0, duration: 0.6, ease: 'power1.out' }, 0.75);
      }, 0.45)
      .to({}, { duration: 0.01 }, 1.62);
  }

  function reveal() {
    root.classList.add('intro-reveal');
    var items = document.querySelectorAll('.hero__inner > *, .hero__scroll, .hero__dots');
    gsap.fromTo(items, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.85, ease: 'power2.out', stagger: 0.09, clearProps: 'opacity,transform' });
    gsap.to(box, { opacity: 0, duration: 0.45, delay: 0.15, ease: 'power1.out', onComplete: finish });
  }

  function finish() {
    if (window.gsap && typeof tick === 'function') window.gsap.ticker.remove(tick);
    window.removeEventListener('resize', measure);
    ['click', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) { window.removeEventListener(ev, skip, true); });
    root.classList.remove('is-intro', 'intro-reveal');
    if (box && box.parentNode) box.parentNode.removeChild(box);
    window.__introDone = true;
    try { window.dispatchEvent(new Event('torrais:intro-done')); } catch (e) {}
    var l = window.TorraisMotion && window.TorraisMotion.lenis;
    if (l) l.start();
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  function skip(e) {
    if (skipped) return;
    if (e && e.type === 'keydown' && (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta')) return;
    skipped = true;
    gsap.killTweensOf([state, logo, hero.el].concat(cards));
    tl.kill();
    gsap.to(box, { opacity: 0, duration: 0.35, ease: 'power1.out', onComplete: finish });
  }
  ['click', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, skip, true); });
})();
