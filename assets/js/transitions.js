/*
 * TORRAIS EVENT — transitions entre pages (tous navigateurs)
 *  - Une carte (pack, service, plat) s'agrandit jusqu'à remplir l'écran, puis la page suivante apparaît.
 *  - Au retour, l'écran se replie dans la carte d'où l'on était parti.
 *  - Les autres liens du site : un fondu doux.
 * Rien ne bouge si la personne a demandé de réduire les animations.
 */
(function () {
  'use strict';

  var html = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CARD_SEL = '.pack, .occasion, .sig, .cf-card';
  var KEY_CARD = 'pt_card';   // { from, href } : la carte d'où l'on est parti
  var KEY_ENTER = 'pt_enter'; // une page du site vient d'être quittée : la suivante apparaît en fondu
  var DUR = 750;
  var EASE = 'cubic-bezier(.65, 0, .25, 1)';
  var BG = '#16130f';
  var busy = false;

  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function cleanHref(h) { return String(h || '').split('#')[0]; }
  function shape() {
    var el = document.querySelector('.pt-shape');
    if (!el) { el = document.createElement('div'); el.className = 'pt-shape'; el.setAttribute('aria-hidden', 'true'); document.body.appendChild(el); }
    return el;
  }
  function place(el, r, radius) {
    el.style.left = r.left + 'px'; el.style.top = r.top + 'px';
    el.style.width = r.width + 'px'; el.style.height = r.height + 'px';
    el.style.borderRadius = radius;
  }
  function full() { return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }; }
  function animate(el, from, to, dur, done) {
    if (!el.animate) { done && done(); return; }
    var a = el.animate([from, to], { duration: dur, easing: EASE, fill: 'forwards' });
    a.onfinish = function () { done && done(); };
    return a;
  }
  function rectKeyframe(r, radius, extra) {
    var k = { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', borderRadius: radius };
    for (var p in extra) k[p] = extra[p];
    return k;
  }

  /* ---------- partir : la carte s'agrandit ---------- */
  function expandTo(card, href) {
    if (busy) return;
    busy = true;
    var r = card.getBoundingClientRect();
    var radius = getComputedStyle(card).borderRadius || '18px';
    var el = shape();
    // une copie de la carte, qui s'efface pendant que la forme grandit
    el.innerHTML = '';
    var clone = card.cloneNode(true);
    clone.removeAttribute('id');
    clone.classList.add('pt-clone');
    clone.style.width = r.width + 'px'; clone.style.height = r.height + 'px';
    el.appendChild(clone);
    el.style.background = getComputedStyle(card).backgroundColor === 'rgba(0, 0, 0, 0)' ? '#fff' : getComputedStyle(card).backgroundColor;
    place(el, r, radius);
    el.classList.add('is-on');
    ss(KEY_CARD, JSON.stringify({ from: location.pathname, href: cleanHref(href) }));
    animate(clone, { opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.04)' }, DUR * 0.55);
    animate(el, rectKeyframe(r, radius, { backgroundColor: el.style.background }), rectKeyframe(full(), '0px', { backgroundColor: BG }), DUR, function () {
      ss(KEY_ENTER, 'card');
      window.location.href = href;
      busy = false;
    });
  }
  /* ---------- partir : fondu ---------- */
  function fadeTo(href) {
    if (busy) return;
    busy = true;
    ss(KEY_CARD, null);
    var el = shape();
    el.innerHTML = '';
    el.style.background = BG;
    place(el, full(), '0px');
    el.classList.add('is-on');
    animate(el, { opacity: 0 }, { opacity: 1 }, 380, function () {
      ss(KEY_ENTER, 'fade');
      window.location.href = href;
      busy = false;
    });
  }
  window.TorraisPT = {
    go: function (card, href) { if (reduce) { window.location.href = href; return; } card ? expandTo(card, href) : fadeTo(href); }
  };

  /* ---------- arriver : la page apparaît (ou se replie dans la carte au retour) ---------- */
  function navType() { var n = performance.getEntriesByType && performance.getEntriesByType('navigation')[0]; return n ? n.type : ''; }
  function findCard(href) {
    var link = $$('a[href]').filter(function (a) { return cleanHref(a.getAttribute('href')) === href && a.closest(CARD_SEL); })[0];
    if (link) return link.closest(CARD_SEL);
    if (href === 'menus.html') return document.querySelector('#dishesTrack .cf-card.is-active');
    return null;
  }
  function reveal(isBack) {
    var el = document.querySelector('.pt-shape.is-on');
    var cover = html.classList.contains('pt-enter');
    if (!el && !cover) return;
    if (!el) { el = shape(); el.innerHTML = ''; el.style.background = BG; place(el, full(), '0px'); el.classList.add('is-on'); }
    html.classList.remove('pt-enter');
    ss(KEY_ENTER, null);
    var info = null;
    try { info = JSON.parse(ss(KEY_CARD) || 'null'); } catch (e) {}
    var card = isBack && info && info.from === location.pathname ? findCard(info.href) : null;
    if (el.getAnimations) el.getAnimations().forEach(function (a) { a.cancel(); });
    el.innerHTML = '';
    if (card && !reduce) {
      // au retour : l'écran se replie dans la carte
      var r = card.getBoundingClientRect();
      var radius = getComputedStyle(card).borderRadius || '18px';
      place(el, full(), '0px');
      el.style.background = BG;
      animate(el, rectKeyframe(full(), '0px', { backgroundColor: BG, opacity: 1 }), rectKeyframe(r, radius, { backgroundColor: BG, opacity: 0.85 }), DUR, function () {
        animate(el, { opacity: 0.85 }, { opacity: 0 }, 220, function () { el.classList.remove('is-on'); if (el.getAnimations) el.getAnimations().forEach(function (a) { a.cancel(); }); });
      });
      ss(KEY_CARD, null);
    } else {
      place(el, full(), '0px');
      animate(el, { opacity: 1 }, { opacity: 0 }, reduce ? 1 : 600, function () { el.classList.remove('is-on'); if (el.getAnimations) el.getAnimations().forEach(function (a) { a.cancel(); }); });
    }
  }
  window.addEventListener('pageshow', function (e) {
    busy = false;
    var back = e.persisted || navType() === 'back_forward';
    // laisse le navigateur remettre la page à sa place avant de mesurer la carte
    requestAnimationFrame(function () { requestAnimationFrame(function () { reveal(back); }); });
  });
  // en quittant une page du site par le bouton retour (sans clic), la page d'avant apparaîtra en fondu
  window.addEventListener('pagehide', function () { if (!ss(KEY_ENTER)) ss(KEY_ENTER, 'fade'); });

  /* ---------- clics sur les liens du site ---------- */
  document.addEventListener('click', function (e) {
    if (reduce || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(https?:|tel:|mailto:|whatsapp:|javascript:)/i.test(href) || a.hasAttribute('data-wa-link')) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return; // ancre de la même page
    e.preventDefault();
    var card = a.closest(CARD_SEL);
    if (!card && a.closest('.carte-cta') && cleanHref(href) === 'menus.html') card = document.querySelector('#dishesTrack .cf-card.is-active');
    window.TorraisPT.go(card, href);
  });
})();
