import { Location } from '@angular/common';
import { Directive, HostListener, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Auth/services/auth-service';


@Directive({
  selector: '[appBackButton]',
})
export class BackButtonDirective {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);


  readonly fallback = input('', { alias: 'appBackButton' });

  @HostListener('click')
  goBack(): void {
    const target = this.fallback();
    
    if (target) {
      this.router.navigateByUrl(target);
      return;
    }
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigateByUrl(this.auth.role() === 'Manager' ? '/manager' : '/admin');
    }
  }
}
