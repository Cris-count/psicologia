import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { AcademyDataService } from '../../../services/academy-data.service';
import { TEACHER_PROFILE_PORTRAIT } from '../data/teacher-avatar.catalog';

@Injectable({ providedIn: 'root' })
export class TeacherProfileService {
  private readonly auth = inject(AuthService);
  private readonly data = inject(AcademyDataService);

  readonly profile = computed(() => {
    const user = this.auth.currentUser();
    return user ? this.data.teacherProfileFor(user.id) : undefined;
  });

  readonly needsProfileSetup = computed(() => {
    const user = this.auth.currentUser();
    if (!user || user.role !== 'TEACHER') return false;
    return !this.data.teacherProfileFor(user.id)?.avatarConfigured;
  });

  /** @deprecated Usar needsProfileSetup */
  readonly needsAvatarSetup = this.needsProfileSetup;

  readonly portraitUrl = computed(() => TEACHER_PROFILE_PORTRAIT);

  readonly characterName = computed(() => {
    const p = this.profile();
    const user = this.auth.currentUser();
    return p?.characterName?.trim() || user?.name || 'Profesor/a';
  });

  saveProfile(characterName: string): boolean {
    const user = this.auth.currentUser();
    if (!user) return false;
    const name = characterName.trim();
    if (name.length < 2) return false;
    return this.data.updateTeacherGameProfile(user.id, {
      characterName: name,
      avatarConfigured: true,
    });
  }

  /** @deprecated Usar saveProfile */
  saveAvatar(_avatarId: unknown, characterName: string): boolean {
    return this.saveProfile(characterName);
  }
}
