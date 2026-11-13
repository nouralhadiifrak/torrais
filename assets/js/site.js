/* TORRAIS EVENT — site public (accueil + pages « univers ») */
(function () {
  'use strict';

  var T = window.Torrais;
  var U = T.util;
  var esc = U.esc;
  var data = T.store.load();
  var s = data.settings;
  var PAGE = document.body.getAttribute('data-page') || 'home';
  var HOME = PAGE === 'home' ? '' : 'index.html';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function occUrl(o) { return 'evenement.html?type=' + encodeURIComponent(o.id); }

  // Page « univers » : quelle occasion afficher ?
  var occasion = null;
  if (PAGE === 'occasion') {
    var wanted = (new URLSearchParams(window.location.search)).get('type');
    occasion = data.occasions.filter(function (o) { return o.id === wanted; })[0] || data.occasions[0];
  }

  /* ---------- en-tête et pied de page (communs aux pages) ---------- */
  function renderChrome() {
    var logo = data.media && data.media.logo
      ? '<img class="brand__logo" src="' + esc(data.media.logo) + '" alt="TORRAIS EVENT">'
      : '<span class="brand__mark">T</span>';
    var occLinks = data.occasions.map(function (o) {
      return '<a href="' + occUrl(o) + '"' + (occasion && occasion.id === o.id ? ' aria-current="page"' : '') + '>' + esc(o.title) + '</a>';
    }).join('');
    var reviewsLink = (data.site.reviews || []).length ? '<a href="' + HOME + '#avis">Avis</a>' : '';

    $('#siteHeader').innerHTML =
      '<div class="topbar"><div class="container topbar__inner">' +
        '<span class="topbar__item"><span class="icon" data-icon="clock"></span><span data-bind="hours"></span></span>' +
        '<span class="topbar__item topbar__item--city"><span class="icon" data-icon="pin"></span>Traiteur à <span data-bind="city"></span></span>' +
        '<span class="topbar__right">' +
          '<a href="#" data-bind-tel="phone"><span class="icon" data-icon="phone"></span><span data-bind="phoneDisplay"></span></a>' +
          '<a href="#" data-bind-href="instagram" target="_blank" rel="noopener" aria-label="Instagram"><span class="icon" data-icon="instagram"></span></a>' +
        '</span>' +
      '</div></div>' +
      '<header class="header"><div class="container header__inner">' +
        '<a href="' + (HOME || '#top') + '" class="brand" aria-label="TORRAIS EVENT — accueil">' + logo + '<span class="brand__text">TORRAIS <em>EVENT</em></span></a>' +
        '<nav class="nav" id="nav" aria-label="Navigation principale">' +
          '<div class="nav__drop"><button type="button" class="nav__droptoggle" aria-expanded="false">Nos univers <span aria-hidden="true">▾</span></button>' +
            '<div class="nav__menu">' + occLinks + '</div></div>' +
          '<a href="' + HOME + '#services">Services</a>' +
          '<a href="' + HOME + '#formules">Formules</a>' +
          '<a href="' + HOME + '#galerie">Réalisations</a>' +
          reviewsLink +
          '<a href="' + HOME + '#contact">Contact</a>' +
          '<a href="#devis" class="btn btn--gold btn--sm">Devis gratuit</a>' +
        '</nav>' +
        '<button class="nav-toggle" id="navToggle" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span></button>' +
      '</div></header>';

    $('#siteFooter').innerHTML =
      '<section class="cta-band"><div class="container cta-band__inner">' +
        '<div><h2>Une date en tête ?</h2><p>Vérifions ensemble sa disponibilité, sans engagement.</p></div>' +
        '<div class="cta-band__actions">' +
          '<a href="#" class="btn btn--wa" data-wa-link data-wa-text="Bonjour TORRAIS EVENT, je voudrais vérifier la disponibilité d\'une date."><span class="icon" data-icon="whatsapp"></span> WhatsApp</a>' +
          '<a href="#" class="btn btn--light" data-bind-tel="phone"><span class="icon" data-icon="phone"></span> Appeler</a>' +
        '</div>' +
      '</div></section>' +
      '<footer class="footer"><div class="container footer__grid">' +
        '<div class="footer__brand"><span class="brand__text brand__text--light">TORRAIS <em>EVENT</em></span>' +
          '<p>Traiteur de mariages et d\'événements à <span data-bind="city"></span>. Traiteur · Tyafer · Buffet · Décoration.</p>' +
          '<div class="footer__links">' +
            '<a href="#" data-bind-href="instagram" target="_blank" rel="noopener" aria-label="Instagram"><span class="icon" data-icon="instagram"></span></a>' +
            '<a href="#" data-wa-link aria-label="WhatsApp"><span class="icon" data-icon="whatsapp"></span></a>' +
            '<a href="#" data-bind-tel="phone" aria-label="Appeler"><span class="icon" data-icon="phone"></span></a>' +
          '</div></div>' +
        '<div><h3>Nos univers</h3><ul>' + data.occasions.map(function (o) { return '<li><a href="' + occUrl(o) + '">' + esc(o.title) + '</a></li>'; }).join('') + '</ul></div>' +
        '<div><h3>Le site</h3><ul>' +
          '<li><a href="' + HOME + '#formules">Formules</a></li><li><a href="' + HOME + '#galerie">Réalisations</a></li>' +
          '<li><a href="' + HOME + '#faq">Questions fréquentes</a></li><li><a href="#devis">Devis gratuit</a></li></ul></div>' +
        '<div><h3>Contact</h3><ul class="footer__contact">' +
          '<li><a href="#" data-bind-tel="phone" data-bind="phoneDisplay"></a></li>' +
          '<li data-hide-empty="email"><a href="#" data-bind-mail="email" data-bind="email"></a></li>' +
          '<li><span data-bind="address"></span></li><li><span data-bind="hours"></span></li></ul></div>' +
      '</div>' +
      '<div class="container footer__bottom"><span>© <span id="year"></span> TORRAIS EVENT. Tous droits réservés.</span>' +
        '<a href="dashboard/" class="footer__admin">Espace gérant</a></div></footer>' +
      '<div class="floating">' +
        '<a href="#" class="floating__btn floating__btn--call" data-bind-tel="phone" aria-label="Appeler"><span class="icon" data-icon="phone"></span></a>' +
        '<a href="#" class="floating__btn floating__btn--wa" data-wa-link aria-label="WhatsApp"><span class="icon" data-icon="whatsapp"></span></a>' +
      '</div>' +
      '<div class="lightbox" id="lightbox" hidden><button class="lightbox__close" id="lightboxClose" aria-label="Fermer">×</button>' +
        '<button class="lightbox__nav lightbox__nav--prev" id="lightboxPrev" aria-label="Photo précédente">‹</button>' +
        '<figure class="lightbox__figure" id="lightboxFigure"></figure>' +
        '<button class="lightbox__nav lightbox__nav--next" id="lightboxNext" aria-label="Photo suivante">›</button></div>';
  }

  /* ---------- icônes et coordonnées ---------- */
  function paintIcons(root) {
    $$('[data-icon]', root).forEach(function (el) {
      var svg = T.icons[el.getAttribute('data-icon')];
      if (svg && !el.firstChild) el.innerHTML = svg;
    });
  }

  function bindSettings() {
    var values = {
      city: s.city, tagline: s.tagline, owner: s.owner, address: s.address, hours: s.hours, email: s.email,
      phoneDisplay: U.formatPhone(s.phone), whatsappDisplay: U.formatPhone(s.whatsapp || s.phone)
    };
    $$('[data-bind]').forEach(function (el) {
      var key = el.getAttribute('data-bind');
      if (values[key] != null && values[key] !== '') el.textContent = values[key];
    });
    $$('[data-bind-tel]').forEach(function (el) { el.href = 'tel:' + U.digits(s[el.getAttribute('data-bind-tel')]); });
    $$('[data-bind-mail]').forEach(function (el) { el.href = 'mailto:' + s[el.getAttribute('data-bind-mail')]; });
    $$('[data-bind-href]').forEach(function (el) {
      var v = s[el.getAttribute('data-bind-href')];
      if (v) el.href = v;
    });
    $$('[data-hide-empty]').forEach(function (el) { el.hidden = !s[el.getAttribute('data-hide-empty')]; });
    $$('[data-wa-link]').forEach(function (el) {
      el.href = U.waLink(s.whatsapp || s.phone, el.getAttribute('data-wa-text') || 'Bonjour TORRAIS EVENT, ');
      el.target = '_blank';
      el.rel = 'noopener';
    });
    var map = $('#mapFrame');
    if (map && s.address) map.src = 'https://maps.google.com/maps?q=' + encodeURIComponent(s.address) + '&z=12&output=embed';
  }

  /* ---------- sections ---------- */
  var PH_ICONS = ['traiteur', 'buffet', 'tyafer', 'deco'];
  function placeholder(i, label) {
    return '<span class="ph tone-' + (i % 8 + 1) + '">' + T.icons[PH_ICONS[i % 4]] + (label ? '<em>' + esc(label) + '</em>' : '') + '</span>';
  }

  function renderOccasions() {
    var box = $('#occasionsGrid');
    if (!box) return;
    var list = data.occasions.filter(function (o) { return !occasion || o.id !== occasion.id; });
    box.innerHTML = list.map(function (o, i) {
      return '<a class="occasion" href="' + occUrl(o) + '"><div class="occasion__img">' +
        (o.image ? '<img src="' + esc(o.image) + '" alt="' + esc(o.title) + '" loading="lazy">' : placeholder(i + 1)) + '</div>' +
        '<div class="occasion__body"><span class="occasion__tag">' + esc(o.eventType) + '</span><h3>' + esc(o.title) + '</h3><p>' + esc(o.short) + '</p>' +
        '<span class="occasion__more">Découvrir →</span></div></a>';
    }).join('');
  }

  function renderServices() {
    var box = $('#servicesGrid');
    if (!box) return;
    box.innerHTML = data.services.map(function (sv) {
      if (sv.image) {
        return '<article class="service service--photo"><div class="service__img"><img src="' + esc(sv.image) + '" alt="' + esc(sv.title) + '" loading="lazy"></div>' +
          '<div class="service__body"><h3>' + esc(sv.title) + '</h3><p>' + esc(sv.text) + '</p></div></article>';
      }
      return '<article class="service"><div class="service__icon">' + (T.icons[sv.icon] || T.icons.deco) + '</div>' +
        '<h3>' + esc(sv.title) + '</h3><p>' + esc(sv.text) + '</p></article>';
    }).join('');
  }

  function renderDishes() {
    var track = $('#dishesTrack');
    if (!track) return;
    var dishes = data.site.dishes || [];
    if (!dishes.length) { $('#carte').hidden = true; return; }
    track.innerHTML = dishes.map(function (d, i) {
      return '<article class="dish"><div class="dish__img">' + (d.image ? '<img src="' + esc(d.image) + '" alt="' + esc(d.name) + '" loading="lazy">' : placeholder(i)) + '</div>' +
        '<div class="dish__body"><h3>' + esc(d.name) + '</h3><p>' + esc(d.text) + '</p></div></article>';
    }).join('');
    $$('[data-carousel]').forEach(function (b) {
      b.addEventListener('click', function () {
        var card = $('.dish', track);
        var step = card ? card.getBoundingClientRect().width + 20 : 300;
        track.scrollBy({ left: b.getAttribute('data-carousel') === 'next' ? step : -step, behavior: 'smooth' });
      });
    });
  }

  function renderPackages() {
    var box = $('#packagesGrid');
    if (!box) return;
    box.innerHTML = data.packages.map(function (p) {
      var price = p.price ? esc(p.price) : 'Prix sur devis';
      return '<article class="package' + (p.featured ? ' package--featured' : '') + (p.image ? ' package--photo' : '') + '">' +
        (p.image ? '<div class="package__img"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy"></div>' : '') +
        (p.featured ? '<span class="package__badge">La plus demandée</span>' : '') +
        '<h3 class="package__name">' + esc(p.name) + '</h3>' +
        '<p class="package__tagline">' + esc(p.tagline) + '</p>' +
        '<div class="package__price">' + price + '</div>' +
        '<ul class="package__list">' + p.features.map(function (f) {
          return '<li><span class="icon">' + T.icons.check + '</span><span>' + esc(f) + '</span></li>';
        }).join('') + '</ul>' +
        '<a href="#devis" class="btn ' + (p.featured ? 'btn--gold' : 'btn--outline') + ' btn--block" data-package="' + esc(p.name) + '">Demander un devis</a>' +
        '</article>';
    }).join('');
  }

  function renderStats() {
    var box = $('#statsGrid');
    if (!box) return;
    var stats = (data.site.stats || []).filter(function (x) { return x.value; });
    if (!stats.length) { $('#chiffres').hidden = true; return; }
    box.innerHTML = stats.map(function (x) {
      return '<div class="stat"><strong data-count="' + esc(x.value) + '">' + esc(x.value) + '</strong><span>' + esc(x.label) + '</span></div>';
    }).join('');
    // Compteur animé quand la section apparaît (seulement pour les nombres simples)
    if (!('IntersectionObserver' in window) || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        $$('[data-count]', en.target).forEach(function (el) {
          var raw = el.getAttribute('data-count');
          var m = raw.match(/^(\D*)(\d+)(\D*)$/);
          if (!m) return;
          var end = +m[2], t0 = null;
          function step(ts) {
            if (!t0) t0 = ts;
            var k = Math.min(1, (ts - t0) / 1200);
            el.textContent = m[1] + Math.round(end * (1 - Math.pow(1 - k, 3))) + m[3];
            if (k < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        });
      });
    }, { threshold: 0.4 });
    io.observe(box);
  }

  var galleryList = [];
  function photoInner(g, i) {
    if (g.src) return '<img src="' + esc(g.src) + '" alt="' + esc(g.caption) + '" loading="lazy">';
    return placeholder(g.tone != null ? g.tone : i);
  }
  function renderGallery(filter) {
    var box = $('#galleryGrid');
    if (!box) return;
    var all = data.gallery.slice();
    if (occasion) {
      var mine = all.filter(function (g) { return g.category === occasion.galleryCat; });
      all = mine.length >= 3 ? mine : all;
      all = all.slice(0, 6);
    }
    galleryList = filter && filter !== 'Tout' ? all.filter(function (g) { return g.category === filter; }) : all;
    box.innerHTML = galleryList.length ? galleryList.map(function (g, i) {
      return '<button type="button" class="gallery__item" data-index="' + i + '">' + photoInner(g, i) +
        (g.caption ? '<span class="gallery__caption">' + esc(g.caption) + '</span>' : '') + '</button>';
    }).join('') : '<p class="gallery__empty">Bientôt de nouvelles photos dans cette catégorie.</p>';
  }
  function renderFilters() {
    var box = $('#galleryFilters');
    if (!box) return;
    var cats = ['Tout'].concat(T.GALLERY_CATEGORIES.filter(function (c) { return data.gallery.some(function (g) { return g.category === c; }); }));
    if (cats.length < 3) { box.hidden = true; return; }
    box.innerHTML = cats.map(function (c, i) {
      return '<button type="button" class="filter' + (i === 0 ? ' is-active' : '') + '" role="tab" aria-selected="' + (i === 0) + '" data-filter="' + esc(c) + '">' + esc(c) + '</button>';
    }).join('');
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]');
      if (!b) return;
      $$('.filter', box).forEach(function (x) { x.classList.toggle('is-active', x === b); x.setAttribute('aria-selected', String(x === b)); });
      renderGallery(b.getAttribute('data-filter'));
    });
  }

  function renderReviews() {
    var box = $('#reviewsGrid');
    if (!box) return;
    var list = (data.site.reviews || []).filter(function (r) { return r.text; });
    if (!list.length) return;
    $('#avis').hidden = false;
    box.innerHTML = list.map(function (r) {
      var stars = Math.max(1, Math.min(5, +r.stars || 5));
      return '<figure class="review"><div class="review__stars" aria-label="' + stars + ' étoiles sur 5">' + '★★★★★'.slice(0, stars) + '<span>' + '★★★★★'.slice(stars) + '</span></div>' +
        '<blockquote>« ' + esc(r.text) + ' »</blockquote><figcaption><strong>' + esc(r.name) + '</strong>' + (r.event ? '<span>' + esc(r.event) + '</span>' : '') + '</figcaption></figure>';
    }).join('');
  }

  function renderFaq() {
    var box = $('#faqList');
    if (!box) return;
    var list = data.site.faq || [];
    if (!list.length) { $('#faq').hidden = true; return; }
    box.innerHTML = list.map(function (f) {
      return '<details class="faq__item"><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>';
    }).join('');
  }

  function renderZones() {
    var box = $('#zonesList');
    if (!box) return;
    var z = data.site.zones || [];
    if (!z.length) { box.parentNode.hidden = true; return; }
    box.innerHTML = z.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
  }

  /* ---------- page « univers » ---------- */
  function renderOccasionPage() {
    if (!occasion) return;
    document.title = occasion.title + ' — TORRAIS EVENT, traiteur à Casablanca';
    $('#occTitle').textContent = occasion.title;
    $('#occShort').textContent = occasion.short;
    $('#occHeading').textContent = occasion.title + ' avec TORRAIS EVENT';
    $('#occText').textContent = occasion.text;
    $('#occIncludes').innerHTML = (occasion.includes || []).map(function (x) {
      return '<li><span class="icon">' + T.icons.check + '</span><span>' + esc(x) + '</span></li>';
    }).join('');
    $('#occWa').setAttribute('data-wa-text', 'Bonjour TORRAIS EVENT, je souhaite des informations pour : ' + occasion.title.toLowerCase() + '.');
    var bg = occasion.image || (data.media.hero[0] && data.media.hero[0].src);
    if (bg) {
      $('#pageHero').classList.add('page-hero--photo');
      $('#pageHeroBg').style.backgroundImage = 'url("' + bg + '")';
    }
  }

  /* ---------- photos : diaporama d'accueil, « Notre maison » ---------- */
  function renderMedia() {
    var m = data.media || {};
    var frame = $('#aboutFrame');
    if (m.about && frame) {
      frame.classList.add('about__frame--photo');
      frame.innerHTML = '<img src="' + esc(m.about) + '" alt="TORRAIS EVENT">';
    }
    var box = $('#heroSlides');
    var slides = m.hero || [];
    if (!box || !slides.length) return;
    var hero = $('.hero');
    var dots = $('#heroDots');
    hero.classList.add('hero--photo');
    slides.forEach(function (h, i) {
      var div = document.createElement('div');
      div.className = 'hero__slide' + (i === 0 ? ' is-active' : '');
      div.style.backgroundImage = 'url("' + h.src + '")';
      box.appendChild(div);
    });
    if (slides.length < 2) return;
    dots.innerHTML = slides.map(function (h, i) {
      return '<button type="button" class="hero__dot' + (i === 0 ? ' is-active' : '') + '" data-slide="' + i + '" aria-label="Photo ' + (i + 1) + '"></button>';
    }).join('');
    var current = 0;
    var timer = null;
    function show(n) {
      current = (n + slides.length) % slides.length;
      $$('.hero__slide', box).forEach(function (el, i) { el.classList.toggle('is-active', i === current); });
      $$('.hero__dot', dots).forEach(function (el, i) { el.classList.toggle('is-active', i === current); });
    }
    function start() {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      clearInterval(timer);
      timer = setInterval(function () { show(current + 1); }, 5500);
    }
    dots.addEventListener('click', function (e) {
      var b = e.target.closest('[data-slide]');
      if (!b) return;
      show(+b.getAttribute('data-slide'));
      start();
    });
    start();
  }

  /* ---------- visionneuse ---------- */
  function initLightbox() {
    var grid = $('#galleryGrid');
    if (!grid) return;
    var box = $('#lightbox');
    var fig = $('#lightboxFigure');
    var index = 0;
    function show(i) {
      index = (i + galleryList.length) % galleryList.length;
      var g = galleryList[index];
      fig.innerHTML = (g.src ? '<img src="' + esc(g.src) + '" alt="' + esc(g.caption) + '">' : '<div class="lightbox__ph">' + photoInner(g, index) + '</div>') +
        '<figcaption>' + esc(g.caption || '') + '</figcaption>';
    }
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('.gallery__item');
      if (!btn) return;
      show(+btn.getAttribute('data-index'));
      box.hidden = false;
      document.body.style.overflow = 'hidden';
    });
    function close() { box.hidden = true; document.body.style.overflow = ''; }
    $('#lightboxClose').addEventListener('click', close);
    $('#lightboxPrev').addEventListener('click', function () { show(index - 1); });
    $('#lightboxNext').addEventListener('click', function () { show(index + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
  }

  /* ---------- navigation ---------- */
  function initNav() {
    var toggle = $('#navToggle');
    var nav = $('#nav');
    var drop = $('.nav__drop');
    var dropBtn = $('.nav__droptoggle');
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    dropBtn.addEventListener('click', function () {
      var open = drop.classList.toggle('is-open');
      dropBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav__drop')) { drop.classList.remove('is-open'); dropBtn.setAttribute('aria-expanded', 'false'); }
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
    var header = $('.header');
    function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 40); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- formulaire de devis ---------- */
  function renderQuoteForm() {
    var mount = $('#quoteMount');
    if (!mount) return;
    mount.innerHTML =
      '<form class="form" id="quoteForm" novalidate>' +
        '<div class="form__row">' +
          '<label class="field"><span>Nom complet *</span><input type="text" name="name" required autocomplete="name" placeholder="Ex. Salma Bennani"></label>' +
          '<label class="field"><span>Téléphone / WhatsApp *</span><input type="tel" name="phone" required autocomplete="tel" placeholder="06 XX XX XX XX"></label>' +
        '</div>' +
        '<div class="form__row">' +
          '<label class="field"><span>Type d\'événement *</span><select name="eventType" required><option value="">Choisir…</option>' +
            T.EVENT_TYPES.map(function (t) { return '<option' + (occasion && occasion.eventType === t ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select></label>' +
          '<label class="field"><span>Date de l\'événement *</span><input type="date" name="date" required min="' + U.iso(new Date()) + '"></label>' +
        '</div>' +
        '<div class="form__row">' +
          '<label class="field"><span>Nombre d\'invités *</span><input type="number" name="guests" required min="10" max="2000" step="10" placeholder="Ex. 200"></label>' +
          '<label class="field"><span>Budget approximatif</span><select name="budget"><option value="">Je ne sais pas encore</option>' +
            '<option>Moins de 20 000 DH</option><option>20 000 – 50 000 DH</option><option>50 000 – 80 000 DH</option><option>80 000 – 120 000 DH</option><option>Plus de 120 000 DH</option></select></label>' +
        '</div>' +
        '<fieldset class="field field--checks"><legend>Services souhaités</legend><div class="checks">' +
          T.SERVICE_NAMES.map(function (n) { return '<label class="check"><input type="checkbox" name="services" value="' + esc(n) + '"><span>' + esc(n) + '</span></label>'; }).join('') +
        '</div></fieldset>' +
        '<label class="field"><span>Votre message</span><textarea name="message" rows="4" placeholder="Lieu, formule qui vous intéresse, demandes particulières…"></textarea></label>' +
        '<p class="form__error" id="formError" role="alert" hidden></p>' +
        '<button type="submit" class="btn btn--dark btn--block">Envoyer ma demande</button>' +
        '<p class="form__hint">Réponse rapide · Sans engagement</p>' +
      '</form>' +
      '<div class="form form--success" id="formSuccess" hidden>' +
        '<div class="success__icon"><span class="icon">' + T.icons.check + '</span></div>' +
        '<h3>Merci, votre demande est bien envoyée !</h3>' +
        '<p>Nous vous recontactons très vite. Pour une réponse encore plus rapide, envoyez-la aussi sur WhatsApp :</p>' +
        '<a href="#" class="btn btn--wa btn--block" id="successWa"><span class="icon">' + T.icons.whatsapp + '</span> Envoyer sur WhatsApp</a>' +
        '<button type="button" class="btn btn--ghost btn--block" id="newRequest">Faire une autre demande</button>' +
      '</div>';
  }

  function initForm() {
    var form = $('#quoteForm');
    if (!form) return;
    var success = $('#formSuccess');
    var errorBox = $('#formError');

    // « Demander un devis » sur une formule : pré-remplit le message
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-package]');
      if (!a) return;
      var msg = form.elements.message;
      if (!msg.value) msg.value = 'Je suis intéressé(e) par la formule ' + a.getAttribute('data-package') + '.';
      if (!form.elements.eventType.value) form.elements.eventType.value = 'Mariage';
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var missing = [];
      ['name', 'phone', 'eventType', 'date', 'guests'].forEach(function (n) {
        var ok = String(f[n].value).trim() !== '';
        f[n].classList.toggle('is-invalid', !ok);
        if (!ok) missing.push(n);
      });
      var phoneOk = U.digits(f.phone.value).length >= 9;
      if (!missing.length && !phoneOk) f.phone.classList.add('is-invalid');
      if (missing.length || !phoneOk) {
        errorBox.textContent = missing.length ? 'Merci de remplir les champs obligatoires (*).' : 'Merci de vérifier votre numéro de téléphone.';
        errorBox.hidden = false;
        return;
      }
      errorBox.hidden = true;

      var services = $$('input[name="services"]:checked', form).map(function (c) { return c.value; });
      var now = new Date();
      var req = {
        id: U.uid(),
        source: 'Site web',
        createdAt: U.iso(now) + 'T' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'),
        name: f.name.value.trim(),
        phone: f.phone.value.trim(),
        eventType: f.eventType.value,
        date: f.date.value,
        guests: +f.guests.value,
        budget: f.budget.value,
        services: services,
        message: f.message.value.trim(),
        status: 'nouveau',
        notes: '',
        eventId: null
      };
      // Démo : la demande est enregistrée dans le navigateur et apparaît dans l'espace gérant.
      data = T.store.fresh();
      data.requests.unshift(req);
      T.store.save(data);

      var text = 'Bonjour TORRAIS EVENT, je souhaite un devis.\n' +
        '• Nom : ' + req.name + '\n' +
        '• Événement : ' + req.eventType + '\n' +
        '• Date : ' + U.formatDate(req.date) + '\n' +
        '• Invités : ' + req.guests + '\n' +
        (req.budget ? '• Budget : ' + req.budget + '\n' : '') +
        (services.length ? '• Services : ' + services.join(', ') + '\n' : '') +
        (req.message ? '• Message : ' + req.message : '');
      var wa = $('#successWa');
      wa.href = U.waLink(s.whatsapp || s.phone, text);
      wa.target = '_blank';
      wa.rel = 'noopener';

      form.hidden = true;
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    form.addEventListener('input', function (e) { e.target.classList.remove('is-invalid'); });
    $('#newRequest').addEventListener('click', function () {
      form.reset();
      success.hidden = true;
      form.hidden = false;
    });
  }

  /* ---------- démarrage ---------- */
  renderChrome();
  renderOccasionPage();
  renderOccasions();
  renderServices();
  renderDishes();
  renderPackages();
  renderStats();
  renderFilters();
  renderGallery();
  renderReviews();
  renderFaq();
  renderZones();
  renderMedia();
  renderQuoteForm();
  bindSettings();
  paintIcons(document);
  initNav();
  initLightbox();
  initForm();
  $('#year').textContent = new Date().getFullYear();
})();
