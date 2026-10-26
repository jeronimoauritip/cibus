import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-occupancy-meter',
  standalone: true,
  template: `
    <div class="meter-container">
      <div class="meter-info">
        <span class="meter-fraction">
          <strong>{{ occupied() }}</strong>/{{ total() }} ocupadas
        </span>
        <span class="meter-percent" [class.high]="percent() >= 75">
          {{ percent() }}%
        </span>
      </div>
      <div class="meter-track" role="progressbar" [attr.aria-valuenow]="percent()" aria-valuemin="0" aria-valuemax="100">
        <div
          class="meter-fill"
          [style.width.%]="clampedPercent()"
          [class.high]="percent() >= 75"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .meter-container {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }

    .meter-info {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 13px;
      color: var(--texto-secundario);
    }

    .meter-fraction strong {
      color: var(--texto-principal);
      font-weight: 700;
    }

    .meter-percent {
      font-weight: 700;
      font-size: 13px;
      font-variant-numeric: tabular-nums;
      color: var(--verde-fondo);
      transition: color var(--dur-normal) var(--ease-smooth);
    }

    .meter-percent.high {
      color: var(--mesa-ocupada);
    }

    .meter-track {
      width: 100%;
      height: 8px;
      background: var(--crema-200);
      border-radius: var(--radio-pill);
      overflow: hidden;
      position: relative;
    }

    .meter-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--verde-fondo), var(--verde-claro));
      border-radius: var(--radio-pill);
      transition: width var(--dur-lenta) var(--ease-smooth), background var(--dur-normal) var(--ease-smooth);
    }

    .meter-fill.high {
      background: linear-gradient(90deg, #d97736, var(--mesa-ocupada));
    }
  `]
})
export class OccupancyMeterComponent {
  readonly occupied = input.required<number>();
  readonly total = input.required<number>();

  readonly percent = computed(() => {
    const tot = this.total();
    return tot > 0 ? Math.round((this.occupied() / tot) * 100) : 0;
  });

  readonly clampedPercent = computed(() => {
    return Math.min(100, Math.max(0, this.percent()));
  });
}
