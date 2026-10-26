import { Component, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MainIconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="top-bar" [class.scrolled]="isScrolled()" role="banner">
      <div class="top-bar-inner">
        <!-- Logo oficial de Cibus con microanimación de campana -->
        <a routerLink="/home" class="brand-logo" aria-label="Cibus Inicio">
          <span class="cloche-icon-wrap" aria-hidden="true">
            <span class="cloche-lid"></span>
            <span class="cloche-base"></span>
          </span>
          <span class="brand-name">cibus</span>
        </a>

        <!-- Controles y perfil a la derecha -->
        <div class="top-bar-actions">
          <!-- Tag de datos de demostración -->
          <div class="demo-tag" title="Los datos se simulan localmente">
            <span class="demo-dot"></span>
            <span class="demo-label">Datos demo</span>
          </div>

          <!-- Chip de usuario / perfil -->
          <div class="profile-chip" title="Sesión activa como Administrador">
            <div class="avatar-circle">A</div>
            <span class="profile-name">Admin</span>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      position: sticky;
      top: 0;
      z-index: 40;
    }

    .top-bar {
      width: 100%;
      padding: 16px 20px;
      background: rgba(231, 219, 191, 0.85);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-bottom: 1px solid transparent;
      transition: background var(--dur-normal) var(--ease-smooth),
                  padding var(--dur-normal) var(--ease-smooth),
                  box-shadow var(--dur-normal) var(--ease-smooth),
                  border-color var(--dur-normal) var(--ease-smooth);
    }

    .top-bar.scrolled {
      padding: 10px 20px;
      background: rgba(231, 219, 191, 0.96);
      border-color: rgba(32, 90, 64, 0.12);
      box-shadow: 0 4px 18px rgba(32, 90, 64, 0.08);
    }

    .top-bar-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--verde-oscuro);
      transition: transform var(--dur-rapida) var(--ease-bounce);
    }

    .brand-logo:hover {
      transform: scale(1.02);
    }

    /* Campana interactiva */
    .cloche-icon-wrap {
      position: relative;
      width: 28px;
      height: 22px;
      display: inline-flex;
      align-items: flex-end;
      justify-content: center;
    }

    .cloche-lid {
      position: absolute;
      top: 2px;
      width: 22px;
      height: 12px;
      background: var(--verde-oscuro);
      border-radius: 12px 12px 0 0;
      transition: transform var(--dur-normal) var(--ease-bounce);
    }

    .cloche-lid::before {
      content: '';
      position: absolute;
      top: -3px;
      left: 50%;
      transform: translateX(-50%);
      width: 5px;
      height: 4px;
      border-radius: 50%;
      background: var(--verde-oscuro);
    }

    .cloche-base {
      width: 26px;
      height: 3px;
      background: var(--verde-oscuro);
      border-radius: 2px;
    }

    .brand-logo:hover .cloche-lid {
      transform: translateY(-3px) rotate(-4deg);
    }

    .brand-name {
      font-family: var(--fuente-display);
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -1.2px;
      line-height: 1;
    }

    .top-bar-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .demo-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: rgba(32, 90, 64, 0.08);
      border-radius: var(--radio-pill);
      font-size: 11px;
      font-weight: 700;
      color: var(--texto-secundario);
      letter-spacing: 0.3px;
    }

    .demo-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--verde-claro);
    }

    .profile-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--crema-50);
      padding: 4px 12px 4px 5px;
      border-radius: var(--radio-pill);
      border: 1px solid rgba(32, 90, 64, 0.14);
      box-shadow: var(--sombra-subtil);
    }

    .avatar-circle {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--verde-oscuro);
      color: #f8f5e9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 800;
    }

    .profile-name {
      font-size: 13px;
      font-weight: 700;
      color: var(--texto-principal);
    }
  `]
})
export class TopBarComponent {
  readonly isScrolled = signal(false);

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 20);
  }
}
