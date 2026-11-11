# TORRAIS EVENT — site web & espace gérant (démo)

Démo du site de **TORRAIS EVENT**, traiteur de mariages et d'événements à Casablanca
(Traiteur · Tyafer · Buffet · Décoration), avec un tableau de bord pour le gérant.

> ⚠️ **Version démo.** Les données du tableau de bord sont fictives et sont stockées
> uniquement dans le navigateur (localStorage). Prix, photos et logo sont des
> emplacements provisoires en attendant les éléments du gérant.

## Contenu

| Page | Chemin | Description |
|---|---|---|
| Site public | `index.html` | Accueil, services, formules (« Prix sur devis »), galerie, étapes, formulaire de devis, contact + carte, boutons WhatsApp / appel |
| Espace gérant | `dashboard/` | Connexion (mot de passe démo : `demo`) |

### Espace gérant
- **Tableau de bord** : nouvelles demandes, événements du mois, chiffre du mois, reste à encaisser, graphique de l'année
- **Demandes de devis** : statuts (Nouveau → Contacté → Devis envoyé → Confirmé / Refusé), notes privées, appel / WhatsApp en un clic, alerte si la date est déjà prise, conversion en événement
- **Calendrier** : vue **Année** (12 mois), vue Mois et vue Liste, navigation d'une année à l'autre, aucune limite d'événements par jour (le nombre s'affiche sur le jour)
- **Événements & paiements** : prix total, acomptes, reste à payer
- **Clients** : fiches créées automatiquement à partir des demandes et des événements
- **Contenu du site** : coordonnées, formules et prix, services, photos de la galerie — visibles immédiatement sur le site

Une demande envoyée depuis le formulaire du site apparaît directement dans l'espace gérant
(même navigateur). Le bouton « Réinitialiser la démo » remet les données d'exemple.

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
