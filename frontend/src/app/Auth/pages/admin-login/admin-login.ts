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
    required(path.email,    { message: 'Ingresá tu mail.' });
    email(path.email,       { message: 'Ingresá un mail válido (ej: nombre@dominio.com).' });
    required(path.password, { message: 'Ingresá tu contraseña.' });
    minLength(path.password, this.minPasswordLength, {
      message: `La contraseña debe tener al menos ${this.minPasswordLength} caracteres.`,
    });
  });

  onSubmit(): void {
    submit(this.loginForm, async () => {
      const { email, password } = this.model();
      this.auth.loginWithCredentials(email, password);
    });
  }
}
