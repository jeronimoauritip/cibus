import { DatePipe } from '@angular/common';
import { Component, computed, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';
import { OrderResponse } from '../../models/order-response';

export type KitchenStatus = 'PENDING' | 'PREPARING' | 'READY';

export const KITCHEN_STATUSES: readonly KitchenStatus[] = ['PENDING', 'PREPARING', 'READY'];

export const KITCHEN_STATUS_LABELS: Record<KitchenStatus, string> = {
  PENDING: 'Pending',
  PREPARING: 'Preparing',
  READY: 'Ready'
};

@Component({
  selector: 'app-kitchen-order-card',
  imports: [DatePipe],
  templateUrl: './kitchen-order-card-component.html',
  styleUrl: './kitchen-order-card-component.css'
})
export class KitchenOrderCardComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly order = input.required<OrderResponse>();
  readonly status = input.required<KitchenStatus>();
  readonly move = output<KitchenStatus>();

  readonly menuOpen = signal(false);

  readonly options = computed(() =>
    KITCHEN_STATUSES.filter(status => status !== this.status()).map(status => ({
      status,
      label: KITCHEN_STATUS_LABELS[status]
    }))
  );

  toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  select(status: KitchenStatus): void {
    this.menuOpen.set(false);
    this.move.emit(status);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.menuOpen() && !this.host.nativeElement.contains(event.target as Node)) {
      this.menuOpen.set(false);
    }
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    this.menuOpen.set(false);
  }
}
