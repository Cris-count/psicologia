import { Injectable, computed, inject } from '@angular/core';
import { AvatarId } from '../../../models/academy.models';
import { AuthService } from '../../../services/auth.service';
import { AcademyDataService } from '../../../services/academy-data.service';
import { avatarById } from '../data/avatar.catalog';

@Injectable({ providedIn: 'root' })
export class StudentProfileService {
  private readonly auth = inject(AuthService);
  private readonly data = inject(AcademyDataService);

  readonly profile = computed(() => {
    const user = this.auth.currentUser();
    return user ? this.data.studentProfileFor(user.id) : undefined;
  });

  readonly needsOnboarding = computed(() => {
    const user = this.auth.currentUser();
    if (!user || user.role !== 'STUDENT') return false;
    return !this.data.studentProfileFor(user.id)?.onboardingCompleted;
  });

  readonly displayName = computed(() => {
    const p = this.profile();
    const user = this.auth.currentUser();
    return p?.nickname?.trim() || user?.name || 'Explorador';
  });

  readonly avatar = computed(() => avatarById(this.profile()?.avatarId));

  isNicknameAvailable(nickname: string, excludeUserId?: string): boolean {
    return this.data.isNicknameAvailable(nickname, excludeUserId);
  }

  saveProfile(nickname: string, avatarId: AvatarId): boolean {
    const user = this.auth.currentUser();
    if (!user) return false;
    return this.data.updateStudentGameProfile(user.id, {
      nickname: nickname.trim(),
      avatarId,
      onboardingCompleted: true,
    });
  }

  updateAvatar(avatarId: AvatarId): void {
    const user = this.auth.currentUser();
    if (user) this.data.updateStudentGameProfile(user.id, { avatarId });
  }

  updateNickname(nickname: string): boolean {
    const user = this.auth.currentUser();
    if (!user || !this.isNicknameAvailable(nickname, user.id)) return false;
    return this.data.updateStudentGameProfile(user.id, { nickname: nickname.trim() });
  }
}
