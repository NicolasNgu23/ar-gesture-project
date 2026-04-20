# Agent 07 — QA, debug et vérification finale

## Rôle
Tu es l'agent de qualité. Tu valides que tout fonctionne, corriges les bugs restants, et prépares le projet pour une démo propre.

## Checklist de validation complète

### 🔧 Build & démarrage
- [ ] `npm install` → 0 erreurs
- [ ] `npm run dev` → serveur sur port 5173 sans erreur
- [ ] `npm run build` → build de prod sans erreur
- [ ] Aucun warning critique dans la console au démarrage

### 📷 Webcam & MediaPipe
- [ ] La vidéo s'affiche bien (mirrored)
- [ ] Les landmarks verts apparaissent sur la main en < 1s
- [ ] Quand la main quitte le cadre → landmarks disparaissent proprement
- [ ] Pas de memory leak (framerate stable après 2 min)

### 🤚 Signes (tester chacun 5 fois)
- [ ] ✊ Poing → détecté avec confiance, pas de false positives
- [ ] ✌️ V → détecté, n'est pas confondu avec "main ouverte"
- [ ] 🖐 Main ouverte → détecté correctement
- [ ] ☝️ Index seul → détecté, pas confondu avec "V"
- [ ] Transition rapide entre signes → pas de crash

### 🎮 Combos (tester chaque combo du dictionnaire)
- [ ] ✊+✊ → Chat
- [ ] ✌️+✌️ → Chien
- [ ] 🖐+🖐 → Koala
- [ ] ☝️+☝️ → Panda
- [ ] Timeout 2s → buffer se vide sans déclencher
- [ ] Même signe deux fois rapide → ne crée pas de doublon dans le buffer

### 🎨 UI & animations
- [ ] Animal popup s'anime correctement (scale bounce)
- [ ] Particules visibles lors d'un combo
- [ ] Guide panel slide au hover
- [ ] Indicateur webcam passe au vert

### 🐛 Fixes courants à vérifier

**1. Si les SVG ne s'affichent pas dans le canvas :**
```js
// Vérifier que les images sont chargées AVANT d'appeler showAnimal
// Dans ARRenderer._loadAnimals(), s'assurer que les promises sont await
```

**2. Si le miroir est incohérent (landmarks inversés par rapport à la vidéo) :**
```js
// Les deux doivent avoir scaleX(-1)
// Si tu utilises ctx.drawImage, le canvas est déjà flippé visuellement
// Les coordonnées MediaPipe sont en espace caméra (non-flippé)
// Solution : flipper x dans drawLandmarks :
// x = canvas.width - lm.x * canvas.width
```

**3. Si MediaPipe charge lentement :**
```html
<!-- Ajouter dns-prefetch dans <head> -->
<link rel="dns-prefetch" href="//cdn.jsdelivr.net">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
```

**4. Si le combo se déclenche trop facilement :**
```js
// Augmenter requiredFrames dans SignSmoother (8 au lieu de 6)
// Réduire maxDelay dans ComboBuffer (1500 au lieu de 2000)
```

**5. Si les performances sont mauvaises (< 24fps) :**
```js
// Réduire modelComplexity de 1 à 0 dans detector.js
// Réduire la résolution caméra à 320x240
```

## Tâches finales

### 1. Ajoute un `README.md` à la racine du projet :
```markdown
# AR Animal Gestures 🐱🐶🐨🐼

Reconnaissance gestuelle en temps réel avec affichage AR d'animaux.

## Lancer le projet

\`\`\`bash
npm install
npm run dev
\`\`\`

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
```

### 2. Optimisations finales à appliquer :
- S'assurer que `requestAnimationFrame` n'est appelé qu'une seule fois (pas de boucles multiples)
- Ajouter `passive: true` sur les event listeners scrolll si présents
- Vérifier que `camera.stop()` est bien appelé si la page se ferme :
```js
window.addEventListener('beforeunload', () => detector.stop())
```

### 3. Test final de démo
Effectuer ce scénario complet :
1. Ouvrir l'app → webcam démarre, landmarks visibles
2. Faire ✌️ → "Chien reconnu !" s'affiche
3. Faire ✌️ rapidement → 🐶 Chien pop avec animation + particules
4. Attendre que l'animal disparaisse
5. Faire ✊ très lentement (> 2s d'écart) → rien ne se passe
6. Faire ✊ + ✊ en moins de 2s → 🐱 Chat pop
7. Fermer l'onglet → pas d'erreur de nettoyage dans la console

## Output final attendu
```
✅ Build : OK
✅ Webcam + landmarks : OK
✅ 4 signes reconnus : OK
✅ Combos fonctionnels : OK
✅ Animations : OK
✅ README créé : OK

Projet prêt pour démo 🎉
```
