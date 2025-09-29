# Wedding Timers App

## App Architecture

src/
├── app/
│ ├── routes/
│ │ ├── index.tsx # Page d'accueil avec liens
│ │ ├── display/
│ │ │ └── demo.tsx # Mode démo avec contrôles
│ │ └── admin/
│ │ ├── index.tsx # Page principal affichant le timer courant
│ │ └── demo.tsx # Mode démo avec contrôles
│ │ └── $eventId.tsx # Gestion des timers
│ ├── components/
│ │ ├── timer/
│ │ │ ├── TimerDisplay.tsx # Composant d'affichage du timer
│ │ │ ├── TimerCountdown.tsx # Compte à rebours
│ │ │ ├── ActionDisplay.tsx # Affichage des actions
│ │ ├── admin/
│ │ │ ├── TimerList.tsx # Liste des timers admin (deja fait)
│ │ │ ├── TimerCard.tsx # Carte d'un timer avec l'affichage du timer (decompte) (deja fait mais ajouter le composant TimerDisplay)
│ │ │ ├── ActionList.tsx # Liste des actions d'un timer (deja fait)
│ │ │ └── StatusBadge.tsx # Badge de statut (deja fait)
│ │ └── demo/
│ │ └── DemoControls.tsx # Contrôles pour le mode démo
│ └── lib/
│ ├── utils/
│ │ ├── timer.ts # Logique des timers
│ │ └── polling.ts # Configuration du polling
│ └── trpc/
│ └── routers/
│ ├── timer.ts # Routes TRPC pour les timers
│ └── event.ts # Routes TRPC pour les événements

## Fonctionnalités principales

### 1. Affichage public (`/`)

- Affichage du timer en cours en grand
- Compte à rebours visuel
- Affichage des actions au bon moment
- Utilisation de Pusher
- Support multilingue (FR/EN/BR)

### 2. Mode démo (`/demo`)

- Boutons pour sauter à chaque timer (-15s avant l'action)
- Simulation accélérée possible
- Reset facile
- Indicateur visuel "MODE DEMO"

### 3. Administration (`/admin/:eventId`)

- Vue d'ensemble de tous les timers
- Statuts visuels (badges colorés)
- Actions de chaque timer
- Contrôles manuels pour les timers

Faire clignoter le timer a la fin et attendre le displayDurationSec avant de passer au suivant
