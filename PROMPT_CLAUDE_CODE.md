# Prompt à envoyer dans Claude Code (terminal)

Copie-colle ce prompt tel quel dans ton terminal Claude Code :

---

```
Tu es l'orchestrateur d'un projet web appelé "AR Animal Gestures".

L'objectif : une app web qui utilise la webcam pour détecter des combos de signes gestuels avec les mains, et affiche un animal en AR correspondant (chat, chien, koala, panda).

Tu vas construire ce projet en lisant et en exécutant les agents dans l'ordre suivant. Lis chaque fichier agent avant de l'exécuter.

ORDRE D'EXÉCUTION :
1. Lis `agents/01_setup_agent.md` → initialise la structure du projet
2. Lis `agents/02_mediapipe_agent.md` → intègre MediaPipe Hands + détection webcam
3. Lis `agents/03_gesture_agent.md` → logique de reconnaissance des 4 signes
4. Lis `agents/04_combo_agent.md` → système de buffer temporel et combos
5. Lis `agents/05_ar_display_agent.md` → affichage AR des animaux sur le canvas
6. Lis `agents/06_ui_agent.md` → UI/UX finale, animations, polish
7. Lis `agents/07_qa_agent.md` → tests, debug, vérification finale

RÈGLES :
- Exécute chaque agent complètement avant de passer au suivant
- Après chaque agent, affiche un résumé de ce qui a été créé/modifié
- Si une étape échoue, diagnostique et corrige avant de continuer
- Le projet final doit tourner avec `npm run dev` (Vite) sans erreur

Lance-toi avec l'agent 01.
```

---

> Le dossier `agents/` doit être dans le même répertoire que ce fichier.
