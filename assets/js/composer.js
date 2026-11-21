/* TORRAIS EVENT — « Composez votre mariage » : simulateur en 5 étapes avec estimation */
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

  var TYPES = [
    { id: 'Mariage', label: 'Mariage', icon: 'traiteur' },
    { id: 'Fiançailles', label: 'Fiançailles', icon: 'deco' },
    { id: 'Henné', label: 'Henné', icon: 'tyafer' },
    { id: 'Anniversaire', label: 'Anniversaire / aqiqa', icon: 'buffet' },
    { id: "Événement d'entreprise", label: 'Entreprise', icon: 'buffet' }
  ];
  var STEPS = ['Votre fête', 'Formule', 'Menu', 'Décoration', 'Récapitulatif'];
  var UNIT_LABEL = { pers: '/ invité', table: '/ table de 10', forfait: 'forfait', unite: "l'unité" };

  // Formules proposées : celles du site + « sur mesure »
  var PACKS = data.packages.filter(function (p) { return P.packages[p.id]; }).map(function (p) {
    return { id: p.id, name: p.name, tagline: p.tagline || p.place || '', features: p.features, featured: p.featured };
  });
  if (P.packages.surmesure) PACKS.push({ id: 'surmesure', name: 'Sur mesure', tagline: 'Je compose moi-même', features: ['Repas de base : entrée, plat, fruits, thé', 'Ajoutez uniquement ce que vous voulez'] });

  var q = new URLSearchParams(window.location.search);
  var state = {
    step: 0,
    type: TYPES.some(function (t) { return t.id === q.get('type'); }) ? q.get('type') : 'Mariage',
    guests: 200,
    date: '',
    pkg: P.packages[q.get('formule')] ? q.get('formule') : (P.packages.villa ? 'villa' : PACKS[0].id),
    opts: {},
    tyafer: 0
  };

  /* ---------- calcul de l'estimation ---------- */
  function round500(n) { return Math.round(n / 500) * 500; }
  function included(id) { var pk = P.packages[state.pkg]; return !!(pk && pk.includes.indexOf(id) !== -1); }
  function qtyOf(o) {
    if (o.unit === 'pers') return state.guests;
    if (o.unit === 'table') return Math.ceil(state.guests / 10);
    if (o.unit === 'unite') return o.id === 'tyafer' ? state.tyafer : (state.opts[o.id] ? 1 : 0);
    return 1;
  }
  function selected(o) { return o.id === 'tyafer' ? state.tyafer > 0 : !!state.opts[o.id]; }
  function lines() {
    var pk = P.packages[state.pkg];
    var pack = PACKS.filter(function (p) { return p.id === state.pkg; })[0];
    var out = [{ label: 'Formule ' + (pack ? pack.name : ''), detail: state.guests + ' invités', min: pk.min * state.guests, max: pk.max * state.guests }];
    P.options.forEach(function (o) {
      if (included(o.id)) { out.push({ label: o.name, detail: 'inclus', min: 0, max: 0, included: true }); return; }
      if (!selected(o)) return;
      var n = qtyOf(o);
      var detail = o.unit === 'table' ? n + ' tables' : o.unit === 'unite' ? n + ' tyafer' : o.unit === 'pers' ? state.guests + ' invités' : '';
      out.push({ label: o.name, detail: detail, min: o.min * n, max: o.max * n });
    });
    return out;
  }
  function estimate() {
    var l = lines();
    var min = l.reduce(function (s, x) { return s + x.min; }, 0);
    var max = l.reduce(function (s, x) { return s + x.max; }, 0);
    return { min: round500(min), max: round500(max), perMin: Math.round(min / state.guests), perMax: Math.round(max / state.guests) };
  }
  function rangeText(e) { return U.formatDH(e.min) + ' – ' + U.formatDH(e.max); }
  function optPrice(o) {
    if (o.unit === 'pers') return '+ ' + o.min + '–' + o.max + ' DH ' + UNIT_LABEL.pers;
    return '+ ' + U.formatDH(o.min).replace(' DH', '') + '–' + U.formatDH(o.max) + ' ' + UNIT_LABEL[o.unit];
  }

  /* ---------- rendu ---------- */
  function render() {
    root.innerHTML =
      '<div class="composer__main">' +
        '<ol class="steps-bar">' + STEPS.map(function (s, i) {
          return '<li class="' + (i === state.step ? 'is-current' : i < state.step ? 'is-done' : '') + '"><button type="button" data-goto="' + i + '"' + (i > state.step ? ' disabled' : '') + '><span>' + (i + 1) + '</span>' + s + '</button></li>';
        }).join('') + '</ol>' +
        '<div class="composer__panel" id="composerPanel">' + stepHtml() + '</div>' +
        '<div class="composer__nav">' +
          (state.step > 0 ? '<button type="button" class="btn btn--ghost" data-prev>← Retour</button>' : '<span></span>') +
          (state.step < STEPS.length - 1 ? '<button type="button" class="btn btn--gold" data-next>Continuer →</button>' : '') +
        '</div>' +
      '</div>' +
      '<aside class="composer__summary" id="composerSummary">' + summaryHtml() + '</aside>' +
      '<div class="composer__bar" id="composerBar">' + barHtml() + '</div>';
    paint();
  }

  function stepHtml() {
    if (state.step === 0) {
      return '<h2 class="composer__title">Quel événement préparez-vous ?</h2>' +
        '<div class="choice-grid choice-grid--types">' + TYPES.map(function (t) {
          return '<label class="choice"><input type="radio" name="type" value="' + esc(t.id) + '"' + (state.type === t.id ? ' checked' : '') + '>' +
            '<span class="choice__box"><span class="choice__icon">' + T.icons[t.icon] + '</span><strong>' + esc(t.label) + '</strong></span></label>';
        }).join('') + '</div>' +
        '<div class="composer__row">' +
          '<label class="field field--guests"><span>Nombre d\'invités : <b id="guestsOut">' + state.guests + '</b></span>' +
            '<input type="range" id="guestsRange" min="20" max="600" step="10" value="' + state.guests + '" aria-label="Nombre d\'invités"></label>' +
          '<label class="field"><span>Date (si vous la connaissez)</span><input type="date" id="dateInput" min="' + U.iso(new Date()) + '" value="' + esc(state.date) + '"></label>' +
        '</div>';
    }
    if (state.step === 1) {
      return '<h2 class="composer__title">Choisissez une formule de départ</h2><p class="composer__hint">Vous pourrez ajouter des options à l\'étape suivante.</p>' +
        '<div class="choice-grid choice-grid--packs">' + PACKS.map(function (p) {
          var pr = P.packages[p.id];
          return '<label class="choice choice--pack"><input type="radio" name="pkg" value="' + esc(p.id) + '"' + (state.pkg === p.id ? ' checked' : '') + '>' +
            '<span class="choice__box">' + (p.featured ? '<em class="choice__badge">La plus demandée</em>' : '') +
            '<strong class="choice__name">' + esc(p.name) + '</strong><span class="choice__tag">' + esc(p.tagline || '') + '</span>' +
            '<span class="choice__price">≈ ' + pr.min + ' – ' + pr.max + ' DH <small>/ invité</small></span>' +
            '<ul>' + (p.features || []).slice(0, 5).map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul></span></label>';
        }).join('') + '</div>';
    }
    if (state.step === 2 || state.step === 3) {
      var groups = state.step === 2 ? ['Menu'] : ['Décoration', 'Service'];
      return '<h2 class="composer__title">' + (state.step === 2 ? 'Votre menu' : 'Décoration, tyafer et service') + '</h2>' +
        '<p class="composer__hint">Ce qui est déjà compris dans votre formule est coché d\'office.</p>' +
        groups.map(function (g) {
          var list = P.options.filter(function (o) { return o.group === g && o.active !== false; });
          if (!list.length) return '';
          return (groups.length > 1 ? '<h3 class="composer__group">' + esc(g) + '</h3>' : '') + '<div class="opt-list">' + list.map(optHtml).join('') + '</div>';
        }).join('');
    }
    // Récapitulatif
    var e = estimate();
    return '<h2 class="composer__title">Votre composition</h2>' +
      '<div class="recap">' + lines().map(function (l) {
        return '<div class="recap__line' + (l.included ? ' is-included' : '') + '"><span>' + esc(l.label) + (l.detail ? ' <small>' + esc(l.detail) + '</small>' : '') + '</span>' +
          '<b>' + (l.included ? 'Inclus' : rangeText({ min: round500(l.min), max: round500(l.max) })) + '</b></div>';
      }).join('') +
      '<div class="recap__total"><span>Estimation totale</span><b>' + rangeText(e) + '</b><small>soit environ ' + e.perMin + ' – ' + e.perMax + ' DH par invité</small></div></div>' +
      '<p class="composer__note">Estimation indicative. TORRAIS EVENT vous envoie un devis précis après avoir échangé avec vous (lieu, date, menu exact).</p>' +
      '<form class="composer__form" id="composerForm" novalidate>' +
        '<div class="form__row">' +
          '<label class="field"><span>Votre nom *</span><input name="name" autocomplete="name" placeholder="Ex. Salma Bennani"></label>' +
          '<label class="field"><span>Téléphone / WhatsApp *</span><input name="phone" type="tel" autocomplete="tel" placeholder="06 XX XX XX XX"></label>' +
        '</div>' +
        '<label class="field"><span>Un mot à ajouter ?</span><textarea name="message" rows="3" placeholder="Lieu, thème, demandes particulières…"></textarea></label>' +
        '<p class="form__error" id="composerError" hidden></p>' +
        '<div class="composer__send">' +
          '<button type="submit" class="btn btn--gold">Recevoir mon devis</button>' +
          '<button type="button" class="btn btn--wa" data-send-wa><span class="icon">' + T.icons.whatsapp + '</span> Envoyer sur WhatsApp</button>' +
        '</div>' +
      '</form>' +
      '<div class="composer__done" id="composerDone" hidden><div class="success__icon"><span class="icon">' + T.icons.check + '</span></div>' +
        '<h3>Merci, votre composition est envoyée !</h3><p>' + esc(S.owner || 'Nous') + ' vous recontacte très vite pour affiner votre devis.</p>' +
        '<a href="#" class="btn btn--wa" id="composerDoneWa"><span class="icon">' + T.icons.whatsapp + '</span> L\'envoyer aussi sur WhatsApp</a></div>';
  }

  function optHtml(o) {
    var inc = included(o.id);
    if (o.id === 'tyafer') {
      return '<div class="opt' + (state.tyafer ? ' is-on' : '') + '"><div class="opt__text"><strong>' + esc(o.name) + '</strong><span>' + esc(o.text || '') + '</span><em>' + optPrice(o) + '</em></div>' +
        '<div class="stepper" role="group" aria-label="Nombre de tyafer"><button type="button" data-tyafer="-1" aria-label="Moins">−</button><output id="tyaferOut">' + state.tyafer + '</output><button type="button" data-tyafer="1" aria-label="Plus">+</button></div></div>';
    }
    return '<label class="opt' + (inc ? ' is-included' : state.opts[o.id] ? ' is-on' : '') + '"><input type="checkbox" data-opt="' + esc(o.id) + '"' + (inc || state.opts[o.id] ? ' checked' : '') + (inc ? ' disabled' : '') + '>' +
      '<span class="opt__check" aria-hidden="true">' + T.icons.check + '</span>' +
      '<span class="opt__text"><strong>' + esc(o.name) + '</strong><span>' + esc(o.text || '') + '</span><em>' + (inc ? 'Inclus dans votre formule' : optPrice(o)) + '</em></span></label>';
  }

  function summaryHtml() {
    var e = estimate();
    var pack = PACKS.filter(function (p) { return p.id === state.pkg; })[0];
    var extras = P.options.filter(function (o) { return !included(o.id) && selected(o); });
    return '<p class="eyebrow">Votre estimation</p>' +
      '<div class="sum__total" aria-live="polite">' + rangeText(e) + '</div>' +
      '<p class="sum__per">≈ ' + e.perMin + ' – ' + e.perMax + ' DH par invité</p>' +
      '<ul class="sum__list">' +
        '<li><span>Événement</span><b>' + esc(state.type) + '</b></li>' +
        '<li><span>Invités</span><b>' + state.guests + '</b></li>' +
        (state.date ? '<li><span>Date</span><b>' + U.formatDate(state.date, { day: 'numeric', month: 'short', year: 'numeric' }) + '</b></li>' : '') +
        '<li><span>Formule</span><b>' + esc(pack ? pack.name : '') + '</b></li>' +
        (extras.length ? '<li class="sum__extras"><span>Options</span><b>' + extras.map(function (o) { return esc(o.id === 'tyafer' ? state.tyafer + ' tyafer' : o.name); }).join(', ') + '</b></li>' : '') +
      '</ul><p class="sum__note">Estimation indicative · devis final gratuit</p>';
  }
  function barHtml() {
    var e = estimate();
    return '<div><small>Estimation</small><b>' + rangeText(e) + '</b></div>' +
      (state.step < STEPS.length - 1 ? '<button type="button" class="btn btn--gold btn--sm" data-next>Continuer</button>' : '');
  }
  function refreshLive() {
    $('#composerSummary').innerHTML = summaryHtml();
    $('#composerBar').innerHTML = barHtml();
  }
  function paint() {
    $$('[data-icon]', root).forEach(function (el) { if (!el.firstChild && T.icons[el.getAttribute('data-icon')]) el.innerHTML = T.icons[el.getAttribute('data-icon')]; });
  }

  function go(step) {
    state.step = Math.max(0, Math.min(STEPS.length - 1, step));
    render();
    var top = $('#composerSection').getBoundingClientRect().top + window.scrollY - 90;
    if (window.TorraisMotion && window.TorraisMotion.lenis) window.TorraisMotion.lenis.scrollTo(top);
    else window.scrollTo({ top: top, behavior: 'smooth' });
  }

  /* ---------- envoi ---------- */
  function compositionText() {
    var e = estimate();
    return lines().map(function (l) { return '• ' + l.label + (l.detail ? ' (' + l.detail + ')' : ''); }).join('\n') +
      '\nEstimation : ' + rangeText(e).replace(/ /g, ' ');
  }
  function waText(name) {
    return 'Bonjour TORRAIS EVENT, j\'ai composé mon événement sur votre site.\n' +
      (name ? '• Nom : ' + name + '\n' : '') +
      '• Événement : ' + state.type + '\n' +
      (state.date ? '• Date : ' + U.formatDate(state.date) + '\n' : '') +
      compositionText();
  }
  function servicesFrom() {
    var sv = ['Traiteur'];
    if (['deco_tables', 'kousha', 'deco_salle'].some(function (id) { return included(id) || state.opts[id]; })) sv.push('Décoration');
    if (state.tyafer > 0) sv.push('Tyafer');
    if (['cocktail', 'desserts'].some(function (id) { return included(id) || state.opts[id]; })) sv.push('Buffet');
    return sv;
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
    var e = estimate();
    var now = new Date();
    var pack = PACKS.filter(function (p) { return p.id === state.pkg; })[0];
    var extra = f.message.value.trim();
    var req = {
      id: U.uid(), source: 'Site web',
      createdAt: U.iso(now) + 'T' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'),
      name: name, phone: phone, eventType: state.type, date: state.date, guests: state.guests,
      budget: 'Estimation ' + rangeText(e).replace(/ /g, ' '),
      services: servicesFrom(),
      message: 'Composé avec le simulateur (formule ' + (pack ? pack.name : '') + ').' + (extra ? ' ' + extra : ''),
      composition: lines().map(function (l) { return { label: l.label, detail: l.detail, included: !!l.included, min: round500(l.min), max: round500(l.max) }; }),
      estimate: { min: e.min, max: e.max },
      status: 'nouveau', notes: '', eventId: null
    };
    data = T.store.fresh();
    data.requests.unshift(req);
    T.store.save(data);
    form.hidden = true;
    var done = $('#composerDone');
    done.hidden = false;
    var wa = $('#composerDoneWa');
    wa.href = U.waLink(S.whatsapp || S.phone, waText(name) + (extra ? '\n• Message : ' + extra : ''));
    wa.target = '_blank'; wa.rel = 'noopener';
    done.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------- interactions ---------- */
  root.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest('[data-next]')) { go(state.step + 1); return; }
    if (t.closest('[data-prev]')) { go(state.step - 1); return; }
    var g = t.closest('[data-goto]');
    if (g && !g.disabled) { go(+g.getAttribute('data-goto')); return; }
    var ty = t.closest('[data-tyafer]');
    if (ty) {
      state.tyafer = Math.max(0, Math.min(30, state.tyafer + (+ty.getAttribute('data-tyafer'))));
      $('#tyaferOut').textContent = state.tyafer;
      ty.closest('.opt').classList.toggle('is-on', state.tyafer > 0);
      refreshLive();
      return;
    }
    if (t.closest('[data-send-wa]')) {
      var f = $('#composerForm').elements;
      var url = U.waLink(S.whatsapp || S.phone, waText(f.name.value.trim()) + (f.message.value.trim() ? '\n• Message : ' + f.message.value.trim() : ''));
      window.open(url, '_blank', 'noopener');
    }
  });
  root.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'type') state.type = t.value;
    if (t.name === 'pkg') state.pkg = t.value;
    if (t.id === 'dateInput') state.date = t.value;
    if (t.dataset && t.dataset.opt) {
      state.opts[t.dataset.opt] = t.checked;
      t.closest('.opt').classList.toggle('is-on', t.checked);
    }
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

  render();
})();
