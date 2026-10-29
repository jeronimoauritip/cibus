import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BranchEmployeesComponent } from './branch-employees';
import { UserService } from '../../../users/user.service';
import { BranchService } from '../../service/branch-service';
import { Page, User } from '../../../users/user.model';

describe('BranchEmployeesComponent', () => {
  let component: BranchEmployeesComponent;
  let fixture: ComponentFixture<BranchEmployeesComponent>;
  let mockUserService: any;
  let mockBranchService: any;

  const mockUsers: User[] = [
    {
      id: 10,
      dni: 30111222,
      firstName: 'Lucia',
      lastName: 'Gomez',
      phoneNumber: '1122334455',
      email: 'lucia@cibus.com',
      branchId: 1,
      branchName: 'Sucursal Centro',
      role: 'WAITER',
    },
    {
      id: 11,
      dni: 32333444,
      firstName: 'Carlos',
      lastName: 'Perez',
      phoneNumber: '1155667788',
      email: 'carlos@cibus.com',
      branchId: 1,
      branchName: 'Sucursal Centro',
      role: 'HOST',
    },
    {
      id: 1,
      dni: 0,
      firstName: 'Admin',
      lastName: 'Master',
      phoneNumber: '1111111111',
      email: 'admin@cibus.com',
      branchId: 1,
      branchName: 'Sucursal Centro',
      role: 'ADMIN',
    },
  ];

  const mockPage: Page<User> = {
    content: mockUsers,
    totalElements: 3,
    totalPages: 1,
    size: 100,
    number: 0,
    first: true,
    last: true,
    empty: false,
  };

  beforeEach(async () => {
    mockUserService = {
      getAll: vi.fn(() => of(mockPage)),
      getRoles: vi.fn(() => of(['ADMIN', 'MANAGER', 'HOST', 'WAITER', 'KITCHEN'])),
      changeRole: vi.fn((userId: number, req: { roleName: string }) =>
        of({
          ...mockUsers[0],
          id: userId,
          role: req.roleName,
        })
      ),
      delete: vi.fn(() => of(undefined)),
    };

    mockBranchService = {
      findById: vi.fn(() =>
        of({ id: 1, name: 'Sucursal Centro', street: 'San Martín', number: 1234 })
      ),
    };

    await TestBed.configureTestingModule({
      imports: [BranchEmployeesComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: UserService, useValue: mockUserService },
        { provide: BranchService, useValue: mockBranchService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BranchEmployeesComponent);
    fixture.componentRef.setInput('branchId', '1');
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the component and load active non-admin employees for the branch', () => {
    expect(component).toBeTruthy();
    expect(component.filteredEmployees().length).toBe(2);
    expect(component.filteredEmployees().some((u) => u.role === 'ADMIN')).toBe(false);
  });

  it('should filter employees by name when searchTerm changes', () => {
    component.searchTerm.set('lucia');
    expect(component.filteredEmployees().length).toBe(1);
    expect(component.filteredEmployees()[0].firstName).toBe('Lucia');

    component.searchTerm.set('Perez');
    expect(component.filteredEmployees().length).toBe(1);
    expect(component.filteredEmployees()[0].firstName).toBe('Carlos');

    component.searchTerm.set('nonexistent');
    expect(component.filteredEmployees().length).toBe(0);
  });

  it('should exclude ADMIN from roles loaded for the edit modal', () => {
    expect(component.roles()).toEqual(['MANAGER', 'HOST', 'WAITER', 'KITCHEN']);
    expect(component.roles().includes('ADMIN')).toBe(false);
  });

  it('should open edit modal when selecting an employee and update role or delete employee', () => {
    const employeeToEdit = component.filteredEmployees()[0];
    component.openEditModal(employeeToEdit);
    expect(component.selectedEmployee()?.id).toBe(10);

    // Role change callback
    component.onEmployeeUpdated({ ...employeeToEdit, role: 'MANAGER' });
    expect(component.filteredEmployees().find((u) => u.id === 10)?.role).toBe('MANAGER');

    // Delete callback
    component.onEmployeeDeleted(10);
    expect(component.filteredEmployees().some((u) => u.id === 10)).toBe(false);
  });

  it('should open the "+ Add employee" modal when openAddModal is called', () => {
    expect(component.isAddModalOpen()).toBe(false);
    component.openAddModal();
    expect(component.isAddModalOpen()).toBe(true);
  });
});

