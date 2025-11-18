# Architektura aplikace

## Přehled

Aplikace "Stát se nenahraditelným v době AI" je full-stack Next.js aplikace s PostgreSQL databází a integrovaným AI koučem postaveným na OpenAI GPT-4.

## Technologický stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS
- **Language:** TypeScript

### Backend
- **API:** Next.js API Routes (Edge Runtime compatible)
- **ORM:** Prisma
- **Database:** PostgreSQL
- **AI:** OpenAI GPT-4 API

### Deployment
- **Primary:** Vercel (doporučeno)
- **Alternatives:** Railway, Netlify, Docker

---

## Architektonické principy

### 1. Server-Side First
- Využití React Server Components kde je to možné
- API routes pro všechny datové operace
- Minimalizace client-side JavaScript

### 2. Type Safety
- TypeScript napříč celým projektem
- Prisma generuje typy z databázového schématu
- Sdílené typy mezi frontend a backend (`lib/api/types.ts`)

### 3. Separation of Concerns
```
app/          → Stránky a API routes (Next.js App Router)
components/   → Reusable React komponenty
lib/          → Business logika, utility funkce
prisma/       → Database schema a migrace
```

### 4. AI Coach jako Modul
AI kouč je izolovaný modul s jasným rozhraním:
- `lib/ai-coach/coach.ts` obsahuje veškerou logiku
- API route pouze volá metody z modulu
- Snadné testování a rozšíření

---

## Datový tok

### 1. User Request Flow
```
User → Next.js Page Component
     → API Route (/app/api/*)
     → Prisma Client
     → PostgreSQL Database
     → Response back to User
```

### 2. AI Coach Flow
```
User → Coach Page
     → POST /api/coach/chat
     → AICoach.chat()
     → OpenAI API
     → Save to CoachSession
     → Response with reply + suggested actions
```

### 3. Daily Tracker Flow
```
User fills form → POST /api/daily-tracker
              → Save DailyTrackerEntry
              → Update Streaks
              → Award Badges (if conditions met)
              → Redirect to Dashboard
```

---

## Databázové schéma

### Hlavní entity a jejich vztahy

```
User (1) ──→ (1) CoursePhase1State
     (1) ──→ (*) WeeklyPlan
     (1) ──→ (*) DailyTrackerEntry
     (1) ──→ (*) ProcrastinationPattern
     (1) ──→ (1) OperatingSystemV1
     (1) ──→ (*) UserBadge ──→ (*) Badge
     (1) ──→ (*) Streak
     (1) ──→ (*) CoachSession
```

### Klíčové vlastnosti:

**User** - Centrální entita
- Cascade delete na všechny související záznamy
- aiMode určuje chování AI kouče

**DailyTrackerEntry**
- Unique constraint: (userId, date)
- Různá pole podle týdne (1-4)
- JSON rawData pro budoucí rozšíření

**CoachSession**
- Ukládá celou konverzaci (messages array)
- interactionType určuje kontext
- summary pro rychlý přehled

---

## API Design

### RESTful Endpoints

Všechny API routes následují konzistentní pattern:

```typescript
GET    /api/resource       → Získat data
POST   /api/resource       → Vytvořit/aktualizovat
DELETE /api/resource?id=X  → Smazat
```

### Response Format

```typescript
{
  success: boolean,
  data?: T,
  error?: string,
  message?: string
}
```

### Authentication

Připraveno pro NextAuth.js:
- Header `x-user-id` pro development
- Production: JWT token z NextAuth

---

## AI Kouč Architecture

### System Prompt Structure

```
Base Prompt
  ├── Základní principy
  ├── Informace o klientovi
  └── Specifické instrukce podle režimu
        ├── Onboarding
        ├── Weekly Planning
        ├── Procrastination
        ├── Reflection
        └── Ad Hoc
```

### Context Management

```typescript
interface CoachContext {
  userId: string;
  currentWeek: number;
  interactionType: string;
  user: UserInfo;
  weeklyPlan?: WeeklyPlan;
  dailyEntries?: DailyTrackerEntry[];
  patterns?: ProcrastinationPattern[];
}
```

### Conversation History

- Ukládá se do `CoachSession`
- Načítá se při každém chatu
- Omezeno na posledních 5 sessions (performance)

---

## State Management

### Server State
- Prisma Client pro všechny DB operace
- No client-side caching (vždy fresh data)
- API routes jako single source of truth

### Client State
- React hooks (useState, useEffect)
- No global state management (není potřeba)
- Forms: controlled components

---

## Gamifikace System

### Badge Award Logic

```typescript
// Příklad: Po vytvoření WeeklyPlan
if (!existingBadge) {
  await prisma.userBadge.create({
    data: {
      userId,
      badgeCode: 'FIRST_WEEKLY_PLAN',
    },
  });
}
```

### Streak Calculation

```typescript
// Logika pro continuous streak
if (lastDate === yesterday) {
  currentStreak += 1;
} else if (lastDate < yesterday) {
  currentStreak = 1; // Reset
}
```

