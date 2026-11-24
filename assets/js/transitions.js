/*
 * TORRAIS EVENT — transitions entre pages, façon « élément partagé » (tous navigateurs)
 *  - Aller : la photo de la carte touchée grandit jusqu'à devenir la grande photo en haut de la page suivante ;
 *    le reste de la page s'efface doucement (fond clair).
 *  - Retour : la grande photo se replie exactement dans sa carte, la liste réapparaît à sa place,
 *    et la carte d'origine est brièvement soulignée.
 *  - Les autres liens du site : un fondu clair.
 * Rien ne bouge si la personne a demandé de réduire les animations.
 */
(function () {
  'use strict';

  var html = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CARD_SEL = '.pack, .occasion, .sig, .cf-card';
  var IMG_SEL = '.occasion__img, .pack__img, .sig__img, .cf-card';
  var KEY = 'pt_nav';      // { from, href, src, hero } : d'où l'on vient, et la photo partagée
  var KEY_ENTER = 'pt_enter';
  var DUR = 620;
  var EASE = 'cubic-bezier(.65, 0, .25, 1)';
  var IVORY = getComputedStyle(html).getPropertyValue('--ivory').trim() || '#fbf8f3';
  var busy = false;

  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function clean(h) { return String(h || '').split('#')[0]; }
  function rectOf(el) { var r = el.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; }
  function kf(r, radius, extra) {
    var k = { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', borderRadius: radius };
    for (var p in extra) k[p] = extra[p];
    return k;
  }
  function headerBottom() {
    var h = document.querySelector('.header');
    return h ? Math.max(0, h.getBoundingClientRect().bottom) : 0;
  }
  // la place de la grande photo en haut d'une page de détail
  function heroRect() {
    var hero = document.getElementById('pageHero');
    if (hero) { var r = rectOf(hero); return { left: 0, top: Math.max(r.top, 0), width: window.innerWidth, height: Math.min(r.height, window.innerHeight * 0.7) }; }
    var top = headerBottom();
    return { left: 0, top: top, width: window.innerWidth, height: Math.min(window.innerHeight * 0.55, 460) };
  }
  function layer(cls) { var el = document.createElement('div'); el.className = cls; el.setAttribute('aria-hidden', 'true'); document.body.appendChild(el); return el; }
  function veil(opacity) {
    var v = layer('pt-veil');
    v.style.background = IVORY;
    v.style.opacity = opacity;
    return v;
  }
  function photo(src, r, radius, darken) {
    var p = layer('pt-photo');
    p.style.left = r.left + 'px'; p.style.top = r.top + 'px'; p.style.width = r.width + 'px'; p.style.height = r.height + 'px';
    p.style.borderRadius = radius;
    if (src) p.style.backgroundImage = 'url("' + src + '")';
    else p.classList.add('pt-photo--ph');
    if (darken) { var d = document.createElement('span'); d.className = 'pt-photo__shade'; p.appendChild(d); }
    return p;
  }
  function srcOf(card) {
    var box = card.matches(IMG_SEL) ? card : card.querySelector(IMG_SEL);
    var img = box && box.querySelector('img');
    if (img && (img.currentSrc || img.src)) return { el: box, src: img.currentSrc || img.src };
    if (box) return { el: box, src: '' };
    return { el: card, src: '' };
  }
  function done(a, cb) { if (!a) { cb(); return; } a.onfinish = cb; a.oncancel = cb; }

  /* ---------- aller ---------- */
  function forward(card, href) {
    if (busy) return;
    busy = true;
    var s = card ? srcOf(card) : null;
    var v = veil(0);
    var fadeVeil = v.animate([{ opacity: 0 }, { opacity: 1 }], { duration: card ? DUR * 0.8 : 380, easing: 'ease', fill: 'forwards' });
    var target = heroRect();
    var store = { from: location.pathname, href: clean(href), src: s ? s.src : '', hero: target };
    if (!card) {
      ss('pt_nav', null);
      done(fadeVeil, function () { ss(KEY_ENTER, 'fade'); window.location.href = href; });
      return;
    }
    var r = rectOf(s.el);
    var radius = getComputedStyle(s.el).borderRadius || getComputedStyle(card).borderRadius || '16px';
    var p = photo(s.src, r, radius, true);
    var a = p.animate([kf(r, radius), kf(target, '0px')], { duration: DUR, easing: EASE, fill: 'forwards' });
    p.firstChild.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DUR, easing: 'ease', fill: 'forwards' });
    ss(KEY, JSON.stringify(store));
    done(a, function () { ss(KEY_ENTER, 'card'); window.location.href = href; });
  }

  /* ---------- arrivée ---------- */
  function navType() { var n = performance.getEntriesByType && performance.getEntriesByType('navigation')[0]; return n ? n.type : ''; }
  function findCard(href) {
    var link = $$('a[href]').filter(function (a) { return clean(a.getAttribute('href')) === href && a.closest(CARD_SEL); })[0];
    if (link) return link.closest(CARD_SEL);
    if (href === 'menus.html') return document.querySelector('#dishesTrack .cf-card.is-active');
    return null;
  }
  function cleanup() { $$('.pt-veil, .pt-photo').forEach(function (el) { el.remove(); }); html.classList.remove('pt-enter'); busy = false; }

  function arrive(isBack) {
    var info = null;
    try { info = JSON.parse(ss(KEY) || 'null'); } catch (e) {}
    var entering = ss(KEY_ENTER);
    ss(KEY_ENTER, null);
    $$('.pt-veil, .pt-photo').forEach(function (el) { el.remove(); });
    if (reduce || (!entering && !html.classList.contains('pt-enter') && !isBack)) { cleanup(); return; }

    // retour : la grande photo se replie dans sa carte
    var card = isBack && info && info.from === location.pathname ? findCard(info.href) : null;
    if (card) {
      var s = srcOf(card);
      var start = info.hero || heroRect();
      var r = rectOf(s.el);
      var radius = getComputedStyle(s.el).borderRadius || '16px';
      var v = veil(1);
      var p = photo(s.src || info.src, start, '0px', true);
      p.firstChild.style.opacity = 1;
      html.classList.remove('pt-enter');
      var a = p.animate([kf(start, '0px'), kf(r, radius)], { duration: DUR, easing: EASE, fill: 'forwards' });
      p.firstChild.animate([{ opacity: 1 }, { opacity: 0 }], { duration: DUR, easing: 'ease', fill: 'forwards' });
      v.animate([{ opacity: 1 }, { opacity: 0 }], { duration: DUR, easing: 'ease', fill: 'forwards' });
      done(a, function () {
        cleanup();
        card.classList.add('pt-came-from');
        setTimeout(function () { card.classList.remove('pt-came-from'); }, 1400);
      });
      ss(KEY, null);
      return;
    }

    // aller : la page arrive sous la grande photo, qui se fond dans le haut de la page
    var v2 = veil(1);
    html.classList.remove('pt-enter');
    var p2 = null;
    if (entering === 'card' && info && info.href === clean(location.pathname.split('/').pop() || 'index.html')) {
      var hr = heroRect();
      p2 = photo(info.src, info.hero || hr, '0px', true);
      p2.firstChild.style.opacity = 1;
      var hero = document.getElementById('pageHero');
      p2.animate([kf(info.hero || hr, '0px', { opacity: 1 }), kf(hr, '0px', { opacity: hero ? 0 : 1 })], { duration: 520, easing: 'ease', fill: 'forwards' });
    }
    // le contenu monte légèrement en apparaissant
    var main = document.getElementById('contenu');
    if (main && main.animate) main.animate([{ transform: 'translateY(18px)' }, { transform: 'none' }], { duration: 560, easing: 'cubic-bezier(.2, .7, .2, 1)' });
    var a2 = v2.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 480, delay: 60, easing: 'ease', fill: 'forwards' });
    done(a2, function () { if (p2) p2.remove(); cleanup(); });
  }

  window.TorraisPT = {
    go: function (card, href) { if (reduce || !document.body.animate) { window.location.href = href; return; } forward(card, href); }
  };

  window.addEventListener('pageshow', function (e) {
    busy = false;
    var back = e.persisted || navType() === 'back_forward';
    // laisse le navigateur remettre la page à sa place avant de mesurer la carte
    requestAnimationFrame(function () { setTimeout(function () { arrive(back); }, back ? 30 : 0); });
  });
  // en quittant une page de détail par le bouton retour : on note où était la grande photo
  window.addEventListener('pagehide', function () {
    if (!ss(KEY_ENTER)) ss(KEY_ENTER, 'back');
    try {
      var info = JSON.parse(ss(KEY) || 'null');
      if (info && document.getElementById('pageHero')) { info.hero = heroRect(); ss(KEY, JSON.stringify(info)); }
    } catch (e) {}
  });

  /* ---------- clics sur les liens du site ---------- */
  document.addEventListener('click', function (e) {
    if (reduce || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(https?:|tel:|mailto:|whatsapp:|javascript:)/i.test(href) || a.hasAttribute('data-wa-link')) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    var card = a.closest(CARD_SEL);
    if (!card && a.closest('.carte-cta') && clean(href) === 'menus.html') card = document.querySelector('#dishesTrack .cf-card.is-active');
    window.TorraisPT.go(card, href);
  });
})();
