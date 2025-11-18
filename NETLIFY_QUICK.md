# Netlify Deployment - Rychlý přehled

## 🗺️ Celkový proces (30 minut)

```
┌─────────────────────────────────────────────────────────────┐
│  FÁZE 1: Příprava databáze (5 min)                          │
├─────────────────────────────────────────────────────────────┤
│  1. Vytvoř účet na Supabase.com                             │
│  2. Vytvoř nový projekt                                      │
│  3. Zkopíruj DATABASE_URL                                    │
│  4. Lokálně spusť: npx prisma db push                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  FÁZE 2: Git & GitHub (5 min)                               │
├─────────────────────────────────────────────────────────────┤
│  1. git init && git add . && git commit                      │
│  2. Vytvoř repo na GitHub                                    │
│  3. git push origin main                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  FÁZE 3: Netlify konfigurace (10 min)                       │
├─────────────────────────────────────────────────────────────┤
│  1. app.netlify.com → Import from GitHub                    │
│  2. Vyber repository                                         │
│  3. DŮLEŽITÉ: Nastav Environment Variables:                 │
│     • DATABASE_URL (z Supabase)                              │
│     • OPENAI_API_KEY (z OpenAI)                              │
│     • NEXTAUTH_SECRET (vygeneruj)                            │
│  4. Deploy site                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  FÁZE 4: První deploy (5 min)                               │
├─────────────────────────────────────────────────────────────┤
│  • Netlify automaticky builduje                              │
│  • Sleduj progress v real-time                               │
│  • Získáš URL: https://random-name.netlify.app               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  FÁZE 5: Testování (5 min)                                  │
├─────────────────────────────────────────────────────────────┤
│  ✓ Otevři /dashboard                                         │
│  ✓ Test AI kouče                                             │
│  ✓ Test denního trackeru                                     │
│  ✓ Ověř, že data se ukládají                                │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Checklist - Co potřebuješ mít připravené

```
PŘED ZAČÁTKEM:
☐ GitHub účet
☐ Netlify účet (zdarma)
☐ OpenAI API klíč (+ kredit na účtu)
☐ Projekt pushnutý do Git repository

BĚHEM DEPLOYMENTU:
☐ Supabase projekt vytvořený
☐ DATABASE_URL zkopírovaná
☐ Všechny env variables nastavené v Netlify
☐ První deploy dokončený

PO DEPLOYMENTU:
☐ Aplikace funguje na URL
☐ AI kouč odpovídá
☐ Data se ukládají do Supabase
```

## ⚠️ 3 nejčastější chyby

### 1️⃣ Zapomenutí environment variables
```bash
❌ CHYBA: "Cannot connect to database"

✅ ŘEŠENÍ:
Site settings → Environment variables
Přidej: DATABASE_URL, OPENAI_API_KEY, NEXTAUTH_SECRET
Pak: Deploys → Trigger deploy
```

### 2️⃣ Špatný DATABASE_URL formát
```bash
❌ CHYBA: "Connection timeout"

✅ ŘEŠENÍ:
Používej CONNECTION POOLING string z Supabase:
postgresql://postgres.xxx:[PASSWORD]@xxx-pooler.supabase.co:6543/postgres
                                      ^^^^^^^^ pooler, ne direct!
```

### 3️⃣ Prisma Client není vygenerovaný
```bash
❌ CHYBA: "Cannot find module @prisma/client"

✅ ŘEŠENÍ:
V package.json přidej:
"scripts": {
  "postbuild": "npx prisma generate"
}
```

## 🎯 Quick Commands

```bash
# Základní setup
npm install -g netlify-cli
netlify login

# Lokální test s Netlify
netlify dev

# Deploy z příkazové řádky
netlify deploy --prod

# Zobrazit production URL
netlify open:site

# Zobrazit logy
netlify logs

