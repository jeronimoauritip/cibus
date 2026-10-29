import { Component, computed, effect, HostListener, inject, input, output, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, pattern, required } from '@angular/forms/signals';
import { finalize } from 'rxjs/operators';
import { User, ChangeRoleRequest } from '../../../users/user.model';
import { UserService } from '../../../users/user.service';

export interface EditRoleFormModel {
  roleName: string;
  newPin: string;
}

@Component({
  selector: 'app-employee-edit-modal',
  imports: [FormField, FormRoot],
  templateUrl: './employee-edit-modal.html',
  styleUrl: './employee-edit-modal.css',
})
export class EmployeeEditModalComponent {
  private readonly userService = inject(UserService);

  readonly employee = input.required<User>();
  readonly roles = input<string[]>(['MANAGER', 'HOST', 'WAITER', 'KITCHEN']);

  readonly closed = output<void>();
  readonly employeeUpdated = output<User>();
  readonly employeeDeleted = output<number>();

  readonly isSavingRole = signal<boolean>(false);
  readonly isDeleting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly submitted = signal<boolean>(false);

  // Exclude ADMIN from selectable roles
  readonly availableRoles = computed(() => {
    const filtered = this.roles().filter((role) => role.toUpperCase() !== 'ADMIN');
    return filtered.length > 0 ? filtered : ['MANAGER', 'HOST', 'WAITER', 'KITCHEN'];
  });

  readonly roleModel = signal<EditRoleFormModel>({
    roleName: '',
    newPin: '',
  });

  readonly roleForm = form(this.roleModel, (r) => {
    required(r.roleName, { message: 'Role is mandatory' });
    maxLength(r.newPin, 4, { message: 'PIN must be at most 4 digits' });
    pattern(r.newPin, /^(\d{4})?$/, { message: 'PIN must be exactly 4 numeric digits' });
  });

  // Backend requires a 4-digit PIN when transitioning from MANAGER to a PIN-based role
  readonly requiresNewPin = computed(() => {
    const currentRole = this.employee().role?.toUpperCase();
    const selectedRole = this.roleModel().roleName?.toUpperCase();
    return currentRole === 'MANAGER' && !!selectedRole && selectedRole !== 'MANAGER';
  });

  readonly isRoleUnchanged = computed(() => {
    const currentRole = this.employee().role?.toUpperCase() || '';
    const selectedRole = this.roleModel().roleName?.toUpperCase() || '';
    return currentRole === selectedRole;
  });

  constructor() {
    effect(() => {
      const emp = this.employee();
      const initialRole = emp.role?.toUpperCase() !== 'ADMIN' ? emp.role?.toUpperCase() : 'WAITER';
      this.roleModel.set({
        roleName: initialRole || 'WAITER',
        newPin: '',
      });
      this.errorMessage.set(null);
      this.submitted.set(false);
    });
  }

  onSaveRole(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);

    if (this.roleForm().invalid()) {
      this.roleForm().markAsTouched();
      return;
    }

    const { roleName, newPin } = this.roleModel();

    if (this.requiresNewPin() && !/^\d{4}$/.test(newPin.trim())) {
      this.errorMessage.set('A 4-digit PIN is required when changing from Manager to an operational role.');
      return;
    }

    const request: ChangeRoleRequest = {
      roleName: roleName.toUpperCase(),
      ...(this.requiresNewPin() ? { newPin: newPin.trim() } : {}),
    };

    this.isSavingRole.set(true);

    this.userService
      .changeRole(this.employee().id, request)
      .pipe(finalize(() => this.isSavingRole.set(false)))
      .subscribe({
        next: (updatedUser) => {
          this.employeeUpdated.emit(updatedUser);
          this.closed.emit();
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || err.error?.error || err.message || 'Failed to change employee role.'
          );
        },
      });
  }

  onDeleteEmployee(): void {
    this.errorMessage.set(null);
    this.isDeleting.set(true);

    const empId = this.employee().id;
    this.userService
      .delete(empId)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => {
          this.employeeDeleted.emit(empId);
          this.closed.emit();
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || err.error?.error || err.message || 'Failed to delete employee.'
          );
        },
      });
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closed.emit();
  }
}