### Weekly Score

```typescript
score = (days_tracked * 5) 
      + (meaningful_steps >= 4 ? 20 : 0)
max_score = 100
```

---

## Security Considerations

### Current Implementation
- Environment variables pro secrets
- Input validation na API routes
- Prisma prepared statements (SQL injection protection)

### Planned Improvements
- [ ] Rate limiting na API endpoints
- [ ] CSRF protection
- [ ] Input sanitization
- [ ] Role-based access control
- [ ] Email verification
- [ ] 2FA support

---

## Performance Optimizations

### Database
1. **Indexy:**
   - `User.email` (unique)
   - `DailyTrackerEntry(userId, date)` (compound unique)
   - `WeeklyPlan(userId, weekNumber)` (compound unique)

2. **Queries:**
   - Select only needed fields
   - Use `include` strategically
   - Implement pagination for lists

### Frontend
1. **Next.js Features:**
   - Server Components pro statický obsah
   - Dynamic imports pro heavy components
   - Image optimization (Next.js Image component)

2. **Caching:**
   - API routes with proper Cache-Control headers
   - Static generation kde je to možné

### AI Coach
1. **Context Management:**
   - Limit conversation history (last 5 sessions)
   - Summarize old conversations

2. **API Optimization:**
   - Batch requests kde je to možné
   - Proper error handling a retry logic

---

## Error Handling

### API Routes
```typescript
try {
  // Business logic
  return NextResponse.json({ success: true, data });
} catch (error) {
  console.error('API error:', error);
  return NextResponse.json(
    { success: false, error: 'Friendly error message' },
    { status: 500 }
  );
}
```

### Frontend
```typescript
try {
  const response = await fetch('/api/...');
  const result = await response.json();
  
  if (!result.success) {
    // Handle error
  }
} catch (error) {
  // Network error
}
```

---

## Testing Strategy

### Unit Tests (Planned)
- [ ] Prisma queries
- [ ] AI Coach logic
- [ ] Utility functions

### Integration Tests (Planned)
- [ ] API endpoints
- [ ] Database operations
- [ ] AI Coach flows

### E2E Tests (Planned)
- [ ] User onboarding flow
- [ ] Weekly planning flow
- [ ] Daily tracker flow
- [ ] Complete 4-week journey

---

## Monitoring & Observability

### Logging
- Console.log for development
- Structured logging for production (planned)
- Error tracking with Sentry (recommended)

### Metrics
- API response times
- Database query performance
- AI Coach response times
- User engagement metrics

### Alerts
- Database connection errors
- OpenAI API failures
- High error rates
- Performance degradation

---

## Scalability Considerations

### Current Limitations
- Single database instance
- No caching layer
- No queue system for async jobs

### Future Improvements
1. **Database:**
   - Read replicas
   - Connection pooling (PgBouncer)
   - Sharding by user region

2. **Caching:**
   - Redis for session data
   - API response caching
   - Static asset CDN

3. **Background Jobs:**
   - Queue system (Bull, BeeQueue)
   - Cron jobs for notifications
   - Async AI processing

4. **AI Coach:**
   - Response streaming
   - Conversation summarization
   - Context compression

---

## Development Workflow

### Local Development
```bash
1. npm install
2. Setup PostgreSQL
3. Copy .env.example → .env
4. npm run db:push
5. npm run db:seed
6. npm run dev
```

### Git Workflow
```
main
  ├── develop
  │    ├── feature/new-feature
  │    └── fix/bug-fix
  └── hotfix/critical-fix
```

### Deployment
```
1. Push to GitHub
2. Vercel auto-deploy
3. Run migrations
4. Verify deployment
```

---

## Future Enhancements

### Phase 2 Features
- [ ] Advanced analytics dashboard
- [ ] Team/company features
- [ ] Social sharing
- [ ] Export functionality (PDF reports)
- [ ] Mobile app (React Native)

### AI Coach Improvements
- [ ] Voice interface
- [ ] Proactive suggestions
- [ ] Multi-language support
- [ ] Personalized learning path
- [ ] Integration with calendar/tasks

### Platform Features
- [ ] Payment integration (Stripe)
- [ ] Subscription management
- [ ] Admin dashboard
- [ ] User management
- [ ] Content management system

---

## Contributing Guidelines

### Code Style
- Use Prettier for formatting
- Follow ESLint rules
- TypeScript strict mode
- Meaningful variable names

### Commit Messages
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

### Pull Request Process
1. Create feature branch
2. Write code + tests
3. Update documentation
4. Submit PR
5. Code review
6. Merge to develop

---

## Kontakt a podpora

Pro technické dotazy nebo podporu:
- Email: [váš email]
- GitHub Issues: [repository URL]
- Documentation: [docs URL]

---

Tento dokument je živý a měl by být aktualizován s každou významnou změnou v architektuře.

Poslední aktualizace: [datum]
