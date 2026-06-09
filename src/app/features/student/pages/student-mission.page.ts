import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupTask } from '../../../models/academy.models';
import { AcademyDataService } from '../../../services/academy-data.service';
import { AuthService } from '../../../services/auth.service';
import { GuideService } from '../../../shared/guide/services/guide.service';
import { ClinicalMissionComponent } from '../mission/clinical-mission.component';

@Component({
  selector: 'app-student-mission-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ClinicalMissionComponent],
  template: `
    @if (task; as activeTask) {
      <app-clinical-mission
        [task]="activeTask"
        [groupName]="groupName"
        (exitMission)="exitMission()"
      />
    }
  `,
})
export class StudentMissionPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly data = inject(AcademyDataService);
  private readonly auth = inject(AuthService);
  private readonly guide = inject(GuideService);

  task?: GroupTask;
  groupId = '';
  groupName = 'Mision';

  ngOnInit(): void {
    if (!this.auth.ensureAuthenticatedOrRedirect()) {
      return;
    }

    this.groupId = this.route.snapshot.paramMap.get('groupId') ?? '';
    const taskId = this.route.snapshot.paramMap.get('taskId') ?? '';
    const user = this.auth.currentUser();
    const group = user ? this.data.groupsForStudent(user.id).find((item) => item.id === this.groupId) : undefined;
    this.task = group ? this.data.tasksForStudentInGroup(user!.id, group.id).find((item) => item.id === taskId) : undefined;
    this.groupName = group?.name ?? 'Mision';

    if (!this.task) {
      void this.router.navigate(['/student'], { queryParams: this.groupId ? { groupId: this.groupId } : undefined });
      return;
    }

    this.guide.setVisible(true);
    this.guide.setContext('student_task');
  }

  exitMission(): void {
    void this.router.navigate(['/student'], { queryParams: { groupId: this.groupId } });
  }
}
