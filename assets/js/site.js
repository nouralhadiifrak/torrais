/* TORRAIS EVENT — site public */
(function () {
  'use strict';

  var T = window.Torrais;
  var U = T.util;
  var esc = U.esc;
  var data = T.store.load();
  var s = data.settings;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- icônes ---------- */
  function paintIcons(root) {
    $$('[data-icon]', root).forEach(function (el) {
      var svg = T.icons[el.getAttribute('data-icon')];
      if (svg && !el.firstChild) el.innerHTML = svg;
    });
  }

  /* ---------- coordonnées ---------- */
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
    if (s.address) {
      $('#mapFrame').src = 'https://maps.google.com/maps?q=' + encodeURIComponent(s.address) + '&z=12&output=embed';
    }
  }

  /* ---------- services, formules, galerie ---------- */
  function renderServices() {
    $('#servicesGrid').innerHTML = data.services.map(function (sv) {
      return '<article class="service"><div class="service__icon">' + (T.icons[sv.icon] || T.icons.deco) + '</div>' +
        '<h3>' + esc(sv.title) + '</h3><p>' + esc(sv.text) + '</p></article>';
    }).join('');
  }

  function renderPackages() {
    $('#packagesGrid').innerHTML = data.packages.map(function (p) {
      var price = p.price ? esc(p.price) : 'Prix sur devis';
      return '<article class="package' + (p.featured ? ' package--featured' : '') + '">' +
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

  var PH_ICONS = ['traiteur', 'buffet', 'tyafer', 'deco'];
  function photoInner(g, i) {
    if (g.src) return '<img src="' + esc(g.src) + '" alt="' + esc(g.caption) + '" loading="lazy">';
    return '<span class="gallery__ph tone-' + ((g.tone || i) % 8 + 1) + '">' + T.icons[PH_ICONS[i % 4]] + '</span>';
  }
  function renderGallery() {
    $('#galleryGrid').innerHTML = data.gallery.map(function (g, i) {
      return '<button type="button" class="gallery__item" data-index="' + i + '">' + photoInner(g, i) +
        (g.caption ? '<span class="gallery__caption">' + esc(g.caption) + '</span>' : '') + '</button>';
    }).join('');
  }

  /* ---------- visionneuse ---------- */
  function initLightbox() {
    var box = $('#lightbox');
    var fig = $('#lightboxFigure');
    $('#galleryGrid').addEventListener('click', function (e) {
      var btn = e.target.closest('.gallery__item');
      if (!btn) return;
      var i = +btn.getAttribute('data-index');
      var g = data.gallery[i];
      fig.innerHTML = g.src
        ? '<img src="' + esc(g.src) + '" alt="' + esc(g.caption) + '">'
        : '<div class="lightbox__ph">' + photoInner(g, i) + '</div>';
      fig.innerHTML += '<figcaption>' + esc(g.caption || '') + '</figcaption>';
      box.hidden = false;
      document.body.style.overflow = 'hidden';
    });
    function close() { box.hidden = true; document.body.style.overflow = ''; }
    $('#lightboxClose').addEventListener('click', close);
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) close(); });
  }

  /* ---------- navigation ---------- */
  function initNav() {
    var toggle = $('#navToggle');
    var nav = $('#nav');
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
    var header = $('.header');
    function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 10); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- formulaire de devis ---------- */
  function initForm() {
    var form = $('#quoteForm');
    var success = $('#formSuccess');
    var errorBox = $('#formError');

    $('#eventTypeSelect').innerHTML = '<option value="">Choisir…</option>' +
      T.EVENT_TYPES.map(function (t) { return '<option>' + esc(t) + '</option>'; }).join('');
    $('#servicesChecks').innerHTML = T.SERVICE_NAMES.map(function (n) {
      return '<label class="check"><input type="checkbox" name="services" value="' + esc(n) + '"><span>' + esc(n) + '</span></label>';
    }).join('');
    $('#dateInput').min = U.iso(new Date());

    // Un clic sur « Demander un devis » d'une formule pré-remplit le message
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
      var required = ['name', 'phone', 'eventType', 'date', 'guests'];
      var missing = [];
      required.forEach(function (n) {
        var ok = String(f[n].value).trim() !== '';
        f[n].classList.toggle('is-invalid', !ok);
        if (!ok) missing.push(n);
      });
      var phoneOk = U.digits(f.phone.value).length >= 9;
      if (!missing.length && !phoneOk) { f.phone.classList.add('is-invalid'); }
      if (missing.length || !phoneOk) {
        errorBox.textContent = missing.length
          ? 'Merci de remplir les champs obligatoires (*).'
          : 'Merci de vérifier votre numéro de téléphone.';
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
      $('#successWa').href = U.waLink(s.whatsapp || s.phone, text);
      $('#successWa').target = '_blank';
      $('#successWa').rel = 'noopener';

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
  renderServices();
  renderPackages();
  renderGallery();
  bindSettings();
  paintIcons(document);
  initNav();
  initLightbox();
  initForm();
  $('#year').textContent = new Date().getFullYear();
})();
