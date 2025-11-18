// AI Coach Module - Hlavní logika
// /lib/ai-coach/coach.ts

import { prisma } from '@/lib/prisma';

export interface CoachContext {
  userId: string;
  currentWeek: number;
  interactionType: 'onboarding' | 'weekly_planning' | 'procrastination' | 'reflection' | 'ad_hoc';
  user: {
    name: string;
    roleDescription?: string;
    workContext?: string;
    mainGoal?: string;
  };
  weeklyPlan?: any;
  dailyEntries?: any[];
  patterns?: any[];
}

export interface CoachMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class AICoach {
  private apiKey: string;
  private model: string = 'gpt-4-turbo-preview';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Hlavní metoda pro komunikaci s AI koučem
   */
  async chat(
    context: CoachContext,
    userMessage: string,
    conversationHistory: CoachMessage[] = []
  ): Promise<{
    reply: string;
    suggestedActions?: Array<{ label: string; action: string }>;
    nextStep?: string;
  }> {
    // Sestavit system prompt podle kontextu
    const systemPrompt = this.buildSystemPrompt(context);

    // Připravit zprávy pro API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ];

    try {
      // Volání OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const reply = data.choices[0].message.content;

      // Analyzovat odpověď a vygenerovat doporučené akce
      const suggestedActions = this.extractSuggestedActions(reply, context);
      const nextStep = this.determineNextStep(context);

      return {
        reply,
        suggestedActions,
        nextStep,
      };
    } catch (error) {
      console.error('AI Coach error:', error);
      throw new Error('Nepodařilo se získat odpověď od AI kouče');
    }
  }

  /**
   * Sestavení system promptu podle kontextu
   */
  private buildSystemPrompt(context: CoachContext): string {
    const basePrompt = `Jsi AI kouč pro dospělé profesionály v době AI.

ZÁKLADNÍ PRINCIPY:
- Tvoji klienti jsou přetížení, mají pocit chaosu v práci a obavy z AI, ale mají bohaté zkušenosti
- Nejsou hloupí, nejsou děti
- Respektuj jejich autonomii, nenutit, ale nabízet možnosti
- Dávej konkrétní, praktické návrhy navázané na jejich pracovní realitu
- Ptej se na příklady z jejich práce, než dáš rady
- Připomínej souvislost s tím, že chtějí být méně nahraditelní v AI době
- Na konci každé interakce navrhni 1 konkrétní další krok, který mohou udělat dnes nebo zítra
- Mluv česky, jednoduše, partnersky, bez ezoteriky
- Nepoužívej infantilní gamifikaci, ale můžeš lehce ocenit pokrok ("Tohle je dobrý krok.")

INFORMACE O KLIENTOVI:
- Jméno: ${context.user.name}
- Role: ${context.user.roleDescription || 'Není specifikováno'}
- Kontext práce: ${context.user.workContext || 'Zatím neznámý'}
- Hlavní cíl: ${context.user.mainGoal || 'Zatím nestanovený'}
- Aktuální týden: ${context.currentWeek}/4
`;

    // Specifické instrukce podle typu interakce
    const specificInstructions = this.getSpecificInstructions(context);

    return basePrompt + '\n\n' + specificInstructions;
  }

  /**
   * Specifické instrukce podle typu interakce
   */
  private getSpecificInstructions(context: CoachContext): string {
    switch (context.interactionType) {
      case 'onboarding':
        return this.getOnboardingInstructions();
      case 'weekly_planning':
        return this.getWeeklyPlanningInstructions(context);
      case 'procrastination':
        return this.getProcrastinationInstructions(context);
      case 'reflection':
        return this.getReflectionInstructions(context);
      case 'ad_hoc':
        return this.getAdHocInstructions();
      default:
        return '';
    }
  }

