import { Component, inject } from '@angular/core';
import { AuthService } from '../../Auth/services/auth-service';

@Component({
  imports: [],
  selector: 'app-header-component',
  styleUrl: './header-component.css',
  templateUrl: './header-component.html',
})
export class HeaderComponent {

  readonly authService = inject(AuthService);

  onLogoClick(): void {
    this.authService.navigateToHome();
  }

}
