import { auth } from '@/lib/auth';
import type { User } from 'better-auth';
import { config } from 'dotenv';
import { reset } from 'drizzle-seed';
import { db } from '../index';
import { user } from '../schema/auth';
import { timer, type NewTimer } from '../schema/timer';
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
      name: 'Video - Landing of the bride and groom',
      descriptionFr: 'Atterrissage des mariés',
      descriptionEn: 'Landing of the bride and groom',
      descriptionBr: 'Desembarque dos noivos',
      scheduledStartTime: new Date('2025-10-25T16:00:00.000Z'),
      durationMinutes: 30,
      triggerType: 'VIDEO' as const,
      status: 'PENDING' as const,
      assetsUrl: ['/assets/videos/1-atterissage.mp4'],
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
      triggerType: 'VIDEO_SOUND' as const,
      status: 'PENDING' as const,
      isPunctual: true,
      assetsUrl: ['/assets/sounds/1-entree-des-maries.m4a'],
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
      descriptionFr: 'Photos',
      descriptionEn: 'Photos',
      descriptionBr: 'Photos',
      scheduledStartTime: new Date('2025-10-25T16:40:00.000Z'),
      durationMinutes: 10,
      triggerType: 'SOUND' as const,
      status: 'PENDING' as const,
      assetsUrl: ['/assets/sounds/2-photo-de-groupe.mp3'],
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
      descriptionFr: 'Discours des témoins',
      descriptionEn: 'Speech of best men and maids of honour',
      descriptionBr: 'Discurso das testemunhas',
      scheduledStartTime: new Date('2025-10-25T17:05:00.000Z'),
      durationMinutes: 40,
      triggerType: 'SOUND' as const,
      status: 'PENDING' as const,
      assetsUrl: ['/assets/sounds/Casa de Cha - AUDIO 3 - DISCOURS - TONY.mp3'],
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
      descriptionFr: 'Moment téléphone - animation surprise',
      descriptionEn: 'Phone moment - surprise animation',
      descriptionBr: 'Momento telefone - animação surpresa',
      scheduledStartTime: new Date('2025-10-25T17:30:00.000Z'),
      triggerType: 'IMAGE_SOUND' as const,
      status: 'PENDING' as const,
      isPunctual: true,
      assetsUrl: ['/assets/sounds/3-telephone.mp3'],
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
      triggerType: 'SOUND' as const,
      status: 'PENDING' as const,
      isManual: true,
      assetsUrl: ['/assets/sounds/4-surprise.mp3'],
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
      descriptionFr: 'Activité table par table',
      descriptionEn: 'Table-by-table activity',
      descriptionBr: 'Atividade mesa por mesa',
      scheduledStartTime: new Date('2025-10-25T18:15:00.000Z'),
      scheduledStartTrigger: new Date('2025-10-25T18:50:00.000Z'),
      durationMinutes: 45,
      triggerType: 'SOUND' as const,
      status: 'PENDING' as const,
      assetsUrl: ['/assets/sounds/6-table.mp3'],
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
      triggerType: 'IMAGE_SOUND' as const,
      status: 'PENDING' as const,
      scheduledStartTime: new Date('2025-10-25T18:30:00.000Z'),
      isPunctual: true,
      assetsUrl: ['/assets/sounds/5-cosmic-love.mp3'],
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
      descriptionFr: 'Lancer de bouquet',
      descriptionEn: 'Bouquet toss',
      descriptionBr: 'Jogar o buquê',
      scheduledStartTime: new Date('2025-10-25T19:00:00.000Z'),
      // si scheduledStartTrigger existe, c'est lui qui est utilisé pour démarrer le triggerType et non a la fin du timer (scheduledStartTime + durationMinutes)
      scheduledStartTrigger: new Date('2025-10-25T19:40:00.000Z'),
      durationMinutes: 50,
      triggerType: 'SOUND' as const,
      status: 'PENDING' as const,
      isPunctual: true,
      assetsUrl: ['/assets/sounds/7-bouquet.mp3'],
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
      triggerType: 'SOUND' as const,
      status: 'PENDING' as const,
      isManual: true,
      assetsUrl: ['/assets/sounds/countdown.mp3'],
      weddingEventId: weddingEvents[0]?.id,
      createdById: createdUsers[0]?.id,
      lastModifiedById: createdUsers[0]?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'timer-11',
      orderIndex: 11,
      name: 'Sound - Ending Bouquet toss',
      triggerType: 'SOUND' as const,
      status: 'PENDING' as const,
      isManual: true,
      assetsUrl: ['/assets/sounds/8-cachaca.mp3'],
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
      triggerType: 'SOUND' as const,
      status: 'PENDING' as const,
      isManual: true,
      assetsUrl: ['/assets/sounds/countdown.mp3'],
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
      descriptionFr: 'Trou normand',
      descriptionEn: 'French shot of Normandy',
      descriptionBr: 'Shot francês da Normandia',
      scheduledStartTime: new Date('2025-10-25T20:15:00.000Z'),
      durationMinutes: 35,
      triggerType: 'SOUND' as const,
      status: 'PENDING' as const,
      assetsUrl: ['/assets/sounds/10-shot.mp3'],
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
      triggerType: 'IMAGE_SOUND' as const,
      status: 'PENDING' as const,
      isPunctual: true,
      assetsUrl: ['/assets/sounds/9-photomaton.mp3'],
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
      descriptionFr: 'Carnaval',
      descriptionEn: 'Carnival',
      descriptionBr: 'Carnaval',
      scheduledStartTime: new Date('2025-10-25T20:55:00.000Z'),
      durationMinutes: 5,
      triggerType: 'SOUND' as const,
      status: 'PENDING' as const,
      assetsUrl: ['/assets/sounds/11-carnaval.mp3'],
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
      descriptionFr: 'Gâteau de mariage',
      descriptionEn: 'Wedding cake',
      descriptionBr: 'Bolo do casamento',
      scheduledStartTime: new Date('2025-10-25T21:05:00.000Z'),
      durationMinutes: 55,
      triggerType: 'SOUND' as const,
      status: 'PENDING' as const,
      assetsUrl: ['/assets/sounds/12-dessert.mp3'],
      weddingEventId: weddingEvents[0]?.id,
      createdById: createdUsers[0]?.id,
      lastModifiedById: createdUsers[0]?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  console.log('⏳ Création des timers...');
  const timers = await db.insert(timer).values(timerData).returning();

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
