/* TORRAIS EVENT — espace gérant (démo, données dans le navigateur) */
(function () {
  'use strict';

  var T = window.Torrais;
  var U = T.util;
  var esc = U.esc;
  var data = T.store.load();

  var MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  var MONTHS_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  var DAYS_LONG = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  var NOW = new Date();
  var TODAY = U.iso(NOW);

  var state = {
    view: 'overview',
    calYear: NOW.getFullYear(),
    calMonth: NOW.getMonth(),
    calMode: 'year',
    reqFilter: 'actives',
    reqSearch: '',
    evFilter: 'avenir',
    clientSearch: ''
  };

  var ICONS = {
    overview: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
    requests: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5.5 5h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    events: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><path d="M16 15h2"/></svg>',
    clients: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14a6 6 0 0 1 3.5 6"/></svg>',
    content: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v6h6"/><path d="M4.5 15a8 8 0 1 0 1.5-8.5L4 10"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4"/><path d="M16 16l4-4-4-4"/><path d="M20 12H9"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    chevL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
    chevR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/></svg>',
    pin: T.icons.pin,
    phone: T.icons.phone,
    whatsapp: T.icons.whatsapp,
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.5v.01"/></svg>'
  };

  var NAV = [
    { id: 'overview', label: 'Tableau de bord', icon: 'overview' },
    { id: 'requests', label: 'Demandes de devis', icon: 'requests' },
    { id: 'calendar', label: 'Calendrier', icon: 'calendar' },
    { id: 'events', label: 'Événements & paiements', icon: 'events' },
    { id: 'clients', label: 'Clients', icon: 'clients' },
    { id: 'content', label: 'Contenu du site', icon: 'content' }
  ];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function icon(name, cls) { return '<span class="ic' + (cls ? ' ' + cls : '') + '">' + (ICONS[name] || '') + '</span>'; }
  function sum(arr, fn) { return arr.reduce(function (s, x) { return s + (+fn(x) || 0); }, 0); }
  function byDate(a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; }
  function plural(n, one, many) { return n + ' ' + (n > 1 ? (many || one + 's') : one); }

  /* ---------- données dérivées ---------- */
  function activeEvents() { return data.events.filter(function (e) { return e.status !== 'annule'; }); }
  function paid(e) { return sum(e.payments || [], function (p) { return p.amount; }); }
  function remaining(e) { return Math.max(0, (+e.total || 0) - paid(e)); }
  function isPending(r) { return T.PENDING.indexOf(r.status) !== -1; }
  function eventsOn(date) { return activeEvents().filter(function (e) { return e.date === date; }); }
  function pendingOn(date) { return data.requests.filter(function (r) { return r.date === date && isPending(r); }); }
  function statusLabel(id) { var s = T.STATUSES.filter(function (x) { return x.id === id; })[0]; return s ? s.label : id; }
  function daysBetween(a, b) { return Math.round((U.parseISO(b) - U.parseISO(a)) / 86400000); }
  function relDays(date) {
    var n = daysBetween(TODAY, date);
    if (n === 0) return "Aujourd'hui";
    if (n === 1) return 'Demain';
    if (n === -1) return 'Hier';
    return n > 0 ? 'Dans ' + plural(n, 'jour') : 'Il y a ' + plural(-n, 'jour');
  }
  function receivedLabel(createdAt) {
    var day = createdAt.slice(0, 10);
    var n = daysBetween(day, TODAY);
    if (n === 0) return "Aujourd'hui à " + createdAt.slice(11, 16);
    if (n === 1) return 'Hier à ' + createdAt.slice(11, 16);
    return U.formatDate(day, { day: 'numeric', month: 'short' });
  }
  function weekdayDate(date) {
    return U.formatDate(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  function dateBlock(date) {
    var d = U.parseISO(date);
    return '<div class="dateblock' + (date < TODAY ? ' dateblock--past' : '') + '"><span>' + d.getDate() + '</span><small>' +
      MONTHS_SHORT[d.getMonth()] + '</small><small>' + d.getFullYear() + '</small></div>';
  }
  function statusBadge(st) { return '<span class="badge badge--' + st + '">' + esc(statusLabel(st)) + '</span>'; }
  function progress(e) {
    var t = +e.total || 0;
    var pct = t ? Math.min(100, Math.round(paid(e) / t * 100)) : 0;
    return '<div class="progress" title="' + pct + '% encaissé"><span style="width:' + pct + '%"></span></div>';
  }
  function waText(name, date) {
    return 'Bonjour ' + name + ', ici ' + data.settings.owner + ' de TORRAIS EVENT' +
      (date ? ', au sujet de votre événement du ' + U.formatDate(date) : '') + '. ';
  }
  function contactButtons(phone, name, date) {
    return '<a class="btn btn--light btn--sm" href="tel:' + esc(U.digits(phone)) + '">' + icon('phone') + ' Appeler</a>' +
      '<a class="btn btn--wa btn--sm" target="_blank" rel="noopener" href="' + esc(U.waLink(phone, waText(name, date))) + '">' + icon('whatsapp') + ' WhatsApp</a>';
  }

  /* ---------- enregistrement ---------- */
  function commit(msg) {
    var ok = T.store.save(data);
    render();
    if (!ok) toast("Impossible d'enregistrer : l'espace de stockage du navigateur est plein.", true);
    else if (msg) toast(msg);
    return ok;
  }

  var toastTimer;
  function toast(msg, isError) {
    var el = $('#toast');
    el.textContent = msg;
    el.className = 'toast is-visible' + (isError ? ' toast--error' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.className = 'toast'; }, 2800);
  }

  /* ---------- navigation ---------- */
  function renderNav() {
    var newCount = data.requests.filter(function (r) { return r.status === 'nouveau'; }).length;
    $('#sideNav').innerHTML = NAV.map(function (n) {
      var badge = n.id === 'requests' && newCount ? '<span class="nav-badge">' + newCount + '</span>' : '';
      return '<button type="button" class="sidebar__item' + (state.view === n.id ? ' is-active' : '') + '" data-action="goto" data-view="' + n.id + '">' +
        icon(n.icon) + '<span>' + n.label + '</span>' + badge + '</button>';
    }).join('');
  }

  function render() {
    renderNav();
    var nav = NAV.filter(function (n) { return n.id === state.view; })[0];
    $('#viewTitle').textContent = nav ? nav.label : '';
    var views = { overview: viewOverview, requests: viewRequests, calendar: viewCalendar, events: viewEvents, clients: viewClients, content: viewContent };
    $('#view').innerHTML = views[state.view]();
    if (state.view === 'requests') renderRequestList();
    if (state.view === 'clients') renderClientList();
  }

  function go(view) {
    state.view = view;
    document.body.classList.remove('nav-open');
    render();
    window.scrollTo(0, 0);
  }

  /* =========================================================
     TABLEAU DE BORD
     ========================================================= */
  function viewOverview() {
    var ym = TODAY.slice(0, 7);
    var year = NOW.getFullYear();
    var newReqs = data.requests.filter(function (r) { return r.status === 'nouveau'; });
    var pendingReqs = data.requests.filter(isPending);
    var monthEvents = activeEvents().filter(function (e) { return e.date.slice(0, 7) === ym; });
    var upcoming = activeEvents().filter(function (e) { return e.date >= TODAY; }).sort(byDate);
    var due = sum(upcoming, remaining);
    var yearEvents = activeEvents().filter(function (e) { return +e.date.slice(0, 4) === year; });

    var perMonth = MONTHS.map(function (m, i) {
      var list = yearEvents.filter(function (e) { return +e.date.slice(5, 7) === i + 1; });
      return { label: m.slice(0, 3), count: list.length, revenue: sum(list, function (e) { return e.total; }) };
    });
    var maxCount = Math.max.apply(null, perMonth.map(function (p) { return p.count; }).concat([1]));

    var hello = NOW.getHours() < 18 ? 'Bonjour' : 'Bonsoir';

    return '' +
      '<div class="welcome"><div><h2>' + hello + ' ' + esc(data.settings.owner) + '</h2><p>' + esc(weekdayDate(TODAY)) + '</p></div>' +
      '<button class="btn btn--gold" data-action="new-event">' + icon('plus') + ' Nouvel événement</button></div>' +

      '<div class="kpis">' +
        kpi('Nouvelles demandes', newReqs.length, plural(pendingReqs.length, 'demande') + ' en cours', 'requests', newReqs.length ? 'kpi--alert' : '') +
        kpi('Événements ce mois-ci', monthEvents.length, MONTHS[NOW.getMonth()] + ' ' + year, 'calendar') +
        kpi('Chiffre du mois', U.formatDH(sum(monthEvents, function (e) { return e.total; })), 'Événements confirmés', 'events') +
        kpi('Reste à encaisser', U.formatDH(due), 'Sur ' + plural(upcoming.length, 'événement') + ' à venir', 'events') +
      '</div>' +

      '<div class="grid-2">' +
        '<section class="card"><header class="card__head"><h3>Prochains événements</h3><button class="link" data-action="goto" data-view="calendar">Voir le calendrier →</button></header>' +
          (upcoming.length ? '<ul class="rows">' + upcoming.slice(0, 6).map(eventRow).join('') + '</ul>' : empty('Aucun événement à venir.')) +
        '</section>' +
        '<section class="card"><header class="card__head"><h3>Demandes à traiter</h3><button class="link" data-action="goto" data-view="requests">Tout voir →</button></header>' +
          (pendingReqs.length ? '<ul class="rows">' + pendingReqs.slice(0, 6).map(requestRow).join('') + '</ul>' : empty('Aucune demande en attente.')) +
        '</section>' +
      '</div>' +

      '<section class="card"><header class="card__head"><h3>Événements confirmés en ' + year + '</h3>' +
        '<span class="muted">' + plural(yearEvents.length, 'événement') + ' · ' + U.formatDH(sum(yearEvents, function (e) { return e.total; })) + '</span></header>' +
        '<div class="bars">' + perMonth.map(function (p, i) {
          var h = Math.round(p.count / maxCount * 100);
          var current = i === NOW.getMonth();
          return '<button class="bars__col' + (current ? ' is-current' : '') + '" data-action="cal-month" data-month="' + i + '" data-year="' + year + '" title="' + p.count + ' événement(s) · ' + U.formatDH(p.revenue) + '">' +
            '<span class="bars__val">' + (p.count || '') + '</span><span class="bars__bar" style="height:' + Math.max(h, p.count ? 8 : 2) + '%"></span><span class="bars__label">' + p.label + '</span></button>';
        }).join('') + '</div>' +
      '</section>';
  }

  function kpi(label, value, sub, view, cls) {
    return '<button class="kpi ' + (cls || '') + '" data-action="goto" data-view="' + view + '"><span class="kpi__label">' + label + '</span>' +
      '<strong class="kpi__value">' + value + '</strong><span class="kpi__sub">' + esc(sub) + '</span></button>';
  }
  function empty(msg) { return '<p class="empty">' + msg + '</p>'; }

  function eventRow(e) {
    var rest = remaining(e);
    return '<li><button class="row" data-action="open-event" data-id="' + e.id + '">' + dateBlock(e.date) +
      '<div class="row__main"><strong>' + esc(e.clientName) + '</strong><span>' + esc(e.eventType) + ' · ' + esc(e.guests) + ' invités · ' + esc(e.venue || '') + '</span>' +
      '<span class="row__rel">' + relDays(e.date) + '</span></div>' +
      '<div class="row__side">' + (rest ? '<span class="amount amount--due">' + U.formatDH(rest) + '</span><small>reste à payer</small>' : '<span class="badge badge--paid">Payé</span>') + '</div></button></li>';
  }

  function conflictFlag(r) {
    if (!r.date || !isPending(r)) return '';
    var n = eventsOn(r.date).length;
    return n ? '<span class="flag" title="Il y a déjà ' + plural(n, 'événement confirmé', 'événements confirmés') + ' ce jour-là">' + icon('alert') + ' Date déjà prise</span>' : '';
  }

  function requestRow(r) {
    return '<li><button class="row" data-action="open-req" data-id="' + r.id + '">' +
      '<div class="avatar">' + esc((r.name || '?').charAt(0).toUpperCase()) + '</div>' +
      '<div class="row__main"><strong>' + esc(r.name) + '</strong><span>' + esc(r.eventType) + ' · ' + U.formatDate(r.date, { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' + esc(r.guests) + ' invités</span>' +
      '<span class="row__rel">Reçue ' + receivedLabel(r.createdAt).toLowerCase() + ' ' + conflictFlag(r) + '</span></div>' +
      '<div class="row__side">' + statusBadge(r.status) + '</div></button></li>';
  }

  /* =========================================================
     DEMANDES
     ========================================================= */
  function viewRequests() {
    var filters = [{ id: 'actives', label: 'En cours' }].concat(T.STATUSES).concat([{ id: 'toutes', label: 'Toutes' }]);
    return '<div class="toolbar">' +
      '<div class="chips">' + filters.map(function (f) {
        var n = countRequests(f.id);
        return '<button class="chip' + (state.reqFilter === f.id ? ' is-active' : '') + '" data-action="req-filter" data-filter="' + f.id + '">' + f.label + ' <b>' + n + '</b></button>';
      }).join('') + '</div>' +
      '<input class="search" type="search" id="reqSearch" placeholder="Rechercher un nom, un téléphone…" value="' + esc(state.reqSearch) + '">' +
      '</div><section class="card card--flush"><ul class="rows rows--big" id="reqList"></ul></section>';
  }
  function filterRequests(id) {
    return data.requests.filter(function (r) {
      if (id === 'actives') return isPending(r);
      if (id === 'toutes') return true;
      return r.status === id;
    });
  }
  function countRequests(id) { return filterRequests(id).length; }
  function renderRequestList() {
    var q = state.reqSearch.trim().toLowerCase();
    var qd = U.digits(q);
    var list = filterRequests(state.reqFilter).filter(function (r) {
      if (!q) return true;
      return (r.name || '').toLowerCase().indexOf(q) !== -1 || (qd && U.digits(r.phone).indexOf(qd) !== -1) || (r.eventType || '').toLowerCase().indexOf(q) !== -1;
    });
    $('#reqList').innerHTML = list.length ? list.map(requestRow).join('') : '<li>' + empty('Aucune demande ici.') + '</li>';
  }

  function openRequest(id) {
    var r = data.requests.filter(function (x) { return x.id === id; })[0];
    if (!r) return;
    var linked = r.eventId && data.events.filter(function (e) { return e.id === r.eventId; })[0];
    openSheet(
      '<header class="sheet__head"><div><p class="sheet__eyebrow">Demande de devis · reçue ' + receivedLabel(r.createdAt).toLowerCase() + '</p><h2>' + esc(r.name) + '</h2></div>' + closeBtn() + '</header>' +
      '<div class="sheet__body">' +
        '<div class="actions">' + contactButtons(r.phone, r.name, r.date) + '</div>' +
        '<dl class="info">' +
          info('Téléphone', U.formatPhone(r.phone)) +
          info('Événement', r.eventType) +
          info('Date', U.formatDate(r.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ' <small>(' + relDays(r.date).toLowerCase() + ')</small>', true) +
          info('Invités', r.guests) +
          info('Budget', r.budget || '—') +
          info('Services', (r.services || []).join(', ') || '—') +
        '</dl>' +
        (r.message ? '<div class="quote">« ' + esc(r.message) + ' »</div>' : '') +
        '<h4 class="sub">Disponibilité de la date</h4>' + availability(r.date, null, r.id) +
        '<h4 class="sub">Suivi</h4>' +
        '<label class="field"><span>Statut</span><select id="reqStatus" data-id="' + r.id + '">' +
          T.STATUSES.map(function (s) { return '<option value="' + s.id + '"' + (s.id === r.status ? ' selected' : '') + '>' + s.label + '</option>'; }).join('') +
        '</select></label>' +
        '<label class="field"><span>Notes privées</span><textarea id="reqNotes" rows="3" placeholder="Ex. rappeler lundi, veut un menu poisson…">' + esc(r.notes) + '</textarea></label>' +
        '<button class="btn btn--light btn--sm" data-action="req-save-notes" data-id="' + r.id + '">Enregistrer les notes</button>' +
      '</div>' +
      '<footer class="sheet__foot">' +
        '<button class="btn btn--text btn--danger" data-action="req-delete" data-id="' + r.id + '">' + icon('trash') + ' Supprimer</button>' +
        (linked
          ? '<button class="btn btn--gold" data-action="open-event" data-id="' + linked.id + '">Voir l\'événement</button>'
          : '<button class="btn btn--gold" data-action="req-convert" data-id="' + r.id + '">Confirmer & créer l\'événement</button>') +
      '</footer>'
    );
  }

  function info(label, value, raw) {
    return '<div><dt>' + label + '</dt><dd>' + (raw ? value : esc(value)) + '</dd></div>';
  }

  function availability(date, excludeEventId, excludeReqId) {
    if (!date) return '';
    var evs = eventsOn(date).filter(function (e) { return e.id !== excludeEventId; });
    var pend = pendingOn(date).filter(function (r) { return r.id !== excludeReqId; });
    if (!evs.length && !pend.length) return '<div class="avail avail--free">' + T.icons.check + '<div><strong>Date libre</strong><span>Aucun événement ni autre demande ce jour-là.</span></div></div>';
    var html = '<div class="avail ' + (evs.length ? 'avail--busy' : 'avail--pending') + '">' + ICONS.alert + '<div>';
    if (evs.length) {
      html += '<strong>' + plural(evs.length, 'événement confirmé', 'événements confirmés') + ' ce jour-là</strong><ul>' +
        evs.map(function (e) { return '<li>' + esc(e.clientName) + ' — ' + esc(e.eventType) + ', ' + esc(e.guests) + ' invités</li>'; }).join('') + '</ul>';
    }
    if (pend.length) {
      html += '<strong>' + plural(pend.length, 'autre demande', 'autres demandes') + ' en attente</strong><ul>' +
        pend.map(function (r) { return '<li>' + esc(r.name) + ' — ' + esc(r.eventType) + ' (' + esc(statusLabel(r.status).toLowerCase()) + ')</li>'; }).join('') + '</ul>';
    }
    return html + '</div></div>';
  }

  /* =========================================================
     CALENDRIER
     ========================================================= */
  function dayMaps() {
    var ev = {}, pe = {};
    activeEvents().forEach(function (e) { ev[e.date] = (ev[e.date] || 0) + 1; });
    data.requests.forEach(function (r) { if (isPending(r) && r.date) pe[r.date] = (pe[r.date] || 0) + 1; });
    return { ev: ev, pe: pe };
  }

  function viewCalendar() {
    var title = state.calMode === 'month' ? MONTHS[state.calMonth] + ' ' + state.calYear : String(state.calYear);
    var modes = [{ id: 'year', label: 'Année' }, { id: 'month', label: 'Mois' }, { id: 'list', label: 'Liste' }];
    var body = state.calMode === 'year' ? calYear() : state.calMode === 'month' ? calMonth() : calList();
    return '<div class="cal-toolbar">' +
        '<div class="cal-nav"><button class="icon-btn" data-action="cal-prev" aria-label="Précédent">' + ICONS.chevL + '</button>' +
        '<h2>' + title + '</h2><button class="icon-btn" data-action="cal-next" aria-label="Suivant">' + ICONS.chevR + '</button>' +
        '<button class="btn btn--light btn--sm" data-action="cal-today">Aujourd\'hui</button></div>' +
        '<div class="segmented">' + modes.map(function (m) {
          return '<button class="' + (state.calMode === m.id ? 'is-active' : '') + '" data-action="cal-mode" data-mode="' + m.id + '">' + m.label + '</button>';
        }).join('') + '</div>' +
      '</div>' +
      '<div class="legend"><span><i class="lg lg--event"></i>Événement confirmé</span><span><i class="lg lg--pending"></i>Demande en attente</span>' +
        '<span><i class="lg lg--today"></i>Aujourd\'hui</span><span><i class="lg lg--count">2</i>Plusieurs le même jour</span></div>' +
      body;
  }

  function calYear() {
    var y = state.calYear;
    var maps = dayMaps();
    var html = '<div class="year">';
    for (var m = 0; m < 12; m++) {
      var first = new Date(y, m, 1);
      var offset = (first.getDay() + 6) % 7;
      var daysIn = new Date(y, m + 1, 0).getDate();
      var monthEvents = activeEvents().filter(function (e) { return e.date.slice(0, 7) === y + '-' + String(m + 1).padStart(2, '0'); });
      var cells = '';
      for (var b = 0; b < offset; b++) cells += '<span class="d d--blank"></span>';
      for (var d = 1; d <= daysIn; d++) {
        var date = U.iso(new Date(y, m, d));
        var ev = maps.ev[date] || 0;
        var pe = maps.pe[date] || 0;
        var total = ev + pe;
        var cls = 'd' + (ev ? ' d--event' : pe ? ' d--pending' : '') + (date === TODAY ? ' d--today' : '') + (date < TODAY ? ' d--past' : '');
        var title = U.formatDate(date) + (ev ? ' — ' + plural(ev, 'événement') : '') + (pe ? ' — ' + plural(pe, 'demande') : '');
        cells += '<button class="' + cls + '" data-action="open-day" data-date="' + date + '" title="' + esc(title) + '">' + d +
          (total > 1 ? '<i class="d__count">' + total + '</i>' : '') + '</button>';
      }
      html += '<section class="mini' + (y === NOW.getFullYear() && m === NOW.getMonth() ? ' mini--current' : '') + '">' +
        '<header><button class="link" data-action="cal-month" data-month="' + m + '" data-year="' + y + '">' + MONTHS[m] + '</button></header>' +
        '<div class="mini__grid">' + DAYS.map(function (x) { return '<span class="d d--head">' + x + '</span>'; }).join('') + cells + '</div>' +
        '<footer>' + (monthEvents.length ? '<strong>' + plural(monthEvents.length, 'événement') + '</strong> · ' + U.formatDH(sum(monthEvents, function (e) { return e.total; })) : '<span class="muted">Aucun événement</span>') + '</footer>' +
        '</section>';
    }
    return html + '</div>';
  }

  function calMonth() {
    var y = state.calYear, m = state.calMonth;
    var first = new Date(y, m, 1);
    var offset = (first.getDay() + 6) % 7;
    var daysIn = new Date(y, m + 1, 0).getDate();
    var html = '<div class="month">' + DAYS_LONG.map(function (x) { return '<div class="month__head">' + x + '</div>'; }).join('');
    for (var b = 0; b < offset; b++) html += '<div class="month__cell month__cell--blank"></div>';
    for (var d = 1; d <= daysIn; d++) {
      var date = U.iso(new Date(y, m, d));
      var evs = eventsOn(date);
      var pend = pendingOn(date);
      var items = evs.map(function (e) { return '<span class="pill pill--event">' + esc(e.eventType) + ' · ' + esc(e.clientName) + '</span>'; })
        .concat(pend.map(function (r) { return '<span class="pill pill--pending">Demande · ' + esc(r.name) + '</span>'; }));
      var more = items.length > 3 ? '<span class="pill pill--more">+' + (items.length - 3) + '</span>' : '';
      html += '<button class="month__cell' + (date === TODAY ? ' is-today' : '') + (date < TODAY ? ' is-past' : '') + (evs.length ? ' has-event' : '') + '" data-action="open-day" data-date="' + date + '">' +
        '<span class="month__num">' + d + '</span>' + items.slice(0, 3).join('') + more + '</button>';
    }
    return html + '</div>';
  }

  function calList() {
    var y = state.calYear;
    var list = activeEvents().filter(function (e) { return +e.date.slice(0, 4) === y; }).sort(byDate);
    if (!list.length) return '<section class="card">' + empty('Aucun événement en ' + y + '.') + '</section>';
    var html = '';
    var current = -1;
    list.forEach(function (e) {
      var m = +e.date.slice(5, 7) - 1;
      if (m !== current) {
        if (current !== -1) html += '</ul></section>';
        var monthList = list.filter(function (x) { return +x.date.slice(5, 7) - 1 === m; });
        html += '<section class="card"><header class="card__head"><h3>' + MONTHS[m] + ' ' + y + '</h3><span class="muted">' +
          plural(monthList.length, 'événement') + ' · ' + U.formatDH(sum(monthList, function (x) { return x.total; })) + '</span></header><ul class="rows">';
        current = m;
      }
      html += eventRow(e);
    });
    return html + '</ul></section>';
  }

  function openDay(date) {
    var evs = eventsOn(date);
    var pend = pendingOn(date);
    openSheet(
      '<header class="sheet__head"><div><p class="sheet__eyebrow">' + relDays(date) + '</p><h2>' + esc(weekdayDate(date)) + '</h2></div>' + closeBtn() + '</header>' +
      '<div class="sheet__body">' +
        '<h4 class="sub">Événements confirmés (' + evs.length + ')</h4>' +
        (evs.length ? '<ul class="rows">' + evs.map(eventRow).join('') + '</ul>' : empty('Aucun événement confirmé ce jour-là.')) +
        '<h4 class="sub">Demandes en attente (' + pend.length + ')</h4>' +
        (pend.length ? '<ul class="rows">' + pend.map(requestRow).join('') + '</ul>' : empty('Aucune demande en attente pour cette date.')) +
      '</div>' +
      '<footer class="sheet__foot"><span></span><button class="btn btn--gold" data-action="new-event" data-date="' + date + '">' + icon('plus') + ' Ajouter un événement</button></footer>'
    );
  }

  /* =========================================================
     ÉVÉNEMENTS & PAIEMENTS
     ========================================================= */
  function viewEvents() {
    var year = NOW.getFullYear();
    var yearEvents = activeEvents().filter(function (e) { return +e.date.slice(0, 4) === year; });
    var upcoming = activeEvents().filter(function (e) { return e.date >= TODAY; });
    var filters = [{ id: 'avenir', label: 'À venir' }, { id: 'impaye', label: 'Reste à payer' }, { id: 'passes', label: 'Passés' }, { id: 'tous', label: 'Tous' }];
    var list = activeEvents().filter(function (e) {
      if (state.evFilter === 'avenir') return e.date >= TODAY;
      if (state.evFilter === 'passes') return e.date < TODAY;
      if (state.evFilter === 'impaye') return remaining(e) > 0;
      return true;
    }).sort(byDate);
    if (state.evFilter === 'passes') list.reverse();

    return '<div class="kpis kpis--3">' +
        '<div class="kpi kpi--static"><span class="kpi__label">Chiffre d\'affaires ' + year + '</span><strong class="kpi__value">' + U.formatDH(sum(yearEvents, function (e) { return e.total; })) + '</strong><span class="kpi__sub">' + plural(yearEvents.length, 'événement') + ' confirmés</span></div>' +
        '<div class="kpi kpi--static"><span class="kpi__label">Encaissé ' + year + '</span><strong class="kpi__value">' + U.formatDH(sum(yearEvents, paid)) + '</strong><span class="kpi__sub">Acomptes et soldes reçus</span></div>' +
        '<div class="kpi kpi--static"><span class="kpi__label">Reste à encaisser</span><strong class="kpi__value">' + U.formatDH(sum(upcoming, remaining)) + '</strong><span class="kpi__sub">Événements à venir</span></div>' +
      '</div>' +
      '<div class="toolbar"><div class="chips">' + filters.map(function (f) {
        return '<button class="chip' + (state.evFilter === f.id ? ' is-active' : '') + '" data-action="ev-filter" data-filter="' + f.id + '">' + f.label + '</button>';
      }).join('') + '</div><button class="btn btn--gold btn--sm" data-action="new-event">' + icon('plus') + ' Nouvel événement</button></div>' +
      '<section class="card card--flush"><ul class="rows rows--big">' + (list.length ? list.map(eventMoneyRow).join('') : '<li>' + empty('Aucun événement.') + '</li>') + '</ul></section>';
  }

  function eventMoneyRow(e) {
    return '<li><button class="row" data-action="open-event" data-id="' + e.id + '">' + dateBlock(e.date) +
      '<div class="row__main"><strong>' + esc(e.clientName) + '</strong><span>' + esc(e.eventType) + ' · ' + esc(e.package || 'Sur mesure') + ' · ' + esc(e.guests) + ' invités</span>' +
      '<span class="row__rel">' + icon('pin', 'ic--xs') + ' ' + esc(e.venue || '—') + '</span></div>' +
      '<div class="row__money"><div class="row__amounts"><span>' + U.formatDH(paid(e)) + '</span><small>/ ' + U.formatDH(e.total) + '</small></div>' + progress(e) +
      (remaining(e) ? '<small class="due">Reste ' + U.formatDH(remaining(e)) + '</small>' : '<small class="ok">Payé en totalité</small>') + '</div></button></li>';
  }

  var draft = null;

  function openEventForm(id, prefill) {
    var existing = id && data.events.filter(function (e) { return e.id === id; })[0];
    draft = existing ? JSON.parse(JSON.stringify(existing)) : Object.assign({
      id: null, clientName: '', phone: '', eventType: 'Mariage', date: '', venue: '', guests: '', package: '', total: '',
      status: 'confirme', notes: '', payments: [], createdAt: TODAY
    }, prefill || {});
    var pkgOptions = data.packages.map(function (p) { return p.name; }).concat(['Buffet cocktail', 'Tyafer + décoration', 'Sur mesure']);
    if (draft.package && pkgOptions.indexOf(draft.package) === -1) pkgOptions.push(draft.package);

    openSheet(
      '<header class="sheet__head"><div><p class="sheet__eyebrow">' + (existing ? 'Événement confirmé' : 'Nouvel événement') + '</p><h2>' + (existing ? esc(existing.clientName) : 'Ajouter un événement') + '</h2></div>' + closeBtn() + '</header>' +
      '<form class="sheet__body" id="eventForm" novalidate>' +
        (existing ? '<div class="actions">' + contactButtons(existing.phone, existing.clientName, existing.date) + '</div>' : '') +
        '<div class="form-grid">' +
          field('Client *', '<input name="clientName" required value="' + esc(draft.clientName) + '" placeholder="Ex. Famille Alaoui">') +
          field('Téléphone', '<input name="phone" type="tel" value="' + esc(draft.phone) + '" placeholder="06 XX XX XX XX">') +
          field('Type d\'événement', '<select name="eventType">' + T.EVENT_TYPES.map(function (t) { return '<option' + (t === draft.eventType ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select>') +
          field('Date *', '<input name="date" type="date" required value="' + esc(draft.date) + '">') +
          field('Lieu', '<input name="venue" value="' + esc(draft.venue) + '" placeholder="Salle, adresse…">', 'span-2') +
          field('Invités', '<input name="guests" type="number" min="0" step="10" value="' + esc(draft.guests) + '">') +
          field('Formule', '<select name="package"><option value="">—</option>' + pkgOptions.map(function (p) { return '<option' + (p === draft.package ? ' selected' : '') + '>' + esc(p) + '</option>'; }).join('') + '</select>') +
          field('Prix total (DH) *', '<input name="total" type="number" min="0" step="500" value="' + esc(draft.total) + '">') +
          field('Statut', '<select name="status"><option value="confirme"' + (draft.status !== 'annule' ? ' selected' : '') + '>Confirmé</option><option value="annule"' + (draft.status === 'annule' ? ' selected' : '') + '>Annulé</option></select>') +
          field('Notes', '<textarea name="notes" rows="3" placeholder="Menu, horaires, demandes particulières…">' + esc(draft.notes) + '</textarea>', 'span-2') +
        '</div>' +
        '<div id="eventAvail"></div>' +
        '<h4 class="sub">Paiements</h4>' +
        '<div id="paymentsBox"></div>' +
      '</form>' +
      '<footer class="sheet__foot">' +
        (existing ? '<button class="btn btn--text btn--danger" data-action="ev-delete" data-id="' + existing.id + '">' + icon('trash') + ' Supprimer</button>' : '<span></span>') +
        '<button class="btn btn--gold" data-action="ev-save">Enregistrer</button>' +
      '</footer>'
    );
    renderPayments();
    renderEventAvail();
    var form = $('#eventForm');
    form.elements.date.addEventListener('change', renderEventAvail);
    form.elements.total.addEventListener('input', renderPayments);
    form.addEventListener('submit', function (e) { e.preventDefault(); saveEvent(); });
  }

  function field(label, control, cls) {
    return '<label class="field' + (cls ? ' ' + cls : '') + '"><span>' + label + '</span>' + control + '</label>';
  }

  function renderEventAvail() {
    var form = $('#eventForm');
    if (!form) return;
    var date = form.elements.date.value;
    $('#eventAvail').innerHTML = date ? '<h4 class="sub">Disponibilité</h4>' + availability(date, draft.id, null) : '';
  }

  function renderPayments() {
    var form = $('#eventForm');
    var total = form ? +form.elements.total.value || 0 : +draft.total || 0;
    var p = sum(draft.payments, function (x) { return x.amount; });
    var pct = total ? Math.min(100, Math.round(p / total * 100)) : 0;
    $('#paymentsBox').innerHTML =
      '<div class="pay-summary"><div><small>Encaissé</small><strong>' + U.formatDH(p) + '</strong></div>' +
      '<div><small>Reste</small><strong class="' + (total - p > 0 ? 'due' : 'ok') + '">' + U.formatDH(Math.max(0, total - p)) + '</strong></div>' +
      '<div><small>Total</small><strong>' + U.formatDH(total) + '</strong></div></div>' +
      '<div class="progress progress--lg"><span style="width:' + pct + '%"></span></div>' +
      (draft.payments.length ? '<ul class="payments">' + draft.payments.slice().sort(byDate).map(function (x) {
        return '<li><span>' + U.formatDate(x.date, { day: 'numeric', month: 'short', year: 'numeric' }) + '</span><span>' + esc(x.note || '') + '</span><strong>' + U.formatDH(x.amount) + '</strong>' +
          '<button type="button" class="icon-btn icon-btn--sm" data-action="ev-del-payment" data-id="' + x.id + '" aria-label="Supprimer ce paiement">' + ICONS.close + '</button></li>';
      }).join('') + '</ul>' : '<p class="empty empty--sm">Aucun paiement enregistré.</p>') +
      '<div class="pay-add">' +
        '<input type="number" id="payAmount" min="0" step="500" placeholder="Montant (DH)">' +
        '<input type="date" id="payDate" value="' + TODAY + '">' +
        '<select id="payNote"><option>Acompte</option><option>Avance</option><option>Solde</option></select>' +
        '<button type="button" class="btn btn--light btn--sm" data-action="ev-add-payment">' + icon('plus') + ' Ajouter</button>' +
      '</div>';
  }

  function saveEvent() {
    var f = $('#eventForm').elements;
    var clientName = f.clientName.value.trim();
    var date = f.date.value;
    if (!clientName || !date) {
      toast('Merci d\'indiquer au moins le client et la date.', true);
      (clientName ? f.date : f.clientName).focus();
      return;
    }
    Object.assign(draft, {
      clientName: clientName, phone: f.phone.value.trim(), eventType: f.eventType.value, date: date,
      venue: f.venue.value.trim(), guests: +f.guests.value || 0, package: f.package.value,
      total: +f.total.value || 0, status: f.status.value, notes: f.notes.value.trim()
    });
    var isNew = !draft.id;
    if (isNew) {
      draft.id = U.uid();
      data.events.push(draft);
    } else {
      data.events = data.events.map(function (e) { return e.id === draft.id ? draft : e; });
    }
    if (draft.fromRequest) {
      var req = data.requests.filter(function (r) { return r.id === draft.fromRequest; })[0];
      if (req) { req.status = 'confirme'; req.eventId = draft.id; }
      delete draft.fromRequest;
    }
    closeSheet();
    if (commit(isNew ? 'Événement ajouté au calendrier.' : 'Événement enregistré.')) {
      if (isNew) { state.calYear = +date.slice(0, 4); state.calMonth = +date.slice(5, 7) - 1; }
    }
  }

  /* =========================================================
     CLIENTS
     ========================================================= */
  function buildClients() {
    var map = {};
    function get(phone, name) {
      var key = U.digits(phone) || ('nom:' + (name || '').toLowerCase());
      if (!map[key]) map[key] = { key: key, name: name, phone: phone, events: [], requests: [] };
      return map[key];
    }
    data.events.forEach(function (e) { var c = get(e.phone, e.clientName); c.events.push(e); c.name = e.clientName || c.name; });
    data.requests.forEach(function (r) { if (!r.eventId) { var c = get(r.phone, r.name); c.requests.push(r); if (!c.name) c.name = r.name; } });
    return Object.keys(map).map(function (k) {
      var c = map[k];
      var act = c.events.filter(function (e) { return e.status !== 'annule'; });
      c.total = sum(act, function (e) { return e.total; });
      c.next = act.filter(function (e) { return e.date >= TODAY; }).sort(byDate)[0];
      c.last = act.filter(function (e) { return e.date < TODAY; }).sort(byDate).pop();
      c.sortKey = (c.next ? '0' + c.next.date : c.last ? '1' + (99999999 - +c.last.date.replace(/-/g, '')) : '2');
      return c;
    }).sort(function (a, b) { return a.sortKey < b.sortKey ? -1 : 1; });
  }

  function viewClients() {
    var clients = buildClients();
    return '<div class="toolbar"><p class="muted">' + plural(clients.length, 'client') + ' · créés automatiquement à partir des demandes et des événements</p>' +
      '<input class="search" type="search" id="clientSearch" placeholder="Rechercher un client…" value="' + esc(state.clientSearch) + '"></div>' +
      '<div class="clients" id="clientList"></div>';
  }

  function renderClientList() {
    var q = state.clientSearch.trim().toLowerCase();
    var qd = U.digits(q);
    var list = buildClients().filter(function (c) {
      return !q || (c.name || '').toLowerCase().indexOf(q) !== -1 || (qd && U.digits(c.phone).indexOf(qd) !== -1);
    });
    $('#clientList').innerHTML = list.length ? list.map(function (c) {
      var status = c.next ? '<span class="badge badge--confirme">Prochain : ' + U.formatDate(c.next.date, { day: 'numeric', month: 'short', year: 'numeric' }) + '</span>'
        : c.requests.some(isPending) ? '<span class="badge badge--nouveau">Demande en cours</span>'
        : c.last ? '<span class="badge badge--muted">Dernier : ' + U.formatDate(c.last.date, { month: 'short', year: 'numeric' }) + '</span>' : '';
      return '<article class="client"><button class="client__main" data-action="open-client" data-key="' + esc(c.key) + '">' +
        '<div class="avatar avatar--lg">' + esc((c.name || '?').charAt(0).toUpperCase()) + '</div>' +
        '<div><strong>' + esc(c.name) + '</strong><span>' + esc(U.formatPhone(c.phone)) + '</span>' + status + '</div></button>' +
        '<div class="client__stats"><div><small>Événements</small><strong>' + c.events.filter(function (e) { return e.status !== 'annule'; }).length + '</strong></div>' +
        '<div><small>Total</small><strong>' + U.formatDH(c.total) + '</strong></div></div>' +
        '<div class="client__actions">' + contactButtons(c.phone, c.name, c.next && c.next.date) + '</div></article>';
    }).join('') : empty('Aucun client trouvé.');
  }

  function openClient(key) {
    var c = buildClients().filter(function (x) { return x.key === key; })[0];
    if (!c) return;
    openSheet(
      '<header class="sheet__head"><div><p class="sheet__eyebrow">Fiche client</p><h2>' + esc(c.name) + '</h2></div>' + closeBtn() + '</header>' +
      '<div class="sheet__body">' +
        '<div class="actions">' + contactButtons(c.phone, c.name, c.next && c.next.date) + '</div>' +
        '<dl class="info">' + info('Téléphone', U.formatPhone(c.phone) || '—') + info('Total des événements', U.formatDH(c.total)) + '</dl>' +
        '<h4 class="sub">Événements (' + c.events.length + ')</h4>' +
        (c.events.length ? '<ul class="rows">' + c.events.slice().sort(byDate).reverse().map(eventRow).join('') + '</ul>' : empty('Aucun événement.')) +
        '<h4 class="sub">Demandes (' + c.requests.length + ')</h4>' +
        (c.requests.length ? '<ul class="rows">' + c.requests.map(requestRow).join('') + '</ul>' : empty('Aucune autre demande.')) +
      '</div>'
    );
  }

  /* =========================================================
     CONTENU DU SITE
     ========================================================= */
  function viewContent() {
    var s = data.settings;
    return '<p class="note">Les modifications sont visibles tout de suite sur le site. <a href="../" target="_blank" rel="noopener">Ouvrir le site ↗</a></p>' +

      '<section class="card"><header class="card__head"><h3>Coordonnées</h3></header>' +
        '<form class="form-grid" id="settingsForm">' +
          field('Nom du gérant', '<input name="owner" value="' + esc(s.owner) + '">') +
          field('Téléphone', '<input name="phone" type="tel" value="' + esc(s.phone) + '">') +
          field('WhatsApp', '<input name="whatsapp" type="tel" value="' + esc(s.whatsapp) + '">') +
          field('E-mail', '<input name="email" type="email" value="' + esc(s.email) + '" placeholder="Optionnel">') +
          field('Instagram (lien)', '<input name="instagram" value="' + esc(s.instagram) + '">') +
          field('Ville', '<input name="city" value="' + esc(s.city) + '">') +
          field('Adresse (pour la carte)', '<input name="address" value="' + esc(s.address) + '">') +
          field('Horaires', '<input name="hours" value="' + esc(s.hours) + '">') +
          field('Phrase d\'accroche', '<input name="tagline" value="' + esc(s.tagline) + '">', 'span-2') +
          '<div class="span-2 form-actions"><button type="button" class="btn btn--gold btn--sm" data-action="save-settings">Enregistrer les coordonnées</button></div>' +
        '</form></section>' +

      '<section class="card"><header class="card__head"><h3>Formules</h3><span class="muted">Laissez le prix vide pour afficher « Prix sur devis »</span></header>' +
        '<div class="editor-grid">' + data.packages.map(function (p, i) {
          return '<div class="editor" data-pkg="' + i + '">' +
            field('Nom', '<input data-k="name" value="' + esc(p.name) + '">') +
            field('Sous-titre', '<input data-k="tagline" value="' + esc(p.tagline) + '">') +
            field('Prix', '<input data-k="price" value="' + esc(p.price) + '" placeholder="Ex. À partir de 350 DH / personne">') +
            field('Contenu (une ligne par élément)', '<textarea data-k="features" rows="5">' + esc(p.features.join('\n')) + '</textarea>') +
            '<label class="switch"><input type="checkbox" data-k="featured"' + (p.featured ? ' checked' : '') + '><span>Mettre en avant</span></label>' +
            '</div>';
        }).join('') + '</div>' +
        '<div class="form-actions"><button class="btn btn--gold btn--sm" data-action="save-packages">Enregistrer les formules</button></div>' +
      '</section>' +

      '<section class="card"><header class="card__head"><h3>Services</h3></header>' +
        '<div class="editor-grid editor-grid--4">' + data.services.map(function (sv, i) {
          return '<div class="editor" data-svc="' + i + '">' + field('Titre', '<input data-k="title" value="' + esc(sv.title) + '">') +
            field('Description', '<textarea data-k="text" rows="5">' + esc(sv.text) + '</textarea>') + '</div>';
        }).join('') + '</div>' +
        '<div class="form-actions"><button class="btn btn--gold btn--sm" data-action="save-services">Enregistrer les services</button></div>' +
      '</section>' +

      '<section class="card"><header class="card__head"><h3>Galerie photos</h3>' +
        '<label class="btn btn--light btn--sm">' + icon('plus') + ' Ajouter des photos<input type="file" id="galleryUpload" accept="image/*" multiple hidden></label></header>' +
        '<div class="gal-edit">' + data.gallery.map(function (g, i) {
          return '<div class="gal-item" data-gal="' + i + '"><div class="gal-item__img tone-' + ((g.tone || i) % 8 + 1) + '">' +
            (g.src ? '<img src="' + esc(g.src) + '" alt="">' : '<span>Photo à venir</span>') +
            '<button class="icon-btn icon-btn--sm gal-item__del" data-action="gallery-remove" data-index="' + i + '" aria-label="Retirer la photo">' + ICONS.close + '</button></div>' +
            '<input data-k="caption" value="' + esc(g.caption) + '" placeholder="Légende"></div>';
        }).join('') + '</div>' +
        '<div class="form-actions"><button class="btn btn--gold btn--sm" data-action="save-gallery">Enregistrer les légendes</button></div>' +
        '<p class="muted small">Démo : les photos sont gardées dans ce navigateur uniquement. Dans la version finale, elles seront stockées en ligne.</p>' +
      '</section>';
  }

  function resizeImage(file, max) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var k = Math.min(1, max / Math.max(img.width, img.height));
          var c = document.createElement('canvas');
          c.width = Math.round(img.width * k);
          c.height = Math.round(img.height * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL('image/jpeg', 0.78));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ---------- panneau ---------- */
  function closeBtn() { return '<button class="icon-btn" data-action="close-sheet" aria-label="Fermer">' + ICONS.close + '</button>'; }
  function openSheet(html) {
    $('#sheetPanel').innerHTML = html;
    $('#sheet').hidden = false;
    document.body.classList.add('sheet-open');
    $('#sheetPanel').scrollTop = 0;
  }
  function closeSheet() {
    $('#sheet').hidden = true;
    document.body.classList.remove('sheet-open');
    draft = null;
  }

  /* =========================================================
     ACTIONS
     ========================================================= */
  var actions = {
    'goto': function (el) { go(el.dataset.view); },
    'toggle-nav': function () { document.body.classList.toggle('nav-open'); },
    'close-sheet': closeSheet,
    'open-req': function (el) { openRequest(el.dataset.id); },
    'open-event': function (el) { openEventForm(el.dataset.id); },
    'new-event': function (el) { openEventForm(null, el.dataset.date ? { date: el.dataset.date } : null); },
    'open-day': function (el) { openDay(el.dataset.date); },
    'open-client': function (el) { openClient(el.dataset.key); },

    'req-filter': function (el) { state.reqFilter = el.dataset.filter; render(); },
    'ev-filter': function (el) { state.evFilter = el.dataset.filter; render(); },

    'cal-mode': function (el) { state.calMode = el.dataset.mode; render(); },
    'cal-today': function () { state.calYear = NOW.getFullYear(); state.calMonth = NOW.getMonth(); render(); },
    'cal-prev': function () {
      if (state.calMode === 'month') { state.calMonth--; if (state.calMonth < 0) { state.calMonth = 11; state.calYear--; } }
      else state.calYear--;
      render();
    },
    'cal-next': function () {
      if (state.calMode === 'month') { state.calMonth++; if (state.calMonth > 11) { state.calMonth = 0; state.calYear++; } }
      else state.calYear++;
      render();
    },
    'cal-month': function (el) {
      state.calYear = +el.dataset.year; state.calMonth = +el.dataset.month; state.calMode = 'month'; state.view = 'calendar';
      render(); window.scrollTo(0, 0);
    },

    'req-save-notes': function (el) {
      var r = findReq(el.dataset.id);
      r.notes = $('#reqNotes').value.trim();
      commit('Notes enregistrées.');
    },
    'req-convert': function (el) {
      var r = findReq(el.dataset.id);
      openEventForm(null, {
        clientName: r.name, phone: r.phone, eventType: r.eventType, date: r.date, guests: r.guests,
        notes: [r.message, r.notes].filter(Boolean).join('\n'), fromRequest: r.id
      });
    },
    'req-delete': function (el) {
      if (!window.confirm('Supprimer cette demande ?')) return;
      data.requests = data.requests.filter(function (r) { return r.id !== el.dataset.id; });
      closeSheet();
      commit('Demande supprimée.');
    },

    'ev-add-payment': function () {
      var amount = +$('#payAmount').value;
      if (!amount || amount <= 0) { toast('Indiquez un montant.', true); $('#payAmount').focus(); return; }
      draft.payments.push({ id: U.uid(), amount: amount, date: $('#payDate').value || TODAY, note: $('#payNote').value });
      renderPayments();
    },
    'ev-del-payment': function (el) {
      draft.payments = draft.payments.filter(function (p) { return p.id !== el.dataset.id; });
      renderPayments();
    },
    'ev-save': saveEvent,
    'ev-delete': function (el) {
      if (!window.confirm('Supprimer définitivement cet événement ?')) return;
      var id = el.dataset.id;
      data.events = data.events.filter(function (e) { return e.id !== id; });
      data.requests.forEach(function (r) { if (r.eventId === id) { r.eventId = null; r.status = 'devis'; } });
      closeSheet();
      commit('Événement supprimé.');
    },

    'save-settings': function () {
      var f = $('#settingsForm').elements;
      ['owner', 'phone', 'whatsapp', 'email', 'instagram', 'city', 'address', 'hours', 'tagline'].forEach(function (k) {
        data.settings[k] = f[k].value.trim();
      });
      commit('Coordonnées enregistrées.');
    },
    'save-packages': function () {
      $$('[data-pkg]').forEach(function (box) {
        var p = data.packages[+box.dataset.pkg];
        p.name = $('[data-k="name"]', box).value.trim();
        p.tagline = $('[data-k="tagline"]', box).value.trim();
        p.price = $('[data-k="price"]', box).value.trim();
        p.features = $('[data-k="features"]', box).value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
        p.featured = $('[data-k="featured"]', box).checked;
      });
      commit('Formules enregistrées.');
    },
    'save-services': function () {
      $$('[data-svc]').forEach(function (box) {
        var sv = data.services[+box.dataset.svc];
        sv.title = $('[data-k="title"]', box).value.trim();
        sv.text = $('[data-k="text"]', box).value.trim();
      });
      commit('Services enregistrés.');
    },
    'save-gallery': function () {
      $$('[data-gal]').forEach(function (box) { data.gallery[+box.dataset.gal].caption = $('[data-k="caption"]', box).value.trim(); });
      commit('Légendes enregistrées.');
    },
    'gallery-remove': function (el) {
      if (!window.confirm('Retirer cette photo du site ?')) return;
      data.gallery.splice(+el.dataset.index, 1);
      commit('Photo retirée.');
    },

    'reset-demo': function () {
      if (!window.confirm('Remettre toutes les données de démonstration à zéro ?')) return;
      data = T.store.reset();
      closeSheet();
      go('overview');
      toast('Démo réinitialisée.');
    },
    'logout': function () {
      try { sessionStorage.removeItem('torrais_auth'); } catch (e) { /* ignore */ }
      authed = false;
      showLogin();
    }
  };

  function findReq(id) { return data.requests.filter(function (r) { return r.id === id; })[0]; }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el || !actions[el.dataset.action]) return;
    if (el.tagName === 'A') return;
    e.preventDefault();
    actions[el.dataset.action](el);
  });

  document.addEventListener('change', function (e) {
    if (e.target.id === 'reqStatus') {
      var r = findReq(e.target.dataset.id);
      var next = e.target.value;
      if (next === 'confirme' && !r.eventId) {
        e.target.value = r.status;
        actions['req-convert']({ dataset: { id: r.id } });
        toast('Complétez l\'événement pour confirmer la demande.');
        return;
      }
      r.status = next;
      commit('Statut mis à jour : ' + statusLabel(next) + '.');
      openRequest(r.id);
    }
    if (e.target.id === 'galleryUpload') {
      var files = Array.prototype.slice.call(e.target.files || []);
      if (!files.length) return;
      Promise.all(files.map(function (f) { return resizeImage(f, 1200); })).then(function (srcs) {
        var before = data.gallery.length;
        srcs.forEach(function (src, i) {
          data.gallery.unshift({ id: U.uid(), src: src, caption: files[i].name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '), tone: 1 });
        });
        if (!commit(plural(srcs.length, 'photo ajoutée', 'photos ajoutées') + '.')) {
          data.gallery.splice(0, data.gallery.length - before);
          T.store.save(data);
          render();
        }
      }).catch(function () { toast('Impossible de lire cette image.', true); });
    }
  });

  document.addEventListener('input', function (e) {
    if (e.target.id === 'reqSearch') { state.reqSearch = e.target.value; renderRequestList(); }
    if (e.target.id === 'clientSearch') { state.clientSearch = e.target.value; renderClientList(); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('#sheet').hidden) closeSheet();
  });

  // Une demande envoyée depuis le site (autre onglet) apparaît tout de suite
  window.addEventListener('storage', function (e) {
    if (e.key === T.KEY && authed) {
      data = T.store.fresh();
      if ($('#sheet').hidden) render(); else renderNav();
      toast('Données mises à jour.');
    }
  });

  /* ---------- connexion (démo) ---------- */
  var DEMO_PASSWORD = 'demo';
  var authed = false;
  try { authed = sessionStorage.getItem('torrais_auth') === '1'; } catch (e) { authed = false; }

  function showLogin() {
    $('#app').hidden = true;
    $('#login').hidden = false;
    $('#loginPass').value = '';
    setTimeout(function () { $('#loginPass').focus(); }, 50);
  }
  function showApp() {
    $('#login').hidden = true;
    $('#app').hidden = false;
    $$('[data-icon-before]').forEach(function (el) {
      if (!el.querySelector('.ic')) el.insertAdjacentHTML('afterbegin', icon(el.getAttribute('data-icon-before')));
    });
    data = T.store.fresh();
    render();
  }

  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if ($('#loginPass').value.trim().toLowerCase() === DEMO_PASSWORD) {
      authed = true;
      try { sessionStorage.setItem('torrais_auth', '1'); } catch (err) { /* ignore */ }
      $('#loginError').hidden = true;
      showApp();
    } else {
      $('#loginError').hidden = false;
    }
  });

  if (authed) showApp(); else showLogin();
})();
