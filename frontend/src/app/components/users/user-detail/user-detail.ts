import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  email,
  form,
  FormField,
  FormRoot,
  max,
  maxLength,
  min,
  minLength,
  pattern,
  required,
} from '@angular/forms/signals';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HeaderComponent } from '../../header-component/header-component';
import { UserService } from '../user.service';
import { User, UserRequest, UserUpdate } from '../user.model';

@Component({
  imports: [HeaderComponent, FormField, FormRoot, RouterLink],
  selector: 'app-user-detail',
  styleUrl: './user-detail.css',
  templateUrl: './user-detail.html',
})
export class UserDetail implements OnInit {
  readonly id = input.required<string>();

  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  readonly user = signal<User | null>(null);
  readonly roles = signal<string[]>([]);

  readonly isEditModalOpen = signal<boolean>(false);
  readonly isDeleteModalOpen = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly isDeleting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly userModel = signal<UserRequest>({
    dni: 0,
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    branchId: 0,
    role: '',
    pin: '',
  });

  readonly form = form(this.userModel, (path) => {
    required(path.firstName, { message: 'First name is required' });
    minLength(path.firstName, 2, { message: 'First name must have between 2 and 50 characters' });
    maxLength(path.firstName, 50, { message: 'First name must have between 2 and 50 characters' });
    pattern(path.firstName, /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/, {
      message: 'First name contains invalid characters',
    });

    required(path.lastName, { message: 'Last name is required' });
    minLength(path.lastName, 2, { message: 'Last name must have between 2 and 50 characters' });
    maxLength(path.lastName, 50, { message: 'Last name must have between 2 and 50 characters' });
    pattern(path.lastName, /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/, {
      message: 'Last name contains invalid characters',
    });

    required(path.dni, { message: 'DNI is required' });
    min(path.dni, 1_000_000, { message: 'DNI must have between 7 and 8 digits' });
    max(path.dni, 99_999_999, { message: 'DNI must have between 7 and 8 digits' });

    required(path.phoneNumber, { message: 'Phone number is required' });
    pattern(path.phoneNumber, /^\+?[0-9\s\-()]{7,20}$/, {
      message: 'Phone number must have between 7 and 20 valid characters',
    });

    required(path.email, { message: 'Email is required' });
    email(path.email, { message: 'Enter a valid email address' });

    required(path.branchId, { message: 'Branch ID is required' });
    min(path.branchId, 1, { message: 'Branch ID must be a positive number' });

    required(path.role, { message: 'Role is required' });
    pattern(path.pin, /^([0-9]{4})?$/, { message: 'PIN must be exactly 4 digits' });
  });

  readonly isFormValid = computed(
    () =>
      this.form.dni().valid() &&
      this.form.firstName().valid() &&
      this.form.lastName().valid() &&
      this.form.email().valid() &&
      this.form.phoneNumber().valid() &&
      this.form.branchId().valid() &&
      this.form.role().valid() &&
      this.form.pin().valid()
  );

  constructor() {
    effect(() => {
      const currentId = Number(this.id());
      if (!Number.isNaN(currentId) && currentId > 0) {
        this.loadUser(currentId);
      }
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  getBackRoute(): string {
    return this.router.url.startsWith('/admin') ? '/admin/employees' : '/users';
  }

  private loadUser(userId: number): void {
    this.userService.getById(userId).subscribe({
      next: (userData) => {
        if (userData) {
          this.user.set(userData);
          this.populateModel(userData);
        }
      },
      error: (err) => {
        console.error('Error fetching user details', err);
        this.errorMessage.set(err.error?.message || 'Failed to load employee details.');
      },
    });
  }

  private loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (data) => {
        this.roles.set((data || []).filter((role) => role.toUpperCase() !== 'ADMIN'));
      },
      error: (err) => console.error('Error fetching roles', err),
    });
  }

  private populateModel(userData: User): void {
    this.userModel.set({
      dni: userData.dni,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      email: userData.email,
      branchId: userData.branchId,
      role: userData.role,
      pin: '',
    });
  }

  openEditModal(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    const currentUser = this.user();
    if (currentUser) {
      this.populateModel(currentUser);
    }
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    if (this.isSubmitting()) return;
    this.isEditModalOpen.set(false);
    this.errorMessage.set(null);
    const currentUser = this.user();
    if (currentUser) {
      this.populateModel(currentUser);
    }
  }

  openDeleteModal(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    if (this.isDeleting()) return;
    this.isDeleteModalOpen.set(false);
    this.errorMessage.set(null);
  }

  onBackdropClick(event: MouseEvent, modalType: 'edit' | 'delete'): void {
    if (event.target === event.currentTarget) {
      if (modalType === 'edit') {
        this.closeEditModal();
      } else {
        this.closeDeleteModal();
      }
    }
  }

  onSubmit(): void {
    if (!this.isFormValid() || this.isSubmitting()) {
      this.form().markAsTouched();
      this.errorMessage.set('Please check the highlighted fields and try again.');
      return;
    }

    const userId = Number(this.id());
    const currentUser = this.user();
    const model = this.userModel();
    const trimmedPin = model.pin.trim();
    const roleChanged = Boolean(currentUser && model.role && model.role !== currentUser.role);

    if (
      roleChanged &&
      currentUser?.role === 'MANAGER' &&
      model.role !== 'MANAGER' &&
      trimmedPin.length !== 4
    ) {
      this.errorMessage.set('A 4-digit PIN is required when changing role from MANAGER.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const updatePayload: UserUpdate = {
      dni: Number(model.dni),
      firstName: model.firstName.trim(),
      lastName: model.lastName.trim(),
      phoneNumber: model.phoneNumber.trim(),
      email: model.email.trim(),
      branchId: Number(model.branchId),
    };

    this.userService
      .update(userId, updatePayload)
      .pipe(
        switchMap((updatedUser): Observable<User> => {
          if (roleChanged) {
            return this.userService.changeRole(userId, {
              roleName: model.role,
              newPin: trimmedPin || undefined,
            });
          }
          if (trimmedPin.length === 4) {
            return this.userService.resetPin(userId, { newPin: trimmedPin });
          }
          return of(updatedUser);
        })
      )
      .subscribe({
        next: (finalUser) => {
          this.user.set(finalUser);
          this.populateModel(finalUser);
          this.isSubmitting.set(false);
          this.isEditModalOpen.set(false);
          this.successMessage.set('Employee updated successfully.');
        },
        error: (err) => {
          console.error('Error updating user', err);
          this.errorMessage.set(
            err.error?.message || err.error?.error || 'Failed to update the employee.'
          );
          this.isSubmitting.set(false);
        },
      });
  }

  confirmDelete(): void {
    if (this.isDeleting()) return;

    this.isDeleting.set(true);
    this.errorMessage.set(null);

    this.userService.delete(Number(this.id())).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.isDeleteModalOpen.set(false);
        this.router.navigate([this.getBackRoute()]);
      },
      error: (err) => {
        console.error('Error deleting user', err);
        this.errorMessage.set(
          err.error?.message || err.error?.error || 'Failed to delete employee.'
        );
        this.isDeleting.set(false);
      },
    });
  }
}
