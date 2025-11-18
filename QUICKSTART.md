# Quick Start Guide

Rychlý průvodce pro spuštění aplikace během 5 minut.

## Prerekvizity

Ujistěte se, že máte nainstalováno:
- ✅ Node.js 18+ ([stáhnout](https://nodejs.org/))
- ✅ PostgreSQL 14+ ([stáhnout](https://www.postgresql.org/download/))
- ✅ OpenAI API klíč ([získat](https://platform.openai.com/api-keys))

## Instalace (5 minut)

### 1. Naklonujte repository a nainstalujte závislosti
```bash
git clone <repository-url>
cd ai-course-app
npm install
```

### 2. Vytvořte PostgreSQL databázi
```bash
# Spusťte PostgreSQL (pokud neběží)
# macOS:
brew services start postgresql

# Linux:
sudo service postgresql start

# Windows: Spusťte PostgreSQL z Start menu

# Vytvořte databázi
createdb ai_course_db
```

### 3. Nastavte environment variables
```bash
# Zkopírujte .env.example
cp .env.example .env

# Upravte .env (otevřete v editoru)
# Minimálně nastavte:
DATABASE_URL="postgresql://user:password@localhost:5432/ai_course_db"
OPENAI_API_KEY="sk-your-key-here"
```

**Jak získat OpenAI API klíč:**
1. Jděte na https://platform.openai.com/api-keys
2. Klikněte na "Create new secret key"
3. Zkopírujte klíč do .env souboru

### 4. Inicializujte databázi
```bash
# Push schema do databáze
npm run db:push

# Seed testovacími daty
npm run db:seed
```

### 5. Spusťte aplikaci
```bash
npm run dev
```

Aplikace běží na: **http://localhost:3000**

---

## První přihlášení

Po spuštění aplikace:

1. Otevřete **http://localhost:3000/dashboard**
2. Používá demo uživatele automaticky (email: `demo@example.com`)
3. Prozkoumejte:
   - ✨ Dashboard s přehledem
   - 💬 AI Kouč na `/coach`
   - 📊 Denní tracker na `/daily-tracker`

---

## Nejčastější problémy

### 🔴 "Cannot connect to database"
**Řešení:**
```bash
# Zkontrolujte, že PostgreSQL běží
psql -U postgres -l

# Ověřte DATABASE_URL v .env
# Ujistěte se, že user a password jsou správné
```

### 🔴 "OpenAI API error"
**Řešení:**
```bash
# Zkontrolujte, že máte kredit na OpenAI účtu
# Ověřte API klíč v .env
# Zkontrolujte, že klíč začíná "sk-"
```

### 🔴 "Module not found"
**Řešení:**
```bash
# Reinstalujte dependencies
rm -rf node_modules package-lock.json
npm install
```

### 🔴 "Prisma Client is not generated"
**Řešení:**
```bash
npx prisma generate
```

---

## Užitečné příkazy

```bash
# Spustit development server
npm run dev

# Build pro produkci
npm run build
npm start

# Otevřít Prisma Studio (GUI pro databázi)
npm run db:studio

# Reset databáze (VAROVÁNÍ: smaže všechna data!)
npx prisma migrate reset

# Zobrazit Prisma schema
cat prisma/schema.prisma

# Kontrola TypeScript chyb
npx tsc --noEmit

# Formátování kódu
npx prettier --write .
```

---

## Testování funkcí

### 1. Dashboard
```
URL: http://localhost:3000/dashboard

Otestujte:
✓ Zobrazení aktuálního týdne
✓ Hlavní cíl (pokud je nastaven)
✓ Gamifikace (odznaky, skóre)
✓ AI kouč panel
```

### 2. AI Kouč
```
URL: http://localhost:3000/coach?type=onboarding

Otestujte:
✓ Odeslání zprávy
✓ Odpověď od AI
✓ Kontextové chování podle typu
✓ Historie konverzace
```

### 3. Denní Tracker
```
URL: http://localhost:3000/daily-tracker

Otestujte:
✓ Vyplnění formuláře podle týdne
✓ Uložení záznamu
✓ Zobrazení historie
```

### 4. Prisma Studio
```bash
npm run db:studio
# Otevře: http://localhost:5555

Otestujte:
✓ Prohlížení tabulek
✓ Editace záznamů
✓ Přidávání dat
```

---

## Co dál?

### Přizpůsobení
1. **Změna vzhledu:** Upravte `tailwind.config.js` a `app/globals.css`
2. **Přidání funkcí:** Vytvořte nové API routes v `app/api/`
3. **Úprava AI kouče:** Upravte prompty v `lib/ai-coach/coach.ts`

### Deployment
```bash
# Pro nasazení na Vercel
npm i -g vercel
vercel

# Viz DEPLOYMENT.md pro více informací
```

### Vývoj
```bash
# Sledujte změny v databázi
npm run db:studio

# Sledujte logy
tail -f .next/trace

# Debug mode
NODE_OPTIONS='--inspect' npm run dev
```

---

## Další dokumentace

📖 **README.md** - Kompletní dokumentace projektu  
🏗️ **ARCHITECTURE.md** - Architektura a design  
🚀 **DEPLOYMENT.md** - Nasazení do produkce  

---

## Podpora

Pokud narazíte na problém:

1. Zkontrolujte logy v konzoli
2. Podívejte se do `ARCHITECTURE.md` pro technické detaily
3. Otevřete issue na GitHubu
4. Kontaktujte: [váš email]

---

**Hotovo! 🎉 Aplikace běží a je připravena k použití.**

Začněte prozkoumáváním dashboardu a vyzkoušejte AI kouče!
