# Wedding Timers App

## App Architecture

src/
├── app/
│ ├── routes/
│ │ ├── index.tsx # Page d'accueil avec liens
│ │ ├── display/
│ │ │ ├── $eventId.tsx # Affichage public du timer
│ │ │ └── demo.tsx # Mode démo avec contrôles
│ │ └── admin/
│ │ ├── index.tsx # Liste des événements
│ │ └── $eventId.tsx # Gestion des timers
│ ├── components/
│ │ ├── timer/
│ │ │ ├── TimerDisplay.tsx # Composant d'affichage du timer
│ │ │ ├── TimerCountdown.tsx # Compte à rebours
│ │ │ ├── ActionDisplay.tsx # Affichage des actions
│ │ │ └── TimerProgress.tsx # Barre de progression
│ │ ├── admin/
│ │ │ ├── TimerList.tsx # Liste des timers admin
│ │ │ ├── TimerCard.tsx # Carte d'un timer
│ │ │ ├── ActionList.tsx # Liste des actions d'un timer
│ │ │ └── StatusBadge.tsx # Badge de statut
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

### 1. Affichage public (`/display/:eventId`)

- Affichage du timer en cours en grand
- Compte à rebours visuel
- Affichage des actions au bon moment
- Polling intelligent basé sur le temps restant
- Support multilingue (FR/EN/BR)

### 2. Mode démo (`/display/demo`)

- Boutons pour sauter à chaque timer (-30s avant l'action)
- Simulation accélérée possible
- Reset facile
- Indicateur visuel "MODE DEMO"

### 3. Administration (`/admin/:eventId`)

- Vue d'ensemble de tous les timers
- Statuts visuels (badges colorés)
- Actions de chaque timer
- Contrôles manuels pour les timers

## Améliorations suggérées

### Fonctionnelles

1. **Websockets** (via Pusher/Ably) pour sync temps réel entre admin et display
