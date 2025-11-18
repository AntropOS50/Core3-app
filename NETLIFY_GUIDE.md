# Netlify Deployment - Kompletní návod

## ⚠️ Důležité upozornění

Next.js App Router má **omezenou podporu** na Netlify. Pro optimální výkon doporučujeme Vercel.
Ale pokud chceš použít Netlify, tento návod ti pomůže.

---

## Část 1: Příprava databáze

### 1.1 Vytvoření PostgreSQL databáze na Supabase

```bash
# Krok po kroku:

1. Jdi na https://supabase.com a přihlaš se
2. Klikni na "New project"
3. Vyplň:
   - Name: ai-course-db
   - Database Password: [silné heslo - ulož si ho!]
   - Region: [nejbližší region, např. Frankfurt]
4. Klikni "Create new project"
5. Počkej 2-3 minuty na inicializaci

# Získání connection stringu:
6. Jdi na: Project Settings (ikona ozubeného kola)
7. Klikni na "Database" v levém menu
8. Scroll dolů na "Connection string"
9. Vyber "URI" tab
10. Zkopíruj string (vypadá takto):
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@xxxxx.supabase.co:5432/postgres
```

### 1.2 Inicializace databáze

```bash
# Na svém počítači, v projektu:

# 1. Nastav DATABASE_URL v .env
DATABASE_URL="postgresql://postgres.xxxxx:..."

# 2. Push schema do Supabase databáze
npx prisma db push

# 3. Seed databáze (volitelné)
npx prisma db seed

# 4. Ověř v Supabase:
# Table Editor → Měl bys vidět všechny tabulky
```

---

## Část 2: Příprava projektu

### 2.1 Instalace Netlify CLI (volitelné, ale užitečné)

```bash
npm install -g netlify-cli

# Přihlášení
netlify login
```

### 2.2 Úprava package.json

Přidej build script pro Netlify:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "postbuild": "npx prisma generate"
  }
}
```

### 2.3 Vytvoření .gitignore (pokud ještě není)

```bash
# .gitignore
node_modules/
.next/
.env
.env.local
.netlify/
dist/
build/
*.log
.DS_Store
```

---

## Část 3: Push do GitHub

```bash
# 1. Inicializuj git (pokud ještě není)
git init

# 2. Přidej všechny soubory
git add .

# 3. Commit
git commit -m "Initial commit for Netlify deployment"

# 4. Vytvoř repository na GitHubu
# Jdi na github.com → New repository

# 5. Push do GitHubu
git remote add origin https://github.com/tvuj-ucet/ai-course-app.git
git branch -M main
git push -u origin main
```

---

## Část 4: Deploy na Netlify

### 4.1 Import projektu z GitHubu

```bash
# V prohlížeči:

1. Jdi na https://app.netlify.com
2. Klikni "Add new site" → "Import an existing project"
3. Vyber "GitHub"
4. Autorizuj Netlify (pokud poprvé)
5. Najdi a vyber svůj repository "ai-course-app"
```

### 4.2 Build nastavení

```bash
# V Netlify konfiguraci:

Base directory: (nech prázdné)
Build command: npm run build
Publish directory: .next

# Klikni "Deploy site" (ZATÍM NE! Nejdřív env variables)
```

### 4.3 ⚡ DŮLEŽITÉ: Environment Variables

```bash
# PŘED deploymentem nastav tyto proměnné:

1. V Netlify dashboardu: Site settings → Environment variables
2. Přidej tyto proměnné:

DATABASE_URL
Value: postgresql://postgres.xxxxx:...@xxxxx.supabase.co:5432/postgres
(zkopíruj z Supabase)

OPENAI_API_KEY
Value: sk-proj-...
(tvůj OpenAI API klíč)

NEXTAUTH_URL
Value: https://tvuj-site.netlify.app
(bude automaticky, nebo nastav později)

NEXTAUTH_SECRET
Value: [vygeneruj: openssl rand -base64 32]

NODE_ENV
Value: production

