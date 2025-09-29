import { env } from '@/env/client';
import type { RouterOutputs } from '@/lib/trpc-client';
import { trpc } from '@/lib/trpc-client';
import { CHANNEL, TIMER_UPDATED } from '@/lib/utils';
import { useRouter } from '@tanstack/react-router';
import Pusher from 'pusher-js';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

type CurrentTimer = RouterOutputs['timers']['getCurrentTimerByWeddingEventId'];

interface PusherContextType {
  pusher: Pusher | null;
  currentTimer: CurrentTimer | null;
  isLoading: boolean;
  refreshTimer: () => void;
}

const PusherContext = createContext<PusherContextType>({
  pusher: null,
  currentTimer: null,
  isLoading: false,
  refreshTimer: () => {},
});

export const usePusher = () => {
  const context = useContext(PusherContext);
  if (!context) {
    throw new Error('usePusher must be used within a PusherProvider');
  }
  return context;
};

interface PusherProviderProps {
  children: React.ReactNode;
}

export function PusherProvider({ children }: PusherProviderProps) {
  const router = useRouter();
  const pusherRef = useRef<Pusher | null>(null);
  const [currentTimer, setCurrentTimer] = useState<CurrentTimer | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour récupérer les données du timer
  const fetchCurrentTimer = async () => {
    try {
      setIsLoading(true);
      const timer = await trpc.timers.getCurrentTimerByWeddingEventId.query({
        weddingEventId: 'wedding-event-1',
      });
      setCurrentTimer(timer);
    } catch (error) {
      console.error('Erreur lors de la récupération du timer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTimer = () => {
    fetchCurrentTimer();
  };

  // Charger les données au montage du composant
  useEffect(() => {
    fetchCurrentTimer();
  }, []);

  useEffect(() => {
    // Configuration Pusher en mode développement uniquement
    if (process.env.NODE_ENV === 'development') {
      Pusher.logToConsole = true;
    }

    // Initialiser Pusher
    const pusher = new Pusher(env.VITE_PUSHER_KEY, {
      cluster: env.VITE_PUSHER_CLUSTER,
    });

    pusherRef.current = pusher;

    // S'abonner au canal principal
    const channel = pusher.subscribe(CHANNEL);

    // Écouter les événements de mise à jour des timers
    channel.bind(TIMER_UPDATED, function (data: { id: string }) {
      console.log('Timer updated:', data);

      // Invalider toutes les requêtes pour forcer le rechargement des données
      router.invalidate().catch((error) => {
        console.error("Erreur lors de l'invalidation du router:", error);
      });
    });

    // Nettoyage à la fermeture du composant
    return () => {
      if (pusherRef.current) {
        pusherRef.current.unsubscribe(CHANNEL);
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
    };
  }, [router]);

  return (
    <PusherContext.Provider
      value={{
        pusher: pusherRef.current,
        currentTimer,
        isLoading,
        refreshTimer,
      }}
    >
      {children}
    </PusherContext.Provider>
  );
}
