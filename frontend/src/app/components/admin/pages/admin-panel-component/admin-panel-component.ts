import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../header-component/header-component';
import { AuthService } from '../../../../Auth/services/auth-service';

@Component({
  imports: [RouterLink, HeaderComponent],
  selector: 'app-admin-panel-component',
  styleUrl: './admin-panel-component.css',
  templateUrl: './admin-panel-component.html',
})
export class AdminPanelComponent {
  private readonly authService = inject(AuthService);

  readonly confirmingLogout = signal(false);

  openLogoutConfirm(): void {
    this.confirmingLogout.set(true);
  }

  cancelLogout(): void {
    this.confirmingLogout.set(false);
  }

  logout(): void {
    this.confirmingLogout.set(false);
    this.authService.logout();
  }
}