# 3. Ulož proměnné
```

### 4.4 Spuštění deploymentu

```bash
1. Klikni "Deploy site" (nebo "Trigger deploy")
2. Sleduj build log v reálném čase
3. Počkej na dokončení (3-5 minut)
```

---

## Část 5: Post-deployment kontroly

### 5.1 Ověření databáze

```bash
# V Supabase Table Editor zkontroluj:
✓ Všechny tabulky existují
✓ Badge záznamy jsou vytvořené
✓ Demo user existuje (pokud byl seed)
```

### 5.2 Testování aplikace

```bash
# Otevři: https://tvuj-site.netlify.app/dashboard

Otestuj:
✓ Dashboard se načte
✓ Kliknutí na "Otevřít kouče"
✓ AI Kouč odpovídá (test OpenAI API)
✓ Denní tracker funguje
✓ Data se ukládají do Supabase
```

### 5.3 Změna URL (volitelné)

```bash
# Změna Netlify URL:
1. Site settings → General → Site details
2. "Change site name"
3. Zadej: ai-course-app (nebo cokoliv dostupného)
4. Ulož → nová URL: https://ai-course-app.netlify.app
```

---

## Část 6: Continuous Deployment

### 6.1 Automatické deploymenty

```bash
# Netlify automaticky deployuje při:
git push origin main

# Proces:
1. Push do GitHubu
2. Netlify detekuje změnu
3. Automatický build a deploy
4. Notifikace (email) o úspěchu/selhání
```

### 6.2 Preview Deployments

```bash
# Pro testování před mergem do main:

1. Vytvoř branch:
git checkout -b feature/nova-funkce

2. Commit a push:
git add .
git commit -m "Add new feature"
git push origin feature/nova-funkce

3. Netlify vytvoří preview URL:
https://deploy-preview-123--tvuj-site.netlify.app

4. Po ověření mergni do main
```

---

## Možné problémy a řešení

### ❌ Problém 1: Build selhává

**Chyba:** `Error: Cannot find module '@prisma/client'`

**Řešení:**
```bash
# V package.json přidej postbuild script:
"scripts": {
  "postbuild": "npx prisma generate"
}

# Nebo v netlify.toml:
[build]
  command = "npx prisma generate && npm run build"
```

### ❌ Problém 2: Database connection timeout

**Chyba:** `Error: Can't reach database server`

**Řešení:**
```bash
# 1. Zkontroluj DATABASE_URL v Netlify env variables
# 2. Ověř, že Supabase projekt běží
# 3. Zkontroluj, že connection string obsahuje správné heslo
# 4. V Supabase: Project Settings → Database → Connection pooling
#    Použij "Connection pooling" string místo direct connection
```

### ❌ Problém 3: API routes nefungují

**Chyba:** `404 Not Found` na `/api/*`

**Řešení:**
```bash
# V netlify.toml přidej:
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/server/:splat"
  status = 200
  force = true

# Nebo zkus Netlify Edge Functions:
# (vyžaduje další konfiguraci)
```

### ❌ Problém 4: OpenAI API nefunguje

**Chyba:** `Error: OpenAI API key not configured`

**Řešení:**
```bash
# 1. Ověř OPENAI_API_KEY v Netlify env variables
# 2. Redeploy site (Deploys → Trigger deploy)
# 3. Zkontroluj API klíč na https://platform.openai.com/api-keys
```

### ❌ Problém 5: Slow cold starts

**Problém:** První požadavek trvá dlouho (15-30s)

**Řešení:**
```bash
# Toto je limitace Netlify Functions
# Možnosti:
1. Použij Netlify Edge Functions (rychlejší)
2. Implementuj keep-alive ping
3. Nebo přejdi na Vercel (má lepší cold start performance)
```

---

## Optimalizace pro Netlify

### 1. Použití Netlify Edge Functions

Pro rychlejší response times:

```bash
# Instalace Netlify adapter
npm install @netlify/next

# V next.config.js:
module.exports = {
  experimental: {
    runtime: 'edge', // Pro edge runtime
  }
}
```

