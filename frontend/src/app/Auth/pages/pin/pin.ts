import { Component, HostListener, inject, output, signal } from '@angular/core'
import { AuthService } from '../../services/auth-service'
import { HeaderComponent } from '../../../components/header-component/header-component'


@Component({
  imports: [HeaderComponent],
  selector: 'app-pin',
  styleUrl: './pin.css',
  templateUrl: './pin.html',
})
export class Pin {
  protected readonly auth = inject(AuthService)
  protected readonly pin  = signal('')
  protected readonly keys = ['1','2','3','4','5','6','7','8','9','⊗','0','⌫']

  readonly adminClick = output<void>()

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key >= '0' && event.key <= '9') {
      this.press(event.key)
    } else if (event.key === 'Backspace') {
      this.pin.update(p => p.slice(0, -1))
    } else if (event.key === 'Escape') {
      this.pin.set('')
    }
  }

  protected onKeyClick(key: string, event: Event): void {
    event.stopPropagation()
    if (key === '⊗') {
      this.pin.set('')
    } else if (key === '⌫') {
      this.pin.update(p => p.slice(0, -1))
    } else {
      this.press(key)
    }
  }

  private press(key: string): void {
    if (this.pin().length < 4) {
      this.pin.update(p => p + key)
      if (this.pin().length === 4) {
        this.auth.loginWithPin(this.pin())
      }
    }
  }
}
