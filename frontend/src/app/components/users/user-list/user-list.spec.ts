import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserList } from './user-list';
import { UserService } from '../user.service';
import { Page, User } from '../user.model';
import { BranchService } from '../../branches/service/branch-service';
import { AuthService } from '../../../Auth/services/auth-service';

describe('UserList', () => {
  let component: UserList;
  let fixture: ComponentFixture<UserList>;
  let mockUserService: any;
  let mockBranchService: any;
  let mockAuthService: any;
  let router: Router;

  const mockPage: Page<User> = {
    content: [
      {
        id: 1,
        dni: 123,
        firstName: 'Lucia',
        lastName: 'Gomez',
        phoneNumber: '123',
        email: 'lucia@test.com',
        branchId: 1,
        branchName: 'Centro',
        role: 'WAITER',
      },
      {
        id: 2,
        dni: 456,
        firstName: 'Admin',
        lastName: 'Master',
        phoneNumber: '456',
        email: 'admin@test.com',
        branchId: 1,
        branchName: 'Centro',
        role: 'ADMIN',
      },
      {
        id: 3,
        dni: 789,
        firstName: 'Carlos',
        lastName: 'Perez',
        phoneNumber: '789',
        email: 'carlos@test.com',
        branchId: 0,
        branchName: '',
        role: 'MANAGER',
      },
      {
        id: 4,
        dni: 999,
        firstName: 'Second',
        lastName: 'Admin',
        phoneNumber: '999',
        email: 'admin2@test.com',
        branchId: 1,
        branchName: 'Centro',
        role: 'ADMIN',
      },
    ],
    totalElements: 4,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: false,
  };

  beforeEach(async () => {
    mockUserService = {
      getAll: vi.fn(() => of(mockPage)),
      update: vi.fn((_id: number, dto: any) =>
        of({
          ...mockPage.content[2],
          branchId: dto.branchId,
          branchName: 'Sucursal Norte',
        })
      ),
    };

    mockBranchService = {
      findAll: vi.fn(() =>
        of([
          { id: 1, name: 'Centro', street: 'San Martin', number: 123 },
          { id: 2, name: 'Norte', street: 'Belgrano', number: 456 },
        ])
      ),
    };

    mockAuthService = {
      user: signal({ email: 'admin@test.com', role: { role: 'Admin' } }),
    };

    await TestBed.configureTestingModule({
      imports: [UserList],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: UserService, useValue: mockUserService },
        { provide: BranchService, useValue: mockBranchService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(UserList);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show ADMIN users and exclude only the currently logged-in user', () => {
    const content = component.usersPage()?.content || [];
    expect(content.length).toBe(3);
    expect(content.some((u) => u.email === 'admin@test.com')).toBe(false);
    expect(content.some((u) => u.email === 'admin2@test.com' && u.role === 'ADMIN')).toBe(true);
  });

  it('should filter only inactive employees when inactive filter is applied', () => {
    component.applyFilter('inactive');
    const content = component.usersPage()?.content || [];
    expect(content.length).toBe(1);
    expect(content[0].firstName).toBe('Carlos');
    expect(component.isInactive(content[0])).toBe(true);
  });

  it('should open reactivation modal instead of navigating when clicking an inactive employee', () => {
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const inactiveEmployee = mockPage.content[2];

    component.onSelectEmployee(inactiveEmployee);
    expect(navSpy).not.toHaveBeenCalled();
    expect(component.isReactivateModalOpen()).toBe(true);
    expect(component.reactivationStep()).toBe('confirm');

    // Step 2: user confirms and selects a branch
    component.proceedToBranchSelection();
    expect(component.reactivationStep()).toBe('branch');
    expect(mockBranchService.findAll).toHaveBeenCalled();
    expect(component.branches().length).toBe(2);

    component.selectBranch(2);
    component.confirmReactivation();
    expect(mockUserService.update).toHaveBeenCalledWith(3, { branchId: 2 });
    expect(component.isReactivateModalOpen()).toBe(false);
  });
});
