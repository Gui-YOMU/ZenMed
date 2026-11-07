# ZenMed

Application web progressive pour consigner localement les prises de médicaments.

## Prérequis

- Node.js LTS
- npm

## Développement

```powershell
npm install
npm run dev
```

## Vérifications

```powershell
npm run lint
npm test
npm run build
```

Les icônes PWA sont placées dans `public/icons` :

- `icon-192.png`
- `icon-512.png`

## Déploiement sur GitHub Pages

Le workflow `.github/workflows/deploy-pages.yml` publie automatiquement
l’application sur GitHub Pages après chaque mise à jour de la branche `main`.

Pour activer le déploiement :

1. Dans les paramètres du dépôt GitHub, ouvrir **Pages**.
2. Choisir **GitHub Actions** comme source de build et de déploiement.
3. Fusionner ou pousser sur `main` : le workflow vérifie le code, construit
   l’application et publie le dossier `dist`.

L’application sera disponible à l’adresse
`https://gui-yomu.github.io/ZenMed/`. Les prises sont stockées localement dans
le navigateur du téléphone et ne sont pas synchronisées entre appareils.
