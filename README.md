# Gesture Race

Jeu de course multijoueur en réalité augmentée contrôlé uniquement par des gestes de la main.

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvrir http://localhost:5173 — autoriser l'accès à la webcam.

## Comment jouer

1. Choisis le mode **Solo** ou **2 Joueurs**
2. Sélectionne ton personnage et modifie ton nom (clique sur "Joueur 1" / "Joueur 2")
3. Appuie sur le **BUZZER** pour lancer le compte à rebours
4. Réalise les gestes dans l'ordre affiché — le premier à en compléter 20 gagne

### Gestes reconnus

| Geste | Signe |
|-------|-------|
| ✊ | Poing fermé |
| ✌️ | Deux doigts (V) |
| 🖐 | Main ouverte |
| ☝️ | Index levé |

### Règles
- 3 erreurs consécutives = pénalité **-2 cases**
- En mode 2 joueurs : main droite = Joueur 1, main gauche = Joueur 2
- Le meilleur score mondial est sauvegardé en base de données avec le nom du joueur

## Stack technique

- **MediaPipe Hands** — détection des mains en temps réel (21 points par main, ~30 fps)
- **MediaPipe Face Detection** — détection du visage pour la couronne du leader
- **Three.js** — rendu 3D de la couronne en réalité augmentée
- **Supabase** — base de données pour le meilleur score global
- **Vite** — bundler
- Vanilla JS, zéro framework UI

## Configuration Supabase

Crée un fichier `.env` à la racine :

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_KEY=your_anon_key
```

Puis crée la table dans le SQL Editor de Supabase :

```sql
create table best_scores (
  id uuid default gen_random_uuid() primary key,
  username text not null,
  score_ms integer not null,
  created_at timestamp with time zone default now()
);

alter table best_scores enable row level security;
create policy "Lecture publique" on best_scores for select using (true);
create policy "Insert public" on best_scores for insert with check (true);
```

## Structure du projet

```
src/
├── main.js              # Contrôleur principal, logique UI et gestion des parties
├── supabase.js          # Client Supabase, lecture/écriture du meilleur score
├── game/
│   └── race.js          # Classe RaceLane, calcul du score et du temps
├── gestures/
│   ├── detector.js      # Wrapper MediaPipe (mains + visage)
│   └── signs.js         # Classification des gestes + lissage (SignSmoother)
├── ar/
│   ├── renderer.js      # Overlay Canvas 2D des points de la main
│   └── three-layer.js   # Couronne 3D Three.js
└── style.css
```
