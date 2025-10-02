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

## Logique des timers

- Utilise un système de queue pour eviter le chevauchement entre deux timer qui ont une scheduledStartTime et une durationMinutes > 0
- Chaque timers a des actions a executer a different timing du timer en cours et peuvent etre lancées apres X minutes du depart du timer avec le champs triggerOffsetMinutes
  - si triggerOffsetMinutes = 0 à la fin du timer
  - si triggerOffsetMinutes < 0 avant la fin (-15 pour 15 min avant la fin du timer)
- Une action se complete a la fin du media en cours de lecture parmis : 'GALLERY', 'IMAGE', 'SOUND', 'VIDEO' ou bien attends le temps defini par le champ displayDuration puis met a jour le champs executedAt
- Si c'etait la derniere action a etre executé et que le displayDuration arrive a la fin alors on met a jour le timer en modifiant le champs completedAt et status a COMPLETED
- Une fois complété, on recupere le timer suivant en fonction du orderIndex qui doit etre superieur au timer qui vient d'etre completé, ce nouveau timer est egalement mis a jour dans le weddingEvent en cours sur le champs currentTimerId
- Chaque mise a jour de timer aui impact le temps, scheduledStartTime, durationMinutes, envoi un event avec Pusher, l'app est wrapper dans un Provider qui utilise pusher dans son context, cela permet d'invalider les requetes et donc declenché un nouvel appel trpc et remettre a jour automatiquement les timers.
- Un timer peut etre 'ponctuel' quand il y a une scheduledStartTime et une durationMinutes = 0 ou null, cela veut dire que ce type de timer peut etre declenché en meme temps qu'un timer en cours, il ne devrait pas rentré dans la queue des timers qui ont une scheduledStartTime et une durationMinutes > 0
- Un timer 'manuel' n'a pas de scheduledStartTime et possède une durationMinutes = 0 ou null, il y a aussi un booleen isManual qui permet de le differencier, comme le ponctuel, il peut etre declenché en meme temps qu'un timer en cours.
- L'action de type gallery, place un overlay avec un carousel d'image (Swiper JS) avec les images disponibles dans le champs urls. En meme que l'affichage du carousel, il faut afficher les champs title contentFr, contentEn, contentBt si l'un d'eux est renseigné et aussi afficher le decompte du timer en plus petit

1. Le front fait du polling vers un endpoint :
   → cherche le premier timer par orderIndex
   → verifie si le timer doit etre activé s'il est egal ou après la date et heure de debut de l'event
   → startTimer() → status = RUNNING, startedAt = now
   → Pusher envoie event
2. Frontend reçoit l'event de pusher
   → useQuery re-fetch
   → Affiche countdown basé sur actualStartTime + durationMinutes
   → Calcule quand afficher chaque action
3. Action atteint son moment (ex: triggerOffsetMinutes = -2) soit 2min avant la fin
   → Frontend affiche l'overlay/média
   → Attend la fin (durée média + displayDuration)
   → Appelle executeAction(actionId)
4. Dernière action terminée
   → executeAction() détecte que c'est la dernière
   → Appelle completeTimer() a la fin du media en cours de lecture puis complete le timer courant et cherche le timer suivant
   → dans le next timer on calcul la nouvelle durationMinutes avec nextTimer.scheduledStartTime - currentTimer.completedAt
   → currentTimerId = next timer
   → Pusher envoie event
5. Frontend reçoit l'event
   → Affiche le nouveau timer avec la nouvelle durée
