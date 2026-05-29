import { Injectable, inject } from '@angular/core';
import { User } from '../../../models/academy.models';
import { AcademyDataService } from '../../../services/academy-data.service';
import { AdminUserRow, CreateStudentDto, CreateTeacherDto } from '../data/admin-api.contracts';

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly data = inject(AcademyDataService);

  listUsers(): AdminUserRow[] {
    return this.data.users
      .filter((user) => user.role !== 'SUPERADMIN')
      .map((user) => {
        const teacher = this.data.teacherProfileFor(user.id);
        const student = this.data.store().studentProfiles.find((profile) => profile.userId === user.id);
        return {
          user,
          role: user.role,
          status: user.status,
          canCreateCases: teacher?.canCreateCases,
          institution: teacher?.institution,
          area: teacher?.area,
          studentCode: student?.code,
        };
      })
      .sort((a, b) => b.user.createdAt.localeCompare(a.user.createdAt));
  }

  createTeacher(dto: CreateTeacherDto): User {
    return this.data.createTeacher(
      dto.name,
      dto.email,
      dto.password,
      dto.institution,
      dto.area,
      dto.canCreateCases,
    );
  }

  createStudent(dto: CreateStudentDto): User {
    return this.data.createStudent(dto.name, dto.email, dto.password, dto.code);
  }

  setStatus(userId: string, status: 'ACTIVE' | 'INACTIVE'): void {
    this.data.setUserStatus(userId, status);
  }

  setCanCreateCases(userId: string, enabled: boolean): void {
    this.data.setTeacherCanCreateCases(userId, enabled);
  }
}