# Přidat env variable
netlify env:set KEY "value"
```

## 🆚 Netlify vs Vercel - Rychlé porovnání

| Feature              | Netlify         | Vercel ⭐       |
|----------------------|-----------------|------------------|
| Next.js App Router   | ⚠️ Omezená      | ✅ Plná podpora  |
| Cold start           | ~5-10s          | ~1-2s            |
| Build time           | Standardní      | Rychlejší        |
| Free tier bandwidth  | 100 GB          | 100 GB           |
| PostgreSQL included  | ❌ Ne           | ✅ Ano (Vercel)  |
| Edge Functions       | ✅ Ano          | ✅ Ano           |
| **Doporučení**       | OK pro MVP      | **Ideální** 🏆   |

## 🔗 Přesný postup - Copy-paste ready

### Krok 1: Supabase setup
```bash
# 1. https://supabase.com → Sign up
# 2. New Project → Vyplň údaje
# 3. Settings → Database → Connection string → URI
# 4. Zkopíruj (bude vypadat takto):
postgresql://postgres.xxxxxx:YOUR_PASSWORD@db.xxxx.supabase.co:5432/postgres
```

### Krok 2: Lokální připojení databáze
```bash
# V .env:
DATABASE_URL="postgresql://postgres.xxxxxx:..."

# Inicializace:
npx prisma db push
npx prisma db seed
```

### Krok 3: GitHub push
```bash
git init
git add .
git commit -m "Initial commit"

# Vytvoř repo na github.com, pak:
git remote add origin https://github.com/username/repo.git
git push -u origin main
```

### Krok 4: Netlify deployment
```bash
# V prohlížeči:
# 1. app.netlify.com → Add new site → Import from GitHub
# 2. Vyber repository
# 3. Site settings → Environment variables → Add:

DATABASE_URL=postgresql://postgres.xxx...
OPENAI_API_KEY=sk-proj-...
NEXTAUTH_SECRET=[generate: openssl rand -base64 32]
NEXTAUTH_URL=https://your-site.netlify.app
NODE_ENV=production

# 4. Trigger deploy
```

### Krok 5: Testování
```bash
# Otevři: https://your-site.netlify.app/dashboard
# Test:
✓ Dashboard se načte
✓ Klikni "Otevřít kouče"
✓ Pošli testovací zprávu
✓ Ověř odpověď od AI
```

## 🚨 Co dělat když něco nefunguje

```bash
# 1. Zkontroluj build logs
Deploys → [latest deploy] → View logs

# 2. Zkontroluj function logs
Functions → [function name] → Logs

# 3. Ověř env variables
Site settings → Environment variables

# 4. Zkus redeploy
Deploys → Trigger deploy → Clear cache and deploy

# 5. Stále nefunguje?
Zkontroluj: NETLIFY_GUIDE.md sekce "Možné problémy"
```

## 💡 Pro tips

```bash
# Custom doména
Site settings → Domain management → Add custom domain

# Automatické preview deploymenty
Každý pull request = preview URL (automaticky)

# Rollback na předchozí verzi
Deploys → [old deploy] → Publish deploy

# Build hooks (trigger deploy z externího zdroje)
Site settings → Build & deploy → Build hooks

# Zabezpečení před botem
Site settings → Forms → Enable spam filtering
```

## 📊 Po úspěšném deploymentu

```
✅ URL: https://your-app.netlify.app
✅ SSL: Automatický HTTPS certifikát
✅ CI/CD: Automatické deploymenty při git push
✅ Monitoring: Netlify Analytics dostupné
✅ Databáze: Supabase s backupy
✅ AI: OpenAI API připojené

🎉 APLIKACE JE LIVE!
```

## 🔄 Workflow pro budoucí změny

```bash
# 1. Lokální vývoj
git checkout -b feature/nova-funkce
# ... udělej změny ...
npm run dev  # testuj lokálně

# 2. Commit a push
git add .
git commit -m "Add new feature"
git push origin feature/nova-funkce

# 3. Preview deployment
Netlify automaticky vytvoří preview URL:
https://deploy-preview-X--your-app.netlify.app

# 4. Test na preview URL

# 5. Merge do main
git checkout main
git merge feature/nova-funkce
git push origin main

# 6. Automatický production deploy
Netlify detekuje push → build → deploy → live!
```

---

## 📞 Potřebuješ pomoc?

**Build selhává?** → Podívej se na build logs v Netlify  
**Databáze nefunguje?** → Zkontroluj DATABASE_URL v Supabase  
**AI kouč neodpovídá?** → Ověř OPENAI_API_KEY a kredit  
**Něco jiného?** → Viz NETLIFY_GUIDE.md pro kompletní troubleshooting  

---

**Celkový čas: 30 minut od nuly po živou aplikaci! 🚀**
