import { Location } from '@angular/common';
import { Directive, HostListener, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Auth/services/auth-service';

/**
 * Makes its host element navigate to the previous screen.
 * If there is no previous screen in the app (e.g. the page was opened
 * directly), it navigates to the fallback route instead.
 */
@Directive({
  selector: '[appBackButton]',
})
export class BackButtonDirective {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  /** Optional explicit fallback route; defaults to the role's home panel. */
  readonly fallback = input('', { alias: 'appBackButton' });

  @HostListener('click')
  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      const home = this.auth.role() === 'Manager' ? '/manager' : '/admin';
      this.router.navigateByUrl(this.fallback() || home);
    }
  }
}
