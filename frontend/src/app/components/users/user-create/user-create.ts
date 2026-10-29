import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { UserRequest } from '../user.model';
import { email, form, FormField, minLength, required } from '@angular/forms/signals';
import { HeaderComponent } from '../../header-component/header-component';

@Component({
  imports: [FormField, HeaderComponent],
  selector: 'app-user-create',
  styleUrl: './user-create.css',
  templateUrl: './user-create.html',
})
export class UserCreate implements OnInit {

  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
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
    required(path.pin, { message: 'PIN is required' });
    minLength(path.pin, 4, { message: 'PIN must be at least 4 characters' });
  });
  readonly isFormValid = computed(() => 
    this.form.dni().valid() &&
    this.form.firstName().valid() &&
    this.form.lastName().valid() &&
    this.form.email().valid() &&
    this.form.phoneNumber().valid() &&
    this.form.branchId().valid() &&
    this.form.role().valid() &&
    this.form.pin().valid()
  );
  readonly roles = signal<string[]>([]);
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);


  ngOnInit(): void {
    this.loadRoles();
  }

  private loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (data) => this.roles.set(data),
      error: (err) => {
        console.error('Error fetching roles', err);
        this.errorMessage.set('Failed to load roles from the server.');
      }
    });
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMessage.set('Please fill out all required fields.');
      return;
    }
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.userService.create(this.userModel()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/users']); 
      },
      error: (err) => {
        console.error('Error creating user', err);
        this.errorMessage.set('Failed to create the user. Please verify the data and try again.');
        this.isSubmitting.set(false);
      }
    });
  }
}
