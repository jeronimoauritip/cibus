import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-logout-confirm',
  styleUrl: './logout-confirm-component.css',
  templateUrl: './logout-confirm-component.html',
  host: { '(document:keydown.escape)': 'cancelled.emit()' },
})
export class LogoutConfirmComponent {
  readonly message = input('Are you sure you want to log out?');
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
