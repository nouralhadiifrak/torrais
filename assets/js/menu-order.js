/* TORRAIS EVENT — « Demander un menu » : on choisit seulement les plats, la liste part sur WhatsApp */
(function () {
  'use strict';

  var root = document.getElementById('menuOrder');
  if (!root) return;
  var T = window.Torrais;
  var U = T.util;
  var esc = U.esc;
  var data = T.store.load();
  var S = data.settings;
  var cats = data.site.menuCats || [];
  var qty = {}; // « famille|plat » → quantité

  function $(sel, r) { return (r || document).querySelector(sel); }
  function $$(sel, r) { return Array.prototype.slice.call((r || document).querySelectorAll(sel)); }
  function key(c, d) { return c.id + '|' + d.name; }
  function chosen() {
    var out = [];
    cats.forEach(function (c) {
      var list = (c.dishes || []).filter(function (d) { return qty[key(c, d)] > 0; });
      if (list.length) out.push({ cat: c, dishes: list });
    });
    return out;
  }
  function count() { return Object.keys(qty).filter(function (k) { return qty[k] > 0; }).length; }

  function render() {
    root.innerHTML =
      '<div class="mo">' +
        '<div class="mo__list">' + cats.map(function (c, ci) {
          return '<section class="mo-cat"><header class="mo-cat__head"><span class="mo-cat__num">' + String(ci + 1).padStart(2, '0') + '</span><h2>' + esc(c.title) + '</h2></header>' +
            '<div class="mo-dishes">' + (c.dishes || []).map(function (d) {
              var k = key(c, d), n = qty[k] || 0, ph = (d.photos || [])[0];
              return '<div class="mo-dish' + (n ? ' is-on' : '') + '" data-key="' + esc(k) + '">' +
                '<span class="mo-dish__img">' + (ph ? '<img src="' + esc(ph) + '" alt="" loading="lazy">' : '<span class="ph cf-ph tone-' + (ci % 8 + 1) + '"></span>') + '</span>' +
                '<span class="mo-dish__name">' + esc(d.name) + '</span>' +
                (n ? '<span class="mo-step"><button type="button" data-dec aria-label="Moins">−</button><output>' + n + '</output><button type="button" data-inc aria-label="Plus">+</button></span>'
                   : '<button type="button" class="mo-add" data-inc>Ajouter</button>') +
                '</div>';
            }).join('') + '</div></section>';
        }).join('') + '</div>' +
        '<aside class="mo__side" id="moSide">' + sideHtml() + '</aside>' +
      '</div>' +
      '<div class="mo__bar" id="moBar">' + barHtml() + '</div>';
  }
  function sideHtml() {
    var list = chosen();
    return '<p class="eyebrow">Votre liste</p>' +
      (list.length ? '<ul class="mo-sum">' + list.map(function (g) {
        return '<li><strong>' + esc(g.cat.title) + '</strong><span>' + g.dishes.map(function (d) { var n = qty[key(g.cat, d)]; return esc(d.name) + (n > 1 ? ' × ' + n : ''); }).join(', ') + '</span></li>';
      }).join('') + '</ul>' : '<p class="mo-empty">Ajoutez les plats qui vous font envie.</p>') +
      '<form class="mo-form" id="moForm" novalidate>' +
        '<label class="field"><span>Nombre d\'invités *</span><input name="guests" type="number" inputmode="numeric" min="5" max="2000" step="5" placeholder="Ex. 150" required></label>' +
        '<label class="field"><span>Date *</span><input name="date" type="date" min="' + U.iso(new Date()) + '" required></label>' +
        '<label class="field"><span>Votre nom *</span><input name="name" maxlength="80" autocomplete="name" placeholder="Ex. Salma Bennani" required></label>' +
        '<label class="field"><span>Téléphone *</span><input name="phone" type="tel" maxlength="20" autocomplete="tel" placeholder="06 XX XX XX XX" required></label>' +
        '<fieldset class="mo-mode"><legend>Service</legend>' +
          '<label><input type="radio" name="mode" value="Livraison" checked><span>Livraison</span></label>' +
          '<label><input type="radio" name="mode" value="Service sur place"><span>Service sur place</span></label>' +
        '</fieldset>' +
        '<label class="field"><span>Précisions</span><textarea name="note" rows="2" maxlength="1000" placeholder="Adresse, allergies, demandes particulières…"></textarea></label>' +
        '<p class="form__error" id="moError" hidden></p>' +
        '<button type="submit" class="btn btn--wa btn--block"><span class="icon">' + T.icons.whatsapp + '</span> Envoyer ma liste<span class="hide-xs"> sur WhatsApp</span></button>' +
      '</form>';
  }
  function barHtml() {
    var n = count();
    return '<div><small>Votre liste</small><b>' + (n ? n + ' plat' + (n > 1 ? 's' : '') : 'Aucun plat') + '</b></div><a href="#moSide" class="btn btn--gold btn--sm">Voir et envoyer</a>';
  }
  function refresh() {
    var f = $('#moForm');
    var keep = f ? Array.prototype.map.call(f.elements, function (el) { return el.type === 'radio' ? el.checked : el.value; }) : null;
    $('#moSide').innerHTML = sideHtml();
    $('#moBar').innerHTML = barHtml();
    if (keep) Array.prototype.forEach.call($('#moForm').elements, function (el, i) { if (el.type === 'radio') el.checked = keep[i]; else if (keep[i] != null) el.value = keep[i]; });
  }
  function drawDish(row) {
    var k = row.getAttribute('data-key'), n = qty[k] || 0;
    row.classList.toggle('is-on', n > 0);
    var ctl = row.querySelector('.mo-step, .mo-add');
    var tmp = document.createElement('span');
    tmp.innerHTML = n ? '<span class="mo-step"><button type="button" data-dec aria-label="Moins">−</button><output>' + n + '</output><button type="button" data-inc aria-label="Plus">+</button></span>'
      : '<button type="button" class="mo-add" data-inc>Ajouter</button>';
    ctl.replaceWith(tmp.firstChild);
  }

  root.addEventListener('click', function (e) {
    var row = e.target.closest('.mo-dish');
    if (!row) return;
    var k = row.getAttribute('data-key');
    if (e.target.closest('[data-inc]')) qty[k] = Math.min(20, (qty[k] || 0) + 1);
    else if (e.target.closest('[data-dec]')) qty[k] = Math.max(0, (qty[k] || 0) - 1);
    else if (!e.target.closest('.mo-step')) qty[k] = qty[k] ? 0 : 1; // toucher le plat l'ajoute ou le retire
    else return;
    drawDish(row);
    refresh();
  });
  root.addEventListener('submit', function (e) {
    if (e.target.id !== 'moForm') return;
    e.preventDefault();
    var f = e.target.elements, err = $('#moError');
    var list = chosen();
    var msg = !list.length ? 'Ajoutez au moins un plat à votre liste.' :
      !f.guests.value ? 'Indiquez le nombre d\'invités.' : !f.date.value ? 'Indiquez la date.' :
      !f.name.value.trim() ? 'Indiquez votre nom.' : U.digits(f.phone.value).length < 9 ? 'Vérifiez votre numéro de téléphone.' : '';
    if (msg) { err.textContent = msg; err.hidden = false; return; }
    err.hidden = true;
    var mode = $('input[name="mode"]:checked', e.target).value;
    var text = 'Bonjour TORRAIS EVENT, je souhaite commander un menu.\n' +
      '• Nom : ' + U.clip(f.name.value, 80) + '\n' +
      '• Téléphone : ' + U.clip(f.phone.value, 20) + '\n' +
      '• Date : ' + U.formatDate(U.clip(f.date.value, 10)) + '\n' +
      '• Invités : ' + Math.min(2000, Math.max(0, Math.round(+f.guests.value) || 0)) + '\n' +
      '• Service : ' + mode + '\n\n' +
      '*Ma liste*\n' + list.map(function (g) {
        return g.cat.title + ' :\n' + g.dishes.map(function (d) { var n = qty[key(g.cat, d)]; return '  – ' + d.name + (n > 1 ? ' × ' + n : ''); }).join('\n');
      }).join('\n') +
      (U.clip(f.note.value, 1000) ? '\n\n• Précisions : ' + U.clip(f.note.value, 1000) : '');
    window.open(U.waLink(S.whatsapp || S.phone, text), '_blank', 'noopener');
  });

  render();
})();
