# Deployment Guide

Tento dokument popisuje, jak nasadit aplikaci na různé platformy.

## Obecné kroky před deploymentem

1. **Nastavte environment variables:**
   - `DATABASE_URL` - PostgreSQL connection string
   - `OPENAI_API_KEY` - OpenAI API klíč
   - `NEXTAUTH_URL` - URL vaší aplikace
   - `NEXTAUTH_SECRET` - Náhodný secret (vygenerovat: `openssl rand -base64 32`)

2. **Připravte databázi:**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

3. **Build aplikace:**
   ```bash
   npm run build
   ```

## 1. Vercel (doporučeno)

Vercel je nejjednodušší způsob, jak nasadit Next.js aplikaci.

### Krok po kroku:

1. **Vytvořte účet na [vercel.com](https://vercel.com)**

2. **Připojte GitHub/GitLab repository**
   - Pushněte kód do Git repository
   - V Vercel dashboardu klikněte na "New Project"
   - Importujte váš repository

3. **Nastavte Environment Variables**
   - V project settings → Environment Variables
   - Přidejte všechny proměnné z `.env`
   
4. **Nastavte PostgreSQL databázi**
   
   **Možnost A: Vercel Postgres (nejjednodušší)**
   ```bash
   # V Vercel dashboardu:
   # Storage → Create Database → Postgres
   # Automaticky se nastaví DATABASE_URL
   ```
   
   **Možnost B: Externí PostgreSQL (Supabase, Neon, atd.)**
   ```bash
   # Vytvořte databázi u externího providera
   # Nastavte DATABASE_URL v Vercel environment variables
   ```

5. **Deploy**
   - Vercel automaticky builduje a deployuje
   - URL: `https://your-app.vercel.app`

### Post-deployment:

```bash
# Připojte se k produkční databázi a spusťte migrace
DATABASE_URL="your-production-url" npx prisma migrate deploy
DATABASE_URL="your-production-url" npx prisma db seed
```

---

## 2. Netlify

### Krok po kroku:

1. **Vytvořte účet na [netlify.com](https://netlify.com)**

2. **Nainstalujte Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   ```

3. **Build aplikace**
   ```bash
   npm run build
   ```

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

5. **Nastavte Environment Variables**
   - V Netlify dashboard → Site settings → Environment variables
   - Přidejte všechny proměnné z `.env`

6. **Nastavte PostgreSQL**
   - Použijte externí PostgreSQL (Supabase, Neon, Railway)
   - Nastavte `DATABASE_URL` v environment variables

**Poznámka:** Netlify není optimalizované pro Next.js App Router - doporučujeme Vercel.

---

## 3. Railway

Railway nabízí jednoduché nasazení včetně PostgreSQL.

### Krok po kroku:

1. **Vytvořte účet na [railway.app](https://railway.app)**

2. **Vytvořte nový projekt**
   ```bash
   # Z dashboard:
   # New Project → Deploy from GitHub repo
   ```

3. **Přidejte PostgreSQL**
   ```bash
   # V projektu:
   # New → Database → PostgreSQL
   # Railway automaticky nastaví DATABASE_URL
   ```

4. **Nastavte další Environment Variables**
   - Settings → Variables
   - Přidejte `OPENAI_API_KEY`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`

5. **Deploy**
   - Railway automaticky detekuje Next.js a builduje aplikaci
   - URL: `https://your-app.up.railway.app`

---

## 4. Docker (Self-hosted)

Pro vlastní hosting nebo VPS servery.

### Vytvořte Dockerfile:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/ai_course_db
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=ai_course_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Spuštění:

```bash
# Build a start
docker-compose up -d

# Migrace databáze
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma db seed
```

---

## 5. AWS (Amazon Web Services)

Pro enterprise nasazení.

### Možnosti:

**A. AWS Amplify** (nejjednodušší)
- Podobné jako Vercel
- Automatické CI/CD z Git
- Snadné škálování

**B. ECS (Elastic Container Service)**
- Docker-based deployment
- Plná kontrola nad infrastrukturou
- Vyžaduje více nastavení

**C. EC2 + PM2**
- Tradiční VPS approach
- Máte plnou kontrolu
- Více manuálního nastavení

### Databáze na AWS:
- **RDS PostgreSQL** - managed database
- Automatické backupy
- Vysoká dostupnost

---

## Monitoring a údržba

### Doporučené nástroje:

1. **Error tracking:**
   - [Sentry](https://sentry.io) - error monitoring
   - [LogRocket](https://logrocket.com) - session replay

2. **Performance monitoring:**
   - [Vercel Analytics](https://vercel.com/analytics)
   - [Google Analytics](https://analytics.google.com)

3. **Uptime monitoring:**
   - [UptimeRobot](https://uptimerobot.com)
   - [Pingdom](https://pingdom.com)

4. **Database backups:**
   ```bash
   # Pravidelné backupy PostgreSQL
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
   ```

---

## Troubleshooting

### Časté problémy:

**1. Prisma Client není vygenerovaný**
```bash
npx prisma generate
```

**2. Database migrace selhaly**
```bash
npx prisma migrate reset
npx prisma migrate deploy
```

**3. Environment variables nejsou dostupné**
- Zkontrolujte, že jsou správně nastavené v deployment platformě
- Restartujte aplikaci po změně proměnných

**4. OpenAI API error**
- Zkontrolujte kredit na OpenAI účtu
- Ověřte API klíč
- Zkontrolujte rate limity

---

## Security checklist před produkcí

- [ ] Nastavte silný `NEXTAUTH_SECRET`
- [ ] Používejte HTTPS (SSL certifikát)
- [ ] Omezte CORS pokud není potřeba
- [ ] Nastavte rate limiting pro API
- [ ] Pravidelně aktualizujte dependencies
- [ ] Používejte environment variables pro secrets
- [ ] Nastavte database backupy
- [ ] Implementujte proper error handling
- [ ] Přidejte logging
- [ ] Testujte na staging environmentu před produkcí

---

## Performance optimalizace

1. **Next.js optimalizace:**
   - Používejte Image component pro obrázky
   - Implementujte ISR (Incremental Static Regeneration) kde je to možné
   - Využijte React Server Components

2. **Database optimalizace:**
   - Přidejte indexy na často dotazované sloupce
   - Používejte connection pooling
   - Implementujte caching (Redis)

3. **API optimalizace:**
   - Batch API requesty kde je to možné
   - Implementujte pagination
   - Používejte proper HTTP caching headers

---

Pro více informací o deployment viz oficiální Next.js dokumentace:
https://nextjs.org/docs/deployment
