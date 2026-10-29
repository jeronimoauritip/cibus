import { Component, computed, inject, input, signal } from '@angular/core';
import { HeaderComponent } from '../../header-component/header-component';
import { UserService } from '../user.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { email, form, FormField, required } from '@angular/forms/signals';
import { User, UserRequest, UserUpdate } from '../user.model'; // <-- Agregado UserUpdate

@Component({
  imports: [HeaderComponent, FormField],
  selector: 'app-user-detail',
  styleUrl: './user-detail.css',
  templateUrl: './user-detail.html',
})
export class UserDetail {

  readonly id = input.required<string>();
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  protected readonly isEditing = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly roles = signal<string[]>([]);

  readonly userModel = signal<UserRequest>({
    dni: 0,
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    branchId: 0,
    role: '',
    pin: ''
  });
  
  readonly form = form(this.userModel, (path) => {
    required(path.dni, { message: 'DNI is required' });
    required(path.firstName, { message: 'First name is required' });
    required(path.lastName, { message: 'Last name is required' });
    required(path.phoneNumber, { message: 'Phone number is required' });
    required(path.email, { message: 'Email is required' });
    email(path.email, { message: 'Enter a valid email address' });
    required(path.branchId, { message: 'Branch ID is required' });
    required(path.role, { message: 'Role is required' });
  });

  readonly isFormValid = computed(() =>
    this.form.dni().valid() &&
    this.form.firstName().valid() &&
    this.form.lastName().valid() &&
    this.form.email().valid() &&
    this.form.phoneNumber().valid() &&
    this.form.branchId().valid() &&
    this.form.role().valid()
  );

  readonly user = toSignal(
    toObservable(this.id).pipe(
      switchMap(currentId => this.userService.getById(Number(currentId))),
      tap((userData: User) => {
        if (userData) {
          this.populateModel(userData);
        }
      })
    )
  );
  

  private loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (data) => this.roles.set(data),
      error: (err) => console.error('Error fetching roles', err)
    });
  }

  ngOnInit(): void {
    this.loadRoles();
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
      pin: ''
    });
  }

  enableEdit(): void {
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.errorMessage.set(null);
    const currentUser = this.user();
    if (currentUser) {
      this.populateModel(currentUser);
    }
  }

  onSubmit(): void {
    if (!this.isFormValid() || this.isSubmitting()) {
      this.errorMessage.set('Please fill out all required fields.');
      return;
    }
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const updatePayload: UserUpdate = {
      dni: this.userModel().dni,
      firstName: this.userModel().firstName,
      lastName: this.userModel().lastName,
      phoneNumber: this.userModel().phoneNumber,
      email: this.userModel().email,
      branchId: this.userModel().branchId
    };
    this.userService.update(Number(this.id()), updatePayload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.isEditing.set(false);
      },
      error: (err) => {
        console.error('Error updating user', err);
        this.errorMessage.set('Failed to update the user.');
        this.isSubmitting.set(false);
      }
    });
  }

  onDelete(): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.userService.delete(Number(this.id())).subscribe({
        next: () => this.router.navigate(['/users']),
        error: (err) => this.errorMessage.set('Failed to delete employee.')
      });
    }
  }
}
