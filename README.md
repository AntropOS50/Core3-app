# Stát se nenahraditelným v době AI - Fáze 1

## Popis projektu

Toto je webová aplikace pro 4týdenní transformační program "Pracovní operační systém 1.0", určený pro dospělé profesionály, kteří se chtějí stát nenahraditelnými v éře AI.

### Hlavní funkce

- **Dashboard** - Přehled pokroku, týdenní skóre, odznaky a streaky
- **AI Kouč** - Inteligentní asistent s kontextovým porozuměním
- **Denní tracker** - Sledování denního pokroku podle týdne
- **Týdenní plánování** - Správa high-value úkolů a focus bloků
- **Gamifikace** - Odznaky, streaky a motivační prvky
- **4 týdenní moduly:**
  - Týden 1: Start & diagnostika
  - Týden 2: AI Kompas týdne
  - Týden 3: Mikro-kroky proti prokrastinaci
  - Týden 4: Pracovní operační systém

## Technologický stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL + Prisma ORM
- **AI:** OpenAI GPT-4 API
- **Authentication:** NextAuth.js (připraveno pro budoucí implementaci)

## Instalace a spuštění

### Prerekvizity

- Node.js 18+ 
- PostgreSQL 14+
- OpenAI API klíč

### 1. Klonování a instalace dependencies

```bash
git clone <repository-url>
cd ai-course-app
npm install
```

### 2. Nastavení databáze

```bash
# Vytvořte PostgreSQL databázi
createdb ai_course_db

# Zkopírujte .env.example do .env a vyplňte hodnoty
cp .env.example .env

# Upravte DATABASE_URL v .env:
DATABASE_URL="postgresql://user:password@localhost:5432/ai_course_db?schema=public"
```

### 3. Inicializace databáze

```bash
# Push Prisma schema do databáze
npm run db:push

# (Volitelně) Spustit seed script pro testovací data
npm run db:seed
```

### 4. Nastavení OpenAI API

V souboru `.env` nastavte:
```
OPENAI_API_KEY="sk-your-api-key-here"
```

### 5. Spuštění aplikace

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Aplikace běží na `http://localhost:3000`

## Struktura projektu

```
ai-course-app/
├── app/
│   ├── api/                    # API routes
│   │   ├── dashboard/          # Dashboard data
│   │   ├── daily-tracker/      # Denní tracker
│   │   ├── weekly-plan/        # Týdenní plán
│   │   ├── coach/              # AI kouč
│   │   ├── procrastination-patterns/
│   │   └── operating-system/
│   ├── dashboard/              # Dashboard stránka
│   ├── coach/                  # AI kouč stránka
│   ├── daily-tracker/          # Tracker stránka
│   └── layout.tsx              # Root layout
├── components/                 # React komponenty
│   ├── WeekProgress.tsx
│   ├── NextStepCard.tsx
│   ├── GamificationPanel.tsx
│   ├── CoachPanel.tsx
│   └── DailyTrackerQuickAccess.tsx
├── lib/
│   ├── api/
│   │   └── types.ts            # TypeScript typy
│   ├── ai-coach/
│   │   └── coach.ts            # AI kouč logika
│   └── prisma.ts               # Prisma client
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed script
├── public/                     # Statické soubory
└── package.json
```

## Datový model

### Hlavní entity

- **User** - Uživatel systému
- **CoursePhase1State** - Stav v kurzu (aktuální týden, hlavní cíl)
- **WeeklyPlan** - Týdenní plán (high-value úkoly, focus bloky)
- **DailyTrackerEntry** - Denní záznamy (různá pole podle týdne)
- **ProcrastinationPattern** - Vzorce prokrastinace s mikro-kroky
- **OperatingSystemV1** - Pracovní operační systém 1.0
- **Badge / UserBadge** - Systém odznaků
- **Streak** - Sledování sérií (streaky)
- **CoachSession** - Historie konverzací s AI koučem

Kompletní schema viz `prisma/schema.prisma`

## API Endpoints

### Dashboard
- `GET /api/dashboard` - Získat data pro dashboard

### Denní tracker
- `GET /api/daily-tracker` - Získat záznamy
- `POST /api/daily-tracker` - Uložit záznam

### Týdenní plán
- `GET /api/weekly-plan?week=N` - Získat plán
- `POST /api/weekly-plan` - Uložit plán

### AI Kouč
- `GET /api/coach/chat?type=X` - Načíst historii
- `POST /api/coach/chat` - Odeslat zprávu

### Vzorce prokrastinace
- `GET /api/procrastination-patterns` - Získat vzorce
- `POST /api/procrastination-patterns` - Vytvořit vzorec
- `DELETE /api/procrastination-patterns?id=X` - Smazat vzorec

### Operating System
- `GET /api/operating-system` - Získat OS
- `POST /api/operating-system` - Uložit OS

## AI Kouč - Režimy

AI kouč má několik režimů podle typu interakce:

1. **Onboarding** (`?type=onboarding`)
   - Úvodní rozhovor
   - Zjištění pracovního kontextu
   - Stanovení hlavního cíle

2. **Weekly Planning** (`?type=weekly_planning`)
   - Pomoc s týdenním plánem
   - Kategorizace úkolů
   - Plánování focus bloků

3. **Procrastination** (`?type=procrastination`)
   - Analýza vzorců prokrastinace
   - Definování mikro-kroků
   - Identifikace trigger situací

4. **Reflection** (`?type=reflection`)
   - Týdenní reflexe
   - Analýza dat z trackeru
   - Návrh úprav

5. **Ad Hoc** (`?type=ad_hoc`)
   - Volná konverzace
   - Odpovědi na otázky
   - Řešení problémů

## Gamifikace

### Odznaky

- **GOAL_LOCKED** (🎯) - Nastaven hlavní cíl
- **FIRST_WEEKLY_PLAN** (📋) - Vytvořen první týdenní plán
- **ANTI_PROCRAST_PATTERNS** (⚡) - Definováno 3+ vzorců prokrastinace
- **OS_V1_DONE** (🚀) - Dokončen Pracovní OS 1.0

### Týdenní skóre

- +5 bodů za každý vyplněný tracker
- +20 bodů bonus za 4+ dny s meaningful step
- Maximum: 100 bodů týdně

### Streaky

Sledování sérií pro:
- Meaningful steps (high-impact kroky)
- Použití mikro-kroků

## Vývoj a testování

### Prisma Studio
```bash
npm run db:studio
```
Otevře GUI pro prohlížení databáze na `http://localhost:5555`

### TypeScript type checking
```bash
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

## Nasazení do produkce

### Vercel (doporučeno)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment variables ve Vercel
Nastavte následující proměnné v Vercel dashboard:
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

### Database migrace
```bash
# Vygenerovat migraci
npx prisma migrate dev --name init

# Aplikovat migrace v produkci
npx prisma migrate deploy
```

## Budoucí rozšíření

- [ ] Autentizace uživatelů (NextAuth.js)
- [ ] Email notifikace
- [ ] Export dat (PDF, CSV)
- [ ] Mobilní aplikace (React Native)
- [ ] Fáze 2 kurzu
- [ ] Community features (sdílení pokroku)
- [ ] Pokročilá analytika a grafy
- [ ] Integrace s kalendářem

## Podpora

Pro dotazy a podporu kontaktujte: [váš email]

## Licence

[Vaše licence]
