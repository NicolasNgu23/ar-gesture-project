# Agent 01 — Setup du projet

## Rôle
Tu es l'agent d'initialisation. Tu crées la structure complète du projet Vite + la configuration de base.

## Tâches

### 1. Crée la structure de fichiers suivante :
```
ar-animal-gestures/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.js
│   ├── style.css
│   ├── gestures/
│   │   ├── detector.js
│   │   └── signs.js
│   ├── combo/
│   │   └── buffer.js
│   ├── ar/
│   │   └── renderer.js
│   └── assets/
│       └── animals/
│           ├── cat.svg
│           ├── dog.svg
│           ├── koala.svg
│           └── panda.svg
└── public/
```

### 2. Contenu de `package.json` :
```json
{
  "name": "ar-animal-gestures",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

### 3. Contenu de `vite.config.js` :
```js
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    https: false,
    port: 5173
  }
})
```

### 4. Contenu de `index.html` :
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AR Animal Gestures</title>
  <link rel="stylesheet" href="/src/style.css" />
</head>
<body>
  <div id="app">
    <div id="camera-container">
      <video id="webcam" autoplay playsinline muted></video>
      <canvas id="overlay"></canvas>
    </div>
    <div id="ui-overlay">
      <div id="sign-display">En attente d'un signe...</div>
      <div id="combo-display"></div>
      <div id="animal-popup" class="hidden"></div>
    </div>
    <div id="guide-panel">
      <h3>Signes disponibles</h3>
      <ul>
        <li>✊ Poing → <strong>Chat</strong></li>
        <li>✌️ V → <strong>Chien</strong></li>
        <li>🖐 Main ouverte → <strong>Koala</strong></li>
        <li>☝️ Index levé → <strong>Panda</strong></li>
      </ul>
      <p class="tip">Enchaîne 2 signes en moins de 2s pour invoquer un animal !</p>
    </div>
  </div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

### 5. Installe les dépendances :
```bash
cd ar-animal-gestures && npm install
```

### 6. Crée des SVG placeholder pour les 4 animaux dans `src/assets/animals/` :

**cat.svg** — visage de chat simple, couleur orange
**dog.svg** — visage de chien simple, couleur marron
**koala.svg** — visage de koala simple, couleur gris
**panda.svg** — visage de panda simple, noir et blanc

Chaque SVG doit être 200x200px, lisible et expressif (yeux, oreilles, nez minimum).

## Validation
- [ ] `npm install` s'exécute sans erreur
- [ ] La structure de dossiers est complète
- [ ] `index.html` s'ouvre correctement avec `npm run dev`
- [ ] Les 4 fichiers SVG existent et sont valides

## Output attendu
Affiche la structure du projet créé avec un `tree` ou liste des fichiers.
