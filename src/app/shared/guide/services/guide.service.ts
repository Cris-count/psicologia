import { Injectable, computed, inject, signal } from '@angular/core';
import { Question, Scenario } from '../../../models/academy.models';
import {
  GUIDE_MESSAGES,
  GuideContext,
  GuideMood,
  hintsForQuestion,
  hintsForSituation,
} from '../data/guide.catalog';

@Injectable({ providedIn: 'root' })
export class GuideService {
  private readonly visibleState = signal(true);
  private readonly contextState = signal<GuideContext>('login_welcome');
  private readonly moodState = signal<GuideMood>('idle');
  private readonly customMessage = signal<string | null>(null);
  private readonly hintIndex = signal(0);
  private readonly activeQuestion = signal<Question | null>(null);
  private readonly activeScenario = signal<Scenario | null>(null);

  readonly visible = this.visibleState.asReadonly();
  readonly context = this.contextState.asReadonly();
  readonly mood = this.moodState.asReadonly();

  readonly message = computed(() => {
    const custom = this.customMessage();
    if (custom) return custom;
    return GUIDE_MESSAGES[this.contextState()].text;
  });

  readonly displayMood = computed(() => {
    if (this.customMessage()) return this.moodState();
    return GUIDE_MESSAGES[this.contextState()].mood ?? this.moodState();
  });

  setContext(context: GuideContext, message?: string): void {
    this.contextState.set(context);
    this.customMessage.set(message ?? null);
    this.hintIndex.set(0);
    if (!message) {
      this.moodState.set(GUIDE_MESSAGES[context].mood ?? 'idle');
    }
  }

  show(message: string, mood: GuideMood = 'idle'): void {
    this.customMessage.set(message);
    this.moodState.set(mood);
  }

  setVisible(visible: boolean): void {
    this.visibleState.set(visible);
  }

  toggle(): void {
    this.visibleState.update((v) => !v);
  }

  setQuestionContext(question: Question, scenario?: Scenario): void {
    this.activeQuestion.set(question);
    this.activeScenario.set(scenario ?? null);
    this.setContext('student_question');
  }

  requestHint(): string {
    const question = this.activeQuestion();
    if (question) {
      const hints = hintsForQuestion(question, this.activeScenario() ?? undefined);
      const idx = this.hintIndex() % hints.length;
      this.hintIndex.set(idx + 1);
      const hint = hints[idx];
      this.show(hint, 'thinking');
      this.contextState.set('student_hint');
      return hint;
    }
    const fallback = 'Tómate un momento para releer el enunciado y el contexto del caso.';
    this.show(fallback, 'encourage');
    return fallback;
  }

  situationHint(context: string): string {
    const hint = hintsForSituation(context);
    this.show(hint, 'thinking');
    return hint;
  }

  reset(): void {
    this.customMessage.set(null);
    this.hintIndex.set(0);
    this.activeQuestion.set(null);
    this.activeScenario.set(null);
  }
}