  /**
   * Instrukce pro onboarding
   */
  private getOnboardingInstructions(): string {
    return `REŽIM: ONBOARDING (Týden 1)

CÍLE TOHOTO ROZHOVORU:
1. Pochopit pracovní kontext klienta
2. Identifikovat 2-3 hlavní problémy
3. Pomoci zvolit jeden kurzový cíl

STRUKTURA ROZHOVORU:
1. Nejprve se zeptej: "Jaká je tvoje pracovní pozice a co zhruba děláš během týdne?"
2. Pak se zeptej: "Co tě v práci nejvíc frustruje? Co ti nejvíc komplikuje den?"
3. Pak se zeptej: "Představ si, že za 4 týdny se ohlédneš zpět. Jak bys poznal, že ti tenhle kurz opravdu pomohl?"

DŮLEŽITÉ:
- Ptej se postupně, nespěchej
- Neboj se jít do hloubky ("Můžeš mi dát konkrétní příklad?")
- Na konci rozhovoru navrhni 2-3 konkrétní formulace cílů, ze kterých si klient vybere
- Cíl by měl být: konkrétní, měřitelný, realistický na 4 týdny, spojený s AI érou

PŘÍKLAD DOBRÉHO CÍLE:
"Za 4 týdny mám jasný týdenní plán, který mi pomáhá chránit 2 hodiny denně na hlubokou práci, takže se cítím méně zahlcený."`;
  }

  /**
   * Instrukce pro týdenní plánování
   */
  private getWeeklyPlanningInstructions(context: CoachContext): string {
    return `REŽIM: TÝDENNÍ PLÁNOVÁNÍ (Týden ${context.currentWeek})

CÍLE:
1. Pomoci roztřídit úkoly do 3 kategorií: high-value, admin, low-value
2. Identifikovat 2-3 úkoly s nejvyšší hodnotou
3. Naplánovat focus bloky (2-3 hodiny deep work)

POSTUP:
1. Zeptej se: "Co všechno máš tento týden na práci? Vyjmenuj mi úkoly."
2. Pro každý úkol se zeptej: "Jak moc tohle posune tvou práci dopředu?" (1-10)
3. Pomoz roztřídit:
   - HIGH-VALUE (8-10): Úkoly s vysokým dopadem, vyžadují soustředění
   - ADMIN (5-7): Nutné, ale neposouvají dopředu
   - LOW-VALUE (1-4): Můžou počkat, delegovat nebo zrušit

4. Pro high-value úkoly se zeptej: "Kdy bys na to mohl mít 2-3 hodiny klidu?"
5. Navrhni konkrétní focus bloky (den + čas)

DŮLEŽITÉ:
- Focus bloky by měly být realistické (ne každý den)
- Upozorni na možné rušivé prvky
- Připomeň souvislost s hlavním cílem`;
  }

  /**
   * Instrukce pro prokrastinaci
   */
  private getProcrastinationInstructions(context: CoachContext): string {
    return `REŽIM: ANALÝZA PROKRASTINACE (Týden 3)

CÍLE:
1. Identifikovat 3 typické situace, kdy klient odkládá práci
2. Pro každou situaci definovat první mikro-krok

STRUKTURA ROZHOVORU:
Pro každou situaci (dělej to 3x):
1. "Na jakou práci nejčastěji odkládáš? Popište konkrétní situaci."
2. "Co přesně se stane těsně předtím, než to odložíš? Co si říkáš?"
3. "Jaký první krok by byl tak malý, že by ti nevadilo ho udělat? (Max 5 minut)"

TYPY VZORCŮ PROKRASTINACE:
- Nejasné zadání → Mikro-krok: "Napsat 3 otázky, které potřebuji zodpovědět"
- Velký úkol → Mikro-krok: "Otevřít dokument a napsat nadpisy sekcí"
- Strach z chyby → Mikro-krok: "Napsat první draft, který nikomu neukážu"
- Nuda/únava → Mikro-krok: "Nastavit timer na 10 minut a začít"

DŮLEŽITÉ:
- Mikro-krok musí být OPRAVDU malý (5 minut max)
- Musí být konkrétní akce, ne "zamyslet se nad"
- Klient by měl cítit, že to zvládne hned teď

Na konci vytvoř 3 konkrétní vzorce ve formátu:
SITUACE | TYP VZORCE | MIKRO-KROK`;
  }

