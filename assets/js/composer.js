/* TORRAIS EVENT — « Composez votre événement » : simulateur en 6 étapes, relié aux vrais packs et aux 5 familles du menu */
(function () {
  'use strict';

  var root = document.getElementById('composer');
  if (!root) return;

  var T = window.Torrais;
  var U = T.util;
  var esc = U.esc;
  var data = T.store.load();
  var S = data.settings;
  var P = data.pricing;

  function $(sel, r) { return (r || document).querySelector(sel); }
  function $$(sel, r) { return Array.prototype.slice.call((r || document).querySelectorAll(sel)); }

  /* ---------- données ---------- */
  var TYPES = [
    { id: 'mariage', label: 'Mariage', eventType: 'Mariage', icon: 'deco', img: 'assets/img/services/mariage.webp' },
    { id: 'fiancailles', label: 'Fiançailles', eventType: 'Fiançailles', icon: 'tyafer', img: 'assets/img/loader/c03.webp' },
    { id: 'bapteme', label: 'Baptême', eventType: 'Aqiqa / Baptême', icon: 'buffet', img: 'assets/img/services/bapteme.webp' },
    { id: 'entreprise', label: 'Entreprise', eventType: "Événement d'entreprise", icon: 'traiteur', img: 'assets/img/services/entreprise.webp' },
    { id: 'prive', label: 'Autre', eventType: 'Autre', icon: 'buffet', img: 'assets/img/services/prive.webp' }
  ];
  var PLACES = [
    { id: 'salle', label: 'Salle de fête', text: 'Nous réservons et préparons la salle.', icon: 'deco' },
    { id: 'villa', label: 'Villa', text: 'Une villa pour une fête plus intime.', icon: 'tyafer' },
    { id: 'domicile', label: 'À domicile', text: 'Nous venons chez vous, tout compris.', icon: 'traiteur' }
  ];
  var STEPS = ['Votre fête', 'Lieu', 'Pack', 'Menu', 'Options', 'Récapitulatif'];
  var UNIT_LABEL = { pers: '/ invité', table: '/ table de 10', forfait: 'forfait', unite: "l'unité" };
  var CAT_ICONS = { plats: 'traiteur', desserts: 'buffet', 'sucres-sales': 'tyafer', salades: 'buffet', jus: 'deco' };
  // Ce que les packs comprennent déjà, par famille du menu (« Inclus » dans le menu)
  var FEATURE_CAT = { dessert: 'desserts', jus: 'jus', 'gâteaux': 'sucres-sales' };
  var DECO_IDS = ['deco_tables', 'deco_salle', 'kousha'];

  function typeOf(id) { return TYPES.filter(function (t) { return t.id === id; })[0] || TYPES[0]; }
  function packsOf(group) { return group === 'mariage' ? data.packages : ((data.servicePacks || {})[group] || []); }
  function isSoon(p) { return p.soon || (!(p.menus || []).filter(function (m) { return m.label; }).length && !(p.features || []).length && !p.price); }
  function placeOfPack(p) {
    var s = (p.place || '').toLowerCase();
    return /villa/.test(s) ? 'villa' : /salle/.test(s) ? 'salle' : /chez vous|domicile/.test(s) ? 'domicile' : '';
  }

  var q = new URLSearchParams(window.location.search);
  var startType = TYPES.some(function (t) { return t.id === q.get('type'); }) ? q.get('type') : 'mariage';
  var state = {
    step: 0,
    maxStep: 0,
    type: startType,
    guests: 200,
    date: '',
    place: '',
    pkg: '',            // id du pack, ou 'surmesure'
    pkgMenu: 0,         // index du menu choisi dans le pack
    cat: '',            // famille du menu ouverte
    dishes: {},         // plats ajoutés : { 'plats:Pastilla au poulet': true }
    opts: {},
    tyafer: 0
  };
  if (q.get('formule')) state.pkg = q.get('formule');

  function currentPacks() { return packsOf(state.type); }
  function currentPack() { return currentPacks().filter(function (p) { return p.id === state.pkg; })[0] || null; }
  function packMenus(p) { return ((p && p.menus) || []).filter(function (m) { return m.label; }); }
  function hasFeature(p, name) { return !!p && (p.features || []).some(function (f) { return f.toLowerCase() === name; }); }

  /* ---------- prix ---------- */
  function round500(n) { return Math.round(n / 500) * 500; }
  function included(id) {
    var p = currentPack();
    if (p && DECO_IDS.indexOf(id) !== -1 && hasFeature(p, 'décoration')) return true;
    return false;
  }
  function qtyOf(o) {
    if (o.unit === 'pers') return state.guests;
    if (o.unit === 'table') return Math.ceil(state.guests / 10);
    if (o.unit === 'unite') return o.id === 'tyafer' ? state.tyafer : (state.opts[o.id] ? 1 : 0);
    return 1;
  }
  function selected(o) { return o.id === 'tyafer' ? state.tyafer > 0 : !!state.opts[o.id]; }
  function extraOptions() { return P.options.filter(function (o) { return o.group !== 'Menu' && o.active !== false; }); }
  function basePrice() {
    var p = currentPack();
    if (!p) return null;
    var m = packMenus(p)[state.pkgMenu];
    if (m && +m.price) return +m.price;
    var digits = String(p.price || '').replace(/[^\d]/g, '');
    return digits ? +digits : null;
  }
  function lines() {
    var out = [];
    var p = currentPack();
    if (state.pkg === 'surmesure') out.push({ label: 'Événement sur mesure', detail: state.guests + ' invités', price: null });
    else if (p) {
      var m = packMenus(p)[state.pkgMenu];
      out.push({ label: 'Pack ' + p.name, detail: m ? m.label : (p.place || ''), price: basePrice() });
    }
    extraOptions().forEach(function (o) {
      if (included(o.id)) { out.push({ label: o.name, detail: 'inclus dans le pack', included: true }); return; }
      if (!selected(o)) return;
      var n = qtyOf(o);
      var detail = o.unit === 'table' ? n + ' tables' : o.unit === 'unite' ? n + ' tyafer' : o.unit === 'pers' ? state.guests + ' invités' : '';
      out.push({ label: o.name, detail: detail, min: o.min * n, max: o.max * n });
    });
    return out;
  }
  function estimate() {
    var l = lines();
    var base = basePrice();
    var min = l.reduce(function (s, x) { return s + (x.min || 0); }, 0);
    var max = l.reduce(function (s, x) { return s + (x.max || 0); }, 0);
    return { base: base, optMin: round500(min), optMax: round500(max), min: (base || 0) + round500(min), max: (base || 0) + round500(max) };
  }
  function totalText(e) {
    if (e.base == null) return e.optMax ? 'Sur devis + options' : 'Sur devis';
    if (!e.optMax) return 'Dès ' + U.formatDH(e.base);
    return U.formatDH(e.min) + ' – ' + U.formatDH(e.max);
  }
  function optPrice(o) {
    if (o.unit === 'pers') return '+ ' + o.min + '–' + o.max + ' DH ' + UNIT_LABEL.pers;
    return '+ ' + U.formatDH(o.min).replace(' DH', '') + '–' + U.formatDH(o.max) + ' ' + UNIT_LABEL[o.unit];
  }
  function thumb(icon, tone) { return '<span class="cz-thumb tone-' + ((tone % 8) + 1) + '" aria-hidden="true">' + (T.icons[icon] || '') + '</span>'; }

  /* ---------- rendu ---------- */
  function render() {
    root.innerHTML =
      '<div class="composer__main">' +
        '<ol class="steps-bar steps-bar--6">' + STEPS.map(function (s, i) {
          return '<li class="' + (i === state.step ? 'is-current' : i <= state.maxStep ? 'is-done' : '') + '"><button type="button" data-goto="' + i + '"' + (i > state.maxStep ? ' disabled' : '') + ' aria-label="Étape ' + (i + 1) + ' : ' + s + (i <= state.maxStep && i !== state.step ? ' (modifier)' : '') + '"><span>' + (i + 1) + '</span>' + s + '</button></li>';
        }).join('') + '</ol>' +
        '<div class="composer__panel" id="composerPanel">' + stepHtml() + '</div>' +
        '<p class="form__error" id="stepError" hidden></p>' +
        '<div class="composer__nav">' +
          (state.step > 0 ? '<button type="button" class="btn btn--ghost" data-prev>← Retour</button>' : '<span></span>') +
          (state.step < STEPS.length - 1 ? '<button type="button" class="btn btn--gold" data-next>Continuer →</button>' : '') +
        '</div>' +
      '</div>' +
      '<aside class="composer__summary" id="composerSummary">' + summaryHtml() + '</aside>' +
      '<div class="composer__bar" id="composerBar">' + barHtml() + '</div>';
  }

  function stepHtml() {
    var t = typeOf(state.type);
    if (state.step === 0) {
      return '<h2 class="composer__title">Quel événement préparez-vous ?</h2>' +
        '<div class="cz-types">' + TYPES.map(function (x, i) {
          return '<label class="cz-type"><input type="radio" name="type" value="' + x.id + '"' + (state.type === x.id ? ' checked' : '') + '>' +
            '<span class="cz-type__box">' + (x.img ? '<span class="cz-type__img"><img src="' + x.img + '" alt=""></span>' : thumb(x.icon, i)) + '<strong>' + esc(x.label) + '</strong></span></label>';
        }).join('') + '</div>' +
        '<div class="composer__row">' +
          '<label class="field field--guests"><span>Nombre d\'invités : <b id="guestsOut">' + state.guests + '</b></span>' +
            '<input type="range" id="guestsRange" min="20" max="600" step="10" value="' + state.guests + '" aria-label="Nombre d\'invités"></label>' +
          '<label class="field"><span>Date (si vous la connaissez)</span><input type="date" id="dateInput" min="' + U.iso(new Date()) + '" value="' + esc(state.date) + '"></label>' +
        '</div>';
    }
    if (state.step === 1) {
      return '<h2 class="composer__title">Où aura lieu votre ' + esc(t.label.toLowerCase()) + ' ?</h2><p class="composer__hint">Nous nous adaptons à votre lieu.</p>' +
        '<div class="cz-places">' + PLACES.map(function (x, i) {
          return '<label class="cz-place"><input type="radio" name="place" value="' + x.id + '"' + (state.place === x.id ? ' checked' : '') + '>' +
            '<span class="cz-place__box"><span class="cz-place__ph ph cf-ph tone-' + (i + 2) + '">' + T.icons[x.icon] + '<em>Photo à venir</em></span>' +
            '<span class="cz-place__text"><strong>' + esc(x.label) + '</strong><span>' + esc(x.text) + '</span></span><span class="cz-radio" aria-hidden="true"></span></span></label>';
        }).join('') + '</div>';
    }
    if (state.step === 2) {
      var list = currentPacks();
      return '<h2 class="composer__title">Choisissez votre pack</h2><p class="composer__hint">Les packs ' + esc(t.label.toLowerCase()) + ' : vous choisirez le menu à l\'étape suivante.</p>' +
        '<div class="cz-packs">' + list.map(function (p, i) {
          var soon = isSoon(p);
          var menus = packMenus(p);
          var prices = menus.map(function (m) { return +m.price; }).filter(Boolean);
          var from = prices.length ? Math.min.apply(null, prices) : 0;
          var match = state.place && placeOfPack(p) === state.place;
          return '<label class="cz-pack' + (p.featured && !soon ? ' cz-pack--featured' : '') + '"><input type="radio" name="pkg" value="' + esc(p.id) + '"' + (state.pkg === p.id ? ' checked' : '') + '>' +
            '<span class="cz-pack__box">' +
              (match ? '<em class="cz-pack__badge">Pour votre lieu</em>' : p.featured && !soon ? '<em class="cz-pack__badge">Le plus demandé</em>' : '') +
              '<span class="cz-pack__num">Pack ' + (i + 1) + '</span>' +
              '<strong class="cz-pack__name">' + esc(p.name) + '</strong>' +
              '<span class="cz-pack__place">' + esc(p.place || (soon ? 'Détails à venir' : '')) + '</span>' +
              '<span class="cz-pack__price">' + (from ? '<small>dès</small> ' + U.formatDH(from) : '<small>Prix</small> sur devis') + '</span>' +
              '<span class="cz-pack__facts">' +
                (p.tables ? '<span>' + p.tables + '+ tables</span>' : '') + (p.tenues ? '<span>' + p.tenues + ' tenues</span>' : '') +
              '</span>' +
              (soon ? '<span class="cz-pack__soon"><i></i><i></i><i class="short"></i></span>' :
                '<ul class="cz-pack__list">' + (p.features || []).slice(0, 6).map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>') +
              '<span class="cz-pack__pick">' + (state.pkg === p.id ? 'Sélectionné' : 'Choisir') + '</span>' +
            '</span></label>';
        }).join('') + '</div>' +
        '<label class="cz-custom"><input type="radio" name="pkg" value="surmesure"' + (state.pkg === 'surmesure' ? ' checked' : '') + '>' +
          '<span class="cz-custom__box">' + thumb('deco', 5) + '<span><strong>Sur mesure</strong><span>Aucun pack ne vous convient ? Composez librement, nous vous faisons un devis.</span></span><span class="cz-radio" aria-hidden="true"></span></span></label>';
    }
    if (state.step === 3) {
      var p = currentPack();
      var menus = packMenus(p);
      var cats = data.site.menuCats || [];
      var head = '<h2 class="composer__title">Votre menu</h2>';
      var packMenu = menus.length ? '<h3 class="composer__group">Le menu de votre pack</h3><div class="cz-menus">' + menus.map(function (m, i) {
        return '<label class="cz-menu"><input type="radio" name="pkgMenu" value="' + i + '"' + (state.pkgMenu === i ? ' checked' : '') + '>' +
          '<span class="cz-menu__box">' + menuThumb(m.label, i) + '<span class="cz-menu__text"><strong>' + esc(m.label) + '</strong><span>' + (+m.price ? 'Pack dès ' + U.formatDH(m.price) : 'Sur devis') + '</span></span><span class="cz-radio" aria-hidden="true"></span></span></label>';
      }).join('') + '</div>' : '';
      var open = cats.filter(function (c) { return c.id === state.cat; })[0];
      var catBlock;
      if (!open) {
        catBlock = '<h3 class="composer__group">' + (menus.length ? 'Ajoutez des plats' : 'Choisissez vos plats') + '</h3>' +
          '<p class="composer__hint">Choisissez une famille pour voir ses plats.</p>' +
          '<div class="cz-cats">' + cats.map(function (c, i) {
            var n = Object.keys(state.dishes).filter(function (k) { return state.dishes[k] && k.indexOf(c.id + ':') === 0; }).length;
            var inc = catIncluded(c.id);
            return '<button type="button" class="cz-cat" data-cat="' + esc(c.id) + '">' +
              (c.image ? '<span class="cz-cat__img"><img src="' + esc(c.image) + '" alt=""></span>' : '<span class="cz-cat__img ph cf-ph tone-' + (i % 8 + 1) + '">' + T.icons[CAT_ICONS[c.id] || 'traiteur'] + '</span>') +
              '<span class="cz-cat__text"><span class="cz-cat__num">' + String(i + 1).padStart(2, '0') + '</span><strong>' + esc(c.title) + '</strong>' +
              '<span>' + (inc ? 'Inclus dans votre pack' : (c.items || []).length + ' plats') + (n ? ' · <b>' + n + ' choisi' + (n > 1 ? 's' : '') + '</b>' : '') + '</span></span>' +
              '<span class="cz-cat__go" aria-hidden="true">→</span></button>';
          }).join('') + '</div>';
      } else {
        var inc = catIncluded(open.id);
        catBlock = '<div class="cz-cathead"><button type="button" class="cz-back" data-cat="">← Toutes les familles</button>' +
          (open.image ? '<span class="cz-cathead__img"><img src="' + esc(open.image) + '" alt=""></span>' : '') +
          '<h3>' + esc(open.title) + '</h3>' + (inc ? '<span class="cz-inc">Inclus dans votre pack</span>' : '') + '</div>' +
          '<div class="cz-dishes">' + (open.items || []).map(function (d, i) {
            var key = open.id + ':' + d;
            var inMenu = menus.length && packMenus(p)[state.pkgMenu] && dishInMenu(d, packMenus(p)[state.pkgMenu].label);
            var on = inMenu || !!state.dishes[key];
            return '<label class="cz-dish' + (on ? ' is-on' : '') + (inMenu ? ' is-included' : '') + '"><input type="checkbox" data-dish="' + esc(key) + '"' + (on ? ' checked' : '') + (inMenu ? ' disabled' : '') + '>' +
              (dishPhoto(open, d) ? '<span class="cz-thumb cz-thumb--photo" aria-hidden="true"><img src="' + esc(dishPhoto(open, d)) + '" alt=""></span>' : thumb(CAT_ICONS[open.id] || 'traiteur', i)) +
              '<span class="cz-dish__name">' + esc(d) + '</span>' +
              '<span class="cz-dish__tag">' + (inMenu ? 'Dans votre menu' : on ? 'Ajouté' : 'Ajouter') + '</span>' +
              '<span class="opt__check" aria-hidden="true">' + T.icons.check + '</span></label>';
          }).join('') + '</div>' +
          '<p class="composer__hint cz-note">Les plats ajoutés sont précisés dans votre devis (prix selon la quantité).</p>';
      }
      return head + packMenu + catBlock;
    }
    if (state.step === 4) {
      var groups = ['Décoration', 'Service'];
      return '<h2 class="composer__title">Décoration, tyafer et service</h2>' +
        '<p class="composer__hint">Ce qui est déjà compris dans votre pack est coché d\'office.</p>' +
        groups.map(function (g) {
          var list = P.options.filter(function (o) { return o.group === g && o.active !== false; });
          if (!list.length) return '';
          return '<h3 class="composer__group">' + esc(g) + '</h3><div class="opt-list">' + list.map(optHtml).join('') + '</div>';
        }).join('');
    }
    // Récapitulatif
    var e = estimate();
    var dishList = chosenDishes();
    return '<h2 class="composer__title">Votre composition</h2>' +
      '<div class="recap">' +
        '<div class="recap__line"><span>Événement <small>' + esc(t.label) + ' · ' + state.guests + ' invités' + (state.date ? ' · ' + U.formatDate(state.date, { day: 'numeric', month: 'short', year: 'numeric' }) : '') + '</small></span><b></b></div>' +
        (state.place ? '<div class="recap__line"><span>Lieu <small>' + esc(placeLabel()) + '</small></span><b></b></div>' : '') +
        lines().map(function (l) {
          return '<div class="recap__line' + (l.included ? ' is-included' : '') + '"><span>' + esc(l.label) + (l.detail ? ' <small>' + esc(l.detail) + '</small>' : '') + '</span>' +
            '<b>' + (l.included ? 'Inclus' : l.price !== undefined ? (l.price ? 'Dès ' + U.formatDH(l.price) : 'Sur devis') : U.formatDH(round500(l.min)) + ' – ' + U.formatDH(round500(l.max))) + '</b></div>';
        }).join('') +
        (dishList.length ? '<div class="recap__line"><span>Plats ajoutés <small>' + esc(dishList.join(', ')) + '</small></span><b>Selon devis</b></div>' : '') +
        '<div class="recap__total"><span>Estimation</span><b>' + totalText(e) + '</b><small>Prix « à partir de » : le devis final dépend du nombre d\'invités et de vos choix.</small></div>' +
      '</div>' +
      '<form class="composer__form" id="composerForm" novalidate>' +
        '<div class="form__row">' +
          '<label class="field"><span>Votre nom *</span><input name="name" autocomplete="name" placeholder="Ex. Salma Bennani"></label>' +
          '<label class="field"><span>Téléphone / WhatsApp *</span><input name="phone" type="tel" autocomplete="tel" placeholder="06 XX XX XX XX"></label>' +
        '</div>' +
        '<label class="field"><span>Un mot à ajouter ?</span><textarea name="message" rows="3" placeholder="Thème, demandes particulières…"></textarea></label>' +
        '<p class="form__error" id="composerError" hidden></p>' +
        '<div class="composer__send">' +
          '<button type="submit" class="btn btn--wa"><span class="icon">' + T.icons.whatsapp + '</span> Envoyer ma composition sur WhatsApp</button>' +
        '</div>' +
        '<p class="composer__note">Votre composition s\'ouvre dans WhatsApp, prête à envoyer à ' + esc(S.owner || 'TORRAIS EVENT') + '.</p>' +
      '</form>' +
      '<div class="composer__done" id="composerDone" hidden><div class="success__icon"><span class="icon">' + T.icons.check + '</span></div>' +
        '<h3>Votre composition est prête !</h3><p>WhatsApp s\'est ouvert avec votre message : appuyez sur « Envoyer ». ' + esc(S.owner || 'Nous') + ' vous répond très vite avec votre devis.</p>' +
        '<a href="#" class="btn btn--wa" id="composerDoneWa"><span class="icon">' + T.icons.whatsapp + '</span> Ouvrir WhatsApp</a></div>';
  }

  // Menu d'un pack (« Poulet + viande aux pruneaux ») : une image coupée en deux, un plat de chaque côté
  function menuPhotos(label) {
    var plats = ((data.site.menuCats || [])[0] || {}).dishes || [];
    return norm(label).split('+').map(function (part) {
      part = part.trim();
      var d = plats.filter(function (x) { return dishInMenu(x.name, part); })[0];
      return d && d.photos && d.photos[0];
    }).filter(Boolean).slice(0, 2);
  }
  function menuThumb(label, i) {
    var ph = menuPhotos(label);
    if (ph.length === 2) return '<span class="cz-split" aria-hidden="true"><img src="' + esc(ph[0]) + '" alt=""><img src="' + esc(ph[1]) + '" alt=""><i></i></span>';
    if (ph.length === 1) return '<span class="cz-split cz-split--one" aria-hidden="true"><img src="' + esc(ph[0]) + '" alt=""></span>';
    return thumb('traiteur', i + 2);
  }
  function dishPhoto(cat, name) {
    var d = (cat.dishes || []).filter(function (x) { return x.name === name; })[0];
    return d && d.photos && d.photos[0];
  }
  function catIncluded(catId) {
    var p = currentPack();
    if (!p) return false;
    return Object.keys(FEATURE_CAT).some(function (f) { return FEATURE_CAT[f] === catId && hasFeature(p, f); });
  }
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' ').replace(/\s+/g, ' ').trim(); }
  // Un plat fait-il partie du menu choisi ? (« Pastilla poulet + viande aux pruneaux » ↔ « Pastilla au poulet », « Viande aux pruneaux & amandes »)
  function dishInMenu(dish, menuLabel) {
    var parts = norm(menuLabel).split('+').map(function (x) { return x.trim(); });
    var d = norm(dish);
    return parts.some(function (part) {
      var words = part.split(' ').filter(function (w) { return w.length > 3; });
      var pas = /^pastilla/.test(part) === /^pastilla/.test(d); // « Poulet » ≠ « Pastilla poulet »
      return pas && words.length && words.every(function (w) { return d.indexOf(w.replace(/s$/, '')) !== -1 || (w === 'poisson' && d.indexOf('fruits de mer') !== -1); });
    });
  }
  function chosenDishes() {
    return Object.keys(state.dishes).filter(function (k) { return state.dishes[k]; }).map(function (k) { return k.split(':').slice(1).join(':'); });
  }
  function placeLabel() { var x = PLACES.filter(function (p) { return p.id === state.place; })[0]; return x ? x.label : ''; }

  function optHtml(o, i) {
    var inc = included(o.id);
    var icon = o.group === 'Décoration' ? 'deco' : o.id === 'tyafer' ? 'tyafer' : 'traiteur';
    if (o.id === 'tyafer') {
      return '<div class="opt' + (state.tyafer ? ' is-on' : '') + '">' + thumb(icon, i) + '<div class="opt__text"><strong>' + esc(o.name) + '</strong><span>' + esc(o.text || '') + '</span><em>' + optPrice(o) + '</em></div>' +
        '<div class="stepper" role="group" aria-label="Nombre de tyafer"><button type="button" data-tyafer="-1" aria-label="Moins">−</button><output id="tyaferOut">' + state.tyafer + '</output><button type="button" data-tyafer="1" aria-label="Plus">+</button></div></div>';
    }
    return '<label class="opt' + (inc ? ' is-included' : state.opts[o.id] ? ' is-on' : '') + '"><input type="checkbox" data-opt="' + esc(o.id) + '"' + (inc || state.opts[o.id] ? ' checked' : '') + (inc ? ' disabled' : '') + '>' +
      thumb(icon, i) +
      '<span class="opt__text"><strong>' + esc(o.name) + '</strong><span>' + esc(o.text || '') + '</span><em>' + (inc ? 'Inclus dans votre pack' : optPrice(o)) + '</em></span>' +
      '<span class="opt__check" aria-hidden="true">' + T.icons.check + '</span></label>';
  }

  function summaryHtml() {
    var e = estimate();
    var p = currentPack();
    var t = typeOf(state.type);
    var extras = extraOptions().filter(function (o) { return !included(o.id) && selected(o); });
    var nd = chosenDishes().length;
    return '<p class="eyebrow">Votre estimation</p>' +
      '<div class="sum__total" aria-live="polite">' + totalText(e) + '</div>' +
      '<p class="sum__per">Prix indicatif · devis final gratuit</p>' +
      '<ul class="sum__list">' +
        '<li><span>Événement</span><b>' + esc(t.label) + '</b></li>' +
        '<li><span>Invités</span><b>' + state.guests + '</b></li>' +
        (state.date ? '<li><span>Date</span><b>' + U.formatDate(state.date, { day: 'numeric', month: 'short', year: 'numeric' }) + '</b></li>' : '') +
        (state.place ? '<li><span>Lieu</span><b>' + esc(placeLabel()) + '</b></li>' : '') +
        '<li><span>Pack</span><b>' + (state.pkg === 'surmesure' ? 'Sur mesure' : p ? esc(p.name) : '—') + '</b></li>' +
        (p && packMenus(p)[state.pkgMenu] ? '<li><span>Menu</span><b>' + esc(packMenus(p)[state.pkgMenu].label) + '</b></li>' : '') +
        (nd ? '<li><span>Plats ajoutés</span><b>' + nd + '</b></li>' : '') +
        (extras.length ? '<li class="sum__extras"><span>Options</span><b>' + extras.map(function (o) { return esc(o.id === 'tyafer' ? state.tyafer + ' tyafer' : o.name); }).join(', ') + '</b></li>' : '') +
      '</ul>';
  }
  function barHtml() {
    return '<div><small>Estimation</small><b>' + totalText(estimate()) + '</b></div>' +
      (state.step < STEPS.length - 1 ? '<button type="button" class="btn btn--gold btn--sm" data-next>Continuer</button>' : '');
  }
  function refreshLive() {
    $('#composerSummary').innerHTML = summaryHtml();
    $('#composerBar').innerHTML = barHtml();
  }
  function redrawPanel() { $('#composerPanel').innerHTML = stepHtml(); refreshLive(); }

  /* ---------- menu : la famille s'ouvre depuis sa carte, et s'y replie au retour (comme entre les pages) ---------- */
  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var catBusy = false;
  function box(r) { return { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }; }
  function veil(r, radius) {
    var v = document.createElement('div');
    v.className = 'cz-veil';
    v.style.left = r.left + 'px'; v.style.top = r.top + 'px'; v.style.width = r.width + 'px'; v.style.height = r.height + 'px';
    v.style.borderRadius = radius;
    document.body.appendChild(v);
    return v;
  }
  function scrollPanelTop() {
    var top = $('#composerSection').getBoundingClientRect().top + window.scrollY - 90;
    if (window.scrollY > top + 10) { if (window.TorraisMotion && window.TorraisMotion.lenis) window.TorraisMotion.lenis.scrollTo(top, { immediate: true }); window.scrollTo({ top: top, behavior: 'instant' }); }
  }
  // fait défiler la page pour que « el » arrive à l'endroit où se trouvait « rect » (aucun saut visible)
  function keepAt(el, rect) {
    var dy = el.getBoundingClientRect().top - rect.top;
    if (Math.abs(dy) < 2) return;
    var y = Math.max(0, window.scrollY + dy);
    var lenis = window.TorraisMotion && window.TorraisMotion.lenis;
    if (lenis) lenis.scrollTo(y, { immediate: true });
    window.scrollTo({ top: y, behavior: 'instant' });
  }
  function flyPhoto(src, from, to, fromR, toR, done) {
    var p = document.createElement('div');
    p.className = 'pt-photo';
    p.style.backgroundImage = 'url("' + src + '")';
    p.style.left = from.left + 'px'; p.style.top = from.top + 'px'; p.style.width = from.width + 'px'; p.style.height = from.height + 'px';
    document.body.appendChild(p);
    var a = p.animate([Object.assign(box(from), { borderRadius: fromR }), Object.assign(box(to), { borderRadius: toR })], { duration: 560, easing: 'cubic-bezier(.65, 0, .25, 1)', fill: 'forwards' });
    a.onfinish = function () { p.remove(); done(); };
  }
  function stagger(sel) {
    $$(sel, root).forEach(function (el, i) { el.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: 80 + i * 35, easing: 'ease-out', fill: 'backwards' }); });
  }
  function openCat(id, fromHistory) {
    if (catBusy || state.cat === id) return;
    var card = $('.cz-cat[data-cat="' + id + '"]', root);
    if (!fromHistory) history.pushState({ czStep: 3, czCat: id }, '');
    var img = card && card.querySelector('.cz-cat__img img');
    if (!img || REDUCE || !document.body.animate) { state.cat = id; redrawPanel(); scrollPanelTop(); stagger('.cz-dish'); return; }
    catBusy = true;
    var from = img.parentNode.getBoundingClientRect(), src = img.currentSrc || img.src;
    state.cat = id; redrawPanel();
    var target = $('.cz-cathead__img', root);
    if (target) keepAt(target, from);
    stagger('.cz-back, .cz-cathead h3, .cz-inc, .cz-dish');
    if (!target) { catBusy = false; return; }
    target.style.visibility = 'hidden';
    flyPhoto(src, from, target.getBoundingClientRect(), '12px', '12px', function () { target.style.visibility = ''; catBusy = false; });
  }
  function closeCat(fromHistory) {
    if (catBusy || !state.cat) return;
    if (!fromHistory) { history.back(); return; } // le bouton retour fera l'animation (une pression = une étape)
    var id = state.cat;
    var head = $('.cz-cathead__img', root);
    if (!head || REDUCE || !document.body.animate) { state.cat = ''; redrawPanel(); stagger('.cz-cat'); return; }
    catBusy = true;
    var from = head.getBoundingClientRect(), src = head.querySelector('img').currentSrc || head.querySelector('img').src;
    state.cat = ''; redrawPanel();
    var card = $('.cz-cat[data-cat="' + id + '"]', root);
    var target = card && card.querySelector('.cz-cat__img');
    stagger('.cz-cat');
    if (!target) { catBusy = false; return; }
    keepAt(target, from);
    target.style.visibility = 'hidden';
    flyPhoto(src, from, target.getBoundingClientRect(), '12px', '12px', function () {
      target.style.visibility = '';
      card.classList.add('pt-came-from');
      setTimeout(function () { card.classList.remove('pt-came-from'); }, 1200);
      catBusy = false;
    });
  }


  function canLeave(step) {
    var msg = '';
    if (step === 1 && !state.place) msg = 'Choisissez le lieu de votre événement.';
    if (step === 2 && !state.pkg) msg = 'Choisissez un pack (ou « Sur mesure »).';
    var err = $('#stepError');
    if (err) { err.textContent = msg; err.hidden = !msg; }
    return !msg;
  }
  function go(step, fromHistory) {
    // pour aller plus loin, chaque étape intermédiaire doit être complète (lieu, pack)
    if (step > state.step) { for (var k = state.step; k < step; k++) { if (!canLeave(k)) { if (k !== state.step) { state.step = k; render(); canLeave(k); } return; } } }
    var prev = state.step;
    state.step = Math.max(0, Math.min(STEPS.length - 1, step));
    if (state.step > state.maxStep) state.maxStep = state.step;
    if (!fromHistory && state.step !== prev) history.pushState({ czStep: state.step }, '');
    if (state.step !== 3) state.cat = '';
    // on remonte en haut du simulateur avant d'afficher l'étape (sinon le pied de page apparaît un instant)
    var top = $('#composerSection').getBoundingClientRect().top + window.scrollY - 90;
    var lenis = window.TorraisMotion && window.TorraisMotion.lenis;
    if (window.scrollY > top) { if (lenis) lenis.scrollTo(top, { immediate: true }); window.scrollTo({ top: top, behavior: 'instant' }); }
    render();
    if (!REDUCE && root.animate) $('#composerPanel').animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'ease-out' });
  }

  /* ---------- envoi ---------- */
  function compositionText() {
    var e = estimate();
    var d = chosenDishes();
    return (state.place ? '• Lieu : ' + placeLabel() + '\n' : '') +
      lines().map(function (l) { return '• ' + l.label + (l.detail ? ' (' + l.detail + ')' : ''); }).join('\n') +
      (d.length ? '\n• Plats ajoutés : ' + d.join(', ') : '') +
      '\nEstimation : ' + totalText(e).replace(/ /g, ' ');
  }
  function waText(name) {
    var t = typeOf(state.type);
    return 'Bonjour TORRAIS EVENT, j\'ai composé mon événement sur votre site.\n' +
      (name ? '• Nom : ' + name + '\n' : '') +
      '• Événement : ' + t.label + ' (' + state.guests + ' invités)\n' +
      (state.date ? '• Date : ' + U.formatDate(state.date) + '\n' : '') +
      compositionText();
  }
  function submit(form) {
    var f = form.elements;
    var name = f.name.value.trim();
    var phone = f.phone.value.trim();
    var err = $('#composerError');
    if (!name || U.digits(phone).length < 9) {
      err.textContent = !name ? 'Merci d\'indiquer votre nom.' : 'Merci de vérifier votre numéro de téléphone.';
      err.hidden = false;
      (name ? f.phone : f.name).focus();
      return;
    }
    err.hidden = true;
    var extra = f.message.value.trim();
    var url = U.waLink(S.whatsapp || S.phone, waText(name) + '\n• Téléphone : ' + phone + (extra ? '\n• Message : ' + extra : ''));
    window.open(url, '_blank', 'noopener');
    form.hidden = true;
    var done = $('#composerDone');
    done.hidden = false;
    var wa = $('#composerDoneWa');
    wa.href = url;
    wa.target = '_blank'; wa.rel = 'noopener';
    done.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------- interactions ---------- */
  root.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest('[data-next]')) { go(state.step + 1); return; }
    if (t.closest('[data-prev]')) { history.back(); return; }
    var g = t.closest('[data-goto]');
    if (g && !g.disabled) { go(+g.getAttribute('data-goto')); return; }
    var c = t.closest('[data-cat]');
    if (c) { var cid = c.getAttribute('data-cat'); if (cid) openCat(cid); else closeCat(); return; }
    var ty = t.closest('[data-tyafer]');
    if (ty) {
      state.tyafer = Math.max(0, Math.min(30, state.tyafer + (+ty.getAttribute('data-tyafer'))));
      $('#tyaferOut').textContent = state.tyafer;
      ty.closest('.opt').classList.toggle('is-on', state.tyafer > 0);
      refreshLive();
      return;
    }
  });
  root.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'type') {
      state.type = t.value;
      if (!currentPacks().some(function (p) { return p.id === state.pkg; }) && state.pkg !== 'surmesure') { state.pkg = ''; state.pkgMenu = 0; if (state.maxStep > 2) state.maxStep = 2; }
    }
    if (t.name === 'place') {
      state.place = t.value;
      // présélectionne le pack qui correspond au lieu (s'il existe)
      var match = currentPacks().filter(function (p) { return placeOfPack(p) === state.place; })[0];
      if (match && !state.pkg) state.pkg = match.id;
    }
    if (t.name === 'pkg') { state.pkg = t.value; state.pkgMenu = 0; $$('.cz-pack__pick', root).forEach(function (el) { var inp = el.closest('label').querySelector('input'); el.textContent = inp.checked ? 'Sélectionné' : 'Choisir'; }); }
    if (t.name === 'pkgMenu') state.pkgMenu = +t.value;
    if (t.id === 'dateInput') state.date = t.value;
    if (t.dataset && t.dataset.dish) {
      state.dishes[t.dataset.dish] = t.checked;
      var row = t.closest('.cz-dish');
      row.classList.toggle('is-on', t.checked);
      row.querySelector('.cz-dish__tag').textContent = t.checked ? 'Ajouté' : 'Ajouter';
    }
    if (t.dataset && t.dataset.opt) {
      state.opts[t.dataset.opt] = t.checked;
      t.closest('.opt').classList.toggle('is-on', t.checked);
    }
    var err = $('#stepError'); if (err) err.hidden = true;
    refreshLive();
  });
  root.addEventListener('input', function (e) {
    if (e.target.id === 'guestsRange') {
      state.guests = +e.target.value;
      $('#guestsOut').textContent = state.guests;
      refreshLive();
    }
  });
  root.addEventListener('submit', function (e) {
    if (e.target.id === 'composerForm') { e.preventDefault(); submit(e.target); }
  });

  // bouton retour du téléphone ou du navigateur : revient à l'étape précédente (puis quitte la page)
  history.replaceState(Object.assign({}, history.state, { czStep: 0 }), '');
  window.addEventListener('popstate', function (e) {
    var st = e.state && e.state.czStep;
    if (state.step === 3 && st === 3) {
      var want = (e.state && e.state.czCat) || '';
      if (want && want !== state.cat) openCat(want, true);
      else if (!want && state.cat) closeCat(true);
      return;
    }
    if (typeof st === 'number') { go(st, true); if (st === 3 && e.state.czCat) { state.cat = e.state.czCat; redrawPanel(); } }
  });
  render();
})();
