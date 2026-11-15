import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../header-component/header-component';
import { LogoutConfirmComponent } from '../../../logout-confirm-component/logout-confirm-component';
import { AuthService } from '../../../../Auth/services/auth-service';

@Component({
  imports: [RouterLink, HeaderComponent, LogoutConfirmComponent],
  selector: 'app-manager-panel-component',
  styleUrl: './manager-panel-component.css',
  templateUrl: './manager-panel-component.html',
})
export class ManagerPanelComponent {
  protected readonly auth = inject(AuthService);

  protected readonly confirmingLogout = signal(false);

  protected openLogoutConfirm(): void {
    this.confirmingLogout.set(true);
  }

  protected cancelLogout(): void {
    this.confirmingLogout.set(false);
  }

  protected logout(): void {
    this.confirmingLogout.set(false);
    this.auth.logout();
  }

  protected readonly branchId = computed(() => {
    const user = this.auth.user();
    return user?.branchId;
  });
}
