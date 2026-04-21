# AR Animal Gestures 🐱🐶🐨🐼

Reconnaissance gestuelle en temps réel avec affichage AR d'animaux.

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvrir http://localhost:5173 — autoriser l'accès à la webcam.

## Signes disponibles

| Signe | Geste | Animal |
|-------|-------|--------|
| ✊ | Poing fermé | 🐱 Chat |
| ✌️ | Deux doigts (V) | 🐶 Chien |
| 🖐 | Main ouverte | 🐨 Koala |
| ☝️ | Index levé | 🐼 Panda |

## Combos

Enchaîne 2 signes en moins de 2 secondes pour invoquer un animal !

## Stack

- **MediaPipe Hands** — détection de main en temps réel
- **Canvas 2D** — rendu AR overlay
- **Vite** — bundler
- Vanilla JS (no framework)

## Ajouter un animal

1. Ajoute le SVG dans `src/assets/animals/`
2. Définis un nouveau signe dans `src/gestures/signs.js`
3. Ajoute les combos dans `src/combo/buffer.js`