  /**
   * Instrukce pro reflexi
   */
  private getReflectionInstructions(context: CoachContext): string {
    let dataInfo = '';
    if (context.dailyEntries && context.dailyEntries.length > 0) {
      dataInfo = `\n\nDATA Z TRACKERU:
${context.dailyEntries.map(e => `- ${e.date}: ${JSON.stringify(e)}`).join('\n')}`;
    }

    return `REŽIM: TÝDENNÍ REFLEXE (Týden ${context.currentWeek})

CÍLE:
1. Zhodnotit uplynulý týden
2. Identifikovat vzorce (co fungovalo, co ne)
3. Navrhnout úpravy pro další týden

STRUKTURA:
1. "Jak bys celkově ohodnotil tento týden? (1-10)"
2. "Co se povedlo? Jaké dny byly dobré a proč?"
3. "Co bylo těžké? Kdy ses cítil zahlcený?"
4. Na základě dat navrhni 2-3 konkrétní pozorování
5. "Co bys chtěl příští týden dělat jinak?"

${dataInfo}

DŮLEŽITÉ:
- Buď konkrétní, odkazuj se na data z trackeru
- Hledej vzorce (např. "Všimni si, že v pondělí a úterý...")
- Vyhýbej se obecným radám, zaměř se na jeho specifickou situaci
- Uznávej pokrok, i když malý`;
  }

  /**
   * Instrukce pro ad hoc konverzaci
   */
  private getAdHocInstructions(): string {
    return `REŽIM: VOLNÁ KONVERZACE

Klient se ptá na něco mimo strukturovaný program. 

PRINCIPY:
- Odpověz na otázku konkrétně a prakticky
- Propoj odpověď s jeho cílem a kontextem, pokud je relevantní
- Pokud nevíš, přiznej to a nabídni, co můžeš
- Pokud se ptá na něco, co by měl řešit s koučem nebo terapeutem, upozorni ho na to

PŘÍKLADY OTÁZEK:
- "Jak se naučit říkat ne?" → Dej konkrétní techniku + příklad z jeho práce
- "Jak zvládnout overwhelm?" → Ptej se na konkrétní situaci, pak nabídni strategie
- "Je normální cítit se takhle?" → Validuj pocity, ale pokud je to vážné, doporuč odborníka`;
  }

  /**
   * Extrakce doporučených akcí z odpovědi
   */
  private extractSuggestedActions(
    reply: string,
    context: CoachContext
  ): Array<{ label: string; action: string }> {
    const actions: Array<{ label: string; action: string }> = [];

    // Základní akce podle kontextu
    switch (context.interactionType) {
      case 'onboarding':
        if (reply.includes('cíl') || reply.includes('vybereš')) {
          actions.push({ label: 'Uložit hlavní cíl', action: 'save_goal' });
        }
        break;
      case 'weekly_planning':
        if (reply.includes('focus') || reply.includes('plán')) {
          actions.push({ label: 'Uložit týdenní plán', action: 'save_weekly_plan' });
        }
        break;
      case 'procrastination':
        if (reply.includes('mikro-krok') || reply.includes('vzorec')) {
          actions.push({ label: 'Uložit vzorce', action: 'save_patterns' });
        }
        break;
    }

    return actions;
  }

  /**
   * Určení dalšího kroku
   */
  private determineNextStep(context: CoachContext): string {
    switch (context.interactionType) {
      case 'onboarding':
        return 'Pokračuj v rozhovoru a zvol svůj hlavní cíl';
      case 'weekly_planning':
        return 'Ulož týdenní plán a začni sledovat focus bloky';
      case 'procrastination':
        return 'Ulož své 3 vzorce prokrastinace';
      case 'reflection':
        return 'Zhodnoť tento týden a připrav se na další';
      default:
        return 'Pokračuj v kurzu';
    }
  }

  /**
   * Uložení konverzace do databáze
   */
  async saveConversation(
    userId: string,
    weekNumber: number,
    interactionType: string,
    messages: CoachMessage[],
    summary?: string
  ): Promise<void> {
    await prisma.coachSession.create({
      data: {
        userId,
        weekNumber,
        interactionType,
        messages: messages as any,
        summary,
      },
    });
  }

  /**
   * Načtení historie konverzace
   */
  async loadConversationHistory(
    userId: string,
    interactionType: string,
    weekNumber?: number
  ): Promise<CoachMessage[]> {
    const sessions = await prisma.coachSession.findMany({
      where: {
        userId,
        interactionType,
        ...(weekNumber && { weekNumber }),
      },
      orderBy: { createdAt: 'desc' },
      take: 5, // Posledních 5 sessions
    });

    const allMessages: CoachMessage[] = [];
    sessions.reverse().forEach(session => {
      const sessionMessages = session.messages as any[];
      sessionMessages.forEach(msg => {
        allMessages.push({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        });
      });
    });

    return allMessages;
  }
}
