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
import { PaymentMethod } from '../../models/payment-method';
import { TableBill } from '../../models/table-bill';
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
  readonly branchId = signal<number | null>(null);

  readonly loading = signal<boolean>(true);
  readonly loadError = signal<string | null>(null);

  readonly bill = signal<TableBill | null>(null);
  readonly paymentMethods = signal<PaymentMethod[]>([]);
  readonly draftDiscount = signal<number>(0);

  readonly submitting = signal<boolean>(false);
  readonly submitError = signal<string | null>(null);

  readonly closedBill = signal<TableBill | null>(null);
  readonly appliedPayments = signal<OrderPayment[]>([]);

  readonly freeingTable = signal<boolean>(false);
  readonly tableAlreadyFree = signal<boolean>(false);
  readonly receiptError = signal<string | null>(null);

  ngOnInit(): void {
    const tableNum = Number(this.route.snapshot.paramMap.get('tableNumber'));
    const queryBranch = Number(this.route.snapshot.queryParamMap.get('branchId')) || null;

    this.tableNumber.set(Number.isFinite(tableNum) ? tableNum : 0);

    if (!tableNum || !Number.isFinite(tableNum)) {
      this.loading.set(false);
      this.loadError.set('Invalid table identifier.');
      return;
    }

    this.authService.ensureProfileLoaded().subscribe((profile) => {
      const resolvedBranchId = queryBranch ?? profile?.branchId ?? null;
      if (!resolvedBranchId) {
        this.loading.set(false);
        this.loadError.set('Could not determine the active branch for this table.');
        return;
      }

      this.branchId.set(resolvedBranchId);
      this.loadData(resolvedBranchId, tableNum);
    });
  }

  loadData(branchId: number, tableNumber: number): void {
    this.loading.set(true);
    this.loadError.set(null);

    forkJoin({
      bill: this.orderService.getTableBill(branchId, tableNumber),
      paymentMethods: this.orderService.getPaymentMethods(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ bill, paymentMethods }) => {
          this.bill.set(bill);
          this.paymentMethods.set(paymentMethods ?? []);
          if (!bill.orders || bill.orders.length === 0) {
            this.loadError.set(`Table #${tableNumber} has no active orders to close.`);
          } else if (
            bill.remainingAmount <= 0 &&
            bill.orders.every((o) => o.status === 'PAID')
          ) {
            this.closedBill.set(bill);
          } else if (!bill.allServed) {
            this.loadError.set(
              'All orders must be served before charging and closing the table.'
            );
          }
        },
        error: (err) => {
          this.loadError.set(extractHttpError(err, 'Could not load table bill details.'));
        },
      });
  }

  retryLoad(): void {
    const bId = this.branchId();
    const tableNum = this.tableNumber();
    if (bId && tableNum) {
      this.loadData(bId, tableNum);
    }
  }

  onDiscountChange(discount: number): void {
    this.draftDiscount.set(discount);
  }

  onConfirmPayment(event: { payments: OrderPayment[]; discount: number }): void {
    const bId = this.branchId();
    const currentBill = this.bill();
    if (!bId || !currentBill) return;

    this.submitting.set(true);
    this.submitError.set(null);

    this.orderService
      .checkoutTable(
        bId,
        currentBill.tableNumber,
        event.payments,
        event.discount,
        currentBill.orders.map((o) => o.id),
        currentBill.allServed
      )
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (paidBill) => {
          this.bill.set(paidBill);
          this.closedBill.set(paidBill);
          this.appliedPayments.set(
            paidBill.payments && paidBill.payments.length > 0
              ? paidBill.payments
              : event.payments
          );
          this.draftDiscount.set(0);
        },
        error: (err) => {
          this.submitError.set(
            extractHttpError(err, 'Could not process payment and close table bill.')
          );
          this.draftDiscount.set(0);
          this.syncBillAfterFailure(bId, currentBill.tableNumber);
        },
      });
  }

  private syncBillAfterFailure(branchId: number, tableNumber: number): void {
    this.orderService.getTableBill(branchId, tableNumber).subscribe({
      next: (freshBill) => {
        this.bill.set(freshBill);
        if (
          freshBill.remainingAmount <= 0 &&
          freshBill.orders.every((o) => o.status === 'PAID')
        ) {
          this.closedBill.set(freshBill);
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
    const tableNum = this.tableNumber() || this.closedBill()?.tableNumber || 0;
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
}

