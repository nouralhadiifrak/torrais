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
  var OCC_PAGES = { mariage: 'mariage.html', bapteme: 'bapteme.html', entreprise: 'entreprise.html', prive: 'evenements-prives.html' };
  function occUrl(o) { return OCC_PAGES[o.id] || ('evenement.html?type=' + encodeURIComponent(o.id)); }

  // Page « pack » : quel service, quel pack ?
  var PACK_GROUP = PAGE === 'pack' ? document.body.getAttribute('data-group') : null;
  var PACK_ID = PAGE === 'pack' ? document.body.getAttribute('data-pack') : null;
  var GROUP_OCC = { mariage: 'mariage', fiancailles: 'mariage', bapteme: 'bapteme', entreprise: 'entreprise', prive: 'prive' };
  var GROUP_EVENT = { mariage: 'Mariage', fiancailles: 'Fiançailles', bapteme: 'Aqiqa / Baptême', entreprise: "Événement d'entreprise", prive: 'Autre' };
  function packUrl(group, p) { return 'pack-' + group + '-' + p.id + '.html'; }

  // Page « univers » : quelle occasion afficher ?
  var occasion = null;
  if (PAGE === 'occasion') {
    var wanted = document.body.getAttribute('data-occasion') || (new URLSearchParams(window.location.search)).get('type');
    occasion = data.occasions.filter(function (o) { return o.id === wanted; })[0] || data.occasions[0];
  }

  /* ---------- bouton retour : une pression = une étape ----------
     Un menu ou une visionneuse ouverts ajoutent une étape à l'historique : « retour » les ferme avant de quitter la page. */
  var layer = null;
  function openLayer(name, close) {
    if (layer) return;
    layer = { name: name, close: close };
    history.pushState(Object.assign({}, history.state, { layer: name }), '');
  }
  function closeLayer() { if (layer) history.back(); }
  window.addEventListener('popstate', function () {
    if (layer) { var l = layer; layer = null; l.close(); }
  });
  // retour sur une page restée « ouverte » dans l'historique : on revient à l'étape d'avant, sans rien rouvrir
  window.addEventListener('pageshow', function () {
    if (history.state && history.state.layer && !layer) history.back();
  });

  /* ---------- la page part comme elle est venue (transitions entre pages) ----------
     La carte cliquée s'agrandit jusqu'au haut de la page suivante ; au retour, la page se replie dans la carte. */
  var VT_KEY = 'torrais_vt';
  function vtName(el, on) { if (el) el.style.viewTransitionName = on ? 'hero-card' : ''; }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || a.target === '_blank') return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(https?:|tel:|mailto:)/.test(href)) return;
    var card = a.closest('.pack, .occasion, .sig, .cf-card') ||
      (a.closest('.carte-cta') && a.getAttribute('href') === 'menus.html' ? $('#dishesTrack .cf-card.is-active') : null);
    // un seul élément porte le nom (sinon le navigateur annule la transition)
    $$('[style*="view-transition-name"]').forEach(function (el) { if (el !== card) vtName(el, false); });
    if (!card) { try { sessionStorage.removeItem(VT_KEY); } catch (err) {} return; }
    vtName(card, true);
    try { sessionStorage.setItem(VT_KEY, JSON.stringify({ from: location.pathname, href: href.split('#')[0] })); } catch (err) {}
  }, true);
  function vtFrom(card, href) {
    $$('[style*="view-transition-name"]').forEach(function (el) { if (el !== card) vtName(el, false); });
    vtName(card, true);
    try { sessionStorage.setItem(VT_KEY, JSON.stringify({ from: location.pathname, href: href })); } catch (err) {}
  }
  function restoreVt() {
    $$('[style*="view-transition-name"]').forEach(function (el) { vtName(el, false); });
    // sur la page de liste : la carte d'où l'on était parti (au retour, la page se replie dedans)
    var card = null, v = null;
    try {
      v = JSON.parse(sessionStorage.getItem(VT_KEY) || 'null');
      if (v && v.from === location.pathname) {
        var link = $$('a[href]').filter(function (x) { return x.getAttribute('href').split('#')[0] === v.href && x.closest('.pack, .occasion'); })[0];
        if (link) card = link.closest('.pack, .occasion');
      }
    } catch (err) {}
    // retour depuis la page Nos menus : la carte du milieu du carrousel
    if (!card && v && v.from === location.pathname && v.href === 'menus.html') card = $('#dishesTrack .cf-card.is-active');
    if (card) { vtName(card, true); return; }
    // sinon, en haut de la page de détail (la carte cliquée s'agrandit jusqu'ici)
    if (PAGE === 'pack' || PAGE === 'occasion' || PAGE === 'menus') vtName($('#pageHero'), true);
  }
  window.addEventListener('pageshow', restoreVt);
  // une transition interrompue (changement de taille, retour rapide…) n'est pas une erreur
  ['pageswap', 'pagereveal'].forEach(function (ev) {
    window.addEventListener(ev, function (e) {
      var vt = e.viewTransition;
      if (vt) { [vt.ready, vt.finished, vt.updateCallbackDone].forEach(function (pr) { if (pr && pr.catch) pr.catch(function () {}); }); }
    });
  });

  /* ---------- en-tête et pied de page (communs aux pages) ---------- */
  function renderChrome() {
    // Logo : celui envoyé par le gérant, sinon l'emblème doré de TORRAIS EVENT
    var logo = '<img class="brand__logo" src="' + esc(data.media && data.media.logo ? data.media.logo : 'assets/img/brand/logo-emblem.webp') + '" alt="" width="360" height="212">';
    var occLinks = data.occasions.map(function (o) {
      return '<a href="' + occUrl(o) + '"' + (occasion && occasion.id === o.id ? ' aria-current="page"' : '') + '>' + esc(o.title) + '</a>';
    }).join('');
    var mariage = data.occasions.filter(function (o) { return o.id === 'mariage'; })[0];
    var PACKS_URL = (mariage ? occUrl(mariage) : 'mariage.html') + '#formules';

    $('#siteHeader').innerHTML =
      '<a class="skip-link" href="#contenu">Aller au contenu</a>' +
      '<div class="topbar"><div class="container topbar__inner">' +
        '<span class="topbar__item"><span class="icon" data-icon="clock"></span><span data-bind="hours"></span></span>' +
        '<span class="topbar__item topbar__item--city"><span class="icon" data-icon="pin"></span>Traiteur à <span data-bind="city"></span></span>' +
        '<span class="topbar__right">' +
          '<a href="#" data-bind-tel="phone" class="topbar__tel"><span class="icon" data-icon="phone"></span><span data-bind="phoneDisplay"></span></a>' +
          (s.phone2 ? '<a href="#" data-bind-tel="phone2" class="topbar__tel"><span class="icon" data-icon="phone"></span><span data-bind="phone2Display"></span></a>' : '') +
          '<a href="#" data-bind-href="instagram" target="_blank" rel="noopener" aria-label="Instagram" class="topbar__insta"><span class="icon" data-icon="instagram"></span></a>' +
        '</span>' +
      '</div></div>' +
      '<header class="header"><div class="container header__inner">' +
        '<a href="' + (HOME || '#top') + '" class="brand" aria-label="TORRAIS EVENT — accueil">' + logo + '<span class="brand__text" aria-hidden="true">TORRAIS <em>EVENT</em></span></a>' +
        '<nav class="nav" id="nav" aria-label="Navigation principale">' +
          '<a href="' + (HOME || '#top') + '"' + (PAGE === 'home' ? ' aria-current="page"' : '') + '>Accueil</a>' +
          '<div class="nav__drop"><button type="button" class="nav__droptoggle" aria-expanded="false">Nos services <span aria-hidden="true">▾</span></button>' +
            '<div class="nav__menu">' + occLinks + '</div></div>' +
          '<a href="menus.html"' + (PAGE === 'menus' ? ' aria-current="page"' : '') + '>Nos menus</a>' +
          '<a href="apropos.html"' + (PAGE === 'about' ? ' aria-current="page"' : '') + '>À propos</a>' +
          '<a href="' + (PAGE === 'home' || PAGE === 'occasion' ? '#devis' : HOME + '#devis') + '" class="btn btn--gold btn--sm">Devis gratuit</a>' +
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
      '<footer class="footer" id="contact"><div class="container footer__grid">' +
        '<div class="footer__brand"><img class="footer__logo" src="assets/img/brand/logo.webp" width="900" height="614" alt="TORRAIS EVENT" loading="lazy">' +
          '<p>Traiteur de mariages et d\'événements à <span data-bind="city"></span>. Traiteur · Tyafer · Buffet · Décoration.</p>' +
          '<div class="footer__links">' +
            '<a href="#" data-bind-href="instagram" target="_blank" rel="noopener" aria-label="Instagram"><span class="icon" data-icon="instagram"></span></a>' +
            '<a href="#" data-wa-link aria-label="WhatsApp"><span class="icon" data-icon="whatsapp"></span></a>' +
            '<a href="#" data-bind-tel="phone" aria-label="Appeler"><span class="icon" data-icon="phone"></span></a>' +
          '</div></div>' +
        '<div><h3>Nos services</h3><ul>' + data.occasions.map(function (o) { return '<li><a href="' + occUrl(o) + '">' + esc(o.title) + '</a></li>'; }).join('') + '</ul></div>' +
        '<div><h3>Le site</h3><ul>' +
          '<li><a href="menus.html">Nos menus</a></li><li><a href="apropos.html">À propos</a></li><li><a href="' + PACKS_URL + '">Packs mariage</a></li><li><a href="composer.html">Composer votre événement</a></li>' +
          '<li><a href="' + HOME + '#galerie">Galerie</a></li><li><a href="' + HOME + '#faq">Questions fréquentes</a></li><li><a href="' + (PAGE === 'home' || PAGE === 'occasion' ? '#devis' : HOME + '#devis') + '">Devis gratuit</a></li></ul></div>' +
        '<div><h3>Contact</h3><ul class="footer__contact">' +
          '<li><a href="#" data-bind-tel="phone" data-bind="phoneDisplay"></a></li>' +
          '<li data-hide-empty="email"><a href="#" data-bind-mail="email" data-bind="email"></a></li>' +
          '<li><span data-bind="address"></span></li><li><span data-bind="hours"></span></li></ul></div>' +
      '</div>' +
      '<div class="container footer__bottom"><span>© <span id="year"></span> TORRAIS EVENT. Tous droits réservés.</span>' +
        '<span class="footer__legal"><a href="mentions-legales.html">Mentions légales</a> · <a href="confidentialite.html">Politique de confidentialité</a></span>' +
        '</div></footer>' +
      // Barre d'actions sur téléphone : devis et simulateur (WhatsApp reste en bouton flottant)
      (PAGE === 'composer' ? '' :
        '<nav class="mbar" aria-label="Actions rapides">' +
          '<a class="mbar__btn mbar__btn--main" href="' + (PAGE === 'home' || PAGE === 'occasion' ? '#devis' : HOME + '#devis') + '">Devis gratuit</a>' +
          '<a class="mbar__btn" href="composer.html">Composer votre événement</a>' +
        '</nav>') +
      '<div class="floating">' +
        '<a href="#" class="floating__btn floating__btn--ig" data-bind-href="instagram" target="_blank" rel="noopener" aria-label="Instagram"><span class="icon" data-icon="instagram"></span></a>' +
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
      phoneDisplay: U.formatPhone(s.phone), phone2Display: U.formatPhone(s.phone2), whatsappDisplay: U.formatPhone(s.whatsapp || s.phone)
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
  var DISH_ICONS = ['traiteur', 'buffet']; // cloche et couverts pour les plats
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
        (o.image ? '<img src="' + esc(o.image) + '" alt="' + esc(o.title) + '" loading="lazy">' : placeholder(i + 1, 'Photo à venir')) + '</div>' +
        '<div class="occasion__body"><span class="occasion__tag">' + String(i + 1).padStart(2, '0') + '</span><h3>' + esc(o.title) + '</h3><p>' + esc(o.short) + '</p>' +
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
    if (track.classList.contains('coverflow')) { coverflow(track, dishes); return; }
    track.innerHTML = dishes.map(function (d, i) {
      return '<article class="dish"><div class="dish__img">' + (d.image ? '<img src="' + esc(d.image) + '" alt="' + esc(d.name) + '" loading="lazy">' : placeholder(i)) + '</div>' +
        '<div class="dish__body"><h3>' + esc(d.name) + '</h3><p>' + esc(d.text) + '</p></div></article>';
    }).join('');
  }

  /* ---------- page de détail d'un pack ---------- */
  var INCL_TEXT = {
    'décoration': 'Décoration de la salle, des tables et de la kousha, à vos couleurs.',
    'caméra': 'Votre mariage filmé du début à la fin.',
    'dj': 'Un DJ pour faire danser vos invités toute la soirée.',
    'orchestre': 'Un orchestre pour une ambiance live et chaleureuse.',
    'dessert': 'Une sélection de desserts pour finir le dîner en douceur.',
    'jus': 'Jus frais servis tout au long de la soirée.',
    'gâteaux': 'Gâteaux marocains et gâteaux de soirée.',
    'thé à la menthe': 'Atay servi dans les règles de l’art.',
    'dattes et lait': 'L’accueil traditionnel de vos invités.'
  };
  function renderPackPage() {
    if (PAGE !== 'pack') return;
    var labels = {}; (T.PACK_GROUPS || []).forEach(function (g) { labels[g.id] = g.label; });
    var list = packsOf(PACK_GROUP);
    var idx = list.map(function (p) { return p.id; }).indexOf(PACK_ID);
    var p = list[idx < 0 ? 0 : idx];
    if (!p) return;
    var gLabel = labels[PACK_GROUP] || '';
    var occ = data.occasions.filter(function (o) { return o.id === GROUP_OCC[PACK_GROUP]; })[0];
    var soon = p.soon || (!(p.menus || []).length && !(p.features || []).length);
    var menus = (p.menus || []).filter(function (m) { return m.label; });
    var prices = menus.map(function (m) { return +m.price; }).filter(Boolean);
    var from = prices.length ? Math.min.apply(null, prices) : 0;
    document.title = 'Pack ' + p.name + ' — ' + gLabel + ' — TORRAIS EVENT';
    $('#packCrumbs').innerHTML = '<a href="index.html">Accueil</a> <span>›</span> ' + (occ ? '<a href="' + occUrl(occ) + '">' + esc(gLabel) + '</a>' : esc(gLabel)) + ' <span>›</span> <span>Pack ' + esc(p.name) + '</span>';
    $('#packTitle').textContent = 'Pack ' + p.name;
    $('#packLead').textContent = gLabel + (p.place ? ' · ' + p.place : '') + (from ? ' · à partir de ' + packPrice(from) : soon ? ' · détails à venir' : '');
    var bg = p.image || (occ && occ.image) || 'assets/img/salle.jpg';
    $('#pageHeroBg').style.backgroundImage = 'url("' + bg + '")';
    $('#packWa').setAttribute('data-wa-text', 'Bonjour TORRAIS EVENT, je suis intéressé(e) par le pack ' + p.name + ' (' + gLabel + ').');
    $('#packHeading').textContent = 'Pack ' + p.name + ', ' + gLabel.toLowerCase();
    // présentation : texte du gérant, sinon un résumé tiré du contenu du pack
    var intro = p.description ? p.description.split(/\n+/) : soon ? ['Le contenu détaillé de ce pack arrive très bientôt. En attendant, contactez-nous : nous vous présentons le pack et préparons votre devis gratuit.'] :
      ['Le pack ' + p.name + ' réunit l’essentiel pour votre ' + gLabel.toLowerCase() + (p.place ? ' : ' + p.place.charAt(0).toLowerCase() + p.place.slice(1) : '') + (p.tables ? ', à partir de ' + p.tables + ' tables' : '') + (p.tenues ? ', avec une neggafa et ' + p.tenues + ' tenues' : '') + '.',
       'Décoration, musique, dîner et douceurs : vous choisissez votre menu, nous nous occupons de tout le reste pour que vous profitiez pleinement de votre fête.'];
    $('#packIntro').innerHTML = intro.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('');
    var facts = [];
    if (p.place) facts.push(esc(p.place));
    if (p.tables) facts.push('Dès <b>' + esc(p.tables) + ' tables</b>');
    if (p.tenues) facts.push('Neggafa · <b>' + esc(p.tenues) + ' tenues</b>');
    $('#packFacts').innerHTML = facts.map(function (f) { return '<span>' + f + '</span>'; }).join('');
    // encadré prix + menu (réutilise la carte pack, sans le lien « détails »)
    var card = packCard(p, idx < 0 ? 0 : idx, gLabel, null);
    $('#packBox').outerHTML = card.replace('<article class="pack', '<aside id="packBox" class="pack pack--detail').replace(/<\/article>$/, '</aside>');
    var box = $('#packBox');
    box.addEventListener('change', function (e) {
      if (e.target.type !== 'radio') return;
      var m = p.menus[+e.target.value];
      if (m) $('[data-pack-price]', box).textContent = +m.price ? packPrice(m.price) : 'Sur devis';
    });
    // photos : celles du pack, sinon des emplacements
    var photos = (p.photos || []).filter(Boolean);
    var slots = photos.length ? photos.map(function (src) { return { src: src }; }) :
      ['Le lieu', 'La décoration', 'La neggafa', 'Le dîner', 'Les douceurs'].map(function (t) { return { label: t }; });
    $('#packGallery').innerHTML = slots.map(function (x, i) {
      return '<figure class="pack-gallery__item' + (i === 0 ? ' pack-gallery__item--big' : '') + '">' +
        (x.src ? '<img src="' + esc(x.src) + '" alt="Pack ' + esc(p.name) + '" loading="lazy">' : '<span class="ph cf-ph tone-' + (i % 8 + 1) + '">' + T.icons[DISH_ICONS[i % 2]] + '<strong>' + esc(x.label) + '</strong><em>Photo à venir</em></span>') + '</figure>';
    }).join('');
    // inclus
    var incl = p.features || [];
    $('#packIncl').innerHTML = incl.length ? incl.map(function (f, i) {
      return '<div class="pack-incl__item"><span class="pack-incl__num">' + String(i + 1).padStart(2, '0') + '</span><h3>' + esc(f) + '</h3><p>' + esc(INCL_TEXT[f.toLowerCase()] || '') + '</p></div>';
    }).join('') : '<p class="pack-empty">Le détail de ce qui est inclus arrive bientôt.</p>';
    // menus
    $('#packMenus').innerHTML = menus.length ? menus.map(function (m, i) {
      return '<div class="pack-menus__item"><span class="pack-menus__label">Menu ' + (i + 1) + '</span><h3>' + esc(m.label) + '</h3><strong>' + (+m.price ? 'À partir de ' + packPrice(m.price) : 'Sur devis') + '</strong></div>';
    }).join('') : '<p class="pack-empty">Le menu de ce pack arrive bientôt. Découvrez déjà nos plats.</p>';
    // FAQ du pack (réponses générales, sans chiffres inventés)
    var faq = [
      { q: 'Puis-je personnaliser ce pack ?', a: 'Oui. Chaque pack est une base : nous l’adaptons à vos envies (menu, décoration, animations). Parlons-en lors de votre demande de devis.' },
      { q: 'Le prix affiché est-il le prix final ?', a: 'Le prix « à partir de » dépend du menu choisi. Le prix final dépend du nombre d’invités et des options ajoutées : demandez un devis gratuit pour une estimation précise.' },
      { q: 'Comment réserver ce pack ?', a: 'Remplissez le formulaire en bas de page ou écrivez-nous sur WhatsApp avec votre date et le nombre d’invités. Nous vous rappelons rapidement.' }
    ];
    $('#packFaq').innerHTML = faq.map(function (f) {
      return '<details class="faq__item"><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>';
    }).join('');
    // les autres packs du même service
    var others = list.filter(function (x) { return x !== p; });
    $('#otherTitle').textContent = 'Nos autres packs ' + gLabel.toLowerCase();
    $('#otherPacks').innerHTML = others.map(function (x) { return packCard(x, list.indexOf(x), gLabel, PACK_GROUP); }).join('');
  }

  /* ---------- page Mariage : les étapes en zigzag ---------- */
  function renderWeddingSteps() {
    var box = $('#weddingSteps');
    if (!box) return;
    var icons = ['deco', 'tyafer', 'deco', 'traiteur', 'buffet', 'tyafer', 'deco', 'traiteur'];
    box.innerHTML = (data.site.weddingSteps || []).map(function (st, i) {
      return '<article class="occasion wstep"><div class="occasion__img">' +
        (st.images && st.images.length > 1 ? '<span class="wstep__split"><img src="' + esc(st.images[0]) + '" alt="" loading="lazy"><img src="' + esc(st.images[1]) + '" alt="" loading="lazy"><i></i></span>' :
         st.image ? '<img src="' + esc(st.image) + '" alt="' + esc(st.title) + '" loading="lazy">' :
          '<span class="ph cf-ph tone-' + (i % 8 + 1) + '">' + T.icons[icons[i % icons.length]] + '<strong>' + esc(st.title) + '</strong><em>Photo à venir</em></span>') + '</div>' +
        '<div class="occasion__body"><span class="occasion__tag">' + String(i + 1).padStart(2, '0') + '</span><h3>' + esc(st.title) + '</h3><p>' + esc(st.text) + '</p>' +
        (st.options && st.options.length ? '<div class="wstep__opts">' + (st.choose ? '<span class="wstep__label">Au choix</span>' : '') +
          st.options.map(function (o) { return '<span class="wstep__opt">' + esc(o) + '</span>'; }).join('') + '</div>' : '') +
        (st.link ? '<a class="wstep__link" href="' + esc(st.link.href) + '">' + esc(st.link.label) + ' <span aria-hidden="true">→</span></a>' : '') +
        '</div></article>';
    }).join('');
  }

  /* ---------- page « Nos menus » ---------- */
  function renderMenusPage() {
    var grid = $('#signatureGrid');
    if (grid) {
      grid.innerHTML = (data.site.dishes || []).map(function (d, i) {
        return '<article class="sig" id="plat-' + i + '"><div class="sig__img">' +
          (d.image ? '<img src="' + esc(d.image) + '" alt="' + esc(d.name) + '" loading="lazy">' : '<span class="ph cf-ph tone-' + (i % 8 + 1) + '">' + T.icons[DISH_ICONS[i % 2]] + '<strong>' + esc(d.name) + '</strong><em>Photo à venir</em></span>') +
          '</div><div class="sig__body"><span class="sig__num">' + String(i + 1).padStart(2, '0') + '</span><h3>' + esc(d.name) + '</h3><p>' + esc(d.text || '') + '</p></div></article>';
      }).join('');
    }
    var cats = data.site.menuCats || [];
    var famBox = $('#menuCats');
    if (famBox) {
      famBox.innerHTML = cats.map(function (c, i) {
        return '<a class="occasion" href="#cat-' + esc(c.id) + '"><div class="occasion__img">' +
          (c.image ? '<img src="' + esc(c.image) + '" alt="' + esc(c.title) + '" loading="lazy">' :
            '<span class="ph cf-ph tone-' + (i % 8 + 1) + '">' + T.icons[DISH_ICONS[i % 2]] + '<strong>' + esc(c.title) + '</strong><em>Photo à venir</em></span>') + '</div>' +
          '<div class="occasion__body"><span class="occasion__tag">' + String(i + 1).padStart(2, '0') + '</span><h3>' + esc(c.title) + '</h3><p>' + esc(c.short) + '</p>' +
          '<span class="occasion__more">Voir les plats →</span></div></a>';
      }).join('');
    }
    var carte = $('#carteList');
    if (carte) {
      var ph = 0;
      carte.innerHTML = cats.map(function (c, i) {
        var list = c.dishes || (c.items || []).map(function (n) { return { name: n, photos: [] }; });
        return '<section class="mcat" id="cat-' + esc(c.id) + '"><header class="mcat__head"><span class="mcat__num">' + String(i + 1).padStart(2, '0') + '</span><h2>' + esc(c.title) + '</h2></header>' +
          '<div class="mdish-grid">' + list.map(function (d, j) {
            var photos = (d.photos || []).filter(Boolean);
            var id = c.id === 'plats' ? ' id="plat-' + j + '"' : '';
            return '<figure class="mdish' + (photos.length > 1 ? ' mdish--duo' : '') + '"' + id + '><div class="mdish__img">' +
              (photos.length ? photos.map(function (p, k) { return '<img src="' + esc(p) + '" alt="' + (k ? '' : esc(d.name)) + '" loading="lazy">'; }).join('') :
                '<span class="ph cf-ph tone-' + (ph++ % 8 + 1) + '">' + T.icons[DISH_ICONS[j % 2]] + '<em>Photo à venir</em></span>') +
              '</div><figcaption>' + esc(d.name) + '</figcaption></figure>';
          }).join('') + '</div></section>';
      }).join('');
    }
    // arrivée depuis le carrousel : met le plat en valeur
    var h = window.location.hash;
    if (/^#plat-\d+$/.test(h)) { var el = $(h); if (el) { el.classList.add('is-target'); setTimeout(function () { el.scrollIntoView({ block: 'center' }); }, 300); } }
  }

  /* ---------- « Nos menus » : carrousel 3D (coverflow) ---------- */
  function coverflow(box, dishes) {
    var n = dishes.length;
    var cur = 0;
    box.innerHTML = '<button type="button" class="cf-arrow cf-arrow--prev" data-cf="prev" aria-label="Plat précédent">‹</button>' +
      '<button type="button" class="cf-arrow cf-arrow--next" data-cf="next" aria-label="Plat suivant">›</button>' +
      '<div class="coverflow__stage">' + dishes.map(function (d, i) {
      return '<button type="button" class="cf-card" data-i="' + i + '" aria-label="' + esc(d.name) + '">' +
        (d.image ? '<img src="' + esc(d.image) + '" alt="" loading="lazy">' : '<span class="ph cf-ph tone-' + (i % 8 + 1) + '">' + T.icons[DISH_ICONS[i % 2]] + '<strong>' + esc(d.name) + '</strong><em>Photo à venir</em></span>') + '</button>';
    }).join('') + '</div>' +
      '<div class="coverflow__caption" aria-live="polite"><h3></h3><p></p></div>' +
      '<div class="coverflow__dots">' + dishes.map(function (d, i) { return '<button type="button" data-i="' + i + '" aria-label="' + esc(d.name) + '"></button>'; }).join('') + '</div>';
    var cards = $$('.cf-card', box);
    var dots = $$('.coverflow__dots button', box);
    var cap = $('.coverflow__caption', box);
    function layout() {
      var w = cards[0].offsetWidth;
      var mobile = window.innerWidth < 640;
      var sp = w * (mobile ? 0.5 : 0.62);
      cards.forEach(function (c, i) {
        var d = ((i - cur) % n + n) % n;
        if (d > n / 2) d -= n;
        var ad = Math.abs(d);
        c.style.transform = 'translate(-50%, -50%) translateX(' + (d * sp) + 'px) translateZ(' + (-ad * 150) + 'px) rotateY(' + (-d * 24) + 'deg)';
        c.style.opacity = ad > 2 ? 0 : 1;
        c.classList.toggle('is-side', ad > 0);
        c.style.zIndex = String(10 - ad);
        c.style.pointerEvents = ad > 2 ? 'none' : '';
        c.classList.toggle('is-active', ad === 0);
        c.setAttribute('aria-hidden', ad > 2 ? 'true' : 'false');
        c.tabIndex = ad === 0 ? 0 : -1;
      });
      dots.forEach(function (b, i) { b.classList.toggle('is-active', i === cur); });
      cap.classList.remove('is-in');
      void cap.offsetWidth;
      cap.querySelector('h3').textContent = dishes[cur].name;
      cap.querySelector('p').textContent = dishes[cur].text || '';
      cap.classList.add('is-in');
    }
    function go(i) { cur = ((i % n) + n) % n; layout(); }
    // défilement automatique (de droite à gauche), en pause au survol, au toucher ou hors écran
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var timer = null, paused = false, visible = false;
    function tick() { if (!paused && visible && !document.hidden) go(cur + 1); }
    function start() { if (!reduce && !timer) timer = setInterval(tick, 2600); }
    function hold() { paused = true; clearTimeout(hold.t); hold.t = setTimeout(function () { paused = false; }, 4000); }
    if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
      box.addEventListener('mouseenter', function () { paused = true; });
      box.addEventListener('mouseleave', function () { paused = false; });
    }
    box.addEventListener('click', function (e) {
      if (box.dataset.dragged) return;
      var arrow = e.target.closest('[data-cf]');
      if (arrow) { hold(); go(cur + (arrow.getAttribute('data-cf') === 'next' ? 1 : -1)); return; }
      var c = e.target.closest('[data-i]');
      if (!c) return;
      hold();
      var i = +c.getAttribute('data-i');
      if (i === cur && c.classList.contains('cf-card')) { if (window.TorraisPT) window.TorraisPT.go(c, 'menus.html#plat-' + i); else window.location.href = 'menus.html#plat-' + i; return; }
      go(i);
    });
    $$('[data-carousel]').forEach(function (b) {
      b.addEventListener('click', function () { hold(); go(cur + (b.getAttribute('data-carousel') === 'next' ? 1 : -1)); });
    });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { hold(); go(cur + 1); }
      if (e.key === 'ArrowLeft') { hold(); go(cur - 1); }
    });
    // glisser au doigt ou à la souris : un pas toutes les 60 px, réaction immédiate
    var drag = null;
    var stage = $('.coverflow__stage', box);
    stage.addEventListener('pointerdown', function (e) {
      if (e.target.closest('[data-cf]')) return;
      drag = { x: e.clientX, moved: false };
      hold();
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (Math.abs(dx) >= 60) { go(cur + (dx < 0 ? 1 : -1)); drag.x = e.clientX; drag.moved = true; }
    });
    window.addEventListener('pointerup', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (Math.abs(dx) > 25) { go(cur + (dx < 0 ? 1 : -1)); drag.moved = true; }
      if (drag.moved) { box.dataset.dragged = '1'; setTimeout(function () { delete box.dataset.dragged; }, 50); }
      drag = null;
    });
    window.addEventListener('pointercancel', function () { drag = null; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.3 }).observe(box);
    } else visible = true;
    window.addEventListener('resize', layout);
    layout();
    start();
  }

  function packPrice(n) { return Math.round(+n || 0).toLocaleString('fr-FR').replace(/\s/g, ' ') + ' DH'; }
  function packsOf(group) { return group === 'mariage' ? data.packages : ((data.servicePacks || {})[group] || []); }
  function packCard(p, i, groupLabel, group) {
    var pin = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
    var menus = (p.menus || []).filter(function (m) { return m.label; });
    var same = menus.length > 1 && menus.every(function (m) { return +m.price === +menus[0].price; });
    var cheapest = menus.reduce(function (min, m, j) { return +m.price && (min < 0 || +m.price < +menus[min].price) ? j : min; }, -1);
    var start = cheapest >= 0 ? cheapest : 0;
    var facts = [];
    if (p.tables) facts.push('Dès <b>' + esc(p.tables) + ' tables</b>');
    if (p.tenues) facts.push('Neggafa · <b>' + esc(p.tenues) + ' tenues</b>');
    var soon = p.soon || (!menus.length && !(p.features || []).length);
    return '<article class="pack' + (p.featured ? ' pack--featured' : '') + (soon ? ' pack--soon' : '') + '" data-i="' + i + '">' +
      (p.image ? '<div class="pack__img"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy"></div>' : '') +
      (p.featured && !soon ? '<span class="pack__badge">Le plus demandé</span>' : '') +
      '<span class="pack__num">Pack ' + (i + 1) + '</span>' +
      '<h3 class="pack__name">' + esc(p.name) + '</h3>' +
      (p.place || p.tagline ? '<p class="pack__place">' + pin + esc(p.place || p.tagline) + '</p>' : '') +
      (facts.length ? '<div class="pack__facts">' + facts.map(function (f) { return '<span>' + f + '</span>'; }).join('') + '</div>' : '') +
      (soon ? '<div class="pack__soon"><span>Détails à venir</span><i></i><i></i><i class="short"></i></div>' : '') +
      (p.features && p.features.length ? '<h4 class="pack__sub">Inclus</h4><ul class="pack__incl">' + p.features.map(function (f) {
        return '<li' + (/orchestre/i.test(f) ? ' class="is-strong"' : '') + '>' + esc(f) + '</li>';
      }).join('') + '</ul>' : '') +
      (menus.length ? '<h4 class="pack__sub">Votre menu</h4><div class="pack__menus" role="radiogroup" aria-label="Menu du pack ' + esc(p.name) + '">' + menus.map(function (m, j) {
        return '<label class="pack__menu"><input type="radio" name="packmenu-' + esc(groupLabel) + '-' + i + '" value="' + j + '"' + (j === start ? ' checked' : '') + '>' +
          '<span>' + esc(m.label) + '</span><em>' + (same ? 'même prix' : (+m.price ? packPrice(m.price) : 'sur devis')) + '</em></label>';
      }).join('') + '</div>' : '') +
      '<div class="pack__price"><small>' + (soon ? 'Prix' : 'À partir de') + '</small><strong data-pack-price>' +
        (menus.length && +menus[start].price ? packPrice(menus[start].price) : esc(p.price || 'Sur devis')) + '</strong></div>' +
      '<a href="' + (PAGE === 'pack' ? '#devis' : '#devis') + '" class="btn ' + (p.featured ? 'btn--gold' : 'btn--outline') + ' btn--block" data-package="' + esc(p.name + ' (' + groupLabel + ')') + '">Demander ce pack</a>' +
      (group ? '<a href="' + packUrl(group, p) + '" class="pack__more">Voir plus de détails <span aria-hidden="true">→</span></a>' : '') +
      '</article>';
  }
  function renderPackages() {
    var box = $('#packagesGrid');
    if (!box) return;
    var section = $('#formules');
    var groups = !occasion ? ['mariage'] : occasion.id === 'mariage' ? ['mariage', 'fiancailles'] : [occasion.id];
    var labels = {}; (T.PACK_GROUPS || []).forEach(function (g) { labels[g.id] = g.label; });
    var tabs = $('#packTabs');
    var saved = history.state && history.state.packTab;
    var current = groups.indexOf(saved) !== -1 ? saved : groups[0];
    function draw() {
      var list = packsOf(current);
      box.setAttribute('data-group', current);
      box.innerHTML = list.map(function (p, i) { return packCard(p, i, labels[current] || current, current); }).join('');
      var head = section && $('.section-head', section);
      if (head) {
        $('.eyebrow', head).textContent = 'Packs ' + (labels[current] || '').toLowerCase();
        var allSoon = list.every(function (p) { return p.soon; });
        $('.section-sub', head).textContent = current === 'mariage'
          ? "Trois packs tout compris : neggafa, décoration, caméra, musique, dîner et douceurs. Choisissez votre menu, le prix s'affiche."
          : allSoon ? 'Nos trois packs ' + (labels[current] || '').toLowerCase() + ' arrivent très bientôt. En attendant, demandez votre devis gratuit.'
          : 'Trois packs pour votre événement. Choisissez celui qui vous convient.';
      }
    }
    if (tabs) {
      if (groups.length > 1) {
        tabs.hidden = false;
        tabs.innerHTML = groups.map(function (g) { return '<button type="button" role="tab" aria-selected="' + (g === current) + '" class="pack-tab' + (g === current ? ' is-active' : '') + '" data-group="' + g + '">' + esc(labels[g] || g) + '</button>'; }).join('');
        tabs.addEventListener('click', function (e) {
          var t = e.target.closest('[data-group]');
          if (!t) return;
          current = t.getAttribute('data-group');
          history.replaceState(Object.assign({}, history.state, { packTab: current }), '');
          $$('.pack-tab', tabs).forEach(function (x) { x.classList.toggle('is-active', x === t); x.setAttribute('aria-selected', String(x === t)); });
          draw();
        });
      } else tabs.hidden = true;
    }
    draw();
    // le prix suit le menu choisi
    box.addEventListener('change', function (e) {
      var card = e.target.closest('.pack');
      if (!card || e.target.type !== 'radio') return;
      var p = packsOf(current)[+card.getAttribute('data-i')];
      var m = p && p.menus[+e.target.value];
      if (m) $('[data-pack-price]', card).textContent = +m.price ? packPrice(m.price) : 'Sur devis';
    });
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
  /* ---------- galerie de l'accueil : « Drift Wall » ----------
     Colonnes de largeurs différentes, tuiles de hauteurs variées (tile 180 × 124, écart 6, arrondi 16, variance 0,4),
     mur légèrement incliné, chaque colonne dérive à sa propre vitesse, en sens alternés. */
  function renderDrift(box) {
    // chaque vraie photo n'apparaît qu'une fois sur le mur ; les autres cases sont des emplacements « photo à venir »
    galleryList = data.gallery.filter(function (g) { return g.src; });
    var n = galleryList.length;
    var mobile = window.innerWidth < 700;
    var GAP = 6, VAR = 0.4;
    var seed, cols;
    // petit générateur pseudo-aléatoire stable (même mur à chaque visite)
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    // 1. la forme du mur : colonnes et hauteurs des cases. Si le mur a plus de cases que de photos,
    //    on agrandit les cases jusqu'à ce que chaque case ait sa propre photo (mur plein, aucune répétition).
    function layout(scale) {
      seed = 7; cols = [];
      var TW = (mobile ? 128 : 180) * scale, TH = (mobile ? 90 : 124) * scale;
      var wallW = box.clientWidth * 1.25, x = 0;
      while (x < wallW) {
        var w = Math.round(TW * (1 + (rnd() * 2 - 1) * VAR * 0.5));
        var hs = [], total = 0;
        while (total < box.clientHeight * 1.35 || hs.length < 3) { var h = Math.round(TH * (1 + (rnd() * 2 - 1) * VAR)); hs.push(h); total += h + GAP; }
        cols.push({ w: w, hs: hs, speed: (mobile ? 14 : 18) + Math.round(rnd() * (mobile ? 22 : 30)) });
        x += w + GAP;
      }
      return cols.reduce(function (t, c) { return t + c.hs.length; }, 0);
    }
    var scale = 1;
    if (n) { while (layout(scale) > n && scale < 4) scale *= 1.06; } else layout(1);
    // 2. on place les photos : une case par photo, réparties sur tout le mur (le centre d'abord, sans regrouper)
    var tilesAll = [];
    cols.forEach(function (c, ci) { c.hs.forEach(function (h, ri) { tilesAll.push({ k: ci + ':' + ri, w: Math.abs(ci - (cols.length - 1) / 2) + rnd() * 1.5 + (ri % 2) * 0.4 }); }); });
    tilesAll.sort(function (p, q) { return p.w - q.w; });
    var slots = tilesAll.slice(0, n).map(function (t) { return t.k; });
    var at = {};
    slots.forEach(function (k, i) { at[k] = i; });
    // 3. le mur
    var html = '<div class="drift__wall">';
    cols.forEach(function (col, ci) {
      var tiles = '', ph = 0;
      col.hs.forEach(function (h, ri) {
        var idx = at[ci + ':' + ri];
        if (idx != null) {
          var g = galleryList[idx];
          tiles += '<button type="button" class="drift__tile" data-index="' + idx + '" style="height:' + h + 'px" aria-label="' + esc(g.caption || 'Photo') + '">' +
            photoInner(g, idx) + (g.caption ? '<span class="drift__cap">' + esc(g.caption) + '</span>' : '') + '</button>';
        } else {
          tiles += '<div class="drift__tile drift__tile--ph" style="height:' + h + 'px" aria-hidden="true">' + placeholder(ci + ri + ph++) + '</div>';
        }
      });
      html += '<div class="drift__col" style="width:' + col.w + 'px" data-speed="' + col.speed + '" data-dir="' + (ci % 2 ? 1 : -1) + '"><div class="drift__track">' +
        tiles + tiles.replace(/<button /g, '<button tabindex="-1" aria-hidden="true" ') + '</div></div>';
    });
    box.innerHTML = html + '</div><div class="drift__vignette" aria-hidden="true"></div>';
    driftMotion(box);
  }
  function driftMotion(box) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cols = $$('.drift__col', box).map(function (col) {
      var track = col.firstChild;
      return { track: track, v: +col.getAttribute('data-speed'), dir: +col.getAttribute('data-dir'), off: Math.random() * 400, half: track.scrollHeight / 2 };
    });
    var factor = 1, target = 1, visible = true, last = 0;
    if (window.matchMedia('(hover: hover)').matches) {
      box.addEventListener('mouseenter', function () { target = 0.15; });
      box.addEventListener('mouseleave', function () { target = 1; });
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(box);
    window.addEventListener('resize', function () { cols.forEach(function (c) { c.half = c.track.scrollHeight / 2; }); });
    function frame(t) {
      var dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      if (visible && !document.hidden) {
        factor += (target - factor) * Math.min(1, dt * 4); // ralentit / repart en douceur
        cols.forEach(function (c) {
          if (!c.half) c.half = c.track.scrollHeight / 2;
          c.off = (c.off + c.v * factor * dt) % c.half;
          var y = c.dir < 0 ? -c.off : c.off - c.half;
          c.track.style.transform = 'translate3d(0,' + y.toFixed(2) + 'px,0)';
        });
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function renderGallery(filter) {
    var box = $('#galleryGrid');
    if (!box) return;
    if (box.classList.contains('drift')) { renderDrift(box); return; }
    var all = data.gallery.slice();
    if (occasion || PAGE === 'pack') {
      // pages de service : les photos du service, sinon des emplacements « photo à venir »
      var sid = occasion ? occasion.id : GROUP_OCC[PACK_GROUP];
      var mine = ((data.servicePhotos || {})[sid] || []);
      all = mine.length ? mine.map(function (src, i) { return { src: src, caption: '', tone: i }; })
        : [0, 1, 2, 3, 4, 5].map(function (i) { return { src: '', caption: '', tone: i }; });
      if (PAGE === 'pack') all = all.slice(0, 14);
      // les photos se fondent dans un bouton vers Instagram
      if (mine.length && !box.parentNode.querySelector('.gallery-more')) {
        box.classList.add('gallery--fade');
        box.insertAdjacentHTML('afterend', '<div class="gallery-more"><a class="btn btn--gold" href="' + esc(s.instagram || 'https://www.instagram.com/torrais.event/') + '" target="_blank" rel="noopener"><span class="icon">' + T.icons.instagram + '</span> Voir plus sur notre page Instagram</a></div>');
      }
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
    $('#avis').hidden = false;
    // Pas encore de vrais avis : cartes d'attente clairement marquées (aucun faux nom ni faux texte)
    if (!list.length) {
      if (box.closest('main') && document.body.getAttribute('data-page') !== 'home') { $('#avis').hidden = true; return; }
      box.innerHTML = [1, 2, 3].map(function () {
        return '<figure class="review review--ph" aria-hidden="true"><div class="review__top"><span class="review__g">G</span><div class="review__stars">★★★★★</div></div>' +
          '<div class="review__lines"><i></i><i></i><i></i><i class="short"></i></div>' +
          '<figcaption><span class="review__avatar"></span><span class="review__tag">Avis à venir</span></figcaption></figure>';
      }).join('');
      box.insertAdjacentHTML('afterend', '<p class="reviews__soon">Les avis de nos clients arrivent bientôt ici.</p>');
      return;
    }
    if (data.settings.googleReviews) {
      $('#reviewsLink').href = data.settings.googleReviews;
      $('#reviewsMore').hidden = false;
    }
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
      // f.html : réponse mise en forme (texte écrit par nous, jamais par un visiteur)
      return '<details class="faq__item"><summary>' + esc(f.q) + '</summary>' + (f.html ? '<div class="faq__html">' + f.html + '</div>' : '<p>' + esc(f.a) + '</p>') + '</details>';
    }).join('');
  }

  function renderZones() {
    var box = $('#zonesList');
    if (!box) return;
    var z = data.site.zones || [];
    if (!z.length) { box.parentNode.hidden = true; return; }
    box.innerHTML = z.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
  }

  /* ---------- accueil : « Demander un devis » ouvre le formulaire ---------- */
  function initDevisChoice() {
    var panel = $('#devisPanel');
    var btn = $('#openDevis');
    if (!panel || !btn) return;
    function open(scroll) {
      history.replaceState(Object.assign({}, history.state, { devisOpen: true }), '');
      panel.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      btn.classList.add('is-open');
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      if (scroll) {
        var lenis = window.TorraisMotion && window.TorraisMotion.lenis;
        setTimeout(function () {
          if (lenis) lenis.scrollTo(panel); else panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
          var first = panel.querySelector('input, select, textarea');
          if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 600);
        }, 30);
      }
    }
    btn.addEventListener('click', function () {
      if (panel.hidden) open(true);
      else { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.classList.remove('is-open'); }
    });
    // tous les liens « #devis » de la page (bouton du héros, barre du bas, menu) ouvrent aussi le formulaire
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href="#devis"]');
      if (!a) return;
      e.preventDefault();
      open(true);
      history.replaceState(null, '', '#devis');
    }, true);
    if (window.location.hash === '#devis') open(true);
    else if (history.state && history.state.devisOpen) open(false);
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
    var oc = $('#occCompose'); if (oc) oc.href = 'composer.html?type=' + encodeURIComponent(occasion.id);
    var bg = occasion.image || (data.media.hero[0] && data.media.hero[0].src) || (data.media.heroVideo ? 'assets/img/salle.jpg' : '');
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
    if (box && !slides.length && m.heroVideo) { heroImage(box); return; }
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

  // Photo de la salle (fond par défaut du héros, tant que le gérant n'a pas ajouté ses photos)
  function heroImage(box) {
    $('.hero').classList.add('hero--photo', 'hero--still');
    var still = document.createElement('div');
    still.className = 'hero__slide is-active';
    still.style.backgroundImage = 'url("assets/img/salle.jpg")';
    box.appendChild(still);
    heroVideo(box);
  }

  // Vidéo du héros : la photo s'affiche d'abord, la vidéo apparaît une fois chargée.
  // Téléphone : vidéo en plein écran derrière le texte. Ordinateur : texte à gauche, vidéo à droite qui se fond dans le texte.
  // Pas de vidéo en mode économie de données ou si les animations sont réduites (la première image reste affichée).
  function heroVideo(box) {
    var mq = window.matchMedia && window.matchMedia('(max-width: 760px) and (orientation: portrait)');
    var split = window.innerWidth >= 900;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var conn = navigator.connection || {};
    if (split) {
      $('.hero').classList.add('hero--split');
      var first = box.querySelector('.hero__slide');
      if (first) first.style.backgroundImage = 'url("assets/video/hero-mobile-poster.jpg")';
    }
    if (!(split || (mq && mq.matches)) || reduce || conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '')) return;
    var v = document.createElement('video');
    v.className = 'hero__video';
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    v.preload = 'auto';
    v.poster = 'assets/video/hero-mobile-poster.jpg';
    // la carte qui s'agrandit dans l'écran d'ouverture montre la première image de la vidéo
    var still = box.querySelector('.hero__slide');
    if (still) still.style.backgroundImage = 'url("assets/video/hero-mobile-poster.jpg")';
    v.src = split ? 'assets/video/hero-hd.mp4' : 'assets/video/hero-mobile.mp4'; // ordinateur : version 1080p, plus nette sur grand écran
    $('.hero').classList.add('hero--video'); // héros plein écran sur téléphone pour montrer la vidéo verticale
    v.addEventListener('playing', function () { v.classList.add('is-playing'); }, { once: true });
    box.appendChild(v);
    var started = false;
    function start() {
      started = true;
      var p = v.play();
      if (p && p.catch) p.catch(function () { /* lecture refusée : la photo reste */ });
    }
    // pendant l'écran d'ouverture, la vidéo attend (chargée mais à l'arrêt) ; elle démarre quand l'accueil apparaît
    if (document.documentElement.classList.contains('is-intro') && !window.__introDone) {
      v.pause();
      window.addEventListener('torrais:intro-done', start, { once: true });
      setTimeout(function () { if (!started && !document.documentElement.classList.contains('is-intro')) start(); }, 9500);
    } else start();
    // pause quand le héros n'est plus visible (économise la batterie)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        if (!started) return;
        if (en[0].isIntersecting) { var q = v.play(); if (q && q.catch) q.catch(function () {}); } else v.pause();
      }).observe(box);
    }
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
    var fromTile = null;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // la photo s'ouvre depuis sa vignette et se referme dedans
    function flip(el, a, b, dur, done) {
      if (!el.animate || reduce || !a || !b) { done && done(); return; }
      var dx = a.left + a.width / 2 - (b.left + b.width / 2), dy = a.top + a.height / 2 - (b.top + b.height / 2);
      var sx = a.width / b.width, sy = a.height / b.height;
      var an = el.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')', borderRadius: '16px' }, { transform: 'none', borderRadius: '0px' }],
        { duration: dur, easing: 'cubic-bezier(.65, 0, .25, 1)', direction: done && done.reverse ? 'reverse' : 'normal', fill: 'both' });
      an.onfinish = function () { an.cancel(); done && done(); };
    }
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-index]');
      if (!btn) return;
      fromTile = btn;
      show(+btn.getAttribute('data-index'));
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      var target = fig.firstElementChild;
      if (target && !reduce && box.animate) {
        box.animate([{ backgroundColor: 'rgba(14,12,10,0)' }, { backgroundColor: getComputedStyle(box).backgroundColor }], { duration: 500, easing: 'ease' });
        flip(target, btn.getBoundingClientRect(), target.getBoundingClientRect(), 650);
      }
      openLayer('lightbox', hide);
    });
    function hide() {
      var target = fig.firstElementChild;
      function done() { box.hidden = true; document.body.style.overflow = ''; }
      if (target && fromTile && !reduce && target.animate) {
        var cb = function () { done(); };
        cb.reverse = true;
        box.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 650, easing: 'ease' });
        flip(target, fromTile.getBoundingClientRect(), target.getBoundingClientRect(), 650, cb);
      } else done();
    }
    function close() { if (!box.hidden) closeLayer(); }
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
    function setNav(open) { nav.classList.toggle('is-open', open); toggle.setAttribute('aria-expanded', String(open)); }
    toggle.addEventListener('click', function () {
      if (nav.classList.contains('is-open')) closeLayer();
      else { setNav(true); openLayer('nav', function () { setNav(false); }); }
    });
    dropBtn.addEventListener('click', function () {
      var open = drop.classList.toggle('is-open');
      dropBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav__drop')) { drop.classList.remove('is-open'); dropBtn.setAttribute('aria-expanded', 'false'); }
    });
    nav.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a || !nav.classList.contains('is-open')) return;
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) === '#') { closeLayer(); return; } // ancre de la même page : on ferme le menu, puis on défile
      setNav(false); // autre page : le pageshow du retour retirera l'étape « menu »
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
          '<label class="field"><span>Nom complet *</span><input type="text" name="name" required maxlength="80" autocomplete="name" placeholder="Ex. Salma Bennani"></label>' +
          '<label class="field"><span>Téléphone / WhatsApp *</span><input type="tel" name="phone" required maxlength="20" autocomplete="tel" placeholder="06 XX XX XX XX"></label>' +
        '</div>' +
        '<div class="form__row">' +
          '<label class="field"><span>Type d\'événement *</span><select name="eventType" required><option value="">Choisir…</option>' +
            T.EVENT_TYPES.map(function (t) { return '<option' + ((PACK_GROUP ? GROUP_EVENT[PACK_GROUP] === t : occasion && occasion.eventType === t) ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select></label>' +
          '<label class="field"><span>Date de l\'événement *</span><input type="date" name="date" required min="' + U.iso(new Date()) + '"></label>' +
        '</div>' +
        '<div class="form__row">' +
          '<label class="field"><span>Nombre d\'invités *</span><input type="number" name="guests" inputmode="numeric" required min="10" max="2000" step="10" placeholder="Ex. 200"></label>' +
          '<label class="field"><span>Budget approximatif</span><select name="budget"><option value="">Je ne sais pas encore</option>' +
            '<option>Moins de 20 000 DH</option><option>20 000 – 50 000 DH</option><option>50 000 – 80 000 DH</option><option>80 000 – 120 000 DH</option><option>Plus de 120 000 DH</option></select></label>' +
        '</div>' +
        '<label class="field"><span>Votre message</span><textarea name="message" rows="4" maxlength="1000" placeholder="Lieu, formule qui vous intéresse, demandes particulières…"></textarea></label>' +
        '<p class="form__error" id="formError" role="alert" hidden></p>' +
        '<button type="submit" class="btn btn--wa btn--block"><span class="icon">' + T.icons.whatsapp + '</span> Envoyer ma demande<span class="hide-xs"> sur WhatsApp</span></button>' +
        '<p class="form__hint">Votre demande s\'ouvre dans WhatsApp, prête à envoyer · Réponse rapide · Sans engagement</p>' +
      '</form>' +
      '<div class="form form--success" id="formSuccess" hidden>' +
        '<div class="success__icon"><span class="icon">' + T.icons.check + '</span></div>' +
        '<h3>Votre demande est prête !</h3>' +
        '<p>WhatsApp s\'est ouvert avec votre message : il ne vous reste qu\'à appuyer sur « Envoyer ». Si WhatsApp ne s\'est pas ouvert, utilisez ce bouton :</p>' +
        '<a href="#" class="btn btn--wa btn--block" id="successWa"><span class="icon">' + T.icons.whatsapp + '</span> Ouvrir WhatsApp</a>' +
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
      var card = a.closest('.pack');
      var chosen = card ? $('.pack__menu input:checked', card) : null;
      var price = card ? $('[data-pack-price]', card) : null;
      var line = 'Je suis intéressé(e) par le pack ' + a.getAttribute('data-package') +
        (chosen ? ' — menu : ' + chosen.parentNode.querySelector('span').textContent : '') +
        (price && /^\d/.test(price.textContent) ? ' (à partir de ' + price.textContent + ')' : price && /\d/.test(price.textContent) ? ' (' + price.textContent.charAt(0).toLowerCase() + price.textContent.slice(1) + ')' : '') + '.';
      if (!msg.value || /^Je suis intéressé\(e\) par (la formule|le pack)/.test(msg.value)) msg.value = line;
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

      var req = {
        name: U.clip(f.name.value, 80), phone: U.clip(f.phone.value, 20), eventType: U.clip(f.eventType.value, 60),
        date: U.clip(f.date.value, 10), guests: Math.min(2000, Math.max(0, Math.round(+f.guests.value) || 0)), budget: U.clip(f.budget.value, 60), message: U.clip(f.message.value, 1000)
      };
      var text = 'Bonjour TORRAIS EVENT, je souhaite un devis.\n' +
        '• Nom : ' + req.name + '\n' +
        '• Téléphone : ' + req.phone + '\n' +
        '• Événement : ' + req.eventType + '\n' +
        '• Date : ' + U.formatDate(req.date) + '\n' +
        '• Invités : ' + req.guests + '\n' +
        (req.budget ? '• Budget : ' + req.budget + '\n' : '') +
        (req.message ? '• Message : ' + req.message : '');
      var url = U.waLink(s.whatsapp || s.phone, text);
      window.open(url, '_blank', 'noopener');
      var wa = $('#successWa');
      wa.href = url;
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
  restoreVt();
  renderOccasionPage();
  renderOccasions();
  renderServices();
  renderDishes();
  renderPackages();
  renderStats();
  renderFilters();
  renderGallery();
  renderReviews();
  renderMenusPage();
  renderWeddingSteps();
  renderPackPage();
  initDevisChoice();
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
