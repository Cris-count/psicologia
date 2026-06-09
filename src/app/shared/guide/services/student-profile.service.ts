import { Injectable, computed, inject } from '@angular/core';
import { AvatarId } from '../../../models/academy.models';
import { AuthService } from '../../../services/auth.service';
import { AcademyDataService } from '../../../services/academy-data.service';
import { avatarById, DEFAULT_AVATAR_ID } from '../data/avatar.catalog';

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

  readonly characterName = computed(() => {
    const p = this.profile();
    const user = this.auth.currentUser();
    return p?.characterName?.trim() || user?.name || 'Explorador';
  });

  readonly avatar = computed(() => avatarById(this.profile()?.avatarId));

  readonly avatarId = computed(() => this.profile()?.avatarId ?? DEFAULT_AVATAR_ID);

  isNicknameAvailable(nickname: string, excludeUserId?: string): boolean {
    return this.data.isNicknameAvailable(nickname, excludeUserId);
  }

  saveProfile(nickname: string, avatarId: AvatarId, characterName?: string): boolean {
    const user = this.auth.currentUser();
    if (!user) return false;
    const name = characterName?.trim();
    if (!name || name.length < 2) return false;
    return this.data.updateStudentGameProfile(user.id, {
      nickname: nickname.trim(),
      characterName: name,
      avatarId,
      onboardingCompleted: true,
    });
  }

  saveCustomization(avatarId: AvatarId, characterName?: string): boolean {
    const user = this.auth.currentUser();
    if (!user) return false;
    const patch: { avatarId: AvatarId; characterName?: string } = { avatarId };
    const name = characterName?.trim();
    if (name && name.length >= 2) patch.characterName = name;
    return this.data.updateStudentGameProfile(user.id, patch);
  }

  updateNickname(nickname: string): boolean {
    const user = this.auth.currentUser();
    if (!user || !this.isNicknameAvailable(nickname, user.id)) return false;
    return this.data.updateStudentGameProfile(user.id, { nickname: nickname.trim() });
  }
}
