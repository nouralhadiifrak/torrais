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
    teamRole: '',
    teamSearch: '',
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
  ICONS.print = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/></svg>';
  ICONS.doc = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/></svg>';
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
    if (state.view === 'team') renderTeamList();
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
        (r.composition && r.composition.length ? '<h4 class="sub">Composition (simulateur du site)</h4><div class="compo">' + r.composition.map(function (l) {
          return '<div class="compo__line' + (l.included ? ' is-inc' : '') + '"><span>' + esc(l.label) + (l.detail ? ' <small>' + esc(l.detail) + '</small>' : '') + '</span><b>' + (l.included ? 'Inclus' : U.formatDH(l.min) + ' – ' + U.formatDH(l.max)) + '</b></div>';
        }).join('') + (r.estimate ? '<div class="compo__total"><span>Estimation montrée au client</span><b>' + U.formatDH(r.estimate.min) + ' – ' + U.formatDH(r.estimate.max) + '</b></div>' : '') + '</div>' : '') +
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
    var all = activeEvents();
    if (!all.length) return '<section class="card">' + empty('Aucun événement.') + '</section>';
    var upcoming = all.filter(function (e) { return e.date >= TODAY; }).sort(byDate);
    var past = all.filter(function (e) { return e.date < TODAY; }).sort(function (a, b) { return byDate(b, a); });
    function groups(list) {
      var html = '';
      var cur = '';
      list.forEach(function (e) {
        var ym = e.date.slice(0, 7);
        if (ym !== cur) {
          if (cur) html += '</ul></section>';
          var monthList = list.filter(function (x) { return x.date.slice(0, 7) === ym; });
          html += '<section class="card"><header class="card__head"><h3>' + MONTHS[+ym.slice(5, 7) - 1] + ' ' + ym.slice(0, 4) + '</h3><span class="muted">' +
            plural(monthList.length, 'événement') + ' · ' + U.formatDH(sum(monthList, function (x) { return x.total; })) + '</span></header><ul class="rows">';
          cur = ym;
        }
        html += eventRow(e);
      });
      return html + (cur ? '</ul></section>' : '');
    }
    return '<h3 class="list-title">À venir <span class="muted">· le plus proche en premier · ' + plural(upcoming.length, 'événement') + '</span></h3>' +
      (upcoming.length ? groups(upcoming) : '<section class="card">' + empty('Aucun événement à venir.') + '</section>') +
      (past.length ? '<details class="past-list"><summary>Événements passés (' + past.length + ') · le plus récent en premier</summary>' + groups(past) + '</details>' : '');
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
  var EV_TABS = [['details', 'Détails'], ['menu', 'Menu'], ['team', 'Équipe'], ['equip', 'Matériel'], ['costs', 'Dépenses'], ['pay', 'Paiements'], ['quote', 'Devis']];

  function openEventForm(id, prefill, tab) {
    var existing = id && data.events.filter(function (e) { return e.id === id; })[0];
    draft = existing ? JSON.parse(JSON.stringify(existing)) : Object.assign({
      id: null, source: 'WhatsApp', clientName: '', phone: '', eventType: 'Mariage', date: '', venue: '', guests: '', package: '', total: '',
      status: 'confirme', notes: '', payments: [], createdAt: TODAY
    }, prefill || {});
    ['payments', 'team', 'equipment', 'expenses'].forEach(function (k) { if (!draft[k]) draft[k] = []; });
    ['arrival', 'service', 'menu', 'menuNotes'].forEach(function (k) { if (draft[k] == null) draft[k] = ''; });
    draft.menuList = String(draft.menu || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
    draft.menuDetails = {};
    (draft.menuItems || []).forEach(function (m) {
      if (!m || !m.name) return;
      if (draft.menuList.map(dishKey).indexOf(dishKey(m.name)) === -1) draft.menuList.push(m.name);
      draft.menuDetails[dishKey(m.name)] = { qty: m.qty || '', kg: m.kg || '', model: m.model || '', shape: m.shape || '' };
    });
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
          '<div id="menuBox"></div>' +
          field('Demandes particulières', '<textarea name="menuNotes" rows="3" placeholder="Allergies, menus spéciaux, tables à part…">' + esc(draft.menuNotes) + '</textarea>') +
        '</div>' +
        '<div class="tabpanel" data-panel="team" id="teamBox"></div>' +
        '<div class="tabpanel" data-panel="equip" id="equipBox"></div>' +
        '<div class="tabpanel" data-panel="costs" id="costsBox"></div>' +
        '<div class="tabpanel" data-panel="pay" id="paymentsBox"></div>' +
        '<div class="tabpanel" data-panel="quote" id="quoteBox"></div>' +
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
    renderMenu();
    renderTeam();
    renderEquip();
    renderCosts();
    renderPayments();
    renderQuote();
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
    var counts = { menu: draft.menuList.length, team: draft.team.length, equip: draft.equipment.length, costs: draft.expenses.length, pay: draft.payments.length, quote: draft.quote ? draft.quote.lines.length : 0 };
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

  /* ----- onglet Menu : choix des plats ----- */
  function dishKey(n) { return String(n).trim().toLowerCase(); }
  function renderMenu() {
    var chosen = draft.menuList.map(dishKey);
    var known = data.dishes.map(function (d) { return dishKey(d.name); });
    var extra = draft.menuList.filter(function (n) { return known.indexOf(dishKey(n)) === -1; });
    var html = '<div class="menu-head"><h4 class="sub">Choisir les plats</h4>' +
      '<button type="button" class="link" data-action="ev-menu-from-package">Reprendre la formule</button></div>';
    T.DISH_CATEGORIES.forEach(function (cat) {
      var list = data.dishes.filter(function (d) { return d.category === cat; });
      if (cat === 'Autres') list = list.concat(extra.map(function (n) { return { name: n, category: 'Autres' }; }));
      if (!list.length) return;
      var n = list.filter(function (d) { return chosen.indexOf(dishKey(d.name)) !== -1; }).length;
      html += '<div class="dish-group"><p class="dish-group__title"><span>' + esc(cat) + '</span>' + (n ? ' <b>' + n + '</b>' : '') + '</p><div class="pick">' +
        list.map(function (d) {
          return '<label class="pick__opt"><input type="checkbox" data-dish="' + esc(d.name) + '"' + (chosen.indexOf(dishKey(d.name)) !== -1 ? ' checked' : '') + '><span>' + esc(d.name) + '</span></label>';
        }).join('') + '</div></div>';
    });
    html += '<div class="add-row add-row--dish">' +
      '<input id="dishName" placeholder="Autre plat (ex. Pastilla au lait)" aria-label="Nom du plat">' +
      '<select id="dishCat" aria-label="Catégorie">' + T.DISH_CATEGORIES.map(function (c) { return '<option' + (c === 'Plats' ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select>' +
      '<button type="button" class="btn btn--light btn--sm" data-action="ev-add-dish">' + icon('plus') + ' Ajouter</button></div>' +
      '<p class="hint">Un plat ajouté ici reste dans la liste pour les prochains événements.</p>' +
      '<div id="menuChosen"></div>';
    $('#menuBox').innerHTML = html;
    renderMenuChosen();
  }
  var DISH_MODELS = ['Grand plateau', 'Plateau moyen', 'Plat individuel', 'Buffet', 'Verrine', 'Pièce montée', 'Tajine en terre', 'Panier', 'Corbeille'];
  var DISH_SHAPES = ['Ronde', 'Carrée', 'Rectangulaire', 'Ovale', 'Cœur', 'Individuelle', 'Étagée'];
  function dishDetail(name) {
    var k = dishKey(name);
    if (!draft.menuDetails[k]) draft.menuDetails[k] = { qty: '', kg: '', model: '', shape: '' };
    return draft.menuDetails[k];
  }
  function dishSummary(m) {
    var parts = [];
    if (m.qty) parts.push(m.qty + ' pièce' + (+m.qty > 1 ? 's' : ''));
    if (m.kg) parts.push(String(m.kg).replace('.', ',') + ' kg');
    if (m.model) parts.push(m.model);
    if (m.shape) parts.push('forme ' + m.shape.toLowerCase());
    return parts.join(' · ');
  }
  function menuItemsOf(d) {
    return d.menuList.map(function (n) { var x = dishDetail(n); return { name: n, qty: x.qty, kg: x.kg, model: x.model, shape: x.shape }; });
  }
  function renderMenuChosen() {
    var box = $('#menuChosen');
    if (!box) return;
    box.innerHTML = '<h4 class="sub">Menu choisi (' + draft.menuList.length + ')</h4>' +
      (draft.menuList.length ? '<p class="hint">Pour chaque plat : le nombre, les kilos, le modèle de présentation et la forme. Tout est facultatif.</p>' +
      '<datalist id="dishModels">' + DISH_MODELS.map(function (m) { return '<option value="' + esc(m) + '">'; }).join('') + '</datalist>' +
      '<datalist id="dishShapes">' + DISH_SHAPES.map(function (m) { return '<option value="' + esc(m) + '">'; }).join('') + '</datalist>' +
      '<ol class="menu-list menu-list--detail">' + draft.menuList.map(function (n, i) {
        var x = dishDetail(n);
        var k = esc(dishKey(n));
        return '<li><div class="menu-list__row"><span class="menu-list__name">' + esc(n) + '</span><span class="menu-list__tools">' +
          '<button type="button" class="icon-btn icon-btn--sm menu-list__up" data-action="ev-dish-up" data-index="' + i + '" aria-label="Monter"' + (i ? '' : ' disabled') + '>' + ICONS.chevL + '</button>' +
          '<button type="button" class="icon-btn icon-btn--sm" data-action="ev-dish-remove" data-index="' + i + '" aria-label="Retirer ' + esc(n) + '">' + ICONS.close + '</button></span></div>' +
          '<div class="dish-spec">' +
            '<label><span>Nombre</span><input type="number" min="0" inputmode="numeric" placeholder="—" value="' + esc(x.qty) + '" data-dish-key="' + k + '" data-dish-field="qty"></label>' +
            '<label><span>Kilos</span><input type="number" min="0" step="0.5" inputmode="decimal" placeholder="—" value="' + esc(x.kg) + '" data-dish-key="' + k + '" data-dish-field="kg"></label>' +
            '<label><span>Modèle</span><input list="dishModels" placeholder="Ex. Grand plateau" value="' + esc(x.model) + '" data-dish-key="' + k + '" data-dish-field="model"></label>' +
            '<label><span>Forme</span><input list="dishShapes" placeholder="Ex. Ronde" value="' + esc(x.shape) + '" data-dish-key="' + k + '" data-dish-field="shape"></label>' +
          '</div></li>';
      }).join('') + '</ol>' : '<p class="empty empty--sm">Cochez les plats ci-dessus.</p>');
    var tab = $('#evTabs [data-tab="menu"]');
    if (tab) tab.innerHTML = 'Menu' + (draft.menuList.length ? '<b>' + draft.menuList.length + '</b>' : '');
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
      '<details class="new-item"' + (free.length ? '' : ' open') + '><summary>' + icon('plus') + ' Article qui n\'est pas dans la liste</summary>' +
        '<div class="add-row add-row--newitem">' +
          '<input id="newEqName" placeholder="Nom (ex. Lustres en cristal)" aria-label="Nom du nouvel article">' +
          '<select id="newEqCat" aria-label="Catégorie">' + T.INV_CATEGORIES.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('') + '</select>' +
          '<input type="number" id="newEqQty" min="1" placeholder="Qté" aria-label="Quantité pour cet événement">' +
          '<button type="button" class="btn btn--light btn--sm" data-action="ev-new-equip">' + icon('plus') + ' Créer et ajouter</button>' +
        '</div><p class="hint">L\'article est aussi ajouté à votre stock (page Matériel), avec cette quantité.</p></details>' +
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

  /* ----- onglet Devis ----- */
  var UNITS = ['pers', 'table', 'unité', 'forfait', 'kg', 'jour'];
  var DEFAULT_TERMS = [
    'Le nombre définitif d\'invités est confirmé au plus tard 10 jours avant l\'événement. Toute personne en plus est facturée au prix par personne du devis.',
    'L\'acompte versé à la signature confirme la réservation de la date. Il n\'est pas remboursable en cas d\'annulation à moins de 30 jours de l\'événement.',
    'Le solde est réglé au plus tard le jour de l\'événement, avant le début du service.',
    'Le matériel prêté (vaisselle, nappage, mobilier) reste la propriété du traiteur. Toute pièce cassée ou manquante est facturée.',
    'L\'accès à la salle, l\'eau et l\'électricité sur place sont à la charge du client.'
  ].join('\n');
  function quoteNumber() {
    data.quoteSeq = (data.quoteSeq || 0) + 1;
    return 'D-' + NOW.getFullYear() + '-' + String(data.quoteSeq).padStart(3, '0');
  }
  function freshQuote() {
    var g = draftGuests();
    var t = draftTotal();
    var f = $('#eventForm');
    var pkg = f ? f.elements.package.value : draft.package;
    var type = f ? f.elements.eventType.value : draft.eventType;
    var lines = [];
    if (t || g) {
      lines.push({ label: pkg ? 'Formule ' + pkg : 'Prestation traiteur — ' + type, detail: 'Repas complet, service à table, vaisselle et nappage', qty: g || 1, unit: g ? 'pers' : 'forfait', price: g && t ? Math.round(t / g) : t });
    } else {
      lines.push({ label: 'Prestation traiteur — ' + type, detail: 'Repas complet, service à table, vaisselle et nappage', qty: 1, unit: 'pers', price: 0 });
    }
    return { number: quoteNumber(), date: TODAY, validity: 30, lines: lines, discount: 0, vat: 0, deposit: 30, clientAddress: '', clientId: '', showMenu: true, showEquip: true, terms: DEFAULT_TERMS };
  }
  function quoteTotals(q) {
    var sub = sum(q.lines, function (l) { return (+l.qty || 0) * (+l.price || 0); });
    var ht = Math.max(0, sub - (+q.discount || 0));
    var vat = Math.round(ht * (+q.vat || 0) / 100);
    var ttc = ht + vat;
    return { sub: sub, ht: ht, vat: vat, ttc: ttc, deposit: Math.round(ttc * (+q.deposit || 0) / 100) };
  }
  function renderQuote() {
    var box = $('#quoteBox');
    if (!box) return;
    if (!draft.quote) {
      box.innerHTML = '<div class="quote-empty">' + icon('doc') + '<div><strong>Préparez un devis détaillé pour ce client</strong>' +
        '<p>Il reprend la formule, le prix par personne, le menu et le matériel. Vous pourrez l\'envoyer sur WhatsApp ou l\'imprimer en devis ou en contrat à signer.</p>' +
        '<button type="button" class="btn btn--primary btn--sm" data-action="q-create">Créer le devis</button></div></div>';
      return;
    }
    var q = draft.quote;
    var opts = data.pricing.options;
    box.innerHTML =
      '<div class="quote-head"><div><small>Devis n°</small><strong>' + esc(q.number) + '</strong></div>' +
        '<label class="field field--inline"><span>Date</span><input type="date" data-q="date" value="' + esc(q.date) + '"></label>' +
        '<label class="field field--inline"><span>Valable (jours)</span><input type="number" min="1" data-q="validity" value="' + esc(q.validity) + '"></label></div>' +
      '<h4 class="sub">Lignes du devis</h4>' +
      '<div class="qlines">' +
        
        q.lines.map(function (l, i) {
          return '<div class="qline">' +
            '<div class="qline__label"><input data-ql="' + i + '" data-k="label" value="' + esc(l.label) + '" placeholder="Désignation (ex. Formule Prestige)" aria-label="Désignation">' +
              '<input class="qline__detail" data-ql="' + i + '" data-k="detail" value="' + esc(l.detail || '') + '" placeholder="Détail (facultatif)" aria-label="Détail"></div>' +
            '<label class="qf"><span>Qté</span><input type="number" min="0" data-ql="' + i + '" data-k="qty" value="' + esc(l.qty) + '"></label>' +
            '<label class="qf"><span>Unité</span><select data-ql="' + i + '" data-k="unit">' + UNITS.concat(UNITS.indexOf(l.unit) === -1 && l.unit ? [l.unit] : []).map(function (u) { return '<option' + (u === l.unit ? ' selected' : '') + '>' + esc(u) + '</option>'; }).join('') + '</select></label>' +
            '<label class="qf"><span>Prix unit. (DH)</span><input type="number" min="0" step="10" data-ql="' + i + '" data-k="price" value="' + esc(l.price) + '"></label>' +
            '<strong class="qline__amount" data-ql-amount="' + i + '">' + U.formatDH((+l.qty || 0) * (+l.price || 0)) + '</strong>' +
            '<button type="button" class="icon-btn icon-btn--sm" data-action="q-del-line" data-index="' + i + '" aria-label="Supprimer la ligne">' + ICONS.close + '</button></div>';
        }).join('') +
      '</div>' +
      '<div class="add-row add-row--quote">' +
        '<select id="qOption" aria-label="Ajouter une prestation"><option value="">Ajouter une prestation du simulateur…</option>' +
          opts.map(function (o, i) { return '<option value="' + i + '">' + esc(o.group + ' · ' + o.name) + '</option>'; }).join('') + '</select>' +
        '<button type="button" class="btn btn--light btn--sm" data-action="q-add-option">' + icon('plus') + ' Ajouter</button>' +
        '<button type="button" class="btn btn--light btn--sm" data-action="q-add-line">' + icon('plus') + ' Ligne libre</button>' +
      '</div>' +
      '<div class="quote-grid">' +
        '<div class="form-grid">' +
          field('Remise (DH)', '<input type="number" min="0" step="100" data-q="discount" value="' + esc(q.discount) + '">') +
          field('TVA', '<select data-q="vat">' + [0, 10, 20].map(function (v) { return '<option value="' + v + '"' + (+q.vat === v ? ' selected' : '') + '>' + (v ? v + ' %' : 'Sans TVA') + '</option>'; }).join('') + '</select>') +
          field('Acompte à la signature', '<select data-q="deposit">' + [0, 20, 30, 40, 50].map(function (v) { return '<option value="' + v + '"' + (+q.deposit === v ? ' selected' : '') + '>' + (v ? v + ' %' : 'Aucun') + '</option>'; }).join('') + '</select>') +
          field('CIN du client', '<input data-q="clientId" value="' + esc(q.clientId) + '" placeholder="Pour le contrat">') +
          field('Adresse du client', '<input data-q="clientAddress" value="' + esc(q.clientAddress) + '" placeholder="Pour le contrat">', 'span-2') +
        '</div>' +
        '<div class="quote-totals" id="quoteTotals"></div>' +
      '</div>' +
      '<div class="quote-checks">' +
        '<label class="line__check"><input type="checkbox" data-q="showMenu"' + (q.showMenu ? ' checked' : '') + '><span>Afficher le menu (' + draft.menuList.length + ' plats)</span></label>' +
        '<label class="line__check"><input type="checkbox" data-q="showEquip"' + (q.showEquip ? ' checked' : '') + '><span>Afficher le matériel fourni (' + draft.equipment.length + ')</span></label>' +
      '</div>' +
      field('Conditions (une par ligne — elles deviennent les articles du contrat)', '<textarea data-q="terms" rows="6">' + esc(q.terms) + '</textarea>') +
      '<div class="quote-actions">' +
        '<button type="button" class="btn btn--wa" data-action="q-whatsapp">' + icon('whatsapp') + ' Envoyer par WhatsApp</button>' +
        '<button type="button" class="btn btn--light" data-action="q-print" data-mode="devis">' + icon('print') + ' Imprimer le devis</button>' +
        '<button type="button" class="btn btn--light" data-action="q-print" data-mode="contrat">' + icon('doc') + ' Imprimer en contrat</button>' +
      '</div>' +
      '<p class="hint">L\'impression ouvre une page prête à imprimer ou à enregistrer en PDF (choisissez « Enregistrer au format PDF »).</p>';
    renderQuoteTotals();
  }
  function renderQuoteTotals() {
    var el = $('#quoteTotals');
    if (!el || !draft.quote) return;
    var q = draft.quote;
    var t = quoteTotals(q);
    var price = draftTotal();
    el.innerHTML =
      '<div><span>Sous-total</span><strong>' + U.formatDH(t.sub) + '</strong></div>' +
      (+q.discount ? '<div><span>Remise</span><strong>− ' + U.formatDH(q.discount) + '</strong></div>' : '') +
      (+q.vat ? '<div><span>Total HT</span><strong>' + U.formatDH(t.ht) + '</strong></div><div><span>TVA ' + q.vat + ' %</span><strong>' + U.formatDH(t.vat) + '</strong></div>' : '') +
      '<div class="quote-totals__ttc"><span>Total' + (+q.vat ? ' TTC' : '') + '</span><strong>' + U.formatDH(t.ttc) + '</strong></div>' +
      (+q.deposit ? '<div><span>Acompte ' + q.deposit + ' %</span><strong>' + U.formatDH(t.deposit) + '</strong></div>' : '') +
      (t.ttc !== price ? '<p class="quote-totals__warn">Le prix de l\'événement est de ' + U.formatDH(price) + '.<button type="button" class="link" data-action="q-sync">Utiliser ' + U.formatDH(t.ttc) + ' comme prix</button></p>' : '<p class="quote-totals__ok">Identique au prix de l\'événement.</p>');
    var tab = $('#evTabs [data-tab="quote"]');
    if (tab) tab.innerHTML = 'Devis<b>' + q.lines.length + '</b>';
  }

  /* chiffres en lettres (pour le contrat) */
  function numberWords(n) {
    n = Math.round(+n || 0);
    if (n === 0) return 'zéro';
    var U1 = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
    var D = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];
    function below100(x) {
      if (x <= 16) return U1[x];
      if (x < 20) return 'dix-' + U1[x - 10];
      var d = Math.floor(x / 10), u = x % 10;
      if (d === 7 || d === 9) { var base = d === 7 ? 'soixante' : 'quatre-vingt'; var r = x - (d === 7 ? 60 : 80); return base + (r === 1 && d === 7 ? ' et ' : '-') + below100(r); }
      if (d === 8) return 'quatre-vingt' + (u ? '-' + U1[u] : 's');
      return D[d] + (u === 1 ? ' et un' : u ? '-' + U1[u] : '');
    }
    function below1000(x) {
      var c = Math.floor(x / 100), r = x % 100;
      var out = c ? (c === 1 ? 'cent' : U1[c] + ' cent' + (r ? '' : 's')) : '';
      return (out + (r ? (out ? ' ' : '') + below100(r) : '')).trim();
    }
    var parts = [];
    var m = Math.floor(n / 1000000), k = Math.floor(n % 1000000 / 1000), r = n % 1000;
    if (m) parts.push(m === 1 ? 'un million' : below1000(m) + ' millions');
    if (k) parts.push(k === 1 ? 'mille' : below1000(k).replace(/cents$/, 'cent') + ' mille');
    if (r) parts.push(below1000(r));
    return parts.join(' ');
  }

  function quoteContext() {
    var f = $('#eventForm').elements;
    return {
      client: f.clientName.value.trim() || 'Client', phone: f.phone.value.trim(), type: f.eventType.value, date: f.date.value,
      venue: f.venue.value.trim(), guests: +f.guests.value || 0, pkg: f.package.value, arrival: f.arrival.value, service: f.service.value,
      menuNotes: f.menuNotes.value.trim()
    };
  }
  function quoteLineText(l) {
    var amount = (+l.qty || 0) * (+l.price || 0);
    return l.label + (l.detail ? ' (' + l.detail + ')' : '') + ' : ' + (l.unit === 'forfait' && +l.qty === 1 ? '' : l.qty + ' ' + l.unit + ' × ' + U.formatDH(l.price) + ' = ') + U.formatDH(amount);
  }
  function quoteWhatsappText() {
    var q = draft.quote, c = quoteContext(), t = quoteTotals(q), st = data.settings;
    var out = [];
    out.push('Bonjour ' + c.client + ',');
    out.push('Voici votre devis ' + (st.businessName || 'TORRAIS EVENT') + ' n° ' + q.number + ' :');
    out.push('');
    out.push('*' + c.type + (c.date ? ' — ' + weekdayDate(c.date) : '') + '*');
    if (c.venue) out.push('Lieu : ' + c.venue);
    if (c.guests) out.push('Invités : ' + c.guests);
    out.push('');
    out.push('*Détail*');
    q.lines.forEach(function (l) { out.push('• ' + quoteLineText(l)); });
    if (q.showMenu && draft.menuList.length) {
      out.push('');
      out.push('*Menu*');
      menuItemsOf(draft).forEach(function (m) { var d = dishSummary(m); out.push('• ' + m.name + (d ? ' — ' + d : '')); });
    }
    out.push('');
    out.push('Sous-total : ' + U.formatDH(t.sub));
    if (+q.discount) out.push('Remise : − ' + U.formatDH(q.discount));
    if (+q.vat) out.push('TVA ' + q.vat + ' % : ' + U.formatDH(t.vat));
    out.push('*Total' + (+q.vat ? ' TTC' : '') + ' : ' + U.formatDH(t.ttc) + '*');
    if (+q.deposit) out.push('Acompte à la réservation (' + q.deposit + ' %) : ' + U.formatDH(t.deposit));
    out.push('');
    out.push('Devis valable ' + q.validity + ' jours.');
    out.push('Merci pour votre confiance — ' + (st.owner || '') + ', ' + (st.businessName || 'TORRAIS EVENT') + ' · ' + U.formatPhone(st.phone));
    return out.join('\n');
  }

  function quoteDocument(mode) {
    var q = draft.quote, c = quoteContext(), t = quoteTotals(q), st = data.settings;
    var contract = mode === 'contrat';
    var logo = new URL('../assets/img/brand/logo.webp', window.location.href).href;
    var paid = sum(draft.payments, function (x) { return x.amount; });
    var until = U.iso(new Date(U.parseISO(q.date).getTime() + (+q.validity || 30) * 86400000));
    var terms = String(q.terms || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
    var legal = [st.ice ? 'ICE ' + st.ice : '', st.rc ? 'RC ' + st.rc : '', st.idf ? 'IF ' + st.idf : '', st.patente ? 'Patente ' + st.patente : ''].filter(Boolean).join(' · ');
    var menu = q.showMenu ? menuItemsOf(draft) : [];
    var equip = q.showEquip ? draft.equipment.filter(function (x) { return +x.qty > 0 && itemById(x.itemId); }) : [];
    var h = function (x) { return esc(x == null ? '' : String(x)); };
    var info = [['Client', c.client], ['Téléphone', U.formatPhone(c.phone)], q.clientId ? ['CIN', q.clientId] : null, q.clientAddress ? ['Adresse', q.clientAddress] : null].filter(Boolean);
    var evInfo = [['Événement', c.type], ['Date', c.date ? weekdayDate(c.date) : 'À définir'], ['Lieu', c.venue || 'À définir'], ['Invités', c.guests || '—'],
      c.service ? ['Début du service', c.service.replace(':', 'h')] : null, c.arrival ? ['Arrivée de l\'équipe', c.arrival.replace(':', 'h')] : null].filter(Boolean);
    var kv = function (rows) { return rows.map(function (r) { return '<div><span>' + h(r[0]) + '</span><strong>' + h(r[1]) + '</strong></div>'; }).join(''); };

    var body = '<header class="top"><img src="' + logo + '" alt="' + h(st.businessName || 'TORRAIS EVENT') + '">' +
      '<div class="biz"><strong>' + h(st.businessName || 'TORRAIS EVENT') + '</strong><span>Traiteur · Tyafer · Buffet · Décoration</span>' +
      '<span>' + h(st.address || st.city || '') + '</span><span>Tél. ' + h(U.formatPhone(st.phone)) + (st.email ? ' · ' + h(st.email) : '') + '</span>' + (legal ? '<span>' + h(legal) + '</span>' : '') + '</div>' +
      '<div class="doc"><h1>' + (contract ? 'Contrat de prestation' : 'Devis') + '</h1><span>N° ' + h(q.number) + '</span><span>Du ' + h(U.formatDate(q.date)) + '</span>' +
      (contract ? '' : '<span>Valable jusqu\'au ' + h(U.formatDate(until)) + '</span>') + '</div></header>';

    if (contract) {
      body += '<p class="parties"><strong>Entre les soussignés :</strong><br>' + h(st.businessName || 'TORRAIS EVENT') + ', représenté par ' + h(st.owner || 'son gérant') + ', ci-après « le Traiteur »,<br>' +
        'et ' + h(c.client) + (q.clientId ? ', CIN ' + h(q.clientId) : '') + (q.clientAddress ? ', demeurant ' + h(q.clientAddress) : '') + ', ci-après « le Client ».<br>Il a été convenu ce qui suit.</p>';
    }
    body += '<section class="two"><div class="box"><h2>Client</h2>' + kv(info) + '</div><div class="box"><h2>Événement</h2>' + kv(evInfo) + '</div></section>';
    if (contract) body += '<h3 class="art">Article 1 — Objet</h3><p>Le Traiteur s\'engage à assurer la prestation décrite ci-dessous pour l\'événement du Client, selon le détail et les prix suivants.</p>';

    body += '<table class="lines"><thead><tr><th>Désignation</th><th class="r">Qté</th><th>Unité</th><th class="r">Prix unitaire</th><th class="r">Montant</th></tr></thead><tbody>' +
      q.lines.map(function (l) {
        return '<tr><td><strong>' + h(l.label) + '</strong>' + (l.detail ? '<small>' + h(l.detail) + '</small>' : '') + '</td><td class="r">' + h(l.qty) + '</td><td>' + h(l.unit) + '</td><td class="r">' + h(U.formatDH(l.price)) + '</td><td class="r">' + h(U.formatDH((+l.qty || 0) * (+l.price || 0))) + '</td></tr>';
      }).join('') + '</tbody></table>';

    body += '<section class="sum"><div class="words">Arrêté' + (contract ? ' le présent contrat' : ' le présent devis') + ' à la somme de <strong>' + h(numberWords(t.ttc)) + ' dirhams</strong>' + (+q.vat ? ' TTC' : '') + '.</div><div class="tot">' +
      '<div><span>Sous-total</span><strong>' + h(U.formatDH(t.sub)) + '</strong></div>' +
      (+q.discount ? '<div><span>Remise</span><strong>− ' + h(U.formatDH(q.discount)) + '</strong></div>' : '') +
      (+q.vat ? '<div><span>Total HT</span><strong>' + h(U.formatDH(t.ht)) + '</strong></div><div><span>TVA ' + h(q.vat) + ' %</span><strong>' + h(U.formatDH(t.vat)) + '</strong></div>' : '') +
      '<div class="big"><span>Total' + (+q.vat ? ' TTC' : '') + '</span><strong>' + h(U.formatDH(t.ttc)) + '</strong></div>' +
      (+q.deposit ? '<div><span>Acompte à la signature (' + h(q.deposit) + ' %)</span><strong>' + h(U.formatDH(t.deposit)) + '</strong></div>' : '') +
      (paid ? '<div><span>Déjà versé</span><strong>' + h(U.formatDH(paid)) + '</strong></div><div><span>Reste à payer</span><strong>' + h(U.formatDH(Math.max(0, t.ttc - paid))) + '</strong></div>' : '') +
      '</div></section>';

    var art = 2;
    if (menu.length) {
      body += (contract ? '<h3 class="art">Article ' + (art++) + ' — Menu</h3>' : '<h2 class="sec">Menu</h2>') +
        '<table class="menu"><thead><tr><th>Plat</th><th class="r">Nombre</th><th class="r">Kilos</th><th>Modèle</th><th>Forme</th></tr></thead><tbody>' +
        menu.map(function (m) { return '<tr><td>' + h(m.name) + '</td><td class="r">' + h(m.qty || '—') + '</td><td class="r">' + h(m.kg ? String(m.kg).replace('.', ',') + ' kg' : '—') + '</td><td>' + h(m.model || '—') + '</td><td>' + h(m.shape || '—') + '</td></tr>'; }).join('') +
        '</tbody></table>' + (c.menuNotes ? '<p class="note"><strong>Demandes particulières :</strong> ' + h(c.menuNotes) + '</p>' : '');
    }
    if (equip.length) {
      body += (contract ? '<h3 class="art">Article ' + (art++) + ' — Matériel fourni</h3>' : '<h2 class="sec">Matériel fourni</h2>') +
        '<ul class="equip">' + equip.map(function (x) { return '<li><span>' + h(itemById(x.itemId).name) + '</span><strong>' + h(x.qty) + '</strong></li>'; }).join('') + '</ul>';
    }
    if (contract) {
      body += '<h3 class="art">Article ' + (art++) + ' — Prix et paiement</h3><p>Le prix total de la prestation est de <strong>' + h(U.formatDH(t.ttc)) + '</strong>' + (+q.vat ? ' TTC' : '') + '.' +
        (+q.deposit ? ' Un acompte de ' + h(q.deposit) + ' %, soit ' + h(U.formatDH(t.deposit)) + ', est versé à la signature du présent contrat.' : '') +
        (paid ? ' Le Client a déjà versé ' + h(U.formatDH(paid)) + '.' : '') + '</p>';
      terms.forEach(function (x) { body += '<h3 class="art">Article ' + (art++) + '</h3><p>' + h(x) + '</p>'; });
      body += '<p class="place">Fait à ' + h(st.city || 'Casablanca') + ', le ' + h(U.formatDate(TODAY)) + ', en deux exemplaires.</p>' +
        '<section class="sign"><div><strong>Le Traiteur</strong><span>' + h(st.owner || '') + ' — ' + h(st.businessName || '') + '</span><em>Signature et cachet</em></div>' +
        '<div><strong>Le Client</strong><span>' + h(c.client) + '</span><em>Signature précédée de « Lu et approuvé »</em></div></section>';
    } else {
      if (terms.length) body += '<h2 class="sec">Conditions</h2><ol class="terms">' + terms.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ol>';
      body += '<section class="sign"><div><strong>' + h(st.businessName || 'TORRAIS EVENT') + '</strong><em>Signature et cachet</em></div><div><strong>Bon pour accord — le Client</strong><em>Date et signature</em></div></section>';
    }
    body += '<footer class="foot">' + h(st.businessName || 'TORRAIS EVENT') + ' · ' + h(st.city || '') + ' · ' + h(U.formatPhone(st.phone)) + (st.instagram ? ' · ' + h(String(st.instagram).replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')) : '') + '</footer>';

    var css = '@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:Inter,system-ui,sans-serif;color:#2b2622;font-size:10pt;line-height:1.45;margin:0;background:#fff}' +
      '.bar{position:sticky;top:0;display:flex;gap:8px;justify-content:center;padding:10px;background:#16130f}.bar button{font:inherit;font-weight:600;padding:9px 18px;border-radius:8px;border:0;cursor:pointer;background:#c9a45c;color:#16130f}.bar button+button{background:#3a332b;color:#f4ead7}' +
      '.page{max-width:186mm;margin:0 auto;padding:18px 0}' +
      '.top{display:grid;grid-template-columns:auto 1fr auto;gap:18px;align-items:center;background:#16130f;color:#f4ead7;border-radius:10px;padding:14px 18px}.top img{width:110px;height:auto}' +
      '.biz{display:flex;flex-direction:column;font-size:8.5pt;color:#d8c8a8}.biz strong{font-family:Georgia,serif;font-size:13pt;color:#fff;letter-spacing:.04em}' +
      '.doc{text-align:right;display:flex;flex-direction:column;font-size:8.5pt;color:#d8c8a8}.doc h1{font-family:Georgia,serif;font-size:17pt;color:#e7c98a;margin:0 0 2px;font-weight:700}' +
      '.parties{margin:14px 0 4px}.two{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:14px 0}.box{border:1px solid #e3d8c4;border-radius:8px;padding:10px 12px}' +
      '.box h2,.sec{font-family:Georgia,serif;font-size:11.5pt;color:#7a5b24;margin:0 0 6px}.sec{margin:16px 0 6px;border-bottom:1.5px solid #b08a45;padding-bottom:3px}' +
      '.box div{display:flex;justify-content:space-between;gap:10px;padding:2px 0;font-size:9pt}.box span{color:#7a6f63}.box strong{text-align:right}' +
      'table{width:100%;border-collapse:collapse;margin:6px 0}th{background:#16130f;color:#f4ead7;text-align:left;font-size:8.3pt;font-weight:600;padding:6px 8px}td{border-bottom:1px solid #eadfcb;padding:6px 8px;vertical-align:top;font-size:9.2pt}' +
      'td small{display:block;color:#7a6f63;font-size:8.2pt}.r{text-align:right;white-space:nowrap}tbody tr:nth-child(even) td{background:#faf6ef}tr{break-inside:avoid}' +
      '.sum{display:grid;grid-template-columns:1fr 250px;gap:16px;align-items:start;margin:8px 0 4px}.words{font-size:9pt;color:#4a423b;padding-top:6px}' +
      '.tot div{display:flex;justify-content:space-between;padding:3px 0;font-size:9.3pt}.tot .big{border-top:2px solid #16130f;margin-top:4px;padding-top:6px;font-size:12pt}.tot .big strong{color:#7a5b24}' +
      '.equip{columns:2;list-style:none;padding:0;margin:4px 0}.equip li{display:flex;justify-content:space-between;border-bottom:1px dotted #e3d8c4;padding:3px 0;break-inside:avoid;font-size:9.2pt}' +
      '.art{font-size:10pt;margin:12px 0 2px;color:#16130f}.art+p,.parties+p{margin:0 0 4px}.note{font-size:9pt}.terms{padding-left:18px;font-size:9pt;color:#4a423b}.terms li{margin:3px 0}' +
      '.place{margin-top:14px}.sign{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:18px;break-inside:avoid}.sign div{border:1px solid #e3d8c4;border-radius:8px;padding:10px 12px;height:110px;display:flex;flex-direction:column}' +
      '.sign span{font-size:8.6pt;color:#7a6f63}.sign em{margin-top:auto;font-size:8pt;color:#9a8f82}.foot{margin-top:18px;text-align:center;font-size:8pt;color:#9a8f82;border-top:1px solid #eadfcb;padding-top:8px}' +
      '@media print{.bar{display:none}.page{padding:0}}@media (max-width:640px){.top,.two,.sum,.sign{grid-template-columns:1fr}.doc{text-align:left}.equip{columns:1}.page{padding:12px}}';
    return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' +
      h((contract ? 'Contrat ' : 'Devis ') + q.number + ' — ' + c.client) + '</title><style>' + css + '</style></head><body>' +
      '<div class="bar"><button onclick="window.print()">Imprimer / PDF</button><button onclick="window.close()">Fermer</button></div>' +
      '<main class="page">' + body + '</main>' +
      '<script>window.addEventListener("load",function(){setTimeout(function(){window.print()},300)});<\/script></body></html>';
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
      arrival: f.arrival.value, service: f.service.value, menu: draft.menuList.join('\n'), menuNotes: f.menuNotes.value.trim()
    });
    draft.menuItems = menuItemsOf(draft);
    if (!draft.quote) delete draft.quote;
    draft.equipment = draft.equipment.filter(function (q) { return +q.qty > 0; });
    delete draft.menuList;
    delete draft.menuDetails;
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
    if (state.teamRole && roles.indexOf(state.teamRole) === -1) state.teamRole = '';
    html += '<div class="toolbar"><div class="chips">' +
      '<button class="chip' + (!state.teamRole ? ' is-active' : '') + '" data-action="team-role" data-role="">Tous <b>' + data.staff.length + '</b></button>' +
      roles.map(function (r) {
        var n = data.staff.filter(function (s) { return s.role === r; }).length;
        return '<button class="chip' + (state.teamRole === r ? ' is-active' : '') + '" data-action="team-role" data-role="' + esc(r) + '">' + esc(r) + ' <b>' + n + '</b></button>';
      }).join('') + '</div>' +
      '<input class="search" type="search" id="teamSearch" placeholder="Rechercher un nom, un téléphone…" value="' + esc(state.teamSearch) + '"></div>' +
      '<section class="card card--flush"><ul class="rows rows--big" id="teamList"></ul></section>';
    return html;
  }

  function teamRow(s) {
    var as = staffAssignments(s.id);
    var next = as.filter(function (a) { return a.event.date >= TODAY; });
    var owed = staffOwed(s.id);
    return '<li><div class="row row--static"><button class="row__open" data-action="staff-open" data-id="' + s.id + '"><div class="avatar">' + esc(s.name.charAt(0).toUpperCase()) + '</div>' +
      '<div class="row__main"><strong>' + esc(s.name) + ' <span class="role-tag">' + esc(s.role) + '</span></strong><span>' + esc(U.formatPhone(s.phone) || 'Pas de téléphone') + ' · ' + U.formatDH(s.rate) + ' par événement</span>' +
      '<span class="row__rel">' + (next.length ? plural(next.length, 'événement') + ' à venir · prochain le ' + U.formatDate(next[0].event.date, { day: 'numeric', month: 'short' }) : 'Aucun événement à venir') + '</span></div></button>' +
      '<div class="row__side">' + (owed ? '<span class="amount amount--due">' + U.formatDH(owed) + '</span><button class="btn btn--light btn--sm" data-action="staff-pay" data-id="' + s.id + '">Marquer payé</button>' : '<span class="badge badge--paid">À jour</span>') + '</div></div></li>';
  }
  function renderTeamList() {
    var box = $('#teamList');
    if (!box) return;
    var q = state.teamSearch.trim().toLowerCase();
    var qd = U.digits(q);
    var list = data.staff.filter(function (s) {
      if (state.teamRole && s.role !== state.teamRole) return false;
      if (!q) return true;
      return s.name.toLowerCase().indexOf(q) !== -1 || (qd && U.digits(s.phone).indexOf(qd) !== -1);
    }).sort(function (a, b) { return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }); });
    box.innerHTML = list.length ? list.map(teamRow).join('') : '<li>' + empty('Personne ne correspond.') + '</li>';
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
      '<button class="btn btn--primary btn--sm" data-action="item-new">' + icon('plus') + ' Fiche complète</button></div>' +
      '<section class="card quick-item"><h3>Ajouter un nouvel article</h3><p class="muted">Un article qui n\'existe pas encore dans la liste.</p>' +
        '<div class="add-row add-row--newitem">' +
          '<input id="qiName" placeholder="Nom (ex. Lustres en cristal)" aria-label="Nom de l\'article">' +
          '<select id="qiCat" aria-label="Catégorie">' + T.INV_CATEGORIES.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('') + '</select>' +
          '<input type="number" id="qiQty" min="0" placeholder="Stock" aria-label="Quantité en stock">' +
          '<button type="button" class="btn btn--primary btn--sm" data-action="item-quick">' + icon('plus') + ' Ajouter</button>' +
        '</div></section>';
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
    var hero = data.media.hero;
    var jumps = [['c-photos', 'Photos'], ['c-coords', 'Coordonnées'], ['c-univers', 'Pages univers'], ['c-formules', 'Formules'], ['c-services', 'Services'],
      ['c-simulateur', 'Simulateur'], ['c-plats', 'Plats signature'], ['c-chiffres', 'Chiffres'], ['c-avis', 'Avis'], ['c-faq', 'FAQ'], ['c-zones', 'Zones'], ['c-galerie', 'Galerie']];
    return '<p class="note">Les modifications sont visibles tout de suite sur le site. <a href="../" target="_blank" rel="noopener">Ouvrir le site ↗</a></p>' +
      '<nav class="jumps" aria-label="Aller à une section">' + jumps.map(function (j) { return '<a class="chip" href="#' + j[0] + '">' + j[1] + '</a>'; }).join('') + '</nav>' +

      '<section class="card" id="c-photos"><header class="card__head"><h3>Photos du site</h3><span class="muted">Les photos des services, des formules et de la galerie se changent plus bas</span></header>' +
        '<h4 class="sub">Diaporama d\'accueil</h4>' +
        '<p class="hint">Les grandes photos qui défilent en haut du site. Tant qu\'il n\'y a pas de photo ici, le site affiche la photo de la salle (ou le fond blanc et or si elle est désactivée).</p>' +
        '<label class="switch switch--block"><input type="checkbox" data-action-change="toggle-hero-video"' + (data.media.heroVideo ? ' checked' : '') + '><span>Photo de la salle quand il n\'y a pas de photos</span></label>' +
        '<div class="hero-edit">' + hero.map(function (h, i) {
          return '<div class="hero-edit__item"><div class="hero-edit__img"><img src="' + esc(h.src) + '" alt=""><span class="hero-edit__num">' + (i + 1) + '</span></div>' +
            '<div class="hero-edit__tools">' +
              '<button type="button" class="icon-btn icon-btn--sm" data-action="hero-move" data-index="' + i + '" data-dir="-1" aria-label="Avancer"' + (i ? '' : ' disabled') + '>' + ICONS.chevL + '</button>' +
              '<button type="button" class="icon-btn icon-btn--sm" data-action="hero-move" data-index="' + i + '" data-dir="1" aria-label="Reculer"' + (i < hero.length - 1 ? '' : ' disabled') + '>' + ICONS.chevR + '</button>' +
              '<label class="btn btn--light btn--sm">Changer<input type="file" accept="image/*" data-img="hero:' + i + '" hidden></label>' +
              '<button type="button" class="icon-btn icon-btn--sm" data-action="img-remove" data-target="hero:' + i + '" aria-label="Retirer la photo">' + ICONS.close + '</button>' +
            '</div></div>';
        }).join('') +
          '<label class="hero-edit__add">' + icon('plus') + '<span>Ajouter des photos</span><input type="file" accept="image/*" multiple data-img="hero:add" hidden></label>' +
        '</div>' +
        '<div class="photo-row">' +
          imgSlot('logo', data.media.logo, 'Logo', 'Remplace le « T » en haut du site. Idéalement un PNG sur fond transparent.') +
          imgSlot('about', data.media.about, 'Photo « Notre maison »', 'La photo à côté de la présentation.') +
        '</div>' +
      '</section>' +

      '<section class="card" id="c-coords"><header class="card__head"><h3>Coordonnées</h3></header>' +
        '<form class="form-grid" id="settingsForm">' +
          field('Nom du gérant', '<input name="owner" value="' + esc(s.owner) + '">') +
          field('Téléphone', '<input name="phone" type="tel" value="' + esc(s.phone) + '">') +
          field('Deuxième téléphone', '<input name="phone2" type="tel" value="' + esc(s.phone2 || '') + '" placeholder="Optionnel">') +
          field('WhatsApp', '<input name="whatsapp" type="tel" value="' + esc(s.whatsapp) + '">') +
          field('E-mail', '<input name="email" type="email" value="' + esc(s.email) + '" placeholder="Optionnel">') +
          field('Instagram (lien)', '<input name="instagram" value="' + esc(s.instagram) + '">') +
          field('Ville', '<input name="city" value="' + esc(s.city) + '">') +
          field('Adresse (pour la carte)', '<input name="address" value="' + esc(s.address) + '">') +
          field('Horaires', '<input name="hours" value="' + esc(s.hours) + '">') +
          field('Phrase d\'accroche', '<input name="tagline" value="' + esc(s.tagline) + '">', 'span-2') +
          '<p class="span-2 hint">Pour les devis et contrats (facultatif) :</p>' +
          field('ICE', '<input name="ice" value="' + esc(s.ice || '') + '" inputmode="numeric">') +
          field('Registre de commerce (RC)', '<input name="rc" value="' + esc(s.rc || '') + '">') +
          field('Identifiant fiscal (IF)', '<input name="idf" value="' + esc(s.idf || '') + '" inputmode="numeric">') +
          field('Patente', '<input name="patente" value="' + esc(s.patente || '') + '" inputmode="numeric">') +
          field('Lien de vos avis Google (facultatif)', '<input name="googleReviews" value="' + esc(s.googleReviews || '') + '" placeholder="https://g.page/…">', 'span-2') +
          '<div class="span-2 form-actions"><button type="button" class="btn btn--primary btn--sm" data-action="save-settings">Enregistrer les coordonnées</button></div>' +
        '</form></section>' +

      occasionsEditor() +

      '<section class="card" id="c-formules"><header class="card__head"><h3>Packs mariage</h3><span class="muted">Le prix affiché suit le menu choisi par le client</span></header>' +
        '<div class="editor-grid">' + data.packages.map(function (p, i) {
          return '<div class="editor" data-pkg="' + i + '">' +
            imgSlot('pkg:' + i, p.image, 'Photo (optionnelle)', '', true) +
            field('Nom', '<input data-k="name" value="' + esc(p.name) + '">') +
            field('Lieu', '<input data-k="place" value="' + esc(p.place || p.tagline || '') + '" placeholder="Ex. Location de villa incluse">') +
            '<div class="form-grid">' +
              field('Tables (à partir de)', '<input data-k="tables" type="number" min="0" value="' + esc(p.tables || '') + '">') +
              field('Neggafa (tenues)', '<input data-k="tenues" type="number" min="0" value="' + esc(p.tenues || '') + '">') +
            '</div>' +
            field('Menus au choix (un par ligne : menu | prix en DH)', '<textarea data-k="menus" rows="3" placeholder="Poulet + viande aux pruneaux | 12900">' + esc((p.menus || []).map(function (m) { return m.label + ' | ' + m.price; }).join('\n')) + '</textarea>') +
            field('Inclus (une ligne par élément)', '<textarea data-k="features" rows="5">' + esc(p.features.join('\n')) + '</textarea>') +
            '<label class="switch"><input type="checkbox" data-k="featured"' + (p.featured ? ' checked' : '') + '><span>Mettre en avant</span></label>' +
            '</div>';
        }).join('') + '</div>' +
        '<div class="form-actions"><button class="btn btn--primary btn--sm" data-action="save-packages">Enregistrer les formules</button></div>' +
      '</section>' +

      '<section class="card" id="c-services"><header class="card__head"><h3>Services</h3></header>' +
        '<div class="editor-grid editor-grid--4">' + data.services.map(function (sv, i) {
          return '<div class="editor" data-svc="' + i + '">' + imgSlot('svc:' + i, sv.image, 'Photo (optionnelle)', 'Sans photo, l\'icône s\'affiche.', true) + field('Titre', '<input data-k="title" value="' + esc(sv.title) + '">') +
            field('Description', '<textarea data-k="text" rows="5">' + esc(sv.text) + '</textarea>') + '</div>';
        }).join('') + '</div>' +
        '<div class="form-actions"><button class="btn btn--primary btn--sm" data-action="save-services">Enregistrer les services</button></div>' +
      '</section>' +

      pricingEditor() + siteDishesEditor() + statsEditor() + reviewsEditor() + faqEditor() + zonesEditor() +

      '<section class="card" id="c-galerie"><header class="card__head"><h3>Galerie photos</h3>' +
        '<label class="btn btn--light btn--sm">' + icon('plus') + ' Ajouter des photos<input type="file" id="galleryUpload" accept="image/*" multiple hidden></label></header>' +
        '<div class="gal-edit">' + data.gallery.map(function (g, i) {
          return '<div class="gal-item" data-gal="' + i + '"><div class="gal-item__img tone-' + ((g.tone || i) % 8 + 1) + '">' +
            (g.src ? '<img src="' + esc(g.src) + '" alt="">' : '<span>Photo à venir</span>') +
            '<button class="icon-btn icon-btn--sm gal-item__del" data-action="gallery-remove" data-index="' + i + '" aria-label="Retirer la photo">' + ICONS.close + '</button>' +
            '<label class="gal-item__change">' + (g.src ? 'Changer' : 'Choisir une photo') + '<input type="file" accept="image/*" data-img="gal:' + i + '" hidden></label></div>' +
            '<input data-k="caption" value="' + esc(g.caption) + '" placeholder="Légende">' +
            '<select data-k="category" aria-label="Catégorie">' + T.GALLERY_CATEGORIES.map(function (c) { return '<option' + (c === g.category ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select></div>';
        }).join('') + '</div>' +
        '<div class="form-actions"><button class="btn btn--primary btn--sm" data-action="save-gallery">Enregistrer les légendes et catégories</button></div>' +
        '<p class="muted small">Démo : les photos sont gardées dans ce navigateur uniquement. Dans la version finale, elles seront stockées en ligne.</p>' +
      '</section>';
  }

  /* ---------- éditeurs des sections du site ---------- */
  function listTools(list, i) {
    return '<button type="button" class="btn btn--text btn--danger btn--sm list-remove" data-action="site-list-remove" data-list="' + list + '" data-index="' + i + '">' + icon('trash') + ' Supprimer</button>';
  }
  function addBtn(list, label) {
    return '<button type="button" class="btn btn--light btn--sm" data-action="site-list-add" data-list="' + list + '">' + icon('plus') + ' ' + label + '</button>';
  }
  function occasionsEditor() {
    return '<section class="card" id="c-univers"><header class="card__head"><h3>Pages « Nos univers »</h3><span class="muted">Une page par type d\'événement, avec son lien dans le menu du site</span></header>' +
      '<div class="editor-grid editor-grid--2">' + data.occasions.map(function (o, i) {
        return '<div class="editor" data-occ="' + i + '">' +
          imgSlot('occ:' + i, o.image, 'Photo de la page', 'Sans photo, la page utilise la première photo du diaporama.', true) +
          field('Titre', '<input data-k="title" value="' + esc(o.title) + '">') +
          field('Accroche', '<input data-k="short" value="' + esc(o.short) + '">') +
          field('Présentation', '<textarea data-k="text" rows="4">' + esc(o.text) + '</textarea>') +
          field('Ce que nous proposons (une ligne par élément)', '<textarea data-k="includes" rows="4">' + esc((o.includes || []).join('\n')) + '</textarea>') +
          '<a class="link small" href="../' + ({ mariage: 'mariage.html', bapteme: 'bapteme.html', entreprise: 'entreprise.html', prive: 'evenements-prives.html' }[o.id] || ('evenement.html?type=' + esc(o.id))) + '" target="_blank" rel="noopener">Voir la page ↗</a></div>';
      }).join('') + '</div>' +
      '<div class="form-actions"><button class="btn btn--primary btn--sm" data-action="save-occasions">Enregistrer les pages</button></div></section>';
  }
  function pricingEditor() {
    var P = data.pricing;
    var UNITS = [['pers', 'par invité'], ['table', 'par table de 10'], ['forfait', 'forfait'], ['unite', "à l'unité"]];
    var pk = data.packages.map(function (p) { return { id: p.id, name: p.name }; }).concat([{ id: 'surmesure', name: 'Sur mesure' }])
      .filter(function (p) { return P.packages[p.id]; });
    return '<section class="card" id="c-simulateur"><header class="card__head"><h3>Simulateur « Composez votre mariage »</h3>' +
      '<a class="link small" href="../composer.html" target="_blank" rel="noopener">Ouvrir le simulateur ↗</a></header>' +
      '<p class="hint">Les prix servent uniquement à l\'estimation montrée au client. Prix de démonstration : à remplacer par vos vrais prix.</p>' +
      '<h4 class="sub">Prix par invité de chaque formule</h4>' +
      '<div class="price-grid">' + pk.map(function (p) {
        var x = P.packages[p.id];
        return '<div class="price-row" data-ppk="' + esc(p.id) + '"><strong>' + esc(p.name) + '</strong>' +
          '<label>de <input type="number" min="0" step="10" data-k="min" value="' + x.min + '"></label>' +
          '<label>à <input type="number" min="0" step="10" data-k="max" value="' + x.max + '"> DH</label>' +
          '<div class="price-inc">' + P.options.map(function (o) {
            return '<label class="pick__opt"><input type="checkbox" data-inc="' + esc(o.id) + '"' + (x.includes.indexOf(o.id) !== -1 ? ' checked' : '') + '><span>' + esc(o.name) + '</span></label>';
          }).join('') + '</div></div>';
      }).join('') + '</div>' +
      '<p class="hint">Les options cochées sont comprises dans la formule (le client les voit « incluses »).</p>' +
      '<h4 class="sub">Options</h4>' +
      '<div class="price-opts">' + P.options.map(function (o) {
        return '<div class="price-opt" data-popt="' + esc(o.id) + '">' +
          '<label class="switch"><input type="checkbox" data-k="active"' + (o.active !== false ? ' checked' : '') + '><span></span></label>' +
          '<input data-k="name" value="' + esc(o.name) + '" aria-label="Nom de l\'option">' +
          '<select data-k="unit" aria-label="Unité">' + UNITS.map(function (u) { return '<option value="' + u[0] + '"' + (o.unit === u[0] ? ' selected' : '') + '>' + u[1] + '</option>'; }).join('') + '</select>' +
          '<label>de <input type="number" min="0" step="10" data-k="min" value="' + o.min + '"></label>' +
          '<label>à <input type="number" min="0" step="10" data-k="max" value="' + o.max + '"> DH</label></div>';
      }).join('') + '</div>' +
      '<div class="form-actions"><button class="btn btn--primary btn--sm" data-action="save-pricing">Enregistrer les prix</button></div></section>';
  }

  function siteDishesEditor() {
    var list = data.site.dishes;
    return '<section class="card" id="c-plats"><header class="card__head"><h3>Plats signature</h3>' + addBtn('dishes', 'Ajouter un plat') + '</header>' +
      '<p class="hint">Les plats mis en avant dans le carrousel « Nos plats signature ».</p>' +
      (list.length ? '<div class="editor-grid">' + list.map(function (d, i) {
        return '<div class="editor" data-sdish="' + i + '">' + imgSlot('sdish:' + i, d.image, 'Photo du plat', '', true) +
          field('Nom', '<input data-k="name" value="' + esc(d.name) + '">') +
          field('Description', '<textarea data-k="text" rows="3">' + esc(d.text) + '</textarea>') + listTools('dishes', i) + '</div>';
      }).join('') + '</div>' : '<p class="empty empty--sm">Aucun plat : la section est masquée sur le site.</p>') +
      '<div class="form-actions"><button class="btn btn--primary btn--sm" data-action="save-sdishes">Enregistrer les plats</button></div></section>';
  }
  function statsEditor() {
    return '<section class="card" id="c-chiffres"><header class="card__head"><h3>Chiffres clés</h3><span class="muted">Le bandeau sombre du site. Laissez un chiffre vide pour le masquer.</span></header>' +
      '<div class="stat-edit">' + data.site.stats.map(function (x, i) {
        return '<div class="stat-edit__row" data-stat="' + i + '">' + field('Chiffre', '<input data-k="value" value="' + esc(x.value) + '" placeholder="Ex. 250">') +
          field('Texte', '<input data-k="label" value="' + esc(x.label) + '" placeholder="Ex. mariages réalisés">') + '</div>';
      }).join('') + '</div>' +
      '<p class="hint">Mettez uniquement des chiffres vrais (années d\'expérience, nombre de mariages…).</p>' +
      '<div class="form-actions"><button class="btn btn--primary btn--sm" data-action="save-stats">Enregistrer les chiffres</button></div></section>';
  }
  function reviewsEditor() {
    var list = data.site.reviews;
    return '<section class="card" id="c-avis"><header class="card__head"><h3>Avis clients</h3>' + addBtn('reviews', 'Ajouter un avis') + '</header>' +
      '<p class="hint">Recopiez de vrais avis reçus (Instagram, WhatsApp, Google…). La section n\'apparaît sur le site qu\'à partir du premier avis.</p>' +
      (list.length ? '<div class="editor-grid">' + list.map(function (r, i) {
        return '<div class="editor" data-review="' + i + '">' +
          field('Nom du client', '<input data-k="name" value="' + esc(r.name) + '" placeholder="Ex. Salma B.">') +
          field('Événement', '<input data-k="event" value="' + esc(r.event) + '" placeholder="Ex. Mariage, juin 2026">') +
          field('Note', '<select data-k="stars">' + [5, 4, 3].map(function (n) { return '<option value="' + n + '"' + (+r.stars === n ? ' selected' : '') + '>' + '★★★★★'.slice(0, n) + '</option>'; }).join('') + '</select>') +
          field('Avis', '<textarea data-k="text" rows="4">' + esc(r.text) + '</textarea>') + listTools('reviews', i) + '</div>';
      }).join('') + '</div>' : '<p class="empty empty--sm">Aucun avis pour l\'instant : la section est masquée sur le site.</p>') +
      (list.length ? '<div class="form-actions"><button class="btn btn--primary btn--sm" data-action="save-reviews">Enregistrer les avis</button></div>' : '') + '</section>';
  }
  function faqEditor() {
    var list = data.site.faq;
    return '<section class="card" id="c-faq"><header class="card__head"><h3>Questions fréquentes</h3>' + addBtn('faq', 'Ajouter une question') + '</header>' +
      (list.length ? '<div class="faq-edit">' + list.map(function (f, i) {
        return '<div class="editor" data-faq="' + i + '">' + field('Question', '<input data-k="q" value="' + esc(f.q) + '">') +
          field('Réponse', '<textarea data-k="a" rows="3">' + esc(f.a) + '</textarea>') + listTools('faq', i) + '</div>';
      }).join('') + '</div>' : '<p class="empty empty--sm">Aucune question : la section est masquée sur le site.</p>') +
      '<div class="form-actions"><button class="btn btn--primary btn--sm" data-action="save-faq">Enregistrer les questions</button></div></section>';
  }
  function zonesEditor() {
    return '<section class="card" id="c-zones"><header class="card__head"><h3>Zones desservies</h3></header>' +
      field('Villes et quartiers (une par ligne)', '<textarea id="zonesInput" rows="5">' + esc(data.site.zones.join('\n')) + '</textarea>') +
      '<p class="hint">À vérifier avec Saïd : la liste actuelle est un exemple.</p>' +
      '<div class="form-actions"><button class="btn btn--primary btn--sm" data-action="save-zones">Enregistrer les zones</button></div></section>';
  }
  function readRows(attr, keys) {
    return $$('[data-' + attr + ']').map(function (box) {
      var o = {};
      keys.forEach(function (k) { var el = $('[data-k="' + k + '"]', box); o[k] = el ? el.value.trim() : ''; });
      return o;
    });
  }
  function syncList(name) {
    if (name === 'dishes') readRows('sdish', ['name', 'text']).forEach(function (r, i) { Object.assign(data.site.dishes[i], r); });
    if (name === 'reviews') readRows('review', ['name', 'event', 'stars', 'text']).forEach(function (r, i) { Object.assign(data.site.reviews[i], r, { stars: +r.stars || 5 }); });
    if (name === 'faq') readRows('faq', ['q', 'a']).forEach(function (r, i) { Object.assign(data.site.faq[i], r); });
  }

  /* ---------- photos du site ---------- */
  function imgSlot(target, src, label, help, compact) {
    return '<div class="img-slot' + (compact ? ' img-slot--compact' : '') + '">' +
      '<div class="img-slot__thumb' + (target === 'logo' ? ' img-slot__thumb--logo' : '') + '">' + (src ? '<img src="' + esc(src) + '" alt="">' : '<span>Aucune photo</span>') + '</div>' +
      '<div class="img-slot__body"><strong>' + esc(label) + '</strong>' + (help ? '<span>' + esc(help) + '</span>' : '') +
        '<div class="img-slot__actions"><label class="btn btn--light btn--sm">' + (src ? 'Changer' : 'Choisir une photo') + '<input type="file" accept="image/*" data-img="' + target + '" hidden></label>' +
        (src ? '<button type="button" class="btn btn--text btn--danger btn--sm" data-action="img-remove" data-target="' + target + '">Retirer</button>' : '') +
      '</div></div></div>';
  }
  function setImage(target, src) {
    var parts = target.split(':');
    var kind = parts[0], i = +parts[1];
    if (kind === 'logo') data.media.logo = src;
    else if (kind === 'about') data.media.about = src;
    else if (kind === 'svc') data.services[i].image = src;
    else if (kind === 'pkg') data.packages[i].image = src;
    else if (kind === 'gal') data.gallery[i].src = src;
    else if (kind === 'occ') data.occasions[i].image = src;
    else if (kind === 'sdish') data.site.dishes[i].image = src;
    else if (kind === 'hero') {
      if (parts[1] === 'add') data.media.hero.push({ id: U.uid(), src: src });
      else if (src) data.media.hero[i].src = src;
      else data.media.hero.splice(i, 1);
    }
  }
  function handleImageInput(input) {
    var files = Array.prototype.slice.call(input.files || []);
    if (!files.length) return;
    var target = input.dataset.img;
    var isLogo = target === 'logo';
    var max = isLogo ? 400 : target.indexOf('hero') === 0 ? 1600 : 1200;
    toast(files.length > 1 ? 'Préparation de ' + files.length + ' photos…' : 'Préparation de la photo…');
    Promise.all(files.map(function (f) { return resizeImage(f, max, isLogo ? 'image/png' : 'image/jpeg'); })).then(function (srcs) {
      var snapshot = JSON.stringify(data);
      srcs.forEach(function (src) { setImage(target, src); });
      if (!commit(srcs.length > 1 ? plural(srcs.length, 'photo ajoutée', 'photos ajoutées') + '.' : 'Photo enregistrée.')) {
        data = JSON.parse(snapshot); normalize();
        T.store.save(data);
        render();
      }
    }).catch(function () { toast('Impossible de lire cette image.', true); });
  }

  function resizeImage(file, max, type) {
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
          resolve(type === 'image/png' ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.8));
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
      if (draft.menuList.length && !window.confirm('Remplacer le menu actuel par le contenu de la formule ' + pkg.name + ' ?')) return;
      var FOOD = ['Dessert', 'Jus', 'Gâteaux', 'Thé à la menthe', 'Dattes', 'Dattes et lait'];
      var chosen = (pkg.menus && pkg.menus[0]) ? pkg.menus[0].label.split('+').map(function (x) { return x.trim(); }).filter(Boolean) : [];
      draft.menuList = chosen.concat(pkg.features.filter(function (x) { return FOOD.indexOf(x) !== -1; }));
      if (!draft.menuList.length) draft.menuList = pkg.features.slice();
      renderMenu();
    },
    'ev-add-dish': function () {
      var name = $('#dishName').value.trim();
      if (!name) { toast('Écrivez le nom du plat.', true); $('#dishName').focus(); return; }
      if (!data.dishes.some(function (d) { return dishKey(d.name) === dishKey(name); })) data.dishes.push({ name: name, category: $('#dishCat').value });
      if (draft.menuList.map(dishKey).indexOf(dishKey(name)) === -1) draft.menuList.push(name);
      renderMenu();
      setTimeout(function () { var i = $('#dishName'); if (i) i.focus(); }, 0);
    },
    'ev-dish-remove': function (el) { draft.menuList.splice(+el.dataset.index, 1); renderMenu(); },
    'ev-dish-up': function (el) {
      var i = +el.dataset.index;
      if (i < 1) return;
      var x = draft.menuList[i]; draft.menuList[i] = draft.menuList[i - 1]; draft.menuList[i - 1] = x;
      renderMenuChosen();
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
    'ev-new-equip': function () {
      var name = $('#newEqName').value.trim();
      var qty = +$('#newEqQty').value;
      if (!name) { toast('Écrivez le nom de l\'article.', true); $('#newEqName').focus(); return; }
      if (!qty || qty <= 0) { toast('Indiquez la quantité.', true); $('#newEqQty').focus(); return; }
      var it = data.inventory.filter(function (x) { return x.name.trim().toLowerCase() === name.toLowerCase(); })[0];
      if (!it) { it = { id: U.uid(), name: name, category: $('#newEqCat').value, qty: qty, rule: '' }; data.inventory.push(it); T.store.save(data); }
      var line = draft.equipment.filter(function (q) { return q.itemId === it.id; })[0];
      if (line) line.qty = qty; else draft.equipment.push({ itemId: it.id, qty: qty });
      renderEquip(); showEvTab('equip');
      toast('« ' + it.name + ' » ajouté au stock et à l\'événement.');
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
    'item-quick': function () {
      var name = $('#qiName').value.trim();
      if (!name) { toast('Écrivez le nom de l\'article.', true); $('#qiName').focus(); return; }
      if (data.inventory.some(function (x) { return x.name.trim().toLowerCase() === name.toLowerCase(); })) { toast('Cet article existe déjà dans la liste.', true); return; }
      data.inventory.push({ id: U.uid(), name: name, category: $('#qiCat').value, qty: +$('#qiQty').value || 0, rule: '' });
      commit('« ' + name + ' » ajouté au stock.');
      setTimeout(function () { var i = $('#qiName'); if (i) i.focus(); }, 0);
    },
    'team-role': function (el) {
      state.teamRole = el.dataset.role;
      $$('[data-action="team-role"]').forEach(function (b) { b.classList.toggle('is-active', b === el); });
      renderTeamList();
    },
    'q-create': function () { draft.quote = freshQuote(); renderQuote(); showEvTab('quote'); },
    'q-add-line': function () { draft.quote.lines.push({ label: '', detail: '', qty: 1, unit: 'forfait', price: 0 }); renderQuote(); showEvTab('quote'); var ins = $$('#quoteBox [data-k="label"]'); if (ins.length) ins[ins.length - 1].focus(); },
    'q-add-option': function () {
      var o = data.pricing.options[+$('#qOption').value];
      if (!o || $('#qOption').value === '') { toast('Choisissez une prestation dans la liste.', true); return; }
      var g = draftGuests();
      var qty = o.unit === 'pers' ? (g || 1) : o.unit === 'table' ? Math.max(1, Math.ceil((g || 10) / 10)) : 1;
      var unit = o.unit === 'unite' ? 'unité' : o.unit;
      draft.quote.lines.push({ label: o.name, detail: o.text || '', qty: qty, unit: unit, price: Math.round(((+o.min || 0) + (+o.max || 0)) / 2) });
      renderQuote(); showEvTab('quote');
    },
    'q-del-line': function (el) { draft.quote.lines.splice(+el.dataset.index, 1); renderQuote(); showEvTab('quote'); },
    'q-sync': function () {
      var t = quoteTotals(draft.quote).ttc;
      $('#eventForm').elements.total.value = t;
      renderPayments(); renderProfit(); renderQuoteTotals();
      toast('Prix de l\'événement : ' + U.formatDH(t) + '.');
    },
    'q-whatsapp': function () {
      var phone = $('#eventForm').elements.phone.value.trim();
      if (!U.digits(phone)) { toast('Ajoutez le téléphone du client dans l\'onglet Détails.', true); return; }
      window.open(U.waLink(phone, quoteWhatsappText()), '_blank', 'noopener');
    },
    'q-print': function (el) {
      var w = window.open('', '_blank');
      if (!w) { toast('Autorisez les fenêtres pop-up pour imprimer.', true); return; }
      w.document.open();
      w.document.write(quoteDocument(el.dataset.mode));
      w.document.close();
    },
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
      ['owner', 'phone', 'phone2', 'whatsapp', 'email', 'instagram', 'city', 'address', 'hours', 'tagline', 'ice', 'rc', 'idf', 'patente', 'googleReviews'].forEach(function (k) {
        data.settings[k] = f[k].value.trim();
      });
      commit('Coordonnées enregistrées.');
    },
    'save-packages': function () {
      $$('[data-pkg]').forEach(function (box) {
        var p = data.packages[+box.dataset.pkg];
        p.name = $('[data-k="name"]', box).value.trim();
        p.place = $('[data-k="place"]', box).value.trim();
        p.tables = +$('[data-k="tables"]', box).value || 0;
        p.tenues = +$('[data-k="tenues"]', box).value || 0;
        p.menus = $('[data-k="menus"]', box).value.split('\n').map(function (x) {
          var parts = x.split('|');
          return { label: parts[0].trim(), price: +String(parts[1] || '').replace(/[^\d]/g, '') || 0 };
        }).filter(function (m) { return m.label; });
        p.features = $('[data-k="features"]', box).value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
        p.featured = $('[data-k="featured"]', box).checked;
      });
      commit('Packs enregistrés.');
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
      $$('[data-gal]').forEach(function (box) {
        var g = data.gallery[+box.dataset.gal];
        g.caption = $('[data-k="caption"]', box).value.trim();
        g.category = $('[data-k="category"]', box).value;
      });
      commit('Galerie enregistrée.');
    },
    'save-occasions': function () {
      $$('[data-occ]').forEach(function (box) {
        var o = data.occasions[+box.dataset.occ];
        o.title = $('[data-k="title"]', box).value.trim() || o.title;
        o.short = $('[data-k="short"]', box).value.trim();
        o.text = $('[data-k="text"]', box).value.trim();
        o.includes = $('[data-k="includes"]', box).value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
      });
      commit('Pages enregistrées.');
    },
    'save-pricing': function () {
      var P = data.pricing;
      $$('[data-ppk]').forEach(function (row) {
        var x = P.packages[row.dataset.ppk];
        x.min = +$('[data-k="min"]', row).value || 0;
        x.max = Math.max(x.min, +$('[data-k="max"]', row).value || 0);
        x.includes = $$('[data-inc]', row).filter(function (c) { return c.checked; }).map(function (c) { return c.dataset.inc; });
      });
      $$('[data-popt]').forEach(function (row) {
        var o = P.options.filter(function (x) { return x.id === row.dataset.popt; })[0];
        o.active = $('[data-k="active"]', row).checked;
        o.name = $('[data-k="name"]', row).value.trim() || o.name;
        o.unit = $('[data-k="unit"]', row).value;
        o.min = +$('[data-k="min"]', row).value || 0;
        o.max = Math.max(o.min, +$('[data-k="max"]', row).value || 0);
      });
      commit('Prix du simulateur enregistrés.');
    },
    'save-sdishes': function () { syncList('dishes'); commit('Plats signature enregistrés.'); },
    'save-reviews': function () { syncList('reviews'); data.site.reviews = data.site.reviews.filter(function (r) { return r.text || r.name; }); commit('Avis enregistrés.'); },
    'save-faq': function () { syncList('faq'); data.site.faq = data.site.faq.filter(function (f) { return f.q; }); commit('Questions enregistrées.'); },
    'save-stats': function () {
      data.site.stats = readRows('stat', ['value', 'label']);
      commit('Chiffres enregistrés.');
    },
    'save-zones': function () {
      data.site.zones = $('#zonesInput').value.split(/\n|,/).map(function (x) { return x.trim(); }).filter(Boolean);
      commit('Zones enregistrées.');
    },
    'site-list-add': function (el) {
      var name = el.dataset.list;
      syncList(name);
      if (name === 'dishes') data.site.dishes.push({ id: U.uid(), name: '', text: '', image: '' });
      if (name === 'reviews') data.site.reviews.push({ id: U.uid(), name: '', event: '', stars: 5, text: '' });
      if (name === 'faq') data.site.faq.push({ q: '', a: '' });
      render();
      var boxes = $$('[data-' + { dishes: 'sdish', reviews: 'review', faq: 'faq' }[name] + ']');
      var last = boxes[boxes.length - 1];
      if (last) { last.scrollIntoView({ block: 'center' }); var inp = $('input', last); if (inp) inp.focus(); }
    },
    'site-list-remove': function (el) {
      if (!window.confirm('Supprimer cet élément du site ?')) return;
      var name = el.dataset.list;
      syncList(name);
      var arr = name === 'faq' ? data.site.faq : data.site[name];
      arr.splice(+el.dataset.index, 1);
      commit('Élément supprimé.');
    },
    'img-remove': function (el) {
      if (!window.confirm('Retirer cette photo du site ?')) return;
      setImage(el.dataset.target, '');
      commit('Photo retirée.');
    },
    'hero-move': function (el) {
      var i = +el.dataset.index, j = i + (+el.dataset.dir);
      var h = data.media.hero;
      if (j < 0 || j >= h.length) return;
      var x = h[i]; h[i] = h[j]; h[j] = x;
      commit('Ordre du diaporama mis à jour.');
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
    if (draft && e.target.dataset && e.target.dataset.dish != null) {
      var dname = e.target.dataset.dish;
      var idx = draft.menuList.map(dishKey).indexOf(dishKey(dname));
      if (e.target.checked && idx === -1) draft.menuList.push(dname);
      if (!e.target.checked && idx !== -1) draft.menuList.splice(idx, 1);
      var group = e.target.closest('.dish-group');
      if (group) {
        var cnt = $$('input[data-dish]:checked', group).length;
        var title = $('.dish-group__title', group);
        title.innerHTML = '<span>' + esc($('span', title).textContent) + '</span>' + (cnt ? ' <b>' + cnt + '</b>' : '');
      }
      renderMenuChosen();
      return;
    }
    if (draft && e.target.dataset && e.target.dataset.teamPaid != null) { draft.team[+e.target.dataset.teamPaid].paid = e.target.checked; return; }
    if (draft && draft.quote && e.target.dataset && e.target.dataset.q && e.target.type === 'checkbox') { draft.quote[e.target.dataset.q] = e.target.checked; return; }
    if (draft && draft.quote && e.target.tagName === 'SELECT' && (e.target.dataset.q || e.target.dataset.ql != null)) { quoteInput(e.target); return; }
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
    if (e.target.dataset && e.target.dataset.img) { handleImageInput(e.target); return; }
    if (e.target.dataset && e.target.dataset.actionChange === 'toggle-hero-video') {
      data.media.heroVideo = e.target.checked;
      commit(e.target.checked ? 'Photo de la salle activée.' : 'Photo de la salle désactivée.');
      return;
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
    var ds = e.target.dataset || {};
    if (draft && ds.teamPay != null) { draft.team[+ds.teamPay].pay = +e.target.value || 0; renderCosts(); renderProfit(); $('.line-total strong', $('#teamBox')).textContent = U.formatDH(staffCost(draft)); }
    if (draft && ds.eqQty != null) {
      draft.equipment[+ds.eqQty].qty = +e.target.value || 0;
      var st = $('[data-eq-status="' + ds.eqQty + '"]');
      if (st) st.innerHTML = equipStatus(draft.equipment[+ds.eqQty]);
    }
    if (draft && ds.dishKey != null) { var dd = draft.menuDetails[ds.dishKey] || (draft.menuDetails[ds.dishKey] = { qty: '', kg: '', model: '', shape: '' }); dd[ds.dishField] = e.target.value.trim(); return; }
    if (draft && draft.quote && (ds.q || ds.ql != null) && e.target.type !== 'checkbox') { quoteInput(e.target); return; }
    if (e.target.id === 'teamSearch') { state.teamSearch = e.target.value; renderTeamList(); }
    if (e.target.id === 'reqSearch') { state.reqSearch = e.target.value; renderRequestList(); }
    if (e.target.id === 'clientSearch') { state.clientSearch = e.target.value; renderClientList(); }
  });

  function quoteInput(el) {
    var ds = el.dataset;
    var num = el.type === 'number' || ds.q === 'vat' || ds.q === 'deposit';
    var v = num ? (el.value === '' ? '' : +el.value) : el.value;
    if (ds.ql != null) {
      var l = draft.quote.lines[+ds.ql];
      l[ds.k] = v;
      var a = $('[data-ql-amount="' + ds.ql + '"]');
      if (a) a.textContent = U.formatDH((+l.qty || 0) * (+l.price || 0));
    } else {
      draft.quote[ds.q] = v;
    }
    renderQuoteTotals();
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.id === 'dishName') { e.preventDefault(); actions['ev-add-dish'](); return; }
    if (e.key === 'Enter' && (e.target.id === 'qiName' || e.target.id === 'qiQty')) { e.preventDefault(); actions['item-quick'](); return; }
    if (e.key === 'Enter' && (e.target.id === 'newEqName' || e.target.id === 'newEqQty')) { e.preventDefault(); actions['ev-new-equip'](); return; }
    if (e.key === 'Enter' && draft && e.target.closest && e.target.closest('#quoteBox, #menuChosen') && e.target.tagName === 'INPUT') { e.preventDefault(); return; }
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
