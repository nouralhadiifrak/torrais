# TORRAIS EVENT — site web & espace gérant (démo)

Démo du site de **TORRAIS EVENT**, traiteur de mariages et d'événements à Casablanca
(Traiteur · Tyafer · Buffet · Décoration), avec un tableau de bord pour le gérant.

> ⚠️ **Version démo.** Les données du tableau de bord sont fictives et sont stockées
> uniquement dans le navigateur (localStorage). Prix, photos et logo sont des
> emplacements provisoires en attendant les éléments du gérant.

## Contenu

| Page | Chemin | Description |
|---|---|---|
| Site public | `index.html` | Barre d'infos, héros (diaporama), notre maison, nos univers, métiers, plats signature, formules (« Prix sur devis »), chiffres clés, réalisations avec filtres, étapes, avis clients (masqués tant qu'il n'y en a pas), FAQ, devis + zones desservies, contact + carte, bandeau WhatsApp / appel |
| Pages univers | `evenement.html?type=…` | Une page par occasion (mariage, henné, fêtes de famille, entreprise) avec présentation, formules, photos et devis pré-rempli |
| Espace gérant | `dashboard/` | Connexion (mot de passe démo : `demo`) |

### Espace gérant
- **Tableau de bord** : nouvelles demandes, événements du mois, chiffre du mois, reste à encaisser, graphique de l'année
- **Ajout manuel** : « Nouvelle demande » et « Nouvel événement » pour les réservations reçues par WhatsApp, téléphone, en boutique, Instagram ou bouche-à-oreille. Chaque demande et chaque événement garde sa **source** (les demandes du site sont marquées « Site web » automatiquement), avec un résumé « D'où viennent vos clients ? »
- **Demandes de devis** : filtre par source, statuts (Nouveau → Contacté → Devis envoyé → Confirmé / Refusé), notes privées, appel / WhatsApp en un clic, alerte si la date est déjà prise, conversion en événement
- **Calendrier** : vue **Année** (12 mois), vue Mois et vue Liste, navigation d'une année à l'autre, aucune limite d'événements par jour (le nombre s'affiche sur le jour)
- **Événements** : chaque fiche a ses onglets — Détails, Menu (plats, horaires, demandes particulières), Équipe (qui travaille, paie), Matériel (réservé, avec alerte si le stock manque), Dépenses, Paiements — et affiche **prix − coûts = bénéfice**
- **Équipe** : liste des cuisiniers, serveurs, décorateurs…, tarif par événement, ce qui reste à leur payer
- **Matériel** : stock (tables, chaises, vaisselle, tyafer…), jour le plus chargé, manques à venir
- **Finances** : chiffre d'affaires, coûts et bénéfice par mois, répartition des dépenses, bénéfice par événement
- **À surveiller** (tableau de bord) : équipe non affectée, matériel insuffisant, soldes en retard, paies à régler
- **Clients** : fiches créées automatiquement à partir des demandes et des événements
- **Contenu du site** : coordonnées, formules et prix, services, photos de la galerie — visibles immédiatement sur le site

Une demande envoyée depuis le formulaire du site apparaît directement dans l'espace gérant
(même navigateur). Le bouton « Réinitialiser la démo » remet les données d'exemple.

## Animations

- **Photo de la salle** en fond du haut de page tant que le gérant n'a pas ajouté son diaporama (`assets/img/salle.jpg`).
- **Apparitions douces** des sections au défilement (opacité uniquement : tout reste utilisable au clavier).
- **Défilement fluide** (Lenis) sur ordinateur uniquement.
- Aucune animation si le visiteur a activé « réduire les animations ».
- Bibliothèques incluses dans `assets/vendor/` (GSAP 3.15.0, Lenis 1.3.27, licence MIT).

## Lancer en local

Aucune installation nécessaire :

```bash
python3 -m http.server 8000
```

puis ouvrir <http://localhost:8000>.

## Mise en ligne de la démo

Le site est 100 % statique : il peut être publié tel quel sur **Vercel**, **Netlify** ou **GitHub Pages**.

## Prochaines étapes (version finale)
- Base de données et connexion sécurisée (Supabase)
- Photos, logo et prix réels du gérant
- Alerte WhatsApp / e-mail à chaque nouvelle demande
- Nom de domaine
