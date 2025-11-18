// Prisma Seed Script
// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Začínám seedování databáze...');

  // 1. Vytvořit základní odznaky
  console.log('📛 Vytvářím odznaky...');
  
  const badges = [
    {
      code: 'GOAL_LOCKED',
      name: 'Cíl nastaven',
      description: 'Úspěšně jsi nastavil svůj hlavní cíl pro Fázi 1',
      icon: '🎯',
    },
    {
      code: 'FIRST_WEEKLY_PLAN',
      name: 'První týdenní plán',
      description: 'Vytvořil jsi svůj první týdenní plán',
      icon: '📋',
    },
    {
      code: 'ANTI_PROCRAST_PATTERNS',
      name: 'Vzorce prokrastinace',
      description: 'Identifikoval jsi 3 vzorce prokrastinace a jejich řešení',
      icon: '⚡',
    },
    {
      code: 'OS_V1_DONE',
      name: 'Pracovní OS 1.0',
      description: 'Dokončil jsi svůj Pracovní operační systém 1.0',
      icon: '🚀',
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: badge,
      create: badge,
    });
  }
  
  console.log(`✅ Vytvořeno ${badges.length} odznaků`);

  // 2. Vytvořit demo uživatele (volitelné)
  console.log('👤 Vytvářím demo uživatele...');
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      id: 'demo-user',
      email: 'demo@example.com',
      name: 'Demo Uživatel',
      roleDescription: 'Projektový manažer v tech firmě',
      aiMode: 'NORMAL',
    },
  });

  console.log(`✅ Demo uživatel vytvořen: ${demoUser.email}`);

  // 3. Vytvořit CoursePhase1State pro demo uživatele
  await prisma.coursePhase1State.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      currentWeek: 1,
      mainGoal: null, // Bude nastaveno během onboardingu
    },
  });

  console.log('✅ Stav kurzu vytvořen');

  // 4. Příklad týdenních plánů (pro testování)
  console.log('📅 Vytvářím ukázkový týdenní plán...');
  
  await prisma.weeklyPlan.upsert({
    where: {
      userId_weekNumber: {
        userId: demoUser.id,
        weekNumber: 2,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      weekNumber: 2,
      highValueTasks: [
        'Dokončit strategický dokument pro Q1',
        'Prezentace pro vedení',
        'Code review kritických částí',
      ],
      adminTasks: [
        'Odpovědět na emaily',
        'Týdenní meeting',
        'Aktualizovat Jiru',
      ],
      lowValueTasks: [
        'Prohlédnout newslettery',
        'Uklidit Slack',
      ],
      focusBlocks: [
        { dayOfWeek: 1, startTime: '09:00', durationMin: 120 },
        { dayOfWeek: 3, startTime: '14:00', durationMin: 90 },
      ],
      notes: 'Tento týden chci dokončit strategický dokument',
    },
  });

  console.log('✅ Ukázkový týdenní plán vytvořen');

  // 5. Příklad denních záznamů
  console.log('📊 Vytvářím ukázkové denní záznamy...');
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.dailyTrackerEntry.upsert({
    where: {
      userId_date: {
        userId: demoUser.id,
        date: yesterday,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      date: yesterday,
      weekNumber: 1,
      engagedToday: true,
      dayFeeling: 4,
      frustrationNote: 'Příliš mnoho meetingů',
    },
  });

  console.log('✅ Ukázkové denní záznamy vytvořeny');

  // 6. Příklad vzorců prokrastinace
  console.log('⚡ Vytvářím ukázkové vzorce prokrastinace...');
  
  const patterns = [
    {
      userId: demoUser.id,
      description: 'Odkládám psaní reportů, protože nevím kde začít',
      patternType: 'Nejasné zadání',
      microStep: 'Napsat 3 hlavní otázky, na které má report odpovědět',
      triggerPhrases: ['report', 'dokumentace', 'dlouhý text'],
    },
    {
      userId: demoUser.id,
      description: 'Odkládám code review, protože je to nudné',
      patternType: 'Nuda/únava',
      microStep: 'Nastavit timer na 10 minut a začít',
      triggerPhrases: ['code review', 'kontrola', 'review'],
    },
    {
      userId: demoUser.id,
      description: 'Odkládám obtížné konverzace s kolegy',
      patternType: 'Strach z konfliktu',
      microStep: 'Napsat 3 věty, jak chci začít konverzaci',
      triggerPhrases: ['feedback', 'konflikt', 'obtížná konverzace'],
    },
  ];

  for (const pattern of patterns) {
    await prisma.procrastinationPattern.create({
      data: pattern,
    });
  }

  console.log(`✅ Vytvořeno ${patterns.length} vzorců prokrastinace`);

  // 7. Udělit první badge demo uživateli
  console.log('🏆 Udělování prvního odznaku...');
  
  await prisma.userBadge.upsert({
    where: {
      userId_badgeCode: {
        userId: demoUser.id,
        badgeCode: 'GOAL_LOCKED',
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      badgeCode: 'GOAL_LOCKED',
    },
  });

  console.log('✅ První odznak udělen');

  // 8. Vytvořit ukázkovou CoachSession
  console.log('💬 Vytvářím ukázkovou konverzaci s koučem...');
  
  await prisma.coachSession.create({
    data: {
      userId: demoUser.id,
      weekNumber: 1,
      interactionType: 'onboarding',
      messages: [
        {
          role: 'assistant',
          content: 'Ahoj! Jsem tvůj AI kouč. Pojďme se poznat. Jaká je tvoje pracovní pozice a co zhruba děláš během týdne?',
          timestamp: new Date(),
        },
        {
          role: 'user',
          content: 'Jsem projektový manažer v tech firmě. Řídím 2 týmy a starám se o komunikaci s klienty.',
          timestamp: new Date(),
        },
      ],
      summary: 'Zahájení onboarding rozhovoru',
    },
  });

  console.log('✅ Ukázková konverzace vytvořena');

  console.log('\n🎉 Seedování dokončeno!');
  console.log('\n📝 Demo uživatel:');
  console.log(`   Email: demo@example.com`);
  console.log(`   ID: demo-user`);
  console.log('\n🚀 Můžeš se přihlásit a začít testovat aplikaci!');
}

main()
  .catch((e) => {
    console.error('❌ Chyba při seedování:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
