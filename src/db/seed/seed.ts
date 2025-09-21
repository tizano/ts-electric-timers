import { auth } from '@/lib/auth';
import type { User } from 'better-auth';
import { config } from 'dotenv';
import { reset } from 'drizzle-seed';
import { db } from '../index';
import { user } from '../schema/auth';
import {
  timer,
  timerAsset,
  type NewTimer,
  type NewTimerAsset,
} from '../schema/timer';
import { weddingEvent, weddingParticipant } from '../schema/wedding-event';

config();
console.log(process.env.SEED_USER_PASSWORD);

async function seedWeddingData() {
  console.log('🌱 Début du seeding...');
  console.log('🔗 Connexion à la base de données...', process.env.DATABASE_URL);

  // 1. Créer les utilisateurs
  const usersToCreate: User[] = [
    {
      id: 'foo',
      name: 'Mathieu',
      email: 'admin@neka-tony.com',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'bar',
      name: 'Tony & Neka',
      email: 'les-maries@neka-tony.com',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'qwerty',
      name: 'Weeding Planner',
      email: 'wedding@neka-tony.com',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  console.log('⏳ Création des utilisateurs...');
  await Promise.all(
    usersToCreate.map(async (userToCreate) => {
      try {
        const res = await auth.api.signUpEmail({
          body: {
            email: userToCreate.email,
            password: process.env.SEED_USER_PASSWORD!,
            name: userToCreate.name,
          },
        });

        if (res.user) {
          console.log(`✅ Utilisateur créé: ${res.user.email}`);
        }
        return res;
      } catch (error) {
        console.error(
          `❌ Erreur lors de la création de l'utilisateur ${userToCreate.email}:`,
          error
        );
        throw error;
      }
    })
  );

  const createdUsers = await db
    .select({
      id: user.id,
    })
    .from(user)
    .orderBy(user.email);

  // 2. Créer l'événement de mariage
  console.log("⏳ Création de l'événement de mariage...");
  const weddingEvents = await db
    .insert(weddingEvent)
    .values({
      id: 'wedding-event-1',
      name: 'Mariage Tony et Neka',
      description: 'Célébration du mariage de Tony et Neka',
      eventDate: new Date('2025-10-25'),
      location: 'Recife',
      ownerId: createdUsers[0]?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  console.log('✅ Événement de mariage créé:', weddingEvents[0]?.name);

  // 3. Créer les participants au mariage
  console.log('⏳ Ajout des participants...');
  const participants = await db
    .insert(weddingParticipant)
    .values([
      {
        id: 'participant-1',
        weddingEventId: weddingEvents[0]?.id,
        userId: createdUsers[0]?.id,
        role: 'OWNER',
        joinedAt: new Date(),
      },
      {
        id: 'participant-2',
        weddingEventId: weddingEvents[0]?.id,
        userId: createdUsers[1]?.id,
        role: 'COORDINATOR',
        joinedAt: new Date(),
      },
      {
        id: 'participant-3',
        weddingEventId: weddingEvents[0]?.id,
        userId: createdUsers[2]?.id,
        role: 'COORDINATOR',
        joinedAt: new Date(),
      },
    ])
    .returning();

  console.log('✅ Participants ajoutés:', participants.length);

  // 4. Créer les 5 timers à partir de 17h, toutes les heures
  const timerData: NewTimer[] = [
    {
      id: 'timer-1',
      orderIndex: 1,
      name: 'Video + Sound - Landing of the bride and groom',
      scheduledStartTime: new Date('2025-10-25T16:00:00.000Z'),
      durationMinutes: 30,
      status: 'PENDING' as const,
      weddingEventId: weddingEvents[0]?.id,
      createdById: createdUsers[0]?.id,
      lastModifiedById: createdUsers[0]?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'timer-2',
      orderIndex: 2,
      name: 'Sound - Landing of the bride and groom',
      scheduledStartTime: new Date('2025-10-25T16:20:00.000Z'),
      status: 'PENDING' as const,
      isPunctual: true,
      weddingEventId: weddingEvents[0]?.id,
      createdById: createdUsers[0]?.id,
      lastModifiedById: createdUsers[0]?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'timer-3',
      orderIndex: 3,
      name: 'Sound - Photos',
      scheduledStartTime: new Date('2025-10-25T16:40:00.000Z'),
      durationMinutes: 10,
      status: 'PENDING' as const,
      weddingEventId: weddingEvents[0]?.id,
      createdById: createdUsers[0]?.id,
      lastModifiedById: createdUsers[0]?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'timer-4',
      orderIndex: 4,
      name: 'Sound - Speech of best men and maids of honour',
      scheduledStartTime: new Date('2025-10-25T17:05:00.000Z'),
      durationMinutes: 40,
      triggerOffsetMinutes: -10,
      status: 'PENDING' as const,
      weddingEventId: weddingEvents[0]?.id,
      createdById: createdUsers[0]?.id,
      lastModifiedById: createdUsers[0]?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'timer-5',
      orderIndex: 5,
      name: 'Activity - Phone',
      scheduledStartTime: new Date('2025-10-25T17:30:00.000Z'),
      status: 'PENDING' as const,
      isPunctual: true,
      weddingEventId: weddingEvents[0]?.id,
      createdById: createdUsers[0]?.id,
      lastModifiedById: createdUsers[0]?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'timer-6',
      orderIndex: 6,
      name: 'Surprise',
      status: 'PENDING' as const,
      isManual: true,
      weddingEventId: weddingEvents[0]?.id,
      createdById: createdUsers[0]?.id,
      lastModifiedById: createdUsers[0]?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'timer-7',
      orderIndex: 7,
      name: 'Sound - Table-by-table',
      scheduledStartTime: new Date('2025-10-25T18:15:00.000Z'),
      triggerOffsetMinutes: -10,
      durationMinutes: 45,
      status: 'PENDING' as const,
      weddingEventId: weddingEvents[0]?.id,
      createdById: createdUsers[0]?.id,
      lastModifiedById: createdUsers[0]?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'timer-8',
      orderIndex: 8,
      name: 'Activity - Digital game',
      status: 'PENDING' as const,
      scheduledStartTime: new Date('2025-10-25T18:30:00.000Z'),
      isPunctual: true,
      weddingEventId: weddingEvents[0]?.id,
      createdById: createdUsers[0]?.id,
      lastModifiedById: createdUsers[0]?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'timer-9',
      orderIndex: 9,
      name: 'Sound - Bouquet toss',
      scheduledStartTime: new Date('2025-10-25T19:00:00.000Z'),
      triggerOffsetMinutes: -10,
      durationMinutes: 50,
      status: 'PENDING' as const,
      isPunctual: true,
      weddingEventId: weddingEvents[0]?.id,
      createdById: createdUsers[0]?.id,
      lastModifiedById: createdUsers[0]?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'timer-10',
      orderIndex: 10,
      name: 'Sound - Starting Bouquet toss',
      status: 'PENDING' as const,
      isManual: true,
      weddingEventId: weddingEvents[0]?.id,
      createdById: createdUsers[0]?.id,
      lastModifiedById: createdUsers[0]?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'timer-11',
      orderIndex: 11,
      name: 'Sound - Ending Bouquet - Cachaca toss',
      status: 'PENDING' as const,
      isManual: true,
      weddingEventId: weddingEvents[0]?.id,
      createdById: createdUsers[0]?.id,
      lastModifiedById: createdUsers[0]?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'timer-12',
      orderIndex: 12,
      name: 'Sound - Starting Cachaca toss',
      status: 'PENDING' as const,
      isManual: true,
      weddingEventId: weddingEvents[0]?.id,
      createdById: createdUsers[0]?.id,
      lastModifiedById: createdUsers[0]?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'timer-13',
      orderIndex: 13,
      name: 'Sound - French Shot',
      scheduledStartTime: new Date('2025-10-25T20:15:00.000Z'),
      durationMinutes: 35,
      status: 'PENDING' as const,
      weddingEventId: weddingEvents[0]?.id,
      createdById: createdUsers[0]?.id,
      lastModifiedById: createdUsers[0]?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'timer-14',
      orderIndex: 14,
      name: 'Activity - Photomaton',
      scheduledStartTime: new Date('2025-10-25T20:30:00.000Z'),
      status: 'PENDING' as const,
      isPunctual: true,
      weddingEventId: weddingEvents[0]?.id,
      createdById: createdUsers[0]?.id,
      lastModifiedById: createdUsers[0]?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'timer-15',
      orderIndex: 15,
      name: 'Carnival',
      scheduledStartTime: new Date('2025-10-25T20:52:00.000Z'),
      durationMinutes: 8,
      status: 'PENDING' as const,
      weddingEventId: weddingEvents[0]?.id,
      createdById: createdUsers[0]?.id,
      lastModifiedById: createdUsers[0]?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'timer-16',
      orderIndex: 16,
      name: 'Wedding cake',
      scheduledStartTime: new Date('2025-10-25T21:05:00.000Z'),
      durationMinutes: 55,
      status: 'PENDING' as const,
      weddingEventId: weddingEvents[0]?.id,
      createdById: createdUsers[0]?.id,
      lastModifiedById: createdUsers[0]?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // 5. Créer les assets des timers
  const timerAssets: NewTimerAsset[] = [
    // Timer 1: Video - Landing of the bride and groom
    {
      id: 'asset-timer-1-video-1',
      timerId: 'timer-1',
      type: 'VIDEO',
      url: '/assets/videos/1-atterissage.mp4',
      orderIndex: 0,
      createdAt: new Date(),
      contentFr: 'Atterrissage des mariés',
      contentEn: 'Landing of the bride and groom',
      contentBr: 'Desembarque dos noivos',
    },
    {
      id: 'asset-timer-1-sound-1',
      timerId: 'timer-1',
      type: 'SOUND',
      url: '/assets/sounds/1-entree-des-maries.mp3',
      orderIndex: 1,
      createdAt: new Date(),
      contentFr: 'Atterrissage des mariés',
      contentEn: 'Landing of the bride and groom',
      contentBr: 'Desembarque dos noivos',
    },

    // Timer 2: Sound - Landing of the bride and groom
    {
      id: 'asset-timer-2-sound',
      timerId: 'timer-2',
      type: 'SOUND',
      url: '/assets/sounds/1-atterissage.mp3',
      contentFr: 'Atterrissage des mariés',
      contentEn: 'Landing of the bride and groom',
      contentBr: 'Desembarque dos noivos',
      displayDurationSec: 60 * 10, // 10 min
      orderIndex: 0,
      createdAt: new Date(),
    },

    // Timer 3: Sound - Photos
    {
      id: 'asset-timer-3-sound',
      timerId: 'timer-3',
      type: 'SOUND',
      url: '/assets/sounds/2-photo-de-groupe.mp3',
      contentFr: 'Photos',
      contentEn: 'Photos',
      contentBr: 'Photos',
      orderIndex: 0,
      createdAt: new Date(),
      displayDurationSec: 60 * 2, // 2 min
    },
    // Timer 4: Sound - Speech of best men and maids of honour
    {
      id: 'asset-timer-4-sound',
      timerId: 'timer-4',
      type: 'SOUND',
      url: '/assets/sounds/3-discours-temoins.mp3',
      orderIndex: 0,
      createdAt: new Date(),
      contentFr: 'Discours des témoins',
      contentEn: 'Speech of best men and maids of honour',
      contentBr: 'Discurso das testemunhas',
      displayDurationSec: 60 * 10, // 10 min
    },
    // Timer 5: Activity - Phone
    {
      id: 'asset-timer-5-sound',
      timerId: 'timer-5',
      type: 'SOUND',
      url: '/assets/sounds/3-telephone.mp3',
      orderIndex: 0,
      createdAt: new Date(),
    },
    {
      id: 'asset-timer-5-image',
      timerId: 'timer-5',
      type: 'IMAGE',
      orderIndex: 1,
      displayDurationSec: 60, // 1 min
      url: '/assets/images/telephone.png',
      createdAt: new Date(),
    },
    // Timer 6: Surprise
    {
      id: 'asset-timer-6-sound',
      timerId: 'timer-6',
      type: 'SOUND',
      url: '/assets/sounds/4-surprise.mp3',
      orderIndex: 0,
      createdAt: new Date(),
    },
    // Timer 7: Sound - Table-by-table
    {
      id: 'asset-timer-7-sound',
      timerId: 'timer-7',
      type: 'SOUND',
      url: '/assets/sounds/6-table.mp3',
      orderIndex: 0,
      createdAt: new Date(),
      contentFr: 'Activité table par table',
      contentEn: 'Table-by-table activity',
      contentBr: 'Atividade mesa por mesa',
      displayDurationSec: 60 * 10, // 10 min
    },
    // Timer 8: Activity - Digital game
    {
      id: 'asset-timer-8-sound',
      timerId: 'timer-8',
      type: 'SOUND',
      url: '/assets/sounds/5-cosmic-love.mp3',
      orderIndex: 0,
      createdAt: new Date(),
    },
    {
      id: 'asset-timer-8-image',
      timerId: 'timer-8',
      type: 'IMAGE',
      url: '/assets/images/cosmic-love.png',
      orderIndex: 1,
      createdAt: new Date(),
    },
    // Timer 9: Sound - Bouquet toss
    {
      id: 'asset-timer-9-sound',
      timerId: 'timer-9',
      type: 'SOUND',
      url: '/assets/sounds/7-bouquet.mp3',
      orderIndex: 0,
      createdAt: new Date(),
      contentFr: 'Lancer de bouquet',
      contentEn: 'Bouquet toss',
      contentBr: 'Jogar o buquê',
      displayDurationSec: 60 * 10, // 10 min
    },
    // Timer 10: Sound - Starting Bouquet toss
    {
      id: 'asset-timer-10-sound',
      timerId: 'timer-10',
      type: 'SOUND',
      url: '/assets/sounds/countdown.mp3',
      orderIndex: 0,
      createdAt: new Date(),
    },
    // Timer 11: Sound - Ending Bouquet toss
    {
      id: 'asset-timer-11-sound',
      timerId: 'timer-11',
      type: 'SOUND',
      url: '/assets/sounds/8-cachaca.mp3',
      orderIndex: 0,
      createdAt: new Date(),
    },
    // Timer 12: Sound - Starting Cachaca toss
    {
      id: 'asset-timer-12-sound',
      timerId: 'timer-12',
      type: 'SOUND',
      url: '/assets/sounds/countdown.mp3',
      orderIndex: 0,
      createdAt: new Date(),
    },
    // Timer 13: Sound - French Shot
    {
      id: 'asset-timer-13-sound',
      timerId: 'timer-13',
      type: 'SOUND',
      url: '/assets/sounds/10-shot.mp3',
      orderIndex: 0,
      createdAt: new Date(),
      contentFr: 'Trou normand',
      contentEn: 'French shot of Normandy',
      contentBr: 'Shot francês da Normandia',
      displayDurationSec: 60 * 2, // 2 min
    },
    // Timer 14: Activity - Photomaton
    {
      id: 'asset-timer-14-sound',
      timerId: 'timer-14',
      type: 'SOUND',
      url: '/assets/sounds/9-photomaton.mp3',
      orderIndex: 0,
      createdAt: new Date(),
    },
    {
      id: 'asset-timer-14-image',
      timerId: 'timer-14',
      type: 'IMAGE',
      url: '/assets/images/photomaton.png',
      orderIndex: 1,
      createdAt: new Date(),
    },
    // Timer 15: Carnival
    {
      id: 'asset-timer-15-sound',
      timerId: 'timer-15',
      type: 'SOUND',
      url: '/assets/sounds/11-carnaval.mp3',
      orderIndex: 0,
      createdAt: new Date(),
      contentFr: 'Carnaval',
      contentEn: 'Carnival',
      contentBr: 'Carnaval',
      displayDurationSec: 60 * 2, // 2 min
    },
    {
      id: 'asset-timer-15-video',
      timerId: 'timer-15',
      type: 'VIDEO',
      url: '/assets/videos/carnaval.mp4',
      orderIndex: 1,
      createdAt: new Date(),
      contentFr: 'Carnaval',
      contentEn: 'Carnival',
      contentBr: 'Carnaval',
      displayDurationSec: 60 * 5, // 5 min
    },
    // Timer 16: Wedding cake
    {
      id: 'asset-timer-16-sound',
      timerId: 'timer-16',
      type: 'SOUND',
      url: '/assets/sounds/12-dessert.mp3',
      orderIndex: 0,
      createdAt: new Date(),
      contentFr: 'Gâteau de mariage',
      contentEn: 'Wedding cake',
      contentBr: 'Bolo do casamento',
      displayDurationSec: 60 * 5, // 5 min
    },
  ];

  console.log('⏳ Création des timers...');
  const timers = await db.insert(timer).values(timerData).returning();

  console.log('⏳ Création des assets des timers...');
  await db.insert(timerAsset).values(timerAssets);

  console.log('✅ Timers créés:', timers.length);

  console.log('🎉 Seeding terminé avec succès!');

  // Afficher un résumé
  console.log('\n📋 Résumé du seeding:');
  console.log(`- Mariage: ${weddingEvents[0]?.name}`);
  console.log(`- Date: ${weddingEvents[0]?.eventDate}`);
  console.log('- Propriétaire: Tony et Neka');
  console.log(`- Nombre de timers: ${timers.length}`);
  console.log('\n⏰ Planning des timers:');
  timers.forEach((timer, index) => {
    const startTime = timer.scheduledStartTime
      ? new Date(timer.scheduledStartTime).toLocaleString()
      : 'N/A';
    console.log(
      `${index + 1}. ${startTime} - ${timer.name} (${timer.durationMinutes}min)`
    );
  });
}

// Fonction principale de seeding
async function main() {
  try {
    await reset(db, { user, weddingParticipant, timer, weddingEvent });
    console.log('✅ Reset de la bas de données avant le seed terminé !');
    await seedWeddingData();
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
}

// Exécuter le seed si ce fichier est lancé directement
if (require.main === module) {
  main();
}

export { seedWeddingData };