### 2. Caching strategie

```toml
# V netlify.toml:
[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 3. Connection pooling

```bash
# V Supabase použij pooler:
# Settings → Database → Connection pooling

# Změň DATABASE_URL na:
postgresql://postgres.xxxxx:[PASSWORD]@xxxxx-pooler.supabase.co:6543/postgres
```

---

## Monitoring

### Netlify Analytics

```bash
# Aktivace:
1. Site settings → Analytics
2. Enable analytics
3. Zobrazí se: Pageviews, Unique visitors, Top pages
```

### Netlify Functions Logs

```bash
# Real-time logs:
netlify dev --live

# Production logs:
1. Functions tab v dashboardu
2. Klikni na funkci
3. Zobraz logs
```

---

## Náklady

### Free tier limity:

- ✅ 300 build minut/měsíc
- ✅ 100 GB bandwidth/měsíc
- ✅ Neomezené sites
- ✅ Automatické SSL certifikáty
- ⚠️ Function execution time: 10s limit
- ⚠️ Background functions: Ne v free tier

### Pokud překročíš limity:

```bash
# Pro více build minut:
Pro tier: $19/měsíc
- 1000 build minut
- 400 GB bandwidth
- Delší function execution
```

---

## Alternativy k Netlify

Pokud narazíš na problémy:

### 1. Vercel (doporučeno) ⭐
```bash
# Výhody:
✓ Nativní Next.js podpora
✓ Rychlejší cold starts
✓ Lepší developer experience
✓ Integrovaná PostgreSQL

# Deploy:
npm i -g vercel
vercel
```

### 2. Railway
```bash
# Výhody:
✓ Obsahuje PostgreSQL
✓ Jednoduchý deployment
✓ Dobrá podpora pro Next.js

# Deploy:
# Připoj GitHub repo v Railway dashboardu
```

### 3. Render
```bash
# Výhody:
✓ Obsahuje PostgreSQL
✓ Dobrý free tier
✓ Persistent storage

# Deploy:
# Vytvoř Web Service a připoj GitHub
```

---

## Checklist před produkcí

- [ ] DATABASE_URL je nastavena
- [ ] OPENAI_API_KEY je nastavena
- [ ] NEXTAUTH_SECRET je vygenerovaný
- [ ] Database migrace jsou aplikovány
- [ ] Seed data jsou v databázi (volitelné)
- [ ] SSL certifikát je aktivní (automatické)
- [ ] Custom domain je nastaven (volitelné)
- [ ] Analytics jsou zapnuté
- [ ] Error monitoring (Sentry) je nastavený (volitelné)
- [ ] Backup strategie pro databázi

---

## Užitečné příkazy

```bash
# Lokální testování s Netlify CLI
netlify dev

# Build lokálně
netlify build

# Deploy z CLI
netlify deploy --prod

# Zobrazit env variables
netlify env:list

# Přidat env variable
netlify env:set KEY value

# Zobrazit logy
netlify functions:log

# Open Netlify dashboard
netlify open
```

---

## Další zdroje

📚 **Oficiální dokumentace:**
- Netlify Next.js: https://docs.netlify.com/integrations/frameworks/next-js/
- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs

🎥 **Video tutoriály:**
- Netlify deployment: https://www.youtube.com/netlify
- Next.js on Netlify: https://www.youtube.com/results?search_query=nextjs+netlify

💬 **Podpora:**
- Netlify forums: https://answers.netlify.com
- Discord: https://netlify.com/discord

---

## Shrnutí

**Celkový čas deploymentu: 15-30 minut**

1. ⏱️ Setup Supabase (5 min)
2. ⏱️ Push do GitHubu (5 min)
3. ⏱️ Konfigurace Netlify (10 min)
4. ⏱️ První deploy (5 min)
5. ⏱️ Testování (5 min)

**Celkem: ~30 minut do produkce** 🚀

---

Máš nějaké dotazy nebo narazil jsi na problém? Napiš mi konkrétní chybovou hlášku a pomůžu ti ji vyřešit!
