import { Component, signal } from '@angular/core';
import { Pin } from '../pin/pin';
import { AdminLogin } from '../admin-login/admin-login';

@Component({
  imports: [Pin, AdminLogin],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  protected readonly adminMode = signal(false)
}
