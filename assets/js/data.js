/*
 * TORRAIS EVENT — données de démonstration partagées entre le site et le tableau de bord.
 * Tout est stocké dans le navigateur (localStorage). Dans la version finale,
 * ces données viendront d'une vraie base de données.
 */
(function () {
  'use strict';

  var KEY = 'torrais_demo_v3';

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

  var EVENT_TYPES = ['Mariage', 'Fiançailles', 'Henné', 'Aqiqa / Baptême', 'Anniversaire', "Événement d'entreprise", 'Funérailles', 'Autre'];
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
  var ROLES = ['Chef cuisinier', 'Cuisinier', 'Aide-cuisinier', 'Serveur', "Maître d'hôtel", 'Musicien', 'Négafa', 'Photographe', 'Décorateur', 'Chauffeur', 'Plongeur', 'Autre'];
  var INV_CATEGORIES = ['Mobilier', 'Linge', 'Vaisselle', 'Service', 'Tyafer', 'Décoration', 'Autre'];
  var EXPENSE_CATEGORIES = ['Ingrédients', 'Location', 'Transport', 'Décoration', 'Autre'];
  // Quantité habituelle d'un article selon l'événement (pour la proposition automatique)
  var INV_RULES = [
    { id: '', label: 'Aucune (à saisir à la main)' },
    { id: 'guest1', label: '1 par invité' },
    { id: 'guest2', label: '2 par invité' },
    { id: 'table1', label: '1 par table de 10' }
  ];
  var SOURCES = ['Site web', 'WhatsApp', 'Téléphone', 'Boutique', 'Instagram', 'Bouche-à-oreille', 'Autre'];

  /* ---------- carte des plats (choix pour le menu d'un événement) ---------- */
  var DISH_CATEGORIES = ['Accueil', 'Entrées', 'Plats', 'Desserts', 'Boissons', 'Autres'];
  var DEFAULT_DISHES = {
    'Accueil': ["Cocktail d'accueil", 'Dattes et lait', 'Jus frais', 'Briouates', 'Mini pastillas', 'Verrines salées', 'Mini brochettes'],
    'Entrées': ['Pastilla au poulet', 'Pastilla aux fruits de mer', 'Salades marocaines', 'Harira'],
    'Plats': ['Méchoui', 'Poulet aux olives et citron confit', 'Tajine de viande aux pruneaux', 'Tajine de veau aux pruneaux', 'Poisson à la chermoula', 'Couscous royal', 'Tanjia', 'Buffet salé'],
    'Desserts': ['Corbeille de fruits', 'Buffet de desserts', 'Gâteau des mariés', 'Gâteau', 'Petits fours sucrés', 'Pâtisseries marocaines'],
    'Boissons': ['Thé à la menthe et pâtisseries marocaines', 'Thé à la menthe', 'Café', 'Jus et boissons'],
    'Autres': []
  };
  function defaultDishes() {
    var out = [];
    DISH_CATEGORIES.forEach(function (c) { DEFAULT_DISHES[c].forEach(function (n) { out.push({ name: n, category: c }); }); });
    return out;
  }

  /* ---------- pages et sections du site (modifiables dans l'espace gérant) ---------- */
  var GALLERY_CATEGORIES = ['Mariages', 'Cuisine', 'Tyafer', 'Décoration'];
  var GALLERY_GUESS = {
    "Table d'honneur": 'Mariages', 'Buffet marocain': 'Cuisine', 'Tyafer de la henné': 'Tyafer', 'Kousha de la mariée': 'Décoration',
    'Pastilla royale': 'Cuisine', 'Plateaux de fruits': 'Cuisine', 'Décoration florale': 'Décoration', 'Pâtisseries marocaines': 'Cuisine'
  };
  /* ---------- packs mariage ---------- */
  var PACK_INCLUDES = ['Décoration', 'Caméra', 'DJ', 'Dessert', 'Jus', 'Gâteaux', 'Thé à la menthe', 'Dattes et lait'];
  function defaultPackages() {
    return [
      { id: 'essentiel', name: 'Essentiel', place: 'Chez vous', tables: 2, tenues: 2, featured: false, image: '', price: '',
        menus: [{ label: 'Poulet + viande aux pruneaux', price: 12900 }, { label: 'Pastilla au poisson + viande aux pruneaux', price: 12900 }],
        features: PACK_INCLUDES.slice() },
      { id: 'villa', name: 'Villa', place: 'Location de villa incluse', tables: 6, tenues: 3, featured: true, image: '', price: '',
        menus: [{ label: 'Pastilla poulet + viande aux pruneaux', price: 29500 }, { label: 'Pastilla poisson + viande aux pruneaux', price: 32500 }],
        features: PACK_INCLUDES.slice() },
      { id: 'salle', name: 'Salle de fête', place: 'Location de salle incluse', tables: 10, tenues: 5, featured: false, image: '', price: '',
        menus: [{ label: 'Poulet + viande aux pruneaux', price: 39900 }, { label: 'Pastilla poisson + viande aux pruneaux', price: 57000 }],
        features: PACK_INCLUDES.map(function (x) { return x === 'DJ' ? 'Orchestre' : x; }) }
    ];
  }
  // Packs des autres services (le mariage garde data.packages) : contenu à venir, remplacé quand le gérant l'envoie
  var PACK_GROUPS = [
    { id: 'mariage', label: 'Mariage' },
    { id: 'fiancailles', label: 'Fiançailles' },
    { id: 'bapteme', label: 'Baptême' },
    { id: 'entreprise', label: 'Entreprise' },
    { id: 'prive', label: 'Événements privés' }
  ];
  function placeholderPacks() {
    return ['Essentiel', 'Prestige', 'Royal'].map(function (n, i) {
      return { id: n.toLowerCase(), name: n, place: '', tables: 0, tenues: 0, featured: i === 1, image: '', price: '', menus: [], features: [], soon: true };
    });
  }
  function defaultServicePacks() {
    return { fiancailles: placeholderPacks(), bapteme: placeholderPacks(), entreprise: placeholderPacks(), prive: placeholderPacks() };
  }
  function defaultOccasions() {
    return [
      { id: 'mariage', title: 'Mariage / Fiançailles', eventType: 'Mariage', galleryCat: 'Mariages', image: 'assets/img/services/mariage.webp',
        short: 'Le grand jour, du dîner à la kousha, pensé dans les moindres détails.',
        text: "Votre mariage ou vos fiançailles méritent une table à la hauteur de l'émotion. Neggafa, décoration, caméra, musique, dîner et douceurs : choisissez votre pack, nous nous occupons de tout pour que vous profitiez de votre fête.",
        includes: ['Neggafa et tenues', 'Décoration de la salle et de la kousha', 'Caméra et musique (DJ ou orchestre)', 'Dîner : pastilla, viande aux pruneaux, poulet…', 'Dessert, jus, gâteaux, thé à la menthe, dattes et lait'] },
      { id: 'bapteme', title: 'Baptême', eventType: 'Aqiqa / Baptême', galleryCat: 'Cuisine', image: 'assets/img/services/bapteme.webp',
        short: 'Célébrez l’arrivée de bébé avec un repas généreux pour vos proches.',
        text: 'Pour le baptême (aqiqa), nous préparons le repas traditionnel, le thé et les douceurs, chez vous ou en salle, pour que vous profitiez pleinement de ce moment en famille.',
        includes: ['Méchoui, viande aux pruneaux ou poulet rôti', 'Thé, dattes et pâtisseries', 'Service sur place', 'Livraison à domicile possible'] },
      { id: 'entreprise', title: 'Entreprise', eventType: "Événement d'entreprise", galleryCat: 'Cuisine', image: 'assets/img/services/entreprise.webp',
        short: 'Cocktails, séminaires et fins d’année pour vos équipes et vos clients.',
        text: 'Inauguration, séminaire, fin d’année ou réception de clients : nous proposons des cocktails dînatoires et des buffets élégants, ponctuels et adaptés à votre image.',
        includes: ['Cocktail dînatoire ou buffet', 'Pauses café', 'Service en tenue', 'Devis rapide et facture'] },
      { id: 'prive', title: 'Événements privés', eventType: 'Autre', galleryCat: 'Cuisine', image: 'assets/img/services/prive.webp',
        short: 'Anniversaires, henné, réceptions de famille : une fête à votre image.',
        text: 'Anniversaire, soirée du henné, retour de pèlerinage ou réception de famille : nous préparons un menu et un service sur mesure, chez vous ou dans la salle de votre choix.',
        includes: ['Menu sur mesure', 'Buffet ou service à table', 'Tyafer et décoration selon vos envies', 'Gâteau et douceurs marocaines'] }
    ];
  }
  function defaultGallery() {
    return [
        { id: uid(), src: 'assets/img/gallery/g01.webp', caption: 'Salle de réception', category: 'Mariages', tone: 1 },
        { id: uid(), src: 'assets/img/gallery/g02.webp', caption: 'Salon traditionnel', category: 'Décoration', tone: 2 },
        { id: uid(), src: 'assets/img/gallery/g03.webp', caption: 'Coffret de fiançailles', category: 'Mariages', tone: 3 },
        { id: uid(), src: 'assets/img/gallery/g04.webp', caption: 'Dattes et douceurs', category: 'Cuisine', tone: 4 },
        { id: uid(), src: 'assets/img/gallery/g05.webp', caption: 'Salon des mariés', category: 'Décoration', tone: 5 },
        { id: uid(), src: 'assets/img/gallery/g06.webp', caption: 'Pastilla aux fruits de mer', category: 'Cuisine', tone: 6 },
        { id: uid(), src: 'assets/img/gallery/g07.webp', caption: 'Arche personnalisée', category: 'Décoration', tone: 7 },
        { id: uid(), src: 'assets/img/gallery/g08.webp', caption: 'Table de baby shower', category: 'Décoration', tone: 8 },
        { id: uid(), src: 'assets/img/gallery/g09.webp', caption: 'Buffet sucré', category: 'Cuisine', tone: 1 },
        { id: uid(), src: 'assets/img/gallery/g10.webp', caption: 'Accueil traditionnel', category: 'Mariages', tone: 2 },
        { id: uid(), src: 'assets/img/gallery/g11.webp', caption: 'Service du thé', category: 'Cuisine', tone: 3 }
    ];
  }
  // Le menu de TORRAIS EVENT (liste du gérant), classé en 5 familles. photos : la 1re est la principale.
  var MENU_IMG = 'assets/img/menu/';
  // Photos de chaque service (pages Baptême, Entreprise, Événements privés) — Mariage : à venir
  function defaultServicePhotos() {
    return {"prive": ["assets/img/services/prive/01.webp", "assets/img/services/prive/02.webp", "assets/img/services/prive/03.webp", "assets/img/services/prive/04.webp", "assets/img/services/prive/05.webp", "assets/img/services/prive/06.webp", "assets/img/services/prive/07.webp", "assets/img/services/prive/08.webp", "assets/img/services/prive/09.webp", "assets/img/services/prive/10.webp", "assets/img/services/prive/11.webp", "assets/img/services/prive/12.webp", "assets/img/services/prive/13.webp", "assets/img/services/prive/14.webp", "assets/img/services/prive/15.webp", "assets/img/services/prive/16.webp"], "entreprise": ["assets/img/services/entreprise/01.webp", "assets/img/services/entreprise/02.webp", "assets/img/services/entreprise/03.webp", "assets/img/services/entreprise/04.webp", "assets/img/services/entreprise/05.webp", "assets/img/services/entreprise/06.webp", "assets/img/services/entreprise/07.webp", "assets/img/services/entreprise/08.webp", "assets/img/services/entreprise/09.webp", "assets/img/services/entreprise/10.webp", "assets/img/services/entreprise/11.webp"], "bapteme": ["assets/img/services/bapteme/01.webp", "assets/img/services/bapteme/02.webp", "assets/img/services/bapteme/03.webp", "assets/img/services/bapteme/04.webp", "assets/img/services/bapteme/05.webp", "assets/img/services/bapteme/06.webp", "assets/img/services/bapteme/07.webp", "assets/img/services/bapteme/08.webp", "assets/img/services/bapteme/09.webp", "assets/img/services/bapteme/10.webp", "assets/img/services/bapteme/11.webp", "assets/img/services/bapteme/12.webp", "assets/img/services/bapteme/13.webp", "assets/img/services/bapteme/14.webp", "assets/img/services/bapteme/15.webp", "assets/img/services/bapteme/16.webp", "assets/img/services/bapteme/18.webp"], "mariage": ["assets/img/services/mariage/01.webp", "assets/img/services/mariage/02.webp", "assets/img/services/mariage/03.webp", "assets/img/services/mariage/04.webp", "assets/img/services/mariage/05.webp", "assets/img/services/mariage/06.webp", "assets/img/services/mariage/07.webp", "assets/img/services/mariage/08.webp", "assets/img/services/mariage/09.webp", "assets/img/services/mariage/10.webp", "assets/img/services/mariage/11.webp", "assets/img/services/mariage/12.webp", "assets/img/services/mariage/13.webp", "assets/img/services/mariage/14.webp", "assets/img/services/mariage/15.webp", "assets/img/services/mariage/16.webp", "assets/img/services/mariage/17.webp", "assets/img/services/mariage/18.webp", "assets/img/services/mariage/19.webp", "assets/img/services/mariage/20.webp", "assets/img/services/mariage/21.webp", "assets/img/services/mariage/22.webp", "assets/img/services/mariage/23.webp", "assets/img/services/mariage/24.webp", "assets/img/services/mariage/25.webp", "assets/img/services/mariage/26.webp", "assets/img/services/mariage/27.webp", "assets/img/services/mariage/28.webp", "assets/img/services/mariage/29.webp", "assets/img/services/mariage/30.webp", "assets/img/services/mariage/31.webp"]};
  }
  // Photos du mariage ajoutées au mur (sans celles déjà présentes)
  function moreGalleryMariage() {
    return [
      { id: uid(), src: 'assets/img/services/mariage/01.webp', caption: 'Mariage', category: 'Mariages', tone: 1 },
      { id: uid(), src: 'assets/img/services/mariage/02.webp', caption: 'Mariage', category: 'Mariages', tone: 2 },
      { id: uid(), src: 'assets/img/services/mariage/03.webp', caption: 'Mariage', category: 'Mariages', tone: 3 },
      { id: uid(), src: 'assets/img/services/mariage/04.webp', caption: 'Mariage', category: 'Mariages', tone: 4 },
      { id: uid(), src: 'assets/img/services/mariage/05.webp', caption: 'Mariage', category: 'Mariages', tone: 5 },
      { id: uid(), src: 'assets/img/services/mariage/06.webp', caption: 'Mariage', category: 'Mariages', tone: 6 },
      { id: uid(), src: 'assets/img/services/mariage/07.webp', caption: 'Mariage', category: 'Mariages', tone: 7 },
      { id: uid(), src: 'assets/img/services/mariage/08.webp', caption: 'Mariage', category: 'Mariages', tone: 8 },
      { id: uid(), src: 'assets/img/services/mariage/10.webp', caption: 'Mariage', category: 'Mariages', tone: 1 },
      { id: uid(), src: 'assets/img/services/mariage/11.webp', caption: 'Mariage', category: 'Mariages', tone: 2 },
      { id: uid(), src: 'assets/img/services/mariage/12.webp', caption: 'Mariage', category: 'Mariages', tone: 3 },
      { id: uid(), src: 'assets/img/services/mariage/13.webp', caption: 'Mariage', category: 'Mariages', tone: 4 },
      { id: uid(), src: 'assets/img/services/mariage/14.webp', caption: 'Mariage', category: 'Mariages', tone: 5 },
      { id: uid(), src: 'assets/img/services/mariage/15.webp', caption: 'Mariage', category: 'Mariages', tone: 6 },
      { id: uid(), src: 'assets/img/services/mariage/16.webp', caption: 'Mariage', category: 'Mariages', tone: 7 },
      { id: uid(), src: 'assets/img/services/mariage/17.webp', caption: 'Mariage', category: 'Mariages', tone: 8 },
      { id: uid(), src: 'assets/img/services/mariage/19.webp', caption: 'Mariage', category: 'Mariages', tone: 1 },
      { id: uid(), src: 'assets/img/services/mariage/21.webp', caption: 'Mariage', category: 'Mariages', tone: 2 },
      { id: uid(), src: 'assets/img/services/mariage/22.webp', caption: 'Mariage', category: 'Mariages', tone: 3 },
      { id: uid(), src: 'assets/img/services/mariage/24.webp', caption: 'Mariage', category: 'Mariages', tone: 4 },
      { id: uid(), src: 'assets/img/services/mariage/25.webp', caption: 'Mariage', category: 'Mariages', tone: 5 },
      { id: uid(), src: 'assets/img/services/mariage/26.webp', caption: 'Mariage', category: 'Mariages', tone: 6 },
      { id: uid(), src: 'assets/img/services/mariage/28.webp', caption: 'Mariage', category: 'Mariages', tone: 7 },
      { id: uid(), src: 'assets/img/services/mariage/29.webp', caption: 'Mariage', category: 'Mariages', tone: 8 },
      { id: uid(), src: 'assets/img/services/mariage/30.webp', caption: 'Mariage', category: 'Mariages', tone: 1 },
      { id: uid(), src: 'assets/img/services/mariage/31.webp', caption: 'Mariage', category: 'Mariages', tone: 2 }
    ];
  }
  // Photos des services ajoutées au mur de la galerie (chacune une seule fois, sans doublon avec les 11 premières)
  function moreGallery() {
    return [
      { id: uid(), src: 'assets/img/services/prive/01.webp', caption: 'Événements privés', category: 'Événements privés', tone: 1 },
      { id: uid(), src: 'assets/img/services/prive/02.webp', caption: 'Événements privés', category: 'Événements privés', tone: 2 },
      { id: uid(), src: 'assets/img/services/prive/03.webp', caption: 'Événements privés', category: 'Événements privés', tone: 3 },
      { id: uid(), src: 'assets/img/services/prive/04.webp', caption: 'Événements privés', category: 'Événements privés', tone: 4 },
      { id: uid(), src: 'assets/img/services/prive/05.webp', caption: 'Événements privés', category: 'Événements privés', tone: 5 },
      { id: uid(), src: 'assets/img/services/prive/06.webp', caption: 'Événements privés', category: 'Événements privés', tone: 6 },
      { id: uid(), src: 'assets/img/services/prive/08.webp', caption: 'Événements privés', category: 'Événements privés', tone: 7 },
      { id: uid(), src: 'assets/img/services/prive/09.webp', caption: 'Événements privés', category: 'Événements privés', tone: 8 },
      { id: uid(), src: 'assets/img/services/prive/10.webp', caption: 'Événements privés', category: 'Événements privés', tone: 1 },
      { id: uid(), src: 'assets/img/services/prive/11.webp', caption: 'Événements privés', category: 'Événements privés', tone: 2 },
      { id: uid(), src: 'assets/img/services/prive/12.webp', caption: 'Événements privés', category: 'Événements privés', tone: 3 },
      { id: uid(), src: 'assets/img/services/prive/13.webp', caption: 'Événements privés', category: 'Événements privés', tone: 4 },
      { id: uid(), src: 'assets/img/services/prive/14.webp', caption: 'Événements privés', category: 'Événements privés', tone: 5 },
      { id: uid(), src: 'assets/img/services/prive/15.webp', caption: 'Événements privés', category: 'Événements privés', tone: 6 },
      { id: uid(), src: 'assets/img/services/prive/16.webp', caption: 'Événements privés', category: 'Événements privés', tone: 7 },
      { id: uid(), src: 'assets/img/services/entreprise/01.webp', caption: 'Entreprise', category: 'Entreprise', tone: 8 },
      { id: uid(), src: 'assets/img/services/entreprise/02.webp', caption: 'Entreprise', category: 'Entreprise', tone: 1 },
      { id: uid(), src: 'assets/img/services/entreprise/03.webp', caption: 'Entreprise', category: 'Entreprise', tone: 2 },
      { id: uid(), src: 'assets/img/services/entreprise/04.webp', caption: 'Entreprise', category: 'Entreprise', tone: 3 },
      { id: uid(), src: 'assets/img/services/entreprise/05.webp', caption: 'Entreprise', category: 'Entreprise', tone: 4 },
      { id: uid(), src: 'assets/img/services/entreprise/06.webp', caption: 'Entreprise', category: 'Entreprise', tone: 5 },
      { id: uid(), src: 'assets/img/services/entreprise/07.webp', caption: 'Entreprise', category: 'Entreprise', tone: 6 },
      { id: uid(), src: 'assets/img/services/entreprise/08.webp', caption: 'Entreprise', category: 'Entreprise', tone: 7 },
      { id: uid(), src: 'assets/img/services/entreprise/09.webp', caption: 'Entreprise', category: 'Entreprise', tone: 8 },
      { id: uid(), src: 'assets/img/services/entreprise/10.webp', caption: 'Entreprise', category: 'Entreprise', tone: 1 },
      { id: uid(), src: 'assets/img/services/bapteme/01.webp', caption: 'Baptême', category: 'Baptême', tone: 2 },
      { id: uid(), src: 'assets/img/services/bapteme/02.webp', caption: 'Baptême', category: 'Baptême', tone: 3 },
      { id: uid(), src: 'assets/img/services/bapteme/03.webp', caption: 'Baptême', category: 'Baptême', tone: 4 },
      { id: uid(), src: 'assets/img/services/bapteme/04.webp', caption: 'Baptême', category: 'Baptême', tone: 5 },
      { id: uid(), src: 'assets/img/services/bapteme/05.webp', caption: 'Baptême', category: 'Baptême', tone: 6 },
      { id: uid(), src: 'assets/img/services/bapteme/06.webp', caption: 'Baptême', category: 'Baptême', tone: 7 },
      { id: uid(), src: 'assets/img/services/bapteme/07.webp', caption: 'Baptême', category: 'Baptême', tone: 8 },
      { id: uid(), src: 'assets/img/services/bapteme/09.webp', caption: 'Baptême', category: 'Baptême', tone: 1 },
      { id: uid(), src: 'assets/img/services/bapteme/10.webp', caption: 'Baptême', category: 'Baptême', tone: 2 },
      { id: uid(), src: 'assets/img/services/bapteme/11.webp', caption: 'Baptême', category: 'Baptême', tone: 3 },
      { id: uid(), src: 'assets/img/services/bapteme/12.webp', caption: 'Baptême', category: 'Baptême', tone: 4 },
      { id: uid(), src: 'assets/img/services/bapteme/13.webp', caption: 'Baptême', category: 'Baptême', tone: 5 },
      { id: uid(), src: 'assets/img/services/bapteme/14.webp', caption: 'Baptême', category: 'Baptême', tone: 6 },
      { id: uid(), src: 'assets/img/services/bapteme/16.webp', caption: 'Baptême', category: 'Baptême', tone: 7 },
      { id: uid(), src: 'assets/img/services/bapteme/18.webp', caption: 'Baptême', category: 'Baptême', tone: 8 }
    ];
  }
  function defaultMenuCats() {
    var cats = [
      { id: 'plats', title: 'Plats principaux', image: MENU_IMG + 'pastilla-poulet.webp',
        short: 'Pastillas, viandes, poulet rôti, méchoui et poisson : le cœur de votre dîner.',
        dishes: [
          { name: 'Pastilla poulet', photos: [MENU_IMG + 'pastilla-poulet.webp'] },
          { name: 'Pastilla poisson', photos: [MENU_IMG + 'pastilla-poisson.webp'] },
          { name: 'Viande aux pruneaux', photos: [MENU_IMG + 'viande-pruneaux.webp'] },
          { name: 'Demi-méchoui', photos: [MENU_IMG + 'demi-mechoui.webp'] },
          { name: 'Poulet rôti avec daghmira', photos: [MENU_IMG + 'poulet-roti.webp'] },
          { name: 'Poisson', photos: [MENU_IMG + 'poisson-2.webp', MENU_IMG + 'poisson.webp'] }
        ] },
      { id: 'desserts', title: 'Desserts', image: MENU_IMG + 'fruits.webp',
        short: 'Fruits, glace et gâteau des mariés pour finir en douceur.',
        dishes: [
          { name: 'Dessert (fruits)', photos: [MENU_IMG + 'fruits.webp'] },
          { name: 'Glace', photos: [MENU_IMG + 'glace.webp'] },
          { name: 'Gâteau des mariés', photos: [] }
        ] },
      { id: 'sucres-sales', title: 'Mets sucrés-salés', image: MENU_IMG + 'mets-sucres-sales.webp',
        short: 'Bouchées salées et gâteaux, à l’accueil ou avec le thé.',
        dishes: [
          { name: 'Mets sucrés-salés', photos: [MENU_IMG + 'mets-sucres-sales.webp'] },
          { name: 'Gâteaux', photos: [MENU_IMG + 'gateaux.webp', MENU_IMG + 'gateaux-2.webp'] }
        ] },
      { id: 'salades', title: 'Salades', image: '',
        short: 'Salades fraîches pour ouvrir le repas.',
        dishes: [
          { name: 'Salades', photos: [] }
        ] },
      { id: 'jus', title: 'Jus', image: MENU_IMG + 'jus.webp',
        short: 'Jus frais, et l’accueil traditionnel avec les dattes et le lait.',
        dishes: [
          { name: 'Jus', photos: [MENU_IMG + 'jus.webp'] },
          { name: 'Dattes et lait', photos: [MENU_IMG + 'dattes-lait.webp'] }
        ] }
    ];
    cats.forEach(function (c) { c.items = c.dishes.map(function (d) { return d.name; }); });
    return cats;
  }
  // Les étapes du mariage (page Mariage / Fiançailles)
  function defaultWeddingSteps() {
    return [
      { title: 'Le lieu', text: 'Votre fête où vous le souhaitez : nous nous occupons de la salle ou nous venons chez vous.', choose: true, options: ['Salle de fête', 'Villa', 'À domicile'] },
      { title: 'L’ambiance traditionnelle', text: 'Une entrée inoubliable, portée par les rythmes de la tradition marocaine.', choose: true, options: ['Issawa', 'Dakka marrakchia'] },
      { title: 'La musique', text: 'Pour faire danser vos invités toute la soirée.', choose: true, options: ['DJ', 'Orchestre'] },
      { title: 'L’entrée', text: 'L’accueil des invités, comme le veut la tradition.', choose: false, options: ['Dattes et lait'], image: 'assets/img/services/entree-dattes.webp' },
      { title: 'Le thé', text: 'Atay servi dans les règles de l’art, accompagné des douceurs de votre choix.', choose: true, options: ['Mets sucrés-salés', 'Gâteaux'] },
      { title: 'La neggafa', text: 'Pour sublimer la mariée tout au long de la soirée.', choose: false, options: ['De 2 à 5 tenues'] },
      { title: 'Photographe et vidéaste', text: 'Chaque instant capturé, en photo et en vidéo, pour revivre votre mariage.', choose: false, options: ['Photographe', 'Vidéaste'] },
      { title: 'Votre menu', text: 'Composez votre dîner parmi nos plats\u00a0: pastillas, viandes, poulet, méchoui, desserts…', choose: false, options: [], link: { href: 'menus.html', label: 'Voir nos menus' }, images: ['assets/img/menu/pastilla-poisson.webp', 'assets/img/menu/viande-pruneaux.webp'] }
    ];
  }
  // Carrousel « Nos menus » de l'accueil : les plats principaux, avec leur photo
  function defaultMenuDishes() {
    return defaultMenuCats()[0].dishes.map(function (d) { return { id: uid(), name: d.name, text: '', image: d.photos[0] || '' }; });
  }
  function defaultSite() {
    return {
      stats: [
        { value: '11,5 k', label: 'abonnés sur Instagram' },
        { value: '4', label: 'métiers : traiteur, buffet, tyafer, décoration' },
        { value: '7j/7', label: 'à votre écoute' },
        { value: '100 %', label: 'formules sur mesure' }
      ],
      zones: ['Casablanca', 'Mohammedia', 'Bouskoura', 'Dar Bouazza', 'Nouaceur', 'Berrechid'],
      dishes: defaultMenuDishes(),
      faq: [
        { q: 'Que propose TORRAIS EVENT ?', a: 'Un service complet, du lieu au dîner : mariages et fiançailles avec nos packs Essentiel, Villa et Salle de fête, baptêmes, événements d’entreprise et fêtes privées, en salle, en villa ou à domicile.', html: '<p>Nous préparons votre fête de A à Z, en salle, en villa ou chez vous :</p><ul><li><strong>Mariage &amp; fiançailles</strong> — trois packs tout compris (Essentiel, Villa, Salle de fête) : neggafa, décoration, caméra, DJ ou orchestre, dîner et douceurs.</li><li><strong>Baptême, entreprise et fêtes privées</strong> — repas traditionnel, buffets et cocktails adaptés à votre nombre d’invités.</li><li><strong>Notre cuisine</strong> — pastillas, viande aux pruneaux, poulet rôti avec daghmira, demi-méchoui, poisson, mets sucrés-salés, desserts et jus.</li><li><strong>Pour une entrée inoubliable</strong> — dattes et lait, Issawa ou dakka marrakchia, photographe et vidéaste, tyafer et kousha.</li></ul><p>Vous préférez composer vous-même ? Essayez notre <a href="composer.html">simulateur</a>.</p>' },
        { q: 'Combien de temps à l’avance faut-il réserver ?', a: 'Pour un mariage, idéalement 3 à 4 mois avant, surtout en été. Pour une petite réception, quelques semaines suffisent souvent : contactez-nous pour vérifier la date.' },
        { q: 'Est-ce que vous vous déplacez à domicile ?', a: 'Oui. Nous servons en salle comme à domicile, à Casablanca et dans les environs.' },
        { q: 'Peut-on adapter une formule ?', a: 'Bien sûr. Chaque formule est une base : nous ajustons le menu, la décoration et le service selon vos envies et votre budget.' },
        { q: 'Comment réserver une date ?', a: 'Envoyez-nous une demande de devis ou écrivez-nous sur WhatsApp. Après validation du devis, un acompte confirme la réservation.' },
        { q: 'Proposez-vous aussi les tyafer et la décoration seuls ?', a: 'Oui, vous pouvez réserver uniquement les tyafer, la décoration ou un buffet, sans le dîner complet.' }
      ],
      reviews: []
    };
  }

  /* ---------- prix du simulateur « Composez votre mariage » (prix de démonstration) ---------- */
  // unit : 'pers' (par invité), 'table' (par table de 10), 'forfait' (une fois), 'unite' (au nombre choisi)
  function defaultPricing() {
    return {
      packages: {
        essentiel: { min: 180, max: 250, includes: [] },
        villa: { min: 280, max: 380, includes: ['mechoui', 'desserts', 'deco_tables'] },
        salle: { min: 420, max: 600, includes: ['cocktail', 'mechoui', 'desserts', 'gateau', 'deco_tables', 'deco_salle', 'kousha', 'maitre'] },
        surmesure: { min: 120, max: 180, includes: [] }
      },
      options: [
        { id: 'cocktail', group: 'Menu', name: "Cocktail d'accueil", text: 'Jus frais, briouates, mini pastillas', unit: 'pers', min: 40, max: 60 },
        { id: 'mechoui', group: 'Menu', name: 'Méchoui', text: 'Agneau rôti lentement', unit: 'pers', min: 60, max: 90 },
        { id: 'pastilla_mer', group: 'Menu', name: 'Pastilla aux fruits de mer', text: 'En entrée, à la place de la pastilla au poulet', unit: 'pers', min: 35, max: 50 },
        { id: 'desserts', group: 'Menu', name: 'Buffet de desserts', text: 'Pâtisseries marocaines et gâteaux', unit: 'pers', min: 30, max: 45 },
        { id: 'gateau', group: 'Menu', name: 'Gâteau des mariés', text: 'Pièce montée personnalisée', unit: 'forfait', min: 1500, max: 3000 },
        { id: 'deco_tables', group: 'Décoration', name: 'Décoration des tables', text: 'Centres de table, fleurs, nappage', unit: 'table', min: 150, max: 250 },
        { id: 'kousha', group: 'Décoration', name: 'Kousha de la mariée', text: 'Trône et décor de la scène', unit: 'forfait', min: 3000, max: 6000 },
        { id: 'deco_salle', group: 'Décoration', name: 'Décoration complète de la salle', text: 'Entrée, lumières, fleurs, scène', unit: 'forfait', min: 8000, max: 15000 },
        { id: 'tyafer', group: 'Décoration', name: 'Tyafer décorés', text: 'Pour la henné, les fiançailles ou la dote', unit: 'unite', min: 250, max: 400 },
        { id: 'maitre', group: 'Service', name: "Maître d'hôtel dédié", text: 'Coordonne le service toute la soirée', unit: 'forfait', min: 800, max: 1200 }
      ]
    };
  }

  /* ---------- contenu par défaut du site ---------- */
  function defaultContent() {
    return {
      // Photos du site : logo, diaporama du héros, photo « Notre maison »
      media: { logo: '', about: '', hero: [] },
      settings: {
        businessName: 'TORRAIS EVENT',
        owner: 'Saïd',
        phone: '0663351507',
        phone2: '0633318936',
        whatsapp: '0663351507',
        email: '',
        instagram: 'https://www.instagram.com/torrais.event/',
        city: 'Casablanca',
        address: 'Casablanca, Maroc',
        hours: 'Tous les jours, de 9h à 21h',
        tagline: 'Réservez la formule mariage à votre service, selon votre choix.'
      },
      services: [
        { id: 'traiteur', image: '', icon: 'traiteur', title: 'Traiteur', text: 'Cuisine marocaine traditionnelle et internationale : pastilla, méchoui, tajines, plats royaux et desserts, préparés avec soin pour tous vos invités.' },
        { id: 'buffet', image: '', icon: 'buffet', title: 'Buffet', text: "Buffets et cocktails dînatoires, salés et sucrés, pour vos mariages, fiançailles, anniversaires et événements d'entreprise." },
        { id: 'tyafer', image: '', icon: 'tyafer', title: 'Tyafer', text: 'Tyafer décorés pour la henné, les fiançailles et la dote : une présentation raffinée des cadeaux, dans le respect de la tradition.' },
        { id: 'deco', image: '', icon: 'deco', title: 'Décoration', text: 'Décoration des tables, fleurs, lumières et kousha de la mariée, accordées au thème et aux couleurs de votre fête.' }
      ],
      packages: defaultPackages(),
      gallery: defaultGallery()
    };
  }

  /* ---------- contenu du site (aucune donnée client ou employé) ---------- */
  function seed() {
    var content = defaultContent();
    return {
      version: 1,
      settings: content.settings,
      services: content.services,
      packages: content.packages,
      gallery: content.gallery,
      media: content.media,
      dishes: defaultDishes(),
      site: defaultSite(),
      occasions: defaultOccasions(),
      pricing: defaultPricing()
    };
  }

  /* ---------- stockage ---------- */
  var memory = null;
  // Complète les données enregistrées avant l'ajout de nouvelles fonctions
  function ensure(d) {
    // anciennes données de démonstration du tableau de bord : supprimées des navigateurs des visiteurs
    ['requests', 'events', 'staff', 'inventory'].forEach(function (k) { delete d[k]; });
    if (!d.media) d.media = { logo: '', about: '', hero: [] };
    if (!d.media.hero) d.media.hero = [];
    if (d.media.heroVideo == null) d.media.heroVideo = true; // photo de la salle en fond quand il n'y a pas de photos
    if (!d.dishes) d.dishes = defaultDishes();
    (d.services || []).forEach(function (x) { if (x.image == null) x.image = ''; });
    (d.packages || []).forEach(function (x) { if (x.image == null) x.image = ''; });
    if (!d.site) d.site = defaultSite();
    ['stats', 'zones', 'dishes', 'faq', 'reviews'].forEach(function (k) { if (!d.site[k]) d.site[k] = defaultSite()[k]; });
    if (!d.occasions) d.occasions = defaultOccasions();
    // v2 : 8 services (Mariage, Fiançailles, Henné, Aqiqa, Anniversaire, Entreprise, Funérailles, Autre) — on garde les photos déjà ajoutées
    // v3 : 4 services (Mariage / Fiançailles, Baptême, Entreprise, Événements privés) — on garde les photos
    if (!d.occasionsV3) {
      var keep3 = {};
      var to3 = { mariage: 'mariage', fiancailles: 'mariage', aqiqa: 'bapteme', entreprise: 'entreprise', anniversaire: 'prive', famille: 'prive', henne: 'prive', autre: 'prive' };
      (d.occasions || []).forEach(function (o) { var k = to3[o.id]; if (k && o.image && !keep3[k]) keep3[k] = o.image; });
      d.occasions = defaultOccasions();
      d.occasions.forEach(function (o) { if (keep3[o.id]) o.image = keep3[o.id]; });
      d.occasionsV2 = d.occasionsV3 = true;
    }
    // menu de la page d'accueil
    // v3 : le vrai menu (liste du gérant + photos)
    if (!d.site.menuV3) { d.site.dishes = defaultMenuDishes(); d.site.menuCats = defaultMenuCats(); d.site.menuV3 = true; }
    if (!d.servicePacks) d.servicePacks = defaultServicePacks();
    d.servicePhotos = defaultServicePhotos();
    if (!d.galleryV4) {
      var have4 = {}; (d.gallery || []).forEach(function (g) { if (g.src) have4[g.src] = 1; });
      if (d.galleryV3) d.gallery = (d.gallery || []).concat(moreGalleryMariage().filter(function (g) { return !have4[g.src]; }));
    }
    if (!d.galleryV3) {
      var have = {}; (d.gallery || []).forEach(function (g) { if (g.src) have[g.src] = 1; });
      d.gallery = (d.gallery || []).concat(moreGallery().filter(function (g) { return !have[g.src]; }));
      d.galleryV3 = true;
      var have5 = {}; d.gallery.forEach(function (g) { if (g.src) have5[g.src] = 1; });
      d.gallery = d.gallery.concat(moreGalleryMariage().filter(function (g) { return !have5[g.src]; }));
    }
    if (!d.galleryV4) {
      d.galleryV4 = true;
    }
    // FAQ : question de présentation en tête (remplace l'ancienne version)
    if (!d.site.faqV3) {
      var fq = defaultSite().faq[0];
      d.site.faq = [fq].concat((d.site.faq || []).filter(function (f) { return f.q !== fq.q && f.q !== 'Quelles prestations proposez-vous ?'; }));
      d.site.faqV2 = d.site.faqV3 = true;
    }
    // photos des services (seulement là où aucune photo n'a été choisie)
    if (!d.occasionsImgV1) {
      (d.occasions || []).forEach(function (o) { if (!o.image && ['mariage', 'bapteme', 'entreprise', 'prive'].indexOf(o.id) !== -1) o.image = 'assets/img/services/' + o.id + '.webp'; });
      d.occasionsImgV1 = true;
    }
    // les vraies photos remplacent la galerie de démonstration (sauf si des photos ont déjà été ajoutées)
    if (!d.galleryV2) { if (!(d.gallery || []).some(function (g) { return g.src; })) d.gallery = defaultGallery(); d.galleryV2 = true; }
    if (!d.site.weddingSteps || !d.site.weddingStepsV4) { d.site.weddingSteps = defaultWeddingSteps(); d.site.weddingStepsV2 = d.site.weddingStepsV3 = d.site.weddingStepsV4 = true; }
    if (!d.occasionsV2) {
      var keep = {};
      d.occasions.forEach(function (o) { if (o.image) keep[o.id === 'famille' ? 'anniversaire' : o.id] = o.image; });
      d.occasions = defaultOccasions();
      d.occasions.forEach(function (o) { if (keep[o.id]) o.image = keep[o.id]; });
      d.occasionsV2 = true;
    }
    if (!d.pricing) d.pricing = defaultPricing();
    if (d.settings && d.settings.phone2 == null) d.settings.phone2 = '0633318936';
    // v2 : packs Essentiel / Villa / Salle de fête (on garde les photos déjà ajoutées)
    if (!d.packagesV2) {
      var imgs = (d.packages || []).map(function (p) { return p.image || ''; });
      d.packages = defaultPackages();
      d.packages.forEach(function (p, i) { if (imgs[i]) p.image = imgs[i]; });
      var map = { essentielle: 'essentiel', prestige: 'villa', royale: 'salle' };
      Object.keys(map).forEach(function (k) {
        if (d.pricing.packages[k] && !d.pricing.packages[map[k]]) { d.pricing.packages[map[k]] = d.pricing.packages[k]; }
        delete d.pricing.packages[k];
      });
      d.packagesV2 = true;
    }
    if (!d.packagesV3) {
      (d.packages || []).forEach(function (p) { p.features = (p.features || []).map(function (x) { return x === 'Dattes' ? 'Dattes et lait' : x; }); });
      d.packagesV3 = true;
    }
    (d.gallery || []).forEach(function (g) { if (!g.category) g.category = GALLERY_GUESS[g.caption] || 'Mariages'; });
    return d;
  }
  function load() {
    if (memory) return memory;
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { memory = ensure(JSON.parse(raw)); save(memory); return memory; }
    } catch (e) { /* stockage indisponible : on garde la démo en mémoire */ }
    memory = ensure(seed());
    save(memory);
    return memory;
  }
  function fresh() { memory = null; return load(); }
  function save(data) {
    memory = data;
    try { localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch (e) { return false; }
  }
  function reset() { memory = ensure(seed()); save(memory); return memory; }

  window.Torrais = {
    KEY: KEY,
    store: { load: load, fresh: fresh, save: save, reset: reset },
    util: {
      uid: uid, iso: iso, addDays: addDays, parseISO: parseISO, esc: esc, formatDH: formatDH,
      formatDate: formatDate, formatPhone: formatPhone, waNumber: waNumber, waLink: waLink, digits: digits
    },
    icons: ICONS,
    EVENT_TYPES: EVENT_TYPES,
    PACK_GROUPS: PACK_GROUPS,
    SERVICE_NAMES: SERVICE_NAMES,
    SOURCES: SOURCES,
    ROLES: ROLES,
    INV_CATEGORIES: INV_CATEGORIES,
    INV_RULES: INV_RULES,
    EXPENSE_CATEGORIES: EXPENSE_CATEGORIES,
    DISH_CATEGORIES: DISH_CATEGORIES,
    GALLERY_CATEGORIES: GALLERY_CATEGORIES,
    STATUSES: STATUSES,
    PENDING: PENDING
  };
})();
