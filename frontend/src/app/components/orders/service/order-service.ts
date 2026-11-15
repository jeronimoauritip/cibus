import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { concatMap, from, last, map, Observable, of, switchMap, throwError } from 'rxjs';
import { OrderDetail } from '../models/order-detail';
import { OrderDetailRequest } from '../models/order-detail-request';
import { OrderPayment } from '../models/order-payment';
import { OrderRequest } from '../models/order-request';
import { OrderResponse } from '../models/order-response';
import { Page } from '../../users/user.model';
import { OrderStatus } from '../models/order-status';
import { PaymentMethod } from '../models/payment-method';
import { TableBill, TableCheckoutRequest } from '../models/table-bill';


@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);


  confirmOrder(
    branchId: number,
    tableNumber: number,
    waiterId: number,
    items: OrderDetail[]
  ): Observable<OrderResponse> {
    if (items.length === 0) {
      return throwError(() => new Error('The order has no products'));
    }

    const request: OrderRequest = { tableNumber, waiterId };

    return this.http.post<OrderResponse>(this.url(branchId), request).pipe(
      switchMap(order =>
        from(items).pipe(
          concatMap(item => {
            const body: OrderDetailRequest = {
              productId: item.productId,
              quantity: item.quantity,
              observation: item.observation
            };
            return this.http.post<unknown>(`${this.url(branchId)}/${order.id}/items`, body);
          }),
          last(),
          map(() => order)
        )
      )
    );
  }
  getKitchenOrders(
    branchId: () => number | undefined,
    status: Extract<OrderStatus, 'PENDING' | 'PREPARING' | 'READY'>
  ) {
    return httpResource<Page<OrderResponse>>(() => {
      const id = branchId();
      return id
        ? {
          url: this.url(id),
          params: { statusName: status, size: 50, sort: 'createdAt,asc' }
        }
        : undefined;
    });
  }

  private static readonly STATUS_ACTIONS: Record<
    Extract<OrderStatus, 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED'>,
    string
  > = {
      PENDING: 'pending',
      PREPARING: 'preparing',
      READY: 'ready',
      SERVED: 'serve',
      CANCELLED: 'cancel'
    };

  changeStatus(
    branchId: number,
    orderId: number,
    status: keyof typeof OrderService.STATUS_ACTIONS
  ): Observable<OrderResponse> {
    const action = OrderService.STATUS_ACTIONS[status];
    return this.http.post<OrderResponse>(`${this.url(branchId)}/${orderId}/${action}`, {});
  }

  getOrderById(branchId: number, orderId: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.url(branchId)}/${orderId}`);
  }

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>('/api/payment-methods');
  }

  getTableBill(branchId: number, tableNumber: number): Observable<TableBill> {
    return this.http.get<TableBill>(`/api/branches/${branchId}/tables/${tableNumber}/bill`);
  }

  checkoutTable(
    branchId: number,
    tableNumber: number,
    payments: OrderPayment[],
    discount = 0,
    orderIds?: number[],
    allServed = true
  ): Observable<TableBill> {
    if (!allServed) {
      return throwError(
        () => new Error('All orders must be served before charging and closing the table')
      );
    }
    if (payments.length === 0) {
      return throwError(() => new Error('At least one payment is required to close the table'));
    }
    if (payments.some(p => !Number.isFinite(p.amount) || p.amount <= 0)) {
      return throwError(() => new Error('All payment amounts must be greater than zero'));
    }
    if (!Number.isFinite(discount) || discount < 0) {
      return throwError(() => new Error('Discount cannot be negative'));
    }

    const body: TableCheckoutRequest = {
      ...(orderIds && orderIds.length > 0 ? { orderIds } : {}),
      discount: Math.round(discount * 100) / 100,
      payments: payments.map(p => ({
        paymentMethodId: p.paymentMethodId,
        amount: Math.round(p.amount * 100) / 100
      }))
    };

    return this.http.post<TableBill>(
      `/api/branches/${branchId}/tables/${tableNumber}/checkout`,
      body
    );
  }

  /** @deprecated Use checkoutTable instead. */
  applyDiscount(branchId: number, orderId: number, amount: number): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.url(branchId)}/${orderId}/discount`, {
      amount: Math.round(amount * 100) / 100
    });
  }

  /** @deprecated Use checkoutTable instead. */
  addPayment(branchId: number, orderId: number, payment: OrderPayment): Observable<OrderPayment> {
    return this.http.post<OrderPayment>(`${this.url(branchId)}/${orderId}/payments`, {
      paymentMethodId: payment.paymentMethodId,
      amount: Math.round(payment.amount * 100) / 100
    });
  }

  /** @deprecated Use checkoutTable instead. */
  closeOrder(
    branchId: number,
    orderId: number,
    payments: OrderPayment[],
    discount = 0,
    currentStatus?: OrderStatus
  ): Observable<OrderResponse> {
    if (payments.length === 0) {
      return throwError(() => new Error('At least one payment is required to close the order'));
    }
    if (payments.some(p => !Number.isFinite(p.amount) || p.amount <= 0)) {
      return throwError(() => new Error('All payment amounts must be greater than zero'));
    }
    if (!Number.isFinite(discount) || discount < 0) {
      return throwError(() => new Error('Discount cannot be negative'));
    }
    if (currentStatus === 'PAID' || currentStatus === 'CANCELLED') {
      return throwError(() => new Error(`Cannot close an order in ${currentStatus} status`));
    }
    if (currentStatus !== 'SERVED') {
      return throwError(
        () => new Error('All orders must be served before charging and closing the table')
      );
    }

    const applyDiscount$: Observable<unknown> =
      discount > 0 ? this.applyDiscount(branchId, orderId, discount) : of(null);

    return applyDiscount$.pipe(
      switchMap(() =>
        from(payments).pipe(
          concatMap(payment => this.addPayment(branchId, orderId, payment)),
          last()
        )
      ),
      switchMap(() => this.getOrderById(branchId, orderId))
    );
  }

  private url(branchId: number): string {
    return `/api/branches/${branchId}/orders`;
  }


}
