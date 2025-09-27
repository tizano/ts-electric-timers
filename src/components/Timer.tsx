// import { useMutation, useQuery, useSubscription } from '@trpc/react-query';
// import PQueue from 'p-queue';
// import { useEffect, useRef, useState } from 'react';

// const TimerComponent = ({ eventId }) => {
//   const [remainingTime, setRemainingTime] = useState<number | null>(null);
//   const [actionButtons, setActionButtons] = useState<
//     { type: string; callback: () => Promise<void> }[]
//   >([]);
//   const [isPollingFallback, setIsPollingFallback] = useState(false); // Fallback activé si SSE down
//   const queue = useRef(new PQueue({ concurrency: 1 }));

//   // SSE Principal via Subscription
//   useSubscription(['timerSubscription', { eventId }], {
//     onData: (data) => {
//       if (data.type === 'heartbeat') return; // Ignore heartbeats
//       // Refresh data sur update push
//       queryClient.invalidateQueries(['getEvent', { id: eventId }]);
//       setIsPollingFallback(false); // SSE works, désactive polling
//     },
//     onError: (err) => {
//       console.error('SSE Error:', err);
//       setIsPollingFallback(true); // Active fallback polling
//     },
//     onStarted: () => setIsPollingFallback(false), // SSE connecté
//   });

//   // Polling Fallback (seulement si isPollingFallback=true)
//   const { data: event } = useQuery(['getEvent', { id: eventId }], {
//     enabled: true, // Toujours enabled, mais refetchInterval conditionnel
//     refetchInterval: () => {
//       if (remainingTime > 10 * 60) return 45000;
//       if (remainingTime > 5 * 60) return 15000;
//       if (remainingTime > 60) return 5000;
//       return 1000;
//     },
//   });
//     onSuccess: (data) => {
//       const currentTimer = data.timers?.find(
//         (t) => t.id === data.currentTimerId
//       );
//       if (currentTimer?.startTime) {
//         const now = new Date().getTime();
//         const end =
//           new Date(currentTimer.startTime).getTime() +
//           currentTimer.duration * 60 * 1000;
//         setRemainingTime(Math.max(0, (end - now) / 1000));
//       } else {
//         setRemainingTime(null);
//       }
//     },
//   });

//   const [updateTimer] = useMutation('updateTimer');
//   const [updateEvent] = useMutation('updateEvent');

//   // Fonctions pour actions (inchangées)
//   const playSound = (url: string) =>
//     new Promise<void>((res) => {
//       const audio = new Audio(url);
//       audio.onended = res;
//       audio.play();
//     });

//   const playVideo = (url: string) =>
//     new Promise<void>((res) => {
//       const video = document.createElement('video');
//       video.src = url;
//       video.onended = res;
//       document.body.appendChild(video); // Ou un conteneur dédié
//       video.play();
//     });

//   const showImages = async (urls: string[]) => {
//     // Implémente modal ou affichage, avec attente (e.g., user close)
//     return new Promise<void>((res) => setTimeout(res, 5000)); // Placeholder
//   };

//   const handleActions = async (actions: {
//     soundUrl?: string;
//     images?: string[];
//     videoUrl?: string;
//   }) => {
//     if (actions.soundUrl) await queue.add(() => playSound(actions.soundUrl));
//     if (actions.videoUrl) await queue.add(() => playVideo(actions.videoUrl));
//     if (actions.images) await queue.add(() => showImages(actions.images));
//   };

//   // Countdown local, détection boutons et auto-actions
//   useEffect(() => {
//     if (!event) return;
//     const currentTimer = event.timers?.find(
//       (t) => t.id === event.currentTimerId
//     );
//     if (!currentTimer?.startTime) {
//       // Check scheduledStart pour auto-start
//       if (
//         currentTimer.scheduledStart &&
//         new Date() >= new Date(currentTimer.scheduledStart)
//       ) {
//         updateTimer({ id: currentTimer.id, start: true });
//       }
//       return;
//     }

