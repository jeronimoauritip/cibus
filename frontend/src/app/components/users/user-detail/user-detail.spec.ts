import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserDetail } from './user-detail';
import { UserService } from '../user.service';
import { User } from '../user.model';

describe('UserDetail', () => {
  let component: UserDetail;
  let fixture: ComponentFixture<UserDetail>;
  let mockUserService: any;
  let router: Router;

  const mockUser: User = {
    id: 10,
    dni: 30111222,
    firstName: 'Lucia',
    lastName: 'Gomez',
    phoneNumber: '1122334455',
    email: 'lucia@cibus.com',
    branchId: 1,
    branchName: 'Centro',
    role: 'WAITER',
  };

  beforeEach(async () => {
    mockUserService = {
      getById: vi.fn(() => of(mockUser)),
      getRoles: vi.fn(() => of(['ADMIN', 'MANAGER', 'HOST', 'WAITER', 'KITCHEN'])),
      update: vi.fn((_id: number, dto: any) =>
        of({
          ...mockUser,
          ...dto,
        })
      ),
      changeRole: vi.fn((_id: number, req: { roleName: string }) =>
        of({
          ...mockUser,
          role: req.roleName,
        })
      ),
      resetPin: vi.fn(() => of(mockUser)),
      delete: vi.fn(() => of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [UserDetail],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(UserDetail);
    fixture.componentRef.setInput('id', '10');
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create and load employee details', () => {
    expect(component).toBeTruthy();
    expect(component.user()?.firstName).toBe('Lucia');
    expect(component.roles().includes('ADMIN')).toBe(false);
  });

  it('should open edit modal, validate DNI and update employee', () => {
    component.openEditModal();
    expect(component.isEditModalOpen()).toBe(true);

    // Invalid DNI (fewer than 7 digits)
    component.userModel.update((m) => ({ ...m, dni: 12345 }));
    expect(component.isFormValid()).toBe(false);

    // Valid 8-digit DNI
    component.userModel.update((m) => ({ ...m, dni: 35666777, firstName: 'Lucia Maria' }));
    expect(component.isFormValid()).toBe(true);

    component.onSubmit();
    expect(mockUserService.update).toHaveBeenCalledWith(10, {
      dni: 35666777,
      firstName: 'Lucia Maria',
      lastName: 'Gomez',
      phoneNumber: '1122334455',
      email: 'lucia@cibus.com',
      branchId: 1,
    });
    expect(component.isEditModalOpen()).toBe(false);
    expect(component.user()?.firstName).toBe('Lucia Maria');
  });

  it('should open delete confirmation modal and delete employee on confirm', () => {
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.openDeleteModal();
    expect(component.isDeleteModalOpen()).toBe(true);

    component.confirmDelete();
    expect(mockUserService.delete).toHaveBeenCalledWith(10);
    expect(component.isDeleteModalOpen()).toBe(false);
    expect(navSpy).toHaveBeenCalledWith(['/users']);
  });
});
