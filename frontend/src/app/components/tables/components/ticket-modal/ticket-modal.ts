import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { TableOrder } from '../../models/table.model';

@Component({
  selector: 'app-ticket-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-modal.html',
  styleUrl: './ticket-modal.css',
})
export class TicketModalComponent {
  readonly ticket = input<TableOrder | null>(null);
  readonly branchName = input<string>('Branch Floor');
  readonly canCancel = input<boolean>(true);
  readonly closed = output<void>();
  readonly cancelOrder = output<TableOrder>();

  readonly isActiveOrder = computed(() => {
    const status = this.ticket()?.status?.toUpperCase();
    return !!status && status !== 'PAID' && status !== 'CANCELLED';
  });

  closeModal(): void {
    this.closed.emit();
  }

  onCancelOrder(order: TableOrder): void {
    this.cancelOrder.emit(order);
  }

  formatTimestamp(iso: string | undefined | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

