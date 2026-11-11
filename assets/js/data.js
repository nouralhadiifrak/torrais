/*
 * TORRAIS EVENT — données de démonstration partagées entre le site et le tableau de bord.
 * Tout est stocké dans le navigateur (localStorage). Dans la version finale,
 * ces données viendront d'une vraie base de données.
 */
(function () {
  'use strict';

  var KEY = 'torrais_demo_v2';

  /* ---------- utilitaires ---------- */
  function uid() { return Math.random().toString(36).slice(2, 10); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function addDays(base, n) { var d = startOfDay(base); d.setDate(d.getDate() + n); return d; }
  function parseISO(s) { var p = String(s).slice(0, 10).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function formatDH(n) {
    return Math.round(+n || 0).toLocaleString('fr-FR').replace(/[ \s]/g, ' ') + ' DH';
  }
  function formatDate(s, opts) {
    if (!s) return '—';
    return parseISO(s).toLocaleDateString('fr-FR', opts || { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  function formatPhone(s) {
    var d = digits(s);
    if (d.length === 10) return d.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
    return s || '';
  }
  function waNumber(s) {
    var d = digits(s);
    if (d.length === 10 && d.charAt(0) === '0') return '212' + d.slice(1);
    return d;
  }
  function waLink(phone, text) {
    return 'https://wa.me/' + waNumber(phone) + (text ? '?text=' + encodeURIComponent(text) : '');
  }

  /* ---------- icônes (SVG en ligne) ---------- */
  var ICONS = {
    traiteur: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18h18"/><path d="M5 18a7 7 0 0 1 14 0"/><path d="M12 11V9"/><path d="M10.5 9h3"/><path d="M4 21h16"/></svg>',
    buffet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v8"/><path d="M5 3v4a2 2 0 0 0 4 0V3"/><path d="M7 11v10"/><path d="M17 21v-9c-2 0-3-1.5-3-4.5S15 3 17 3v18"/></svg>',
    tyafer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="1"/><rect x="2.5" y="7" width="19" height="3" rx="1"/><path d="M12 7v13"/><path d="M12 7C10.5 4 7.5 3.5 7.5 5.5S10.5 7 12 7c1.5 0 4.5.5 4.5-1.5S13.5 4 12 7"/></svg>',
    deco: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M5.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/><path d="M18.5 15l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h3.5l2 5-2.5 1.5a11 11 0 0 0 5.5 5.5L15 13.5l5 2V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24s8.24 3.7 8.24 8.24-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>'
  };

  var EVENT_TYPES = ['Mariage', 'Fiançailles', 'Henné', 'Aqiqa / Baptême', 'Anniversaire', "Événement d'entreprise", 'Autre'];
  var SERVICE_NAMES = ['Traiteur', 'Buffet', 'Tyafer', 'Décoration'];
  var STATUSES = [
    { id: 'nouveau', label: 'Nouveau' },
    { id: 'contacte', label: 'Contacté' },
    { id: 'devis', label: 'Devis envoyé' },
    { id: 'confirme', label: 'Confirmé' },
    { id: 'refuse', label: 'Refusé' }
  ];
  var PENDING = ['nouveau', 'contacte', 'devis'];
  // D'où vient la demande / la réservation
  var SOURCES = ['Site web', 'WhatsApp', 'Téléphone', 'Boutique', 'Instagram', 'Bouche-à-oreille', 'Autre'];

  /* ---------- contenu par défaut du site ---------- */
  function defaultContent() {
    return {
      settings: {
        businessName: 'TORRAIS EVENT',
        owner: 'Saïd',
        phone: '0663351507',
        whatsapp: '0663351507',
        email: '',
        instagram: 'https://www.instagram.com/torrais.event/',
        city: 'Casablanca',
        address: 'Casablanca, Maroc',
        hours: 'Tous les jours, de 9h à 21h',
        tagline: 'Réservez la formule mariage à votre service, selon votre choix.'
      },
      services: [
        { id: 'traiteur', icon: 'traiteur', title: 'Traiteur', text: 'Cuisine marocaine traditionnelle et internationale : pastilla, méchoui, tajines, plats royaux et desserts, préparés avec soin pour tous vos invités.' },
        { id: 'buffet', icon: 'buffet', title: 'Buffet', text: "Buffets et cocktails dînatoires, salés et sucrés, pour vos mariages, fiançailles, anniversaires et événements d'entreprise." },
        { id: 'tyafer', icon: 'tyafer', title: 'Tyafer', text: 'Tyafer décorés pour la henné, les fiançailles et la dote : une présentation raffinée des cadeaux, dans le respect de la tradition.' },
        { id: 'deco', icon: 'deco', title: 'Décoration', text: 'Décoration des tables, fleurs, lumières et kousha de la mariée, accordées au thème et aux couleurs de votre fête.' }
      ],
      packages: [
        { id: 'essentielle', name: 'Essentielle', tagline: 'Fiançailles et réceptions intimes', price: '', featured: false,
          features: ['Dîner traditionnel : pastilla, tajine, fruits', 'Service à table', 'Vaisselle et nappage', 'Thé et pâtisseries marocaines'] },
        { id: 'prestige', name: 'Prestige', tagline: 'La formule mariage la plus demandée', price: '', featured: true,
          features: ['Tout de la formule Essentielle', 'Méchoui ou plat royal', 'Buffet de desserts', 'Décoration des tables', 'Tyafer pour la cérémonie'] },
        { id: 'royale', name: 'Royale', tagline: 'Votre mariage clé en main', price: '', featured: false,
          features: ['Tout de la formule Prestige', 'Décoration complète de la salle et de la kousha', "Cocktail d'accueil", 'Gâteau des mariés', 'Maître d\'hôtel dédié'] }
      ],
      gallery: [
        { id: uid(), src: '', caption: "Table d'honneur", tone: 1 },
        { id: uid(), src: '', caption: 'Buffet marocain', tone: 2 },
        { id: uid(), src: '', caption: 'Tyafer de la henné', tone: 3 },
        { id: uid(), src: '', caption: 'Kousha de la mariée', tone: 4 },
        { id: uid(), src: '', caption: 'Pastilla royale', tone: 5 },
        { id: uid(), src: '', caption: 'Plateaux de fruits', tone: 6 },
        { id: uid(), src: '', caption: 'Décoration florale', tone: 7 },
        { id: uid(), src: '', caption: 'Pâtisseries marocaines', tone: 8 }
      ]
    };
  }

  /* ---------- données fictives du tableau de bord ---------- */
  function seed() {
    var today = new Date();
    var events = [];
    var requests = [];
    function d(n) { return iso(addDays(today, n)); }
    var SRC_CYCLE = ['WhatsApp', 'Boutique', 'Site web', 'WhatsApp', 'Téléphone', 'Instagram', 'Boutique', 'WhatsApp', 'Bouche-à-oreille', 'Site web'];
    var srcIndex = 0;

    function addEvent(o) {
      var id = uid();
      var source = o.source || SRC_CYCLE[srcIndex++ % SRC_CYCLE.length];
      var e = {
        id: id,
        source: source,
        clientName: o.client,
        phone: o.phone,
        eventType: o.type,
        date: d(o.at),
        venue: o.venue,
        guests: o.guests,
        package: o.pkg,
        total: o.total,
        status: 'confirme',
        notes: o.notes || '',
        createdAt: d(o.booked),
        payments: (o.paid || []).map(function (p) {
          return { id: uid(), date: d(p[0]), amount: p[1], note: p[2] || 'Acompte' };
        })
      };
      events.push(e);
      requests.push({
        id: uid(), source: source, createdAt: d(o.booked) + 'T11:00', name: o.client, phone: o.phone, eventType: o.type,
        date: e.date, guests: o.guests, budget: '', services: o.services || ['Traiteur'], message: '',
        status: 'confirme', notes: 'Converti en événement.', eventId: id
      });
    }

    // Événements passés (cette année)
    addEvent({ at: -290, booked: -360, type: 'Mariage', client: 'Famille Naciri', phone: '0661452378', venue: 'Salle Les Orangers, Casablanca', guests: 230, pkg: 'Prestige', total: 76000, paid: [[-360, 25000], [-290, 51000, 'Solde']] });
    addEvent({ at: -236, booked: -300, type: 'Fiançailles', client: 'Famille Belhaj', phone: '0670213698', venue: 'Domicile, Oasis', guests: 70, pkg: 'Essentielle', total: 16000, paid: [[-300, 5000], [-236, 11000, 'Solde']] });
    addEvent({ at: -190, booked: -260, type: 'Mariage', client: 'Famille Guessous', phone: '0662783145', venue: 'Salle Dar Essalam, Casablanca', guests: 260, pkg: 'Royale', total: 102000, paid: [[-260, 35000], [-190, 67000, 'Solde']] });
    addEvent({ at: -151, booked: -200, type: 'Mariage', client: 'Famille Amrani', phone: '0663981274', venue: 'Salle Al Firdaous, Casablanca', guests: 210, pkg: 'Prestige', total: 74000, paid: [[-200, 25000], [-151, 49000, 'Solde']] });
    addEvent({ at: -144, booked: -180, type: 'Henné', client: 'Famille Rachidi', phone: '0675123498', venue: 'Domicile, Hay Hassani', guests: 55, pkg: 'Tyafer + décoration', total: 13000, services: ['Tyafer', 'Décoration'], paid: [[-180, 4000], [-144, 9000, 'Solde']] });
    addEvent({ at: -109, booked: -170, type: 'Mariage', client: 'Famille Cherkaoui', phone: '0661784523', venue: 'Salle Royal Palace, Casablanca', guests: 290, pkg: 'Royale', total: 115000, paid: [[-170, 40000], [-109, 75000, 'Solde']] });
    addEvent({ at: -82, booked: -130, type: "Événement d'entreprise", client: 'Maroc Logistique', phone: '0522364178', venue: 'Siège social, Sidi Maârouf', guests: 120, pkg: 'Buffet cocktail', total: 26000, services: ['Buffet'], paid: [[-130, 13000], [-82, 13000, 'Solde']] });
    addEvent({ at: -48, booked: -140, type: 'Mariage', client: 'Famille Bennani', phone: '0661245873', venue: 'Salle Les Jardins, Casablanca', guests: 250, pkg: 'Prestige', total: 85000, services: ['Traiteur', 'Décoration', 'Tyafer'], paid: [[-140, 30000], [-48, 55000, 'Solde']] });
    addEvent({ at: -21, booked: -100, type: 'Fiançailles', client: 'Famille El Idrissi', phone: '0672318450', venue: 'Domicile, Aïn Diab', guests: 80, pkg: 'Essentielle', total: 18000, paid: [[-100, 6000], [-21, 12000, 'Solde']] });
    addEvent({ at: -7, booked: -60, type: 'Anniversaire', client: 'Mme Tazi', phone: '0650981234', venue: 'Villa, Bouskoura', guests: 60, pkg: 'Sur mesure', total: 12000, services: ['Buffet'], paid: [[-60, 4000], [-7, 8000, 'Solde']] });

    // Événements à venir (jusqu'à 9 mois à l'avance)
    addEvent({ at: 4, booked: -120, type: 'Mariage', client: 'Famille Alaoui', phone: '0663784512', venue: 'Salle Royal Palace, Casablanca', guests: 300, pkg: 'Royale', total: 120000, services: ['Traiteur', 'Décoration', 'Tyafer', 'Buffet'], paid: [[-120, 40000], [-30, 30000]], notes: "Menu poisson pour 20 invités. Arrivée de l'équipe à 16h." });
    addEvent({ at: 4, booked: -45, type: 'Henné', client: 'Famille Chraibi', phone: '0668452197', venue: 'Domicile, Maârif', guests: 70, pkg: 'Tyafer + décoration', total: 15000, services: ['Tyafer', 'Décoration'], paid: [[-45, 5000]] });
    addEvent({ at: 11, booked: -50, type: "Événement d'entreprise", client: 'Atlas Conseil', phone: '0522458796', venue: 'Hôtel, Casa Finance City', guests: 150, pkg: 'Buffet cocktail', total: 32000, services: ['Buffet'], paid: [[-50, 16000]] });
    addEvent({ at: 25, booked: -80, type: 'Mariage', client: 'Famille Berrada', phone: '0661987345', venue: 'Salle Al Firdaous, Casablanca', guests: 220, pkg: 'Prestige', total: 78000, paid: [[-80, 25000]] });
    addEvent({ at: 46, booked: -35, type: 'Fiançailles', client: 'Famille Ouazzani', phone: '0677123986', venue: 'Domicile, Californie', guests: 90, pkg: 'Essentielle', total: 20000, paid: [[-35, 6000]] });
    addEvent({ at: 68, booked: -40, type: 'Mariage', client: 'Famille Kettani', phone: '0662345718', venue: 'Salle Les Orangers, Casablanca', guests: 280, pkg: 'Royale', total: 110000, paid: [[-40, 30000]] });
    addEvent({ at: 68, booked: -12, type: 'Aqiqa / Baptême', client: 'M. Sefrioui', phone: '0655782341', venue: 'Domicile, Oasis', guests: 50, pkg: 'Sur mesure', total: 9000, services: ['Buffet'], paid: [] });
    addEvent({ at: 96, booked: -25, type: 'Mariage', client: 'Famille Lahlou', phone: '0670456123', venue: 'Salle Dar Essalam, Casablanca', guests: 200, pkg: 'Prestige', total: 72000, paid: [[-25, 20000]] });
    addEvent({ at: 112, booked: -18, type: 'Henné', client: 'Famille Tahiri', phone: '0661239874', venue: 'Domicile, Hay Hassani', guests: 60, pkg: 'Tyafer + décoration', total: 14000, services: ['Tyafer', 'Décoration'], paid: [[-18, 4000]] });
    addEvent({ at: 131, booked: -9, type: 'Mariage', client: 'Famille Mernissi', phone: '0664781235', venue: 'Salle Les Jardins, Casablanca', guests: 260, pkg: 'Royale', total: 105000, paid: [[-9, 30000]] });
    addEvent({ at: 175, booked: -6, type: 'Mariage', client: 'Famille Zniber', phone: '0669874512', venue: 'Salle Royal Palace, Casablanca', guests: 240, pkg: 'Prestige', total: 80000, paid: [[-6, 25000]] });
    addEvent({ at: 232, booked: -3, type: 'Mariage', client: 'Famille Benkirane', phone: '0673219865', venue: 'Villa, Dar Bouazza', guests: 180, pkg: 'Prestige', total: 68000, paid: [] });
    addEvent({ at: 268, booked: -2, type: 'Fiançailles', client: 'Famille Sqalli', phone: '0662147896', venue: 'Domicile, Anfa', guests: 100, pkg: 'Essentielle', total: 22000, paid: [] });

    // Demandes en cours
    function addReq(o) {
      requests.push({
        id: uid(), source: o.source, createdAt: d(o.created) + 'T' + (o.time || '09:30'), name: o.name, phone: o.phone, eventType: o.type,
        date: d(o.at), guests: o.guests, budget: o.budget || '', services: o.services || [], message: o.message || '',
        status: o.status, notes: o.notes || '', eventId: null
      });
    }
    addReq({ source: 'Site web', created: 0, time: '10:12', status: 'nouveau', name: 'Salma Aït Lahcen', phone: '0661728394', type: 'Mariage', at: 4, guests: 200, budget: '60 000 – 80 000 DH', services: ['Traiteur', 'Décoration'], message: 'Bonjour, nous cherchons un traiteur pour notre mariage. Est-ce que cette date est encore disponible ?' });
    addReq({ source: 'WhatsApp', created: -1, time: '18:40', status: 'nouveau', name: 'Youssef Amrani', phone: '0677345612', type: 'Fiançailles', at: 38, guests: 100, budget: '20 000 – 25 000 DH', services: ['Traiteur', 'Tyafer'], message: 'Fiançailles à la maison, environ 100 personnes.' });
    addReq({ source: 'Instagram', created: -2, time: '14:05', status: 'nouveau', name: 'Nadia Squalli', phone: '0650127845', type: 'Henné', at: 60, guests: 50, services: ['Tyafer', 'Décoration'], message: 'Je voudrais voir vos modèles de tyafer.' });
    addReq({ source: 'Boutique', created: -4, time: '11:20', status: 'contacte', name: 'Karim Fassi', phone: '0662984513', type: 'Mariage', at: 130, guests: 250, budget: '90 000 DH', services: ['Traiteur', 'Décoration', 'Buffet'], notes: 'Rappeler samedi. Hésite entre Prestige et Royale.' });
    addReq({ source: 'Téléphone', created: -7, time: '16:45', status: 'devis', name: 'Imane Rami', phone: '0671456239', type: 'Anniversaire', at: 18, guests: 40, services: ['Buffet'], notes: 'Devis envoyé par WhatsApp : 8 500 DH.' });
    addReq({ source: 'Site web', created: -10, time: '09:15', status: 'devis', name: 'Novatech SARL', phone: '0522987412', type: "Événement d'entreprise", at: 52, guests: 120, budget: '30 000 DH', services: ['Buffet'], notes: 'Cocktail de fin d\'année. Devis de 28 000 DH envoyé.' });
    addReq({ source: 'WhatsApp', created: -15, time: '20:30', status: 'refuse', name: 'Hamza Benjelloun', phone: '0663218745', type: 'Mariage', at: 200, guests: 400, services: ['Traiteur'], notes: 'Budget trop bas pour 400 invités.' });

    requests.sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; });

    var content = defaultContent();
    return {
      version: 1,
      settings: content.settings,
      services: content.services,
      packages: content.packages,
      gallery: content.gallery,
      requests: requests,
      events: events
    };
  }

  /* ---------- stockage ---------- */
  var memory = null;
  function load() {
    if (memory) return memory;
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { memory = JSON.parse(raw); return memory; }
    } catch (e) { /* stockage indisponible : on garde la démo en mémoire */ }
    memory = seed();
    save(memory);
    return memory;
  }
  function fresh() { memory = null; return load(); }
  function save(data) {
    memory = data;
    try { localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch (e) { return false; }
  }
  function reset() { memory = seed(); save(memory); return memory; }

  window.Torrais = {
    KEY: KEY,
    store: { load: load, fresh: fresh, save: save, reset: reset },
    util: {
      uid: uid, iso: iso, addDays: addDays, parseISO: parseISO, esc: esc, formatDH: formatDH,
      formatDate: formatDate, formatPhone: formatPhone, waNumber: waNumber, waLink: waLink, digits: digits
    },
    icons: ICONS,
    EVENT_TYPES: EVENT_TYPES,
    SERVICE_NAMES: SERVICE_NAMES,
    SOURCES: SOURCES,
    STATUSES: STATUSES,
    PENDING: PENDING
  };
})();
