import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../header-component/header-component';
import { AuthService } from '../../../../Auth/services/auth-service';

@Component({
  imports: [RouterLink, HeaderComponent],
  selector: 'app-manager-panel-component',
  styleUrl: './manager-panel-component.css',
  templateUrl: './manager-panel-component.html',
})
export class ManagerPanelComponent {
  protected readonly auth = inject(AuthService);

  protected readonly branchId = computed(() => {
    const user = this.auth.user();
    return user?.branchId;
  });
}