//     const interval = setInterval(() => {
//       const now = new Date().getTime();
//       const end =
//         new Date(currentTimer.startTime).getTime() +
//         currentTimer.duration * 60 * 1000;
//       const remaining = Math.max(0, (end - now) / 1000);
//       setRemainingTime(remaining);

//       // Boutons pour actions 5s avant
//       const newActionButtons: {
//         type: string;
//         callback: () => Promise<void>;
//       }[] = [];

//       if (
//         currentTimer.actions.beforeEnd &&
//         remaining <= currentTimer.actions.beforeEnd.minutesBefore * 60 + 5 &&
//         remaining > currentTimer.actions.beforeEnd.minutesBefore * 60
//       ) {
//         newActionButtons.push({
//           type: `Son avant (${currentTimer.actions.beforeEnd.minutesBefore} min)`,
//           callback: () => playSound(currentTimer.actions.beforeEnd!.soundUrl),
//         });
//       }

//       if (remaining <= 5 && remaining > 0) {
//         if (currentTimer.actions.atEnd.soundUrl) {
//           newActionButtons.push({
//             type: 'Son à la fin',
//             callback: () => playSound(currentTimer.actions.atEnd.soundUrl!),
//           });
//         }
//         if (currentTimer.actions.atEnd.videoUrl) {
//           newActionButtons.push({
//             type: 'Vidéo à la fin',
//             callback: () => playVideo(currentTimer.actions.atEnd.videoUrl!),
//           });
//         }
//         if (currentTimer.actions.atEnd.images) {
//           newActionButtons.push({
//             type: 'Images à la fin',
//             callback: () => showImages(currentTimer.actions.atEnd.images!),
//           });
//         }
//       }

//       setActionButtons(newActionButtons);

//       // Actions auto
//       if (remaining <= 0) {
//         queue.add(() => handleActions(currentTimer.actions.atEnd));
//         queue.add(() =>
//           updateTimer({ id: getNextTimerId(event), start: true })
//         ); // Suppose getNextTimerId implémenté
//       } else if (
//         currentTimer.actions.beforeEnd &&
//         Math.floor(remaining) ===
//           currentTimer.actions.beforeEnd.minutesBefore * 60
//       ) {
//         queue.add(() => playSound(currentTimer.actions.beforeEnd.soundUrl));
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [event, updateTimer]);

//   // Boutons manuels
//   const startFirstTimer = () => {
//     const firstTimer = event?.timers?.sort((a, b) => a.order - b.order)[0];
//     if (firstTimer) updateTimer({ id: firstTimer.id, start: true });
//   };

//   const simulateDemo = () => {
//     updateEvent({ id: eventId, demo: true });
//   };

//   return (
//     <div>
//       <h2>
//         Timer:{' '}
//         {remainingTime !== null
//           ? `${Math.floor(remainingTime / 60)}:${Math.floor(remainingTime % 60)
//               .toString()
//               .padStart(2, '0')}`
//           : 'Inactif'}
//       </h2>
//       <p>Mode: {isPollingFallback ? 'Polling Fallback' : 'SSE Actif'}</p>
//       <button
//         onClick={startFirstTimer}
//         disabled={!event || remainingTime !== null}
//       >
//         Lancer Premier Timer
//       </button>
//       <button onClick={simulateDemo}>Mode Démo: Reset à Aujourd'hui</button>
//       {actionButtons.map((btn, idx) => (
//         <button key={idx} onClick={() => queue.add(btn.callback)}>
//           Tester {btn.type} (5s avant)
//         </button>
//       ))}
//     </div>
//   );
// };

// // if (currentTimer.durationMinutes > 0) {
// //   // Calcul remainingTime avec countdown
// //   // Gère beforeEnd via triggerOffsetMinutes
// // } else {
// //   // Punctual: Check si now >= scheduledStartTime, alors trigger actions atEnd
// //   // Pas de interval, juste un check one-shot ou polling/subscription
// // }

// // Fonction helper (à implémenter)
// function getNextTimerId(event: any) {
//   // Logique pour trouver le prochain timer basé sur order
//   return /* ID du next */;
// }
// export default TimerComponent;
