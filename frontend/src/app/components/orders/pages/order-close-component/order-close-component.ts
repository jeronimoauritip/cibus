import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../../Auth/services/auth-service';
import { HeaderComponent } from '../../../header-component/header-component';
import { TableService } from '../../../tables/service/table.service';
import { PaymentComponent } from '../../components/payment-component/payment-component';
import { ReceiptComponent } from '../../components/receipt-component/receipt-component';
import { TicketPreviewComponent } from '../../components/ticket-preview-component/ticket-preview-component';
import { OrderPayment } from '../../models/order-payment';
import { OrderResponse } from '../../models/order-response';
import { PaymentMethod } from '../../models/payment-method';
import { OrderService } from '../../service/order-service';

function extractHttpError(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    return err.error?.message || err.error?.error || err.message || fallback;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

@Component({
  selector: 'app-order-close',
  standalone: true,
  imports: [
    HeaderComponent,
    TicketPreviewComponent,
    PaymentComponent,
    ReceiptComponent,
  ],
  templateUrl: './order-close-component.html',
  styleUrl: './order-close-component.css',
})
export class OrderCloseComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly tableService = inject(TableService);

  readonly tableNumber = signal<number>(0);
  readonly orderId = signal<number>(0);
  readonly branchId = signal<number | null>(null);

  readonly loading = signal<boolean>(true);
  readonly loadError = signal<string | null>(null);

  readonly order = signal<OrderResponse | null>(null);
  readonly paymentMethods = signal<PaymentMethod[]>([]);
  readonly draftDiscount = signal<number>(0);

  readonly submitting = signal<boolean>(false);
  readonly submitError = signal<string | null>(null);

  readonly closedOrder = signal<OrderResponse | null>(null);
  readonly appliedPayments = signal<OrderPayment[]>([]);

  readonly freeingTable = signal<boolean>(false);
  readonly tableAlreadyFree = signal<boolean>(false);
  readonly receiptError = signal<string | null>(null);

  ngOnInit(): void {
    const tableNum = Number(this.route.snapshot.paramMap.get('tableNumber'));
    const ordId = Number(this.route.snapshot.paramMap.get('orderId'));
    const queryBranch = Number(this.route.snapshot.queryParamMap.get('branchId')) || null;

    this.tableNumber.set(Number.isFinite(tableNum) ? tableNum : 0);
    this.orderId.set(Number.isFinite(ordId) ? ordId : 0);

    if (!ordId || !Number.isFinite(ordId)) {
      this.loading.set(false);
      this.loadError.set('Invalid order identifier.');
      return;
    }

    this.authService.ensureProfileLoaded().subscribe((profile) => {
      const resolvedBranchId = queryBranch ?? profile?.branchId ?? null;
      if (!resolvedBranchId) {
        this.loading.set(false);
        this.loadError.set('Could not determine the active branch for this order.');
        return;
      }

      this.branchId.set(resolvedBranchId);
      this.loadData(resolvedBranchId, ordId);
    });
  }

  loadData(branchId: number, orderId: number): void {
    this.loading.set(true);
    this.loadError.set(null);

    forkJoin({
      order: this.orderService.getOrderById(branchId, orderId),
      paymentMethods: this.orderService.getPaymentMethods(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ order, paymentMethods }) => {
          this.order.set(order);
          this.paymentMethods.set(paymentMethods ?? []);
          if (order.status === 'PAID') {
            this.closedOrder.set(order);
          } else if (order.status === 'CANCELLED') {
            this.loadError.set(`Order #${order.id} is cancelled and cannot be closed.`);
          }
        },
        error: (err) => {
          this.loadError.set(extractHttpError(err, 'Could not load order details.'));
        },
      });
  }

  retryLoad(): void {
    const bId = this.branchId();
    const oId = this.orderId();
    if (bId && oId) {
      this.loadData(bId, oId);
    }
  }

  onDiscountChange(discount: number): void {
    this.draftDiscount.set(discount);
  }

  onConfirmPayment(event: { payments: OrderPayment[]; discount: number }): void {
    const bId = this.branchId();
    const currentOrder = this.order();
    if (!bId || !currentOrder) return;

    this.submitting.set(true);
    this.submitError.set(null);

    this.orderService
      .closeOrder(
        bId,
        currentOrder.id,
        event.payments,
        event.discount,
        currentOrder.status
      )
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (paidOrder) => {
          this.order.set(paidOrder);
          this.closedOrder.set(paidOrder);
          this.appliedPayments.set(event.payments);
          this.draftDiscount.set(0);
        },
        error: (err) => {
          this.submitError.set(
            extractHttpError(err, 'Could not process payment and close order.')
          );
          this.draftDiscount.set(0);
          this.syncOrderAfterFailure(bId, currentOrder.id);
        },
      });
  }

  private syncOrderAfterFailure(branchId: number, orderId: number): void {
    this.orderService.getOrderById(branchId, orderId).subscribe({
      next: (freshOrder) => {
        this.order.set(freshOrder);
        if (freshOrder.status === 'PAID') {
          this.closedOrder.set(freshOrder);
          this.submitError.set(null);
        }
      },
      error: () => {
        // Keep the original submit error visible if refresh fails
      },
    });
  }

  onFinishAndFreeTable(): void {
    const bId = this.branchId();
    const tableNum = this.tableNumber() || this.closedOrder()?.tableNumber || 0;
    if (!bId || !tableNum) {
      this.navigateToFloor();
      return;
    }

    this.freeingTable.set(true);
    this.receiptError.set(null);

    this.tableService
      .freeTable(bId, tableNum)
      .pipe(finalize(() => this.freeingTable.set(false)))
      .subscribe({
        next: () => {
          this.tableAlreadyFree.set(true);
          this.navigateToFloor();
        },
        error: (err) => {
          const msg = extractHttpError(err, 'Could not free the table.');
          if (msg.toLowerCase().includes('already free')) {
            this.tableAlreadyFree.set(true);
            this.navigateToFloor();
            return;
          }
          this.receiptError.set(msg);
        },
      });
  }

  navigateToFloor(): void {
    const bId = this.branchId();
    if (this.authService.isAdmin() && bId) {
      this.router.navigate(['/admin/branches', bId, 'tables']);
      return;
    }
    this.router.navigate(['/tables']);
  }

  onPrintReceipt(): void {
    window.print();
  }
}

