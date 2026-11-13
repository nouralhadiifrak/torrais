/* TORRAIS EVENT — espace gérant (démo, données dans le navigateur) */
(function () {
  'use strict';

  var T = window.Torrais;
  var U = T.util;
  var esc = U.esc;
  var data = T.store.load();
  function normalize() {
    if (!data.staff) data.staff = [];
    if (!data.inventory) data.inventory = [];
    data.events.forEach(function (e) {
      ['payments', 'team', 'equipment', 'expenses'].forEach(function (k) { if (!e[k]) e[k] = []; });
    });
  }
  normalize();

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
    reqSource: '',
    evFilter: 'avenir',
    clientSearch: '',
    finYear: NOW.getFullYear()
  };

  var ICONS = {
    overview: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
    requests: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5.5 5h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    events: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><path d="M16 15h2"/></svg>',
    clients: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14a6 6 0 0 1 3.5 6"/></svg>',
    team: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/><path d="M9 14.5l3 3 3-3"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8L12 3.5 20.5 8v8L12 20.5 3.5 16z"/><path d="M3.5 8l8.5 4.5L20.5 8"/><path d="M12 12.5v8"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v16h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/></svg>',
    content: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v6h6"/><path d="M4.5 15a8 8 0 1 0 1.5-8.5L4 10"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/></svg>',
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
    { group: 'Ventes' },
    { id: 'requests', label: 'Demandes de devis', icon: 'requests' },
    { id: 'calendar', label: 'Calendrier', icon: 'calendar' },
    { id: 'events', label: 'Événements', icon: 'events' },
    { id: 'clients', label: 'Clients', icon: 'clients' },
    { group: 'Organisation' },
    { id: 'team', label: 'Équipe', icon: 'team' },
    { id: 'inventory', label: 'Matériel', icon: 'box' },
    { group: 'Gestion' },
    { id: 'finances', label: 'Finances', icon: 'chart' },
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
  function sourceTag(src) { return src ? '<span class="src-tag">' + esc(src) + '</span>' : ''; }
  function sourceOptions(selected, withSite) {
    return T.SOURCES.filter(function (s) { return withSite || s !== 'Site web' || s === selected; }).map(function (s) {
      return '<option' + (s === selected ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');
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
      if (n.group) return '<p class="sidebar__group">' + n.group + '</p>';
      var badge = n.id === 'requests' && newCount ? '<span class="nav-badge">' + newCount + '</span>' : '';
      return '<button type="button" class="sidebar__item' + (state.view === n.id ? ' is-active' : '') + '" data-action="goto" data-view="' + n.id + '">' +
        icon(n.icon) + '<span>' + n.label + '</span>' + badge + '</button>';
    }).join('');
  }

  function render() {
    renderNav();
    var nav = NAV.filter(function (n) { return n.id === state.view; })[0];
    $('#viewTitle').textContent = nav ? nav.label : '';
    var views = { overview: viewOverview, requests: viewRequests, calendar: viewCalendar, events: viewEvents, clients: viewClients, team: viewTeam, inventory: viewInventory, finances: viewFinances, content: viewContent };
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
      '<div class="welcome__actions"><button class="btn btn--light" data-action="new-request">' + icon('plus') + ' Nouvelle demande</button>' +
      '<button class="btn btn--primary" data-action="new-event">' + icon('plus') + ' Nouvel événement</button></div></div>' +

      '<div class="kpis">' +
        kpi('Nouvelles demandes', newReqs.length, plural(pendingReqs.length, 'demande') + ' en cours', 'requests', newReqs.length ? 'kpi--alert' : '') +
        kpi('Événements ce mois-ci', monthEvents.length, MONTHS[NOW.getMonth()] + ' ' + year, 'calendar') +
        kpi('Chiffre du mois', U.formatDH(sum(monthEvents, function (e) { return e.total; })), 'Événements confirmés', 'events') +
        kpi('Reste à encaisser', U.formatDH(due), 'Sur ' + plural(upcoming.length, 'événement') + ' à venir', 'events') +
      '</div>' +

      alertsCard() +

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
      '</section>' +
      sourcesCard();
  }

  // Ce qui demande une action : équipe manquante, matériel insuffisant, soldes en retard, paies à régler
  function alertsCard() {
    var items = [];
    activeEvents().filter(function (e) { return e.date >= TODAY && daysBetween(TODAY, e.date) <= 14 && !(e.team || []).length; }).sort(byDate).forEach(function (e) {
      items.push('<button class="alert" data-action="open-event" data-id="' + e.id + '" data-tab="team">' + icon('team') + '<span><strong>Aucune équipe affectée</strong> pour ' + esc(e.clientName) + ' — ' + esc(e.eventType.toLowerCase()) + ' du ' + U.formatDate(e.date, { day: 'numeric', month: 'long' }) + ' (' + relDays(e.date).toLowerCase() + ')</span><em>Affecter →</em></button>');
    });
    var short = shortages(60);
    var days = {};
    short.forEach(function (x) { (days[x.date] = days[x.date] || []).push(x); });
    Object.keys(days).sort().forEach(function (date) {
      items.push('<button class="alert" data-action="goto" data-view="inventory">' + icon('box') + '<span><strong>Matériel insuffisant</strong> le ' + U.formatDate(date, { day: 'numeric', month: 'long' }) + ' — il manque ' +
        days[date].map(function (x) { return x.missing + ' ' + esc(x.item.name.toLowerCase()); }).join(', ') + '</span><em>Voir →</em></button>');
    });
    activeEvents().filter(function (e) { return e.date < TODAY && remaining(e) > 0; }).sort(byDate).forEach(function (e) {
      items.push('<button class="alert" data-action="open-event" data-id="' + e.id + '" data-tab="pay">' + icon('events') + '<span><strong>Solde en retard</strong> — ' + esc(e.clientName) + ' doit encore ' + U.formatDH(remaining(e)) + ' (événement du ' + U.formatDate(e.date, { day: 'numeric', month: 'long' }) + ')</span><em>Voir →</em></button>');
    });
    var owed = sum(data.staff, function (s) { return staffOwed(s.id); });
    if (owed) {
      var n = data.staff.filter(function (s) { return staffOwed(s.id) > 0; }).length;
      items.push('<button class="alert" data-action="goto" data-view="team">' + icon('team') + '<span><strong>Équipe à payer</strong> — ' + U.formatDH(owed) + ' pour ' + plural(n, 'personne') + '</span><em>Voir →</em></button>');
    }
    if (!items.length) return '';
    return '<section class="card card--alerts"><header class="card__head"><h3>À surveiller</h3><span class="muted">' + plural(items.length, 'point') + '</span></header><div class="alerts">' + items.join('') + '</div></section>';
  }

  function sourcesCard() {
    var rows = T.SOURCES.map(function (s) {
      return {
        label: s,
        req: data.requests.filter(function (r) { return (r.source || 'Autre') === s; }).length,
        ev: activeEvents().filter(function (e) { return (e.source || 'Autre') === s; }).length
      };
    }).filter(function (x) { return x.req || x.ev; }).sort(function (a, b) { return b.req - a.req; });
    if (!rows.length) return '';
    var max = Math.max.apply(null, rows.map(function (x) { return x.req; }).concat([1]));
    return '<section class="card"><header class="card__head"><h3>D\'où viennent vos clients ?</h3><span class="muted">Demandes reçues et réservations confirmées, par source</span></header>' +
      '<div class="src-rows">' + rows.map(function (x) {
        return '<div class="src-row"><span class="src-row__label">' + esc(x.label) + '</span>' +
          '<div class="src-row__bar"><span style="width:' + Math.round(x.req / max * 100) + '%"></span></div>' +
          '<span class="src-row__val"><b>' + plural(x.req, 'demande') + '</b> · ' + plural(x.ev, 'réservation') + '</span></div>';
      }).join('') + '</div></section>';
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
      '<span class="row__rel">' + sourceTag(r.source) + ' Reçue ' + receivedLabel(r.createdAt).toLowerCase() + ' ' + conflictFlag(r) + '</span></div>' +
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
      '</div>' +
      '<div class="toolbar">' +
        '<div class="toolbar__group">' +
          '<input class="search" type="search" id="reqSearch" placeholder="Rechercher un nom, un téléphone…" value="' + esc(state.reqSearch) + '">' +
          '<select class="search search--select" id="reqSource" aria-label="Filtrer par source"><option value="">Toutes les sources</option>' + sourceOptions(state.reqSource, true) + '</select>' +
        '</div>' +
        '<button class="btn btn--primary btn--sm" data-action="new-request">' + icon('plus') + ' Nouvelle demande</button>' +
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
      if (state.reqSource && (r.source || 'Autre') !== state.reqSource) return false;
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
          info('Date', r.date ? U.formatDate(r.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ' <small>(' + relDays(r.date).toLowerCase() + ')</small>' : '—', true) +
          info('Invités', r.guests || '—') +
          info('Budget', r.budget || '—') +
          info('Reçue par', r.source || '—') +
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
          ? '<button class="btn btn--primary" data-action="open-event" data-id="' + linked.id + '">Voir l\'événement</button>'
          : '<button class="btn btn--primary" data-action="req-convert" data-id="' + r.id + '">Confirmer & créer l\'événement</button>') +
      '</footer>'
    );
  }

  /* Ajouter à la main une demande reçue par WhatsApp, téléphone, en boutique… */
  function openRequestForm(prefill) {
    var r = Object.assign({ name: '', phone: '', source: 'WhatsApp', eventType: 'Mariage', date: '', guests: '', budget: '', services: [], message: '', status: 'nouveau' }, prefill || {});
    var manualSources = T.SOURCES.filter(function (s) { return s !== 'Site web'; });
    openSheet(
      '<header class="sheet__head"><div><p class="sheet__eyebrow">Ajout manuel</p><h2>Nouvelle demande</h2></div>' + closeBtn() + '</header>' +
      '<form class="sheet__body" id="reqForm" novalidate>' +
        '<div class="field"><span>Reçue par</span><div class="pick">' + manualSources.map(function (s) {
          return '<label class="pick__opt"><input type="radio" name="source" value="' + esc(s) + '"' + (s === r.source ? ' checked' : '') + '><span>' + esc(s) + '</span></label>';
        }).join('') + '</div></div>' +
        '<div class="form-grid">' +
          field('Nom du client *', '<input name="name" required value="' + esc(r.name) + '" placeholder="Ex. Famille Alaoui">') +
          field('Téléphone', '<input name="phone" type="tel" value="' + esc(r.phone) + '" placeholder="06 XX XX XX XX">') +
          field('Type d\'événement', '<select name="eventType">' + T.EVENT_TYPES.map(function (t) { return '<option' + (t === r.eventType ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select>') +
          field('Date de l\'événement *', '<input name="date" type="date" required value="' + esc(r.date) + '">') +
          field('Invités', '<input name="guests" type="number" min="0" step="10" value="' + esc(r.guests) + '">') +
          field('Budget', '<input name="budget" value="' + esc(r.budget) + '" placeholder="Ex. 50 000 DH">') +
          field('Statut', '<select name="status">' + T.STATUSES.filter(function (s) { return s.id !== 'confirme'; }).map(function (s) {
            return '<option value="' + s.id + '"' + (s.id === r.status ? ' selected' : '') + '>' + s.label + '</option>';
          }).join('') + '</select>', 'span-2') +
        '</div>' +
        '<div class="field"><span>Services souhaités</span><div class="pick">' + T.SERVICE_NAMES.map(function (n) {
          return '<label class="pick__opt"><input type="checkbox" name="services" value="' + esc(n) + '"' + (r.services.indexOf(n) !== -1 ? ' checked' : '') + '><span>' + esc(n) + '</span></label>';
        }).join('') + '</div></div>' +
        field('Détails / notes', '<textarea name="message" rows="3" placeholder="Ce que le client a demandé : menu, lieu, formule…">' + esc(r.message) + '</textarea>') +
        '<div id="reqAvail"></div>' +
      '</form>' +
      '<footer class="sheet__foot"><span class="muted small">Le client sera ajouté à la liste des clients.</span>' +
        '<button class="btn btn--primary" data-action="req-form-save">Enregistrer la demande</button></footer>'
    );
    var form = $('#reqForm');
    function avail() {
      var d = form.elements.date.value;
      $('#reqAvail').innerHTML = d ? '<h4 class="sub">Disponibilité</h4>' + availability(d, null, null) : '';
    }
    form.elements.date.addEventListener('change', avail);
    form.addEventListener('submit', function (e) { e.preventDefault(); saveRequestForm(); });
    avail();
    setTimeout(function () { form.elements.name.focus(); }, 50);
  }

  function saveRequestForm() {
    var form = $('#reqForm');
    var f = form.elements;
    var name = f.name.value.trim();
    if (!name || !f.date.value) {
      toast('Merci d\'indiquer au moins le nom du client et la date.', true);
      (name ? f.date : f.name).focus();
      return;
    }
    var now = new Date();
    var req = {
      id: U.uid(),
      source: (form.querySelector('input[name="source"]:checked') || {}).value || 'Autre',
      createdAt: U.iso(now) + 'T' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'),
      name: name,
      phone: f.phone.value.trim(),
      eventType: f.eventType.value,
      date: f.date.value,
      guests: +f.guests.value || 0,
      budget: f.budget.value.trim(),
      services: $$('input[name="services"]:checked', form).map(function (c) { return c.value; }),
      message: f.message.value.trim(),
      status: f.status.value,
      notes: '',
      eventId: null
    };
    data.requests.unshift(req);
    closeSheet();
    if (commit('Demande ajoutée (' + req.source + ').')) openRequest(req.id);
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
      '<footer class="sheet__foot"><button class="btn btn--light" data-action="new-request" data-date="' + date + '">' + icon('plus') + ' Demande</button>' +
      '<button class="btn btn--primary" data-action="new-event" data-date="' + date + '">' + icon('plus') + ' Événement</button></footer>'
    );
  }

  /* =========================================================
     COÛTS, ÉQUIPE ET MATÉRIEL (calculs)
     ========================================================= */
  function staffById(id) { return data.staff.filter(function (s) { return s.id === id; })[0]; }
  function itemById(id) { return data.inventory.filter(function (i) { return i.id === id; })[0]; }
  function staffCost(e) { return sum(e.team || [], function (t) { return t.pay; }); }
  function expenseCost(e) { return sum(e.expenses || [], function (x) { return x.amount; }); }
  function cost(e) { return staffCost(e) + expenseCost(e); }
  function profit(e) { return (+e.total || 0) - cost(e); }
  function marginPct(total, c) { return total ? Math.round((total - c) / total * 100) : 0; }
  // Événements (autres que exceptId) où cette personne travaille déjà ce jour-là
  function staffBusy(staffId, date, exceptId) {
    return activeEvents().filter(function (e) {
      return e.date === date && e.id !== exceptId && (e.team || []).some(function (t) { return t.staffId === staffId; });
    });
  }
  function reservedOn(itemId, date, exceptId) {
    return sum(activeEvents().filter(function (e) { return e.date === date && e.id !== exceptId; }), function (e) {
      return sum((e.equipment || []).filter(function (q) { return q.itemId === itemId; }), function (q) { return q.qty; });
    });
  }
  // Jours à venir où le matériel réservé dépasse le stock
  function shortages(maxDays) {
    var dates = {};
    activeEvents().forEach(function (e) {
      if (e.date >= TODAY && (maxDays == null || daysBetween(TODAY, e.date) <= maxDays) && (e.equipment || []).length) dates[e.date] = true;
    });
    var out = [];
    Object.keys(dates).sort().forEach(function (date) {
      data.inventory.forEach(function (it) {
        var need = reservedOn(it.id, date, null);
        if (need > it.qty) out.push({ date: date, item: it, need: need, missing: need - it.qty });
      });
    });
    return out;
  }
  function staffOwed(staffId) {
    return sum(activeEvents().filter(function (e) { return e.date <= TODAY; }), function (e) {
      return sum((e.team || []).filter(function (t) { return t.staffId === staffId && !t.paid; }), function (t) { return t.pay; });
    });
  }
  function suggestedQty(item, guests) {
    var g = +guests || 0;
    if (item.rule === 'guest1') return g;
    if (item.rule === 'guest2') return g * 2;
    if (item.rule === 'table1') return Math.ceil(g / 10);
    return 0;
  }

  /* =========================================================
     ÉVÉNEMENTS
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
      }).join('') + '</div><button class="btn btn--primary btn--sm" data-action="new-event">' + icon('plus') + ' Nouvel événement</button></div>' +
      '<section class="card card--flush"><ul class="rows rows--big">' + (list.length ? list.map(eventMoneyRow).join('') : '<li>' + empty('Aucun événement.') + '</li>') + '</ul></section>';
  }

  function eventMoneyRow(e) {
    var team = (e.team || []).length;
    return '<li><button class="row" data-action="open-event" data-id="' + e.id + '">' + dateBlock(e.date) +
      '<div class="row__main"><strong>' + esc(e.clientName) + '</strong><span>' + esc(e.eventType) + ' · ' + esc(e.package || 'Sur mesure') + ' · ' + esc(e.guests) + ' invités</span>' +
      '<span class="row__rel">' + icon('pin', 'ic--xs') + ' ' + esc(e.venue || '—') + ' · ' + (team ? plural(team, 'personne') + ' dans l\'équipe' : 'Équipe à affecter') + '</span></div>' +
      '<div class="row__money"><div class="row__amounts"><span>' + U.formatDH(paid(e)) + '</span><small>/ ' + U.formatDH(e.total) + '</small></div>' + progress(e) +
      (remaining(e) ? '<small class="due">Reste ' + U.formatDH(remaining(e)) + '</small>' : '<small class="ok">Payé en totalité</small>') + '</div></button></li>';
  }

  var draft = null;
  var evTab = 'details';
  var EV_TABS = [['details', 'Détails'], ['menu', 'Menu'], ['team', 'Équipe'], ['equip', 'Matériel'], ['costs', 'Dépenses'], ['pay', 'Paiements']];

  function openEventForm(id, prefill, tab) {
    var existing = id && data.events.filter(function (e) { return e.id === id; })[0];
    draft = existing ? JSON.parse(JSON.stringify(existing)) : Object.assign({
      id: null, source: 'WhatsApp', clientName: '', phone: '', eventType: 'Mariage', date: '', venue: '', guests: '', package: '', total: '',
      status: 'confirme', notes: '', payments: [], createdAt: TODAY
    }, prefill || {});
    ['payments', 'team', 'equipment', 'expenses'].forEach(function (k) { if (!draft[k]) draft[k] = []; });
    ['arrival', 'service', 'menu', 'menuNotes'].forEach(function (k) { if (draft[k] == null) draft[k] = ''; });
    evTab = tab || 'details';
    var pkgOptions = data.packages.map(function (p) { return p.name; }).concat(['Buffet cocktail', 'Tyafer + décoration', 'Sur mesure']);
    if (draft.package && pkgOptions.indexOf(draft.package) === -1) pkgOptions.push(draft.package);

    openSheet(
      '<header class="sheet__head"><div><p class="sheet__eyebrow">' + (existing ? 'Événement confirmé' : 'Nouvel événement') + '</p><h2>' + (existing ? esc(existing.clientName) : 'Ajouter un événement') + '</h2></div>' + closeBtn() + '</header>' +
      '<nav class="tabs" id="evTabs"></nav>' +
      '<form class="sheet__body" id="eventForm" novalidate>' +
        '<div class="tabpanel" data-panel="details">' +
          (existing ? '<div class="actions">' + contactButtons(existing.phone, existing.clientName, existing.date) + '</div>' : '') +
          '<div class="form-grid">' +
            field('Client *', '<input name="clientName" required value="' + esc(draft.clientName) + '" placeholder="Ex. Famille Alaoui">') +
            field('Téléphone', '<input name="phone" type="tel" value="' + esc(draft.phone) + '" placeholder="06 XX XX XX XX">') +
            field('Type d\'événement', '<select name="eventType">' + T.EVENT_TYPES.map(function (t) { return '<option' + (t === draft.eventType ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select>') +
            field('Date *', '<input name="date" type="date" required value="' + esc(draft.date) + '">') +
            field('Lieu', '<input name="venue" value="' + esc(draft.venue) + '" placeholder="Salle, adresse…">') +
            field('Invités', '<input name="guests" type="number" min="0" step="10" value="' + esc(draft.guests) + '">') +
            field('Formule', '<select name="package"><option value="">—</option>' + pkgOptions.map(function (p) { return '<option' + (p === draft.package ? ' selected' : '') + '>' + esc(p) + '</option>'; }).join('') + '</select>') +
            field('Prix total (DH) *', '<input name="total" type="number" min="0" step="500" value="' + esc(draft.total) + '">') +
            field('Réservé par', '<select name="source">' + sourceOptions(draft.source || 'Autre', true) + '</select>') +
            field('Statut', '<select name="status"><option value="confirme"' + (draft.status !== 'annule' ? ' selected' : '') + '>Confirmé</option><option value="annule"' + (draft.status === 'annule' ? ' selected' : '') + '>Annulé</option></select>') +
            field('Notes (lieu, accès, contact sur place…)', '<textarea name="notes" rows="3">' + esc(draft.notes) + '</textarea>', 'span-2') +
          '</div>' +
          '<div id="eventAvail"></div>' +
        '</div>' +
        '<div class="tabpanel" data-panel="menu">' +
          '<div class="form-grid">' +
            field('Arrivée de l\'équipe', '<input name="arrival" type="time" value="' + esc(draft.arrival) + '">') +
            field('Début du service', '<input name="service" type="time" value="' + esc(draft.service) + '">') +
          '</div>' +
          field('Menu convenu (un plat par ligne)', '<textarea name="menu" rows="8" placeholder="Pastilla…&#10;Méchoui…">' + esc(draft.menu) + '</textarea>') +
          '<button type="button" class="btn btn--light btn--sm" data-action="ev-menu-from-package">Reprendre le contenu de la formule</button>' +
          '<div class="gap"></div>' +
          field('Demandes particulières', '<textarea name="menuNotes" rows="3" placeholder="Allergies, menus spéciaux, tables à part…">' + esc(draft.menuNotes) + '</textarea>') +
        '</div>' +
        '<div class="tabpanel" data-panel="team" id="teamBox"></div>' +
        '<div class="tabpanel" data-panel="equip" id="equipBox"></div>' +
        '<div class="tabpanel" data-panel="costs" id="costsBox"></div>' +
        '<div class="tabpanel" data-panel="pay" id="paymentsBox"></div>' +
      '</form>' +
      '<div class="profit-bar" id="profitBar"></div>' +
      '<footer class="sheet__foot">' +
        (existing ? '<button class="btn btn--text btn--danger" data-action="ev-delete" data-id="' + existing.id + '">' + icon('trash') + ' Supprimer</button>' : '<span></span>') +
        '<button class="btn btn--primary" data-action="ev-save">Enregistrer</button>' +
      '</footer>'
    );
    var form = $('#eventForm');
    form.elements.date.addEventListener('change', function () { renderEventAvail(); renderTeam(); renderEquip(); });
    form.elements.total.addEventListener('input', function () { renderPayments(); renderProfit(); });
    form.addEventListener('submit', function (e) { e.preventDefault(); saveEvent(); });
    renderEventAvail();
    renderTeam();
    renderEquip();
    renderCosts();
    renderPayments();
    showEvTab(evTab);
  }

  function field(label, control, cls) {
    return '<label class="field' + (cls ? ' ' + cls : '') + '"><span>' + label + '</span>' + control + '</label>';
  }

  function draftDate() { var f = $('#eventForm'); return f ? f.elements.date.value : draft.date; }
  function draftTotal() { var f = $('#eventForm'); return f ? +f.elements.total.value || 0 : +draft.total || 0; }
  function draftGuests() { var f = $('#eventForm'); return f ? +f.elements.guests.value || 0 : +draft.guests || 0; }

  function showEvTab(tab) {
    evTab = tab;
    var counts = { team: draft.team.length, equip: draft.equipment.length, costs: draft.expenses.length, pay: draft.payments.length };
    $('#evTabs').innerHTML = EV_TABS.map(function (t) {
      return '<button type="button" class="tabs__btn' + (t[0] === tab ? ' is-active' : '') + '" data-action="ev-tab" data-tab="' + t[0] + '">' + t[1] +
        (counts[t[0]] ? '<b>' + counts[t[0]] + '</b>' : '') + '</button>';
    }).join('');
    $$('.tabpanel').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== tab; });
    var active = $('#evTabs .is-active');
    if (active) {
      var bar = $('#evTabs');
      var left = active.offsetLeft - 16;
      var right = active.offsetLeft + active.offsetWidth + 16;
      if (left < bar.scrollLeft) bar.scrollLeft = left;
      else if (right > bar.scrollLeft + bar.clientWidth) bar.scrollLeft = right - bar.clientWidth;
    }
    renderProfit();
  }

  function renderProfit() {
    var total = draftTotal();
    var c = cost(draft);
    var p = total - c;
    $('#profitBar').innerHTML =
      '<div><small>Prix</small><strong>' + U.formatDH(total) + '</strong></div><span>−</span>' +
      '<div><small>Coûts</small><strong>' + U.formatDH(c) + '</strong></div><span>=</span>' +
      '<div class="profit-bar__result"><small>Bénéfice' + (total && c ? ' · ' + marginPct(total, c) + ' %' : '') + '</small><strong class="' + (p < 0 ? 'due' : 'ok') + '">' + U.formatDH(p) + '</strong></div>';
  }

  function renderEventAvail() {
    var date = draftDate();
    $('#eventAvail').innerHTML = date ? '<h4 class="sub">Disponibilité</h4>' + availability(date, draft.id, null) : '';
  }

  /* ----- onglet Équipe ----- */
  function renderTeam() {
    var date = draftDate();
    var assigned = draft.team.map(function (t) { return t.staffId; });
    var free = data.staff.filter(function (s) { return assigned.indexOf(s.id) === -1; });
    var html = '<p class="hint">Les personnes qui travaillent sur cet événement et ce que vous leur payez.</p>';
    if (draft.team.length) {
      html += '<ul class="lines">' + draft.team.map(function (t, i) {
        var s = staffById(t.staffId) || { name: 'Personne supprimée', role: '' };
        var busy = date ? staffBusy(t.staffId, date, draft.id) : [];
        return '<li class="line"><div class="line__main"><strong>' + esc(s.name) + '</strong><span>' + esc(s.role) +
          (busy.length ? ' <span class="flag">' + icon('alert') + ' Déjà sur ' + esc(busy[0].clientName) + ' ce jour-là</span>' : '') + '</span></div>' +
          '<label class="line__num"><input type="number" min="0" step="50" value="' + esc(t.pay) + '" data-team-pay="' + i + '" aria-label="Paie de ' + esc(s.name) + '"><span>DH</span></label>' +
          '<label class="line__check"><input type="checkbox" data-team-paid="' + i + '"' + (t.paid ? ' checked' : '') + '><span>Payé</span></label>' +
          '<button type="button" class="icon-btn icon-btn--sm" data-action="ev-del-team" data-index="' + i + '" aria-label="Retirer ' + esc(s.name) + '">' + ICONS.close + '</button></li>';
      }).join('') + '</ul>' +
      '<p class="line-total">Coût de l\'équipe : <strong>' + U.formatDH(staffCost(draft)) + '</strong> · ' + plural(draft.team.length, 'personne') + '</p>';
    } else {
      html += '<p class="empty empty--sm">Personne n\'est encore affecté à cet événement.</p>';
    }
    if (free.length) {
      html += '<div class="add-row"><select id="teamAdd" aria-label="Personne à ajouter">' + free.map(function (s) {
        var busy = date ? staffBusy(s.id, date, draft.id).length : 0;
        return '<option value="' + s.id + '">' + esc(s.name) + ' — ' + esc(s.role) + ' (' + s.rate + ' DH)' + (busy ? ' · déjà pris ce jour' : '') + '</option>';
      }).join('') + '</select><button type="button" class="btn btn--light btn--sm" data-action="ev-add-team">' + icon('plus') + ' Ajouter</button></div>';
    } else if (!data.staff.length) {
      html += '<p class="hint">Ajoutez d\'abord des personnes dans la page Équipe.</p>';
    }
    $('#teamBox').innerHTML = html;
  }

  /* ----- onglet Matériel ----- */
  function equipStatus(q) {
    var it = itemById(q.itemId);
    if (!it) return '';
    var date = draftDate();
    var others = date ? reservedOn(q.itemId, date, draft.id) : 0;
    var left = it.qty - others - (+q.qty || 0);
    if (left < 0) return '<span class="flag">' + icon('alert') + ' Il en manque ' + (-left) + '</span> <span class="muted">(stock ' + it.qty + (others ? ', ' + others + ' pris par un autre événement' : '') + ')</span>';
    return '<span class="muted">Stock ' + it.qty + (others ? ' · ' + others + ' pris ailleurs ce jour' : '') + ' · reste ' + left + '</span>';
  }
  function renderEquip() {
    var used = draft.equipment.map(function (q) { return q.itemId; });
    var free = data.inventory.filter(function (it) { return used.indexOf(it.id) === -1; });
    var html = '<p class="hint">Le matériel réservé pour cet événement. Le tableau de bord vous prévient si le stock ne suffit pas ce jour-là.</p>';
    if (draft.equipment.length) {
      html += '<ul class="lines">' + draft.equipment.map(function (q, i) {
        var it = itemById(q.itemId) || { name: 'Article supprimé' };
        return '<li class="line"><div class="line__main"><strong>' + esc(it.name) + '</strong><span data-eq-status="' + i + '">' + equipStatus(q) + '</span></div>' +
          '<label class="line__num"><input type="number" min="0" value="' + esc(q.qty) + '" data-eq-qty="' + i + '" aria-label="Quantité de ' + esc(it.name) + '"></label>' +
          '<button type="button" class="icon-btn icon-btn--sm" data-action="ev-del-equip" data-index="' + i + '" aria-label="Retirer ' + esc(it.name) + '">' + ICONS.close + '</button></li>';
      }).join('') + '</ul>';
    } else {
      html += '<p class="empty empty--sm">Aucun matériel réservé.</p>';
    }
    html += '<div class="add-row">' +
      (free.length ? '<select id="equipAdd" aria-label="Article à ajouter">' + free.map(function (it) { return '<option value="' + it.id + '">' + esc(it.name) + '</option>'; }).join('') + '</select>' +
        '<input type="number" id="equipQty" min="1" placeholder="Qté" aria-label="Quantité">' +
        '<button type="button" class="btn btn--light btn--sm" data-action="ev-add-equip">' + icon('plus') + ' Ajouter</button>' : '') +
      '</div>' +
      '<button type="button" class="btn btn--light btn--sm" data-action="ev-suggest-equip">Proposer selon le nombre d\'invités</button>';
    $('#equipBox').innerHTML = html;
  }

  /* ----- onglet Dépenses ----- */
  function renderCosts() {
    var html = '<p class="hint">Ce que cet événement vous coûte. La paie de l\'équipe est comptée automatiquement.</p><ul class="lines">';
    html += '<li class="line line--auto"><div class="line__main"><strong>Équipe</strong><span>' + (draft.team.length ? plural(draft.team.length, 'personne') : 'Personne affecté') + ' · calculé depuis l\'onglet Équipe</span></div><strong class="line__amount">' + U.formatDH(staffCost(draft)) + '</strong></li>';
    html += draft.expenses.map(function (x) {
      return '<li class="line"><div class="line__main"><strong>' + esc(x.label) + '</strong><span>' + esc(x.category) + (x.date ? ' · ' + U.formatDate(x.date, { day: 'numeric', month: 'short' }) : '') + '</span></div>' +
        '<strong class="line__amount">' + U.formatDH(x.amount) + '</strong>' +
        '<button type="button" class="icon-btn icon-btn--sm" data-action="ev-del-expense" data-id="' + x.id + '" aria-label="Supprimer cette dépense">' + ICONS.close + '</button></li>';
    }).join('');
    html += '</ul><p class="line-total">Total des coûts : <strong>' + U.formatDH(cost(draft)) + '</strong></p>' +
      '<div class="add-row add-row--expense">' +
        '<input id="expLabel" placeholder="Ex. Boucher, fleurs, location…" aria-label="Libellé">' +
        '<select id="expCat" aria-label="Catégorie">' + T.EXPENSE_CATEGORIES.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('') + '</select>' +
        '<input type="number" id="expAmount" min="0" step="100" placeholder="Montant (DH)" aria-label="Montant">' +
        '<button type="button" class="btn btn--light btn--sm" data-action="ev-add-expense">' + icon('plus') + ' Ajouter</button>' +
      '</div>';
    $('#costsBox').innerHTML = html;
  }

  /* ----- onglet Paiements ----- */
  function renderPayments() {
    var total = draftTotal();
    var p = sum(draft.payments, function (x) { return x.amount; });
    var pct = total ? Math.min(100, Math.round(p / total * 100)) : 0;
    $('#paymentsBox').innerHTML =
      '<p class="hint">Ce que le client vous a déjà versé.</p>' +
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
      showEvTab('details');
      toast('Merci d\'indiquer au moins le client et la date.', true);
      (clientName ? f.date : f.clientName).focus();
      return;
    }
    Object.assign(draft, {
      clientName: clientName, phone: f.phone.value.trim(), eventType: f.eventType.value, date: date,
      venue: f.venue.value.trim(), guests: +f.guests.value || 0, package: f.package.value,
      total: +f.total.value || 0, status: f.status.value, notes: f.notes.value.trim(), source: f.source.value,
      arrival: f.arrival.value, service: f.service.value, menu: f.menu.value.trim(), menuNotes: f.menuNotes.value.trim()
    });
    draft.equipment = draft.equipment.filter(function (q) { return +q.qty > 0; });
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
     ÉQUIPE
     ========================================================= */
  function staffAssignments(staffId) {
    var out = [];
    activeEvents().forEach(function (e) {
      (e.team || []).forEach(function (t) { if (t.staffId === staffId) out.push({ event: e, t: t }); });
    });
    return out.sort(function (a, b) { return byDate(a.event, b.event); });
  }

  function viewTeam() {
    var totalOwed = sum(data.staff, function (s) { return staffOwed(s.id); });
    var roles = T.ROLES.filter(function (r) { return data.staff.some(function (s) { return s.role === r; }); });
    data.staff.forEach(function (s) { if (roles.indexOf(s.role) === -1) roles.push(s.role); });
    var html = '<div class="kpis kpis--3">' +
      '<div class="kpi kpi--static"><span class="kpi__label">Personnes</span><strong class="kpi__value">' + data.staff.length + '</strong><span class="kpi__sub">Cuisine, service, décoration, transport</span></div>' +
      '<div class="kpi kpi--static' + (totalOwed ? ' kpi--alert' : '') + '"><span class="kpi__label">À payer à l\'équipe</span><strong class="kpi__value">' + U.formatDH(totalOwed) + '</strong><span class="kpi__sub">Événements déjà passés</span></div>' +
      '<div class="kpi kpi--static"><span class="kpi__label">Payé à l\'équipe en ' + NOW.getFullYear() + '</span><strong class="kpi__value">' + U.formatDH(sum(activeEvents().filter(function (e) { return +e.date.slice(0, 4) === NOW.getFullYear(); }), function (e) {
        return sum((e.team || []).filter(function (t) { return t.paid; }), function (t) { return t.pay; });
      })) + '</strong><span class="kpi__sub">Toutes les paies réglées</span></div></div>' +
      '<div class="toolbar"><p class="muted">Chaque personne est payée à l\'événement. Affectez l\'équipe depuis la fiche de chaque événement.</p>' +
      '<button class="btn btn--primary btn--sm" data-action="staff-new">' + icon('plus') + ' Ajouter une personne</button></div>';
    if (!data.staff.length) return html + '<section class="card">' + empty('Aucune personne dans l\'équipe.') + '</section>';
    roles.forEach(function (role) {
      var list = data.staff.filter(function (s) { return s.role === role; });
      html += '<section class="card card--flush"><header class="card__head card__head--pad"><h3>' + esc(role) + '</h3><span class="muted">' + list.length + '</span></header><ul class="rows rows--big">' +
        list.map(function (s) {
          var as = staffAssignments(s.id);
          var next = as.filter(function (a) { return a.event.date >= TODAY; });
          var owed = staffOwed(s.id);
          return '<li><div class="row row--static"><button class="row__open" data-action="staff-open" data-id="' + s.id + '"><div class="avatar">' + esc(s.name.charAt(0).toUpperCase()) + '</div>' +
            '<div class="row__main"><strong>' + esc(s.name) + '</strong><span>' + esc(U.formatPhone(s.phone) || 'Pas de téléphone') + ' · ' + U.formatDH(s.rate) + ' par événement</span>' +
            '<span class="row__rel">' + (next.length ? plural(next.length, 'événement') + ' à venir · prochain le ' + U.formatDate(next[0].event.date, { day: 'numeric', month: 'short' }) : 'Aucun événement à venir') + '</span></div></button>' +
            '<div class="row__side">' + (owed ? '<span class="amount amount--due">' + U.formatDH(owed) + '</span><button class="btn btn--light btn--sm" data-action="staff-pay" data-id="' + s.id + '">Marquer payé</button>' : '<span class="badge badge--paid">À jour</span>') + '</div></div></li>';
        }).join('') + '</ul></section>';
    });
    return html;
  }

  function openStaff(id) {
    var s = id ? staffById(id) : null;
    var v = s || { id: '', name: '', role: 'Serveur', phone: '', rate: 200 };
    var as = s ? staffAssignments(s.id) : [];
    openSheet(
      '<header class="sheet__head"><div><p class="sheet__eyebrow">Équipe</p><h2>' + (s ? esc(s.name) : 'Ajouter une personne') + '</h2></div>' + closeBtn() + '</header>' +
      '<form class="sheet__body" id="staffForm" novalidate data-id="' + esc(v.id) + '">' +
        (s && s.phone ? '<div class="actions">' + contactButtons(s.phone, s.name, null) + '</div>' : '') +
        '<div class="form-grid">' +
          field('Nom *', '<input name="name" required value="' + esc(v.name) + '">') +
          field('Téléphone', '<input name="phone" type="tel" value="' + esc(v.phone) + '" placeholder="06 XX XX XX XX">') +
          field('Rôle', '<select name="role">' + T.ROLES.map(function (r) { return '<option' + (r === v.role ? ' selected' : '') + '>' + esc(r) + '</option>'; }).join('') + '</select>') +
          field('Tarif par événement (DH)', '<input name="rate" type="number" min="0" step="50" value="' + esc(v.rate) + '">') +
        '</div>' +
        (s ? '<h4 class="sub">Événements (' + as.length + ')</h4>' + (as.length ? '<ul class="lines">' + as.slice().reverse().map(function (a) {
          return '<li class="line"><div class="line__main"><strong>' + esc(a.event.clientName) + '</strong><span>' + U.formatDate(a.event.date, { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' + esc(a.event.eventType) + '</span></div>' +
            '<strong class="line__amount">' + U.formatDH(a.t.pay) + '</strong>' +
            (a.t.paid ? '<span class="badge badge--paid">Payé</span>' : a.event.date <= TODAY ? '<span class="badge badge--refuse">À payer</span>' : '<span class="badge badge--muted">À venir</span>') + '</li>';
        }).join('') + '</ul>' : '<p class="empty empty--sm">Pas encore affecté à un événement.</p>') : '') +
      '</form>' +
      '<footer class="sheet__foot">' +
        (s ? '<button class="btn btn--text btn--danger" data-action="staff-delete" data-id="' + s.id + '">' + icon('trash') + ' Supprimer</button>' : '<span></span>') +
        '<button class="btn btn--primary" data-action="staff-save">Enregistrer</button></footer>'
    );
    $('#staffForm').addEventListener('submit', function (e) { e.preventDefault(); actions['staff-save'](); });
  }

  /* =========================================================
     MATÉRIEL
     ========================================================= */
  function itemPeak(itemId) {
    var peak = { qty: 0, date: '' };
    var dates = {};
    activeEvents().forEach(function (e) { if (e.date >= TODAY) dates[e.date] = true; });
    Object.keys(dates).forEach(function (date) {
      var n = reservedOn(itemId, date, null);
      if (n > peak.qty) peak = { qty: n, date: date };
    });
    return peak;
  }

  function shortageList(list) {
    var byDay = {};
    list.forEach(function (x) { (byDay[x.date] = byDay[x.date] || []).push(x); });
    return Object.keys(byDay).sort().map(function (date) {
      return '<li><strong>' + U.formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' }) + '</strong> — il manque ' +
        byDay[date].map(function (x) { return '<b>' + x.missing + '</b> ' + esc(x.item.name.toLowerCase()); }).join(', ') +
        ' <span class="muted">(' + eventsOn(date).map(function (e) { return esc(e.clientName); }).join(' + ') + ')</span></li>';
    }).join('');
  }

  function viewInventory() {
    var short = shortages(null);
    var cats = T.INV_CATEGORIES.filter(function (c) { return data.inventory.some(function (i) { return i.category === c; }); });
    data.inventory.forEach(function (i) { if (cats.indexOf(i.category) === -1) cats.push(i.category); });
    var html = (short.length ? '<div class="avail avail--busy avail--block">' + ICONS.alert + '<div><strong>Stock insuffisant sur ' + plural(Object.keys(short.reduce(function (m, x) { m[x.date] = 1; return m; }, {})).length, 'jour') + ' à venir</strong><ul>' + shortageList(short) + '</ul><span>Prévoyez une location, ou modifiez le matériel réservé dans la fiche des événements.</span></div></div>' : '') +
      '<div class="toolbar"><p class="muted">Ce que vous possédez. « Réservé au maximum » montre le jour à venir le plus chargé.</p>' +
      '<button class="btn btn--primary btn--sm" data-action="item-new">' + icon('plus') + ' Ajouter un article</button></div>';
    if (!data.inventory.length) return html + '<section class="card">' + empty('Aucun article en stock.') + '</section>';
    cats.forEach(function (cat) {
      var list = data.inventory.filter(function (i) { return i.category === cat; });
      html += '<section class="card card--flush"><header class="card__head card__head--pad"><h3>' + esc(cat) + '</h3></header><ul class="rows rows--big">' + list.map(function (it) {
        var peak = itemPeak(it.id);
        var pct = it.qty ? Math.min(100, Math.round(peak.qty / it.qty * 100)) : (peak.qty ? 100 : 0);
        var over = peak.qty > it.qty;
        return '<li><button class="row" data-action="item-open" data-id="' + it.id + '"><div class="row__main"><strong>' + esc(it.name) + '</strong>' +
          '<span>' + (peak.qty ? 'Réservé au maximum : ' + peak.qty + ' le ' + U.formatDate(peak.date, { day: 'numeric', month: 'short' }) : 'Aucune réservation à venir') + '</span></div>' +
          '<div class="row__money"><div class="row__amounts"><span>' + it.qty + '</span><small>en stock</small></div>' +
          '<div class="progress' + (over ? ' progress--over' : '') + '"><span style="width:' + pct + '%"></span></div>' +
          (over ? '<small class="due">Il en manque ' + (peak.qty - it.qty) + '</small>' : '<small class="muted">' + (peak.qty ? pct + ' % utilisé au maximum' : 'Disponible') + '</small>') + '</div></button></li>';
      }).join('') + '</ul></section>';
    });
    return html;
  }

  function openItem(id) {
    var it = id ? itemById(id) : null;
    var v = it || { id: '', name: '', category: 'Mobilier', qty: '', rule: '' };
    var uses = [];
    if (it) {
      activeEvents().filter(function (e) { return e.date >= TODAY; }).sort(byDate).forEach(function (e) {
        (e.equipment || []).forEach(function (q) { if (q.itemId === it.id) uses.push({ event: e, qty: q.qty }); });
      });
    }
    openSheet(
      '<header class="sheet__head"><div><p class="sheet__eyebrow">Matériel</p><h2>' + (it ? esc(it.name) : 'Ajouter un article') + '</h2></div>' + closeBtn() + '</header>' +
      '<form class="sheet__body" id="itemForm" novalidate data-id="' + esc(v.id) + '">' +
        '<div class="form-grid">' +
          field('Nom *', '<input name="name" required value="' + esc(v.name) + '" placeholder="Ex. Chaises dorées">', 'span-2') +
          field('Catégorie', '<select name="category">' + T.INV_CATEGORIES.map(function (c) { return '<option' + (c === v.category ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select>') +
          field('Quantité en stock', '<input name="qty" type="number" min="0" value="' + esc(v.qty) + '">') +
          field('Quantité habituelle par événement', '<select name="rule">' + T.INV_RULES.map(function (r) { return '<option value="' + r.id + '"' + (r.id === (v.rule || '') ? ' selected' : '') + '>' + esc(r.label) + '</option>'; }).join('') + '</select>', 'span-2') +
        '</div>' +
        (it ? '<h4 class="sub">Réservations à venir (' + uses.length + ')</h4>' + (uses.length ? '<ul class="lines">' + uses.map(function (u) {
          var total = reservedOn(it.id, u.event.date, null);
          return '<li class="line"><div class="line__main"><strong>' + esc(u.event.clientName) + '</strong><span>' + U.formatDate(u.event.date, { day: 'numeric', month: 'short', year: 'numeric' }) +
            (total > it.qty ? ' <span class="flag">' + icon('alert') + ' ' + total + ' réservés ce jour-là</span>' : '') + '</span></div><strong class="line__amount">' + u.qty + '</strong></li>';
        }).join('') + '</ul>' : '<p class="empty empty--sm">Aucune réservation à venir.</p>') : '') +
      '</form>' +
      '<footer class="sheet__foot">' +
        (it ? '<button class="btn btn--text btn--danger" data-action="item-delete" data-id="' + it.id + '">' + icon('trash') + ' Supprimer</button>' : '<span></span>') +
        '<button class="btn btn--primary" data-action="item-save">Enregistrer</button></footer>'
    );
    $('#itemForm').addEventListener('submit', function (e) { e.preventDefault(); actions['item-save'](); });
  }

  /* =========================================================
     FINANCES
     ========================================================= */
  function viewFinances() {
    var y = state.finYear;
    var evs = activeEvents().filter(function (e) { return +e.date.slice(0, 4) === y; });
    var done = evs.filter(function (e) { return e.date < TODAY; });
    var revenue = sum(evs, function (e) { return e.total; });
    var doneRevenue = sum(done, function (e) { return e.total; });
    var doneCost = sum(done, cost);
    var months = MONTHS.map(function (m, i) {
      var list = evs.filter(function (e) { return +e.date.slice(5, 7) === i + 1; });
      var past = list.length && list.every(function (e) { return e.date < TODAY; });
      return { label: m, count: list.length, revenue: sum(list, function (e) { return e.total; }), cost: sum(list, cost), past: past };
    });
    var maxRev = Math.max.apply(null, months.map(function (m) { return m.revenue; }).concat([1]));
    var cats = T.EXPENSE_CATEGORIES.map(function (c) {
      return { label: c, amount: sum(done, function (e) { return sum((e.expenses || []).filter(function (x) { return x.category === c; }), function (x) { return x.amount; }); }) };
    });
    cats.unshift({ label: 'Équipe', amount: sum(done, staffCost) });
    cats = cats.filter(function (c) { return c.amount; }).sort(function (a, b) { return b.amount - a.amount; });
    var maxCat = Math.max.apply(null, cats.map(function (c) { return c.amount; }).concat([1]));

    return '<div class="cal-toolbar"><div class="cal-nav"><button class="icon-btn" data-action="fin-prev" aria-label="Année précédente">' + ICONS.chevL + '</button><h2>' + y + '</h2>' +
        '<button class="icon-btn" data-action="fin-next" aria-label="Année suivante">' + ICONS.chevR + '</button></div></div>' +
      '<div class="kpis">' +
        '<div class="kpi kpi--static"><span class="kpi__label">Chiffre d\'affaires</span><strong class="kpi__value">' + U.formatDH(revenue) + '</strong><span class="kpi__sub">' + plural(evs.length, 'événement') + ' confirmés</span></div>' +
        '<div class="kpi kpi--static"><span class="kpi__label">Encaissé</span><strong class="kpi__value">' + U.formatDH(sum(evs, paid)) + '</strong><span class="kpi__sub">Reste ' + U.formatDH(sum(evs, remaining)) + '</span></div>' +
        '<div class="kpi kpi--static"><span class="kpi__label">Coûts</span><strong class="kpi__value">' + U.formatDH(doneCost) + '</strong><span class="kpi__sub">' + plural(done.length, 'événement réalisé', 'événements réalisés') + '</span></div>' +
        '<div class="kpi kpi--static kpi--alert"><span class="kpi__label">Bénéfice réalisé</span><strong class="kpi__value">' + U.formatDH(doneRevenue - doneCost) + '</strong><span class="kpi__sub">Marge de ' + marginPct(doneRevenue, doneCost) + ' % sur les événements réalisés</span></div>' +
      '</div>' +

      '<section class="card"><header class="card__head"><h3>Mois par mois</h3><span class="muted">Le bénéfice est calculé une fois les événements du mois passés</span></header>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Mois</th><th class="num">Événements</th><th class="num">Chiffre d\'affaires</th><th class="num">Coûts</th><th class="num">Bénéfice</th><th class="table__bar"></th></tr></thead><tbody>' +
        months.map(function (m) {
          if (!m.count) return '<tr class="is-empty"><td>' + m.label + '</td><td class="num">—</td><td class="num">—</td><td class="num">—</td><td class="num">—</td><td class="table__bar"></td></tr>';
          return '<tr><td>' + m.label + '</td><td class="num">' + m.count + '</td><td class="num">' + U.formatDH(m.revenue) + '</td><td class="num">' + (m.cost ? U.formatDH(m.cost) : '—') + '</td>' +
            '<td class="num">' + (m.past ? '<strong class="' + (m.revenue - m.cost < 0 ? 'due' : 'ok') + '">' + U.formatDH(m.revenue - m.cost) + '</strong>' : '<span class="muted">à venir</span>') + '</td>' +
            '<td class="table__bar"><div class="duo"><span style="width:' + Math.round(m.revenue / maxRev * 100) + '%"></span><i style="width:' + Math.round(m.cost / maxRev * 100) + '%"></i></div></td></tr>';
        }).join('') + '</tbody></table></div>' +
        '<div class="legend legend--inline"><span><i class="lg lg--rev"></i>Chiffre d\'affaires</span><span><i class="lg lg--cost"></i>Coûts</span></div>' +
      '</section>' +

      '<div class="grid-2">' +
        '<section class="card"><header class="card__head"><h3>Où part l\'argent</h3><span class="muted">Événements réalisés</span></header>' +
          (cats.length ? '<div class="src-rows">' + cats.map(function (c) {
            return '<div class="src-row src-row--compact"><span class="src-row__label">' + esc(c.label) + '</span><div class="src-row__bar"><span style="width:' + Math.round(c.amount / maxCat * 100) + '%"></span></div>' +
              '<span class="src-row__val"><b>' + U.formatDH(c.amount) + '</b> · ' + Math.round(c.amount / (doneCost || 1) * 100) + ' %</span></div>';
          }).join('') + '</div>' : empty('Aucune dépense enregistrée.')) +
        '</section>' +
        '<section class="card"><header class="card__head"><h3>Bénéfice par événement</h3><span class="muted">Les plus récents</span></header>' +
          (done.length ? '<ul class="rows">' + done.slice().sort(byDate).reverse().slice(0, 7).map(function (e) {
            var c = cost(e);
            return '<li><button class="row" data-action="open-event" data-id="' + e.id + '" data-tab="costs">' + dateBlock(e.date) +
              '<div class="row__main"><strong>' + esc(e.clientName) + '</strong><span>' + U.formatDH(e.total) + ' − ' + U.formatDH(c) + ' de coûts</span></div>' +
              '<div class="row__side"><span class="amount ' + (e.total - c < 0 ? 'due' : 'ok') + '">' + U.formatDH(e.total - c) + '</span><small>marge ' + marginPct(e.total, c) + ' %</small></div></button></li>';
          }).join('') + '</ul>' : empty('Aucun événement réalisé cette année.')) +
        '</section>' +
      '</div>';
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
          '<div class="span-2 form-actions"><button type="button" class="btn btn--primary btn--sm" data-action="save-settings">Enregistrer les coordonnées</button></div>' +
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
        '<div class="form-actions"><button class="btn btn--primary btn--sm" data-action="save-packages">Enregistrer les formules</button></div>' +
      '</section>' +

      '<section class="card"><header class="card__head"><h3>Services</h3></header>' +
        '<div class="editor-grid editor-grid--4">' + data.services.map(function (sv, i) {
          return '<div class="editor" data-svc="' + i + '">' + field('Titre', '<input data-k="title" value="' + esc(sv.title) + '">') +
            field('Description', '<textarea data-k="text" rows="5">' + esc(sv.text) + '</textarea>') + '</div>';
        }).join('') + '</div>' +
        '<div class="form-actions"><button class="btn btn--primary btn--sm" data-action="save-services">Enregistrer les services</button></div>' +
      '</section>' +

      '<section class="card"><header class="card__head"><h3>Galerie photos</h3>' +
        '<label class="btn btn--light btn--sm">' + icon('plus') + ' Ajouter des photos<input type="file" id="galleryUpload" accept="image/*" multiple hidden></label></header>' +
        '<div class="gal-edit">' + data.gallery.map(function (g, i) {
          return '<div class="gal-item" data-gal="' + i + '"><div class="gal-item__img tone-' + ((g.tone || i) % 8 + 1) + '">' +
            (g.src ? '<img src="' + esc(g.src) + '" alt="">' : '<span>Photo à venir</span>') +
            '<button class="icon-btn icon-btn--sm gal-item__del" data-action="gallery-remove" data-index="' + i + '" aria-label="Retirer la photo">' + ICONS.close + '</button></div>' +
            '<input data-k="caption" value="' + esc(g.caption) + '" placeholder="Légende"></div>';
        }).join('') + '</div>' +
        '<div class="form-actions"><button class="btn btn--primary btn--sm" data-action="save-gallery">Enregistrer les légendes</button></div>' +
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
    'open-event': function (el) { openEventForm(el.dataset.id, null, el.dataset.tab); },
    'new-request': function (el) { openRequestForm(el.dataset.date ? { date: el.dataset.date } : null); },
    'req-form-save': saveRequestForm,
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
        clientName: r.name, phone: r.phone, eventType: r.eventType, date: r.date, guests: r.guests, source: r.source || 'Autre',
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
      renderPayments(); showEvTab('pay');
    },
    'ev-del-payment': function (el) {
      draft.payments = draft.payments.filter(function (p) { return p.id !== el.dataset.id; });
      renderPayments(); showEvTab('pay');
    },
    'ev-save': saveEvent,
    'ev-tab': function (el) { showEvTab(el.dataset.tab); },
    'ev-menu-from-package': function () {
      var f = $('#eventForm').elements;
      var pkg = data.packages.filter(function (p) { return p.name === f.package.value; })[0];
      if (!pkg) { toast('Choisissez d\'abord une formule dans l\'onglet Détails.', true); return; }
      if (f.menu.value.trim() && !window.confirm('Remplacer le menu actuel par le contenu de la formule ' + pkg.name + ' ?')) return;
      f.menu.value = pkg.features.join('\n');
    },
    'ev-add-team': function () {
      var s = staffById($('#teamAdd').value);
      if (!s) return;
      draft.team.push({ staffId: s.id, pay: s.rate, paid: false });
      renderTeam(); renderCosts(); showEvTab('team');
    },
    'ev-del-team': function (el) { draft.team.splice(+el.dataset.index, 1); renderTeam(); renderCosts(); showEvTab('team'); },
    'ev-add-equip': function () {
      var qty = +$('#equipQty').value;
      var it = itemById($('#equipAdd').value);
      if (!it) return;
      if (!qty || qty <= 0) qty = suggestedQty(it, draftGuests());
      if (!qty) { toast('Indiquez une quantité.', true); $('#equipQty').focus(); return; }
      draft.equipment.push({ itemId: it.id, qty: qty });
      renderEquip(); showEvTab('equip');
    },
    'ev-del-equip': function (el) { draft.equipment.splice(+el.dataset.index, 1); renderEquip(); showEvTab('equip'); },
    'ev-suggest-equip': function () {
      var guests = draftGuests();
      if (!guests) { toast('Indiquez d\'abord le nombre d\'invités dans l\'onglet Détails.', true); return; }
      var n = 0;
      data.inventory.forEach(function (it) {
        var qty = suggestedQty(it, guests);
        if (!qty) return;
        var line = draft.equipment.filter(function (q) { return q.itemId === it.id; })[0];
        if (line) line.qty = qty; else draft.equipment.push({ itemId: it.id, qty: qty });
        n++;
      });
      renderEquip(); showEvTab('equip');
      toast(n ? 'Quantités proposées pour ' + guests + ' invités.' : 'Aucun article n\'a de quantité habituelle.');
    },
    'ev-add-expense': function () {
      var label = $('#expLabel').value.trim();
      var amount = +$('#expAmount').value;
      if (!amount || amount <= 0) { toast('Indiquez un montant.', true); $('#expAmount').focus(); return; }
      draft.expenses.push({ id: U.uid(), label: label || $('#expCat').value, category: $('#expCat').value, amount: amount, date: TODAY });
      renderCosts(); showEvTab('costs');
    },
    'ev-del-expense': function (el) {
      draft.expenses = draft.expenses.filter(function (x) { return x.id !== el.dataset.id; });
      renderCosts(); showEvTab('costs');
    },

    'staff-new': function () { openStaff(null); },
    'staff-open': function (el) { openStaff(el.dataset.id); },
    'staff-save': function () {
      var form = $('#staffForm');
      var f = form.elements;
      var name = f.name.value.trim();
      if (!name) { toast('Indiquez le nom.', true); f.name.focus(); return; }
      var s = staffById(form.dataset.id);
      if (!s) { s = { id: U.uid() }; data.staff.push(s); }
      s.name = name; s.phone = f.phone.value.trim(); s.role = f.role.value; s.rate = +f.rate.value || 0;
      closeSheet();
      commit('Équipe mise à jour.');
    },
    'staff-delete': function (el) {
      var s = staffById(el.dataset.id);
      var n = staffAssignments(el.dataset.id).length;
      if (!window.confirm('Supprimer ' + s.name + ' de l\'équipe ?' + (n ? ' Cette personne sera aussi retirée de ' + plural(n, 'événement') + '.' : ''))) return;
      data.staff = data.staff.filter(function (x) { return x.id !== el.dataset.id; });
      data.events.forEach(function (e) { e.team = (e.team || []).filter(function (t) { return t.staffId !== el.dataset.id; }); });
      closeSheet();
      commit('Personne supprimée.');
    },
    'staff-pay': function (el) {
      var s = staffById(el.dataset.id);
      var owed = staffOwed(s.id);
      if (!window.confirm('Marquer ' + U.formatDH(owed) + ' comme payés à ' + s.name + ' ?')) return;
      activeEvents().forEach(function (e) {
        if (e.date <= TODAY) (e.team || []).forEach(function (t) { if (t.staffId === s.id) t.paid = true; });
      });
      commit(s.name + ' : paie réglée.');
    },

    'item-new': function () { openItem(null); },
    'item-open': function (el) { openItem(el.dataset.id); },
    'item-save': function () {
      var form = $('#itemForm');
      var f = form.elements;
      var name = f.name.value.trim();
      if (!name) { toast('Indiquez le nom de l\'article.', true); f.name.focus(); return; }
      var it = itemById(form.dataset.id);
      if (!it) { it = { id: U.uid() }; data.inventory.push(it); }
      it.name = name; it.category = f.category.value; it.qty = +f.qty.value || 0; it.rule = f.rule.value;
      closeSheet();
      commit('Stock mis à jour.');
    },
    'item-delete': function (el) {
      var it = itemById(el.dataset.id);
      if (!window.confirm('Supprimer « ' + it.name + ' » du stock ? Il sera aussi retiré des événements.')) return;
      data.inventory = data.inventory.filter(function (x) { return x.id !== el.dataset.id; });
      data.events.forEach(function (e) { e.equipment = (e.equipment || []).filter(function (q) { return q.itemId !== el.dataset.id; }); });
      closeSheet();
      commit('Article supprimé.');
    },

    'fin-prev': function () { state.finYear--; render(); },
    'fin-next': function () { state.finYear++; render(); },
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
      data = T.store.reset(); normalize();
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

  /* ---------- thème clair / sombre ---------- */
  function isDark() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t) return t === 'dark';
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
  function renderThemeToggle() {
    var dark = isDark();
    $('#themeToggle').innerHTML = icon(dark ? 'sun' : 'moon') + (dark ? 'Mode clair' : 'Mode sombre');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#12161d' : '#f3f5f8');
  }
  actions['toggle-theme'] = function () {
    var next = isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('torrais_theme', next); } catch (e) { /* ignore */ }
    renderThemeToggle();
  };
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', function () { if ($('#themeToggle')) renderThemeToggle(); });
  }

  function findReq(id) { return data.requests.filter(function (r) { return r.id === id; })[0]; }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el || !actions[el.dataset.action]) return;
    if (el.tagName === 'A') return;
    e.preventDefault();
    actions[el.dataset.action](el);
  });

  document.addEventListener('change', function (e) {
    if (draft && e.target.dataset && e.target.dataset.teamPaid != null) { draft.team[+e.target.dataset.teamPaid].paid = e.target.checked; return; }
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
    if (e.target.id === 'reqSource') { state.reqSource = e.target.value; renderRequestList(); return; }
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
    var ds = e.target.dataset || {};
    if (draft && ds.teamPay != null) { draft.team[+ds.teamPay].pay = +e.target.value || 0; renderCosts(); renderProfit(); $('.line-total strong', $('#teamBox')).textContent = U.formatDH(staffCost(draft)); }
    if (draft && ds.eqQty != null) {
      draft.equipment[+ds.eqQty].qty = +e.target.value || 0;
      var st = $('[data-eq-status="' + ds.eqQty + '"]');
      if (st) st.innerHTML = equipStatus(draft.equipment[+ds.eqQty]);
    }
    if (e.target.id === 'reqSearch') { state.reqSearch = e.target.value; renderRequestList(); }
    if (e.target.id === 'clientSearch') { state.clientSearch = e.target.value; renderClientList(); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('#sheet').hidden) closeSheet();
  });

  // Une demande envoyée depuis le site (autre onglet) apparaît tout de suite
  window.addEventListener('storage', function (e) {
    if (e.key === T.KEY && authed) {
      data = T.store.fresh(); normalize();
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
    data = T.store.fresh(); normalize();
    renderThemeToggle();
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
