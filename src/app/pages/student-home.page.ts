import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameGroup, Question, Scenario, Situation, User } from '../models/academy.models';
import { AcademyDataService } from '../services/academy-data.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-student-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="student-shell">
      <header class="student-header">
        <div>
          <p class="eyebrow">Estudiante</p>
          <h1>Mis grupos</h1>
          <p>Accede a situaciones publicadas, responde preguntas y revisa tu avance.</p>
        </div>
        <button class="ghost-button" type="button" (click)="auth.logout()">Cerrar sesion</button>
      </header>

      <section class="student-grid">
        <aside class="panel">
          <h2>Grupos</h2>
          <div class="card-list">
            @for (group of groups(); track group.id) {
              <button class="classroom-card" type="button" (click)="selectGroup(group.id)">
                <strong>{{ group.name }}</strong>
                <span>{{ group.description }}</span>
                <small>{{ situationsForGroup(group.id).length }} situaciones publicadas</small>
              </button>
            } @empty {
              <p class="muted">Aun no perteneces a ningun grupo.</p>
            }
          </div>
        </aside>

        <main class="learning-area">
          <section class="panel">
            <h2>Situaciones asignadas</h2>
            <div class="situation-strip">
              @for (situation of situations(); track situation.id) {
                <button class="situation-card" type="button" (click)="selectedSituationId = situation.id">
                  <strong>{{ situation.title }}</strong>
                  <span>{{ situation.description }}</span>
                  <meter min="0" max="100" [value]="progress(situation.id).progressPercentage"></meter>
                  <small>Avance {{ progress(situation.id).progressPercentage }}%</small>
                </button>
              } @empty {
                <p class="muted">Selecciona un grupo con situaciones publicadas.</p>
              }
            </div>
          </section>

          @if (selectedSituation(); as situation) {
            <section class="panel scenario-reader">
              <div class="reader-intro">
                <p class="eyebrow">{{ situation.difficulty }}</p>
                <h2>{{ situation.title }}</h2>
                <p>{{ situation.context }}</p>
                <strong>Objetivo: {{ situation.learningObjective }}</strong>
              </div>

              @for (scenario of scenarios(situation.id); track scenario.id) {
                <article class="scenario-block">
                  <h3>{{ scenario.orderIndex }}. {{ scenario.title }}</h3>
                  <p>{{ scenario.context }}</p>
                  <small>{{ scenario.instructions }}</small>

                  @for (question of questions(scenario); track question.id) {
                    <div class="question-card">
                      <p class="question-category">{{ question.category }}</p>
                      <h4>{{ question.statement }}</h4>
                      <div class="answer-grid">
                        @for (option of data.optionsForQuestion(question.id); track option.id) {
                          <button
                            type="button"
                            class="answer-button"
                            [class.selected]="answer(question.id)?.selectedOptionId === option.id"
                            [class.correct]="answer(question.id)?.selectedOptionId === option.id && answer(question.id)?.isCorrect"
                            [class.incorrect]="answer(question.id)?.selectedOptionId === option.id && answer(question.id)?.isCorrect === false"
                            (click)="answerQuestion(question.id, option.id)"
                          >
                            {{ option.text }}
                          </button>
                        }
                      </div>
                      @if (answer(question.id)) {
                        <div class="feedback-box">
                          <strong>{{ answer(question.id)?.isCorrect ? 'Respuesta adecuada' : 'Respuesta por revisar' }}</strong>
                          <span>{{ question.feedback }}</span>
                        </div>
                      }
                    </div>
                  }
                </article>
              }
            </section>
          }
        </main>
      </section>
    </div>
  `,
})
export class StudentHomePage {
  selectedGroupId = '';
  selectedSituationId = '';

  constructor(
    public readonly data: AcademyDataService,
    public readonly auth: AuthService,
  ) {
    this.selectedGroupId = this.groups()[0]?.id ?? '';
    this.selectedSituationId = this.situations()[0]?.id ?? '';
  }

  student(): User | null {
    return this.auth.currentUser();
  }

  groups(): GameGroup[] {
    const student = this.student();
    return student ? this.data.groupsForStudent(student.id) : [];
  }

  selectGroup(groupId: string): void {
    this.selectedGroupId = groupId;
    this.selectedSituationId = this.situations()[0]?.id ?? '';
  }

  situationsForGroup(groupId: string): Situation[] {
    return this.data.situationsForGroup(groupId);
  }

  situations(): Situation[] {
    return this.selectedGroupId ? this.data.situationsForGroup(this.selectedGroupId) : [];
  }

  selectedSituation(): Situation | undefined {
    return this.situations().find((situation) => situation.id === this.selectedSituationId) ?? this.situations()[0];
  }

  scenarios(situationId: string): Scenario[] {
    return this.data.scenariosForSituation(situationId);
  }

  questions(scenario: Scenario): Question[] {
    return this.data.questionsForScenario(scenario.id);
  }

  answer(questionId: string) {
    const student = this.student();
    return student ? this.data.answerForQuestion(student.id, questionId) : undefined;
  }

  answerQuestion(questionId: string, optionId: string): void {
    const student = this.student();
    if (student) {
      this.data.answerQuestion(student.id, questionId, optionId);
    }
  }

  progress(situationId: string) {
    const student = this.student();
    return student
      ? this.data.progressFor(student.id, situationId)
      : { progressPercentage: 0, completed: false, id: '', studentId: '', situationId, updatedAt: '' };
  }
}
