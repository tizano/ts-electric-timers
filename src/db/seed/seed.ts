import { auth } from '@/lib/auth';
import type { User } from 'better-auth';
import { config } from 'dotenv';
import { reset } from 'drizzle-seed';
import { db } from '../index';
import { user } from '../schema/auth';
import { timer } from '../schema/timer';
import { weddingEvent, weddingParticipant } from '../schema/wedding-event';

config({ path: '/apps/server/.env' });

async function seedWeddingData() {
  console.log('🌱 Début du seeding...');
  console.log('🔗 Connexion à la base de données...', process.env.DATABASE_URL);

  const adminId = 'admin-user-id';
  const coordId = 'coord-user-id';
  const coordWeddingPlannerId = 'coord-weeding-planner-id';
  const weddingId = 'wedding-event-neka-tony-2025';

  const soundsBaseUrl = '/assets/sounds';
  const imagesBaseUrl = '/assets/images';
  const soundFiles = [
    '1-casa-de-cha-audio-atterrissage-tony.mp3',
    '2-casa-de-cha-audio-photos-neka.mp3',
    '3-casa-de-cha-audio-discours-tony.mp3',
    '4-casa-de-cha-audio-ouverture-neka.mp3',
    '5-casa-de-cha-audio-bouquet-tony.mp3',
    '6-casa-de-cha-audio-cachaca-neka.mp3',
    '7-casa-de-cha-audio-trou-normand-neka.mp3',
    '8-casa-de-cha-audio-gateau-tony.mp3',
  ];

  // 1. Créer les utilisateurs
  const userToCreate: User[] = [
    {
      id: adminId,
      name: 'Mathieu',
      email: 'admin@neka-tony.com',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: coordId,
      name: 'Tony & Neka',
      email: 'les-maries@neka-tony.com',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: coordWeddingPlannerId,
      name: 'Weeding Planner',
      email: 'wedding@neka-tony.com',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  userToCreate.forEach(async (user) => {
    await auth.api
      .signUpEmail({
        body: {
          email: user.email,
          password: process.env.SEED_USER_PASSWORD || 'Password123*',
          name: user.name,
        },
      })
      .then(async (res) => {
        if (res.user) {
          console.log(`✅ Utilisateur créé: ${res.user.email}`);
        }
      });
  });

  // 2. Créer l'événement de mariage
  const weddingEvents = await db
    .insert(weddingEvent)
    .values({
      id: weddingId,
      name: 'Mariage Tony et Neka',
      description: 'Célébration du mariage de Tony et Neka',
      eventDate: new Date('2025-10-25'),
      location: 'Recife',
      ownerId: adminId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  console.log('✅ Événement de mariage créé:', weddingEvents[0]?.name);

  // 3. Créer les participants au mariage
  const participants = await db
    .insert(weddingParticipant)
    .values([
      {
        id: `participant-${adminId}`,
        weddingEventId: weddingId,
        userId: adminId,
        role: 'OWNER',
        joinedAt: new Date(),
      },
      {
        id: `participant-${coordId}`,
        weddingEventId: weddingId,
        userId: coordId,
        role: 'COORDINATOR',
        joinedAt: new Date(),
      },
      {
        id: `participant-${coordWeddingPlannerId}`,
        weddingEventId: weddingId,
        userId: coordWeddingPlannerId,
        role: 'COORDINATOR',
        joinedAt: new Date(),
      },
    ])
    .returning();

  console.log('✅ Participants ajoutés:', participants.length);

  // 4. Créer les 5 timers à partir de 17h, toutes les heures
  const timerData = [
    {
      name: 'Arrivée des invités',
      description: "Accueil et vin d'honneur",
      time: '17:00',
      duration: 60,
      sound: '/assets/sounds/welcome-bells.mp4',
      image: '/assets/images/ceremony.jpg',
    },
    {
      name: 'Cérémonie',
      description: 'Cérémonie officielle de mariage',
      time: '18:00',
      duration: 45,
      sound: '/assets/sounds/wedding-march.mp4',
      image: '/assets/images/ceremony.jpg',
    },

    {
      name: 'Photos de groupe',
      description: 'Session photos avec famille et amis',
      time: '19:00',
      duration: 30,
      sound: '/assets/sounds/photo-time.mp4',
      image: '/assets/images/ceremony.jpg',
    },

    {
      name: 'Cocktail dînatoire',
      description: 'Apéritif et amuse-bouches',
      time: '20:00',
      duration: 90,
      sound: '/assets/sounds/dinner-bell.mp4',
      image: '/assets/images/ceremony.jpg',
    },

    {
      name: 'Ouverture du bal',
      description: 'Première danse des mariés',
      time: '21:00',
      duration: 120,
      sound: '/assets/sounds/dance-music.mp4',
      image: '/assets/images/ceremony.jpg',
    },
  ];

  const timers = await db
    .insert(timer)
    .values(
      timerData.map((timerInfo, index) => ({
        id: `timer-${index + 1}-tony-neka`,
        weddingEventId: weddingId,
        name: timerInfo.name,
        description: timerInfo.description,
        scheduledStartTime: new Date(`2025-10-25T${timerInfo.time}:00.000Z`),
        durationMinutes: timerInfo.duration,
        status: 'PENDING' as const,
        soundFileUrl: timerInfo.sound,
        imageFileUrl: timerInfo.image,
        orderIndex: index + 1,
        createdById: adminId,
        lastModifiedById: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    )
    .returning();

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
    const startTime = new Date(timer.scheduledStartTime).toUTCString();
    console.log(
      `${index + 1}. ${startTime} - ${timer.name} (${timer.durationMinutes}min)`,
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
