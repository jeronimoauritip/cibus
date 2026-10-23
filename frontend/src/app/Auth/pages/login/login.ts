import { Component, inject, signal } from '@angular/core';
import { Pin } from '../pin/pin';
import { AdminLogin } from '../admin-login/admin-login';
import { AuthService } from '../../services/auth-service';

@Component({
  imports: [Pin, AdminLogin],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService)
  protected readonly adminMode = signal(false)

  protected setAdminMode(value: boolean): void {
    this.auth.clearError()
    this.adminMode.set(value)
  }
}
