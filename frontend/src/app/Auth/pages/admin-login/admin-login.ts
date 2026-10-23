import { Component, inject, output, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { email, form, FormField, minLength, required, submit } from '@angular/forms/signals';

@Component({
  selector: 'app-admin-login',
  imports: [FormField],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {
  protected readonly auth = inject(AuthService);

  readonly employeeClick = output<void>();
  
  readonly minPasswordLength = 8;

  private readonly model= signal ({email:'', password:''});

  protected readonly loginForm = form(this.model, (path) => {
    required(path.email,    { message: 'Enter your email.' });
    email(path.email,       { message: 'Enter a valid email (e.g. name@domain.com).' });
    required(path.password, { message: 'Enter your password.' });
    minLength(path.password, this.minPasswordLength, {
      message: `Password must be at least ${this.minPasswordLength} characters long.`,
    });
  });

  onSubmit(): void {
    submit(this.loginForm, async () => {
      const { email, password } = this.model();
      this.auth.loginWithCredentials(email, password);
    });
  }
}
