import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserList } from './user-list';
import { UserService } from '../user.service';
import { Page, User } from '../user.model';

describe('UserList', () => {
  let component: UserList;
  let fixture: ComponentFixture<UserList>;
  let mockUserService: any;

  const mockPage: Page<User> = {
    content: [
      { id: 1, dni: 123, firstName: 'Lucia', lastName: 'Gomez', phoneNumber: '123', email: 'lucia@test.com', branchId: 1, branchName: 'Centro', role: 'WAITER' },
      { id: 2, dni: 456, firstName: 'Admin', lastName: 'Master', phoneNumber: '456', email: 'admin@test.com', branchId: 1, branchName: 'Centro', role: 'ADMIN' },
      { id: 3, dni: 789, firstName: 'Carlos', lastName: 'Perez', phoneNumber: '789', email: 'carlos@test.com', branchId: 1, branchName: 'Centro', role: 'MANAGER' }
    ],
    totalElements: 3,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: false
  };

  beforeEach(async () => {
    mockUserService = {
      getAll: vi.fn(() => of(mockPage))
    };

    await TestBed.configureTestingModule({
      imports: [UserList],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: UserService, useValue: mockUserService }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserList);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter out ADMIN users from the list', () => {
    const content = component.usersPage()?.content || [];
    expect(content.length).toBe(2);
    expect(content.some(u => u.role === 'ADMIN')).toBe(false);
  });
});
