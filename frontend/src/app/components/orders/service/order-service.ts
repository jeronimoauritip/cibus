import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap, throwError } from 'rxjs';
import { OrderDetail } from '../models/order-detail';
import { OrderDetailRequest } from '../models/order-detail-request';
import { OrderRequest } from '../models/order-request';
import { OrderResponse } from '../models/order-response';
import { Page } from '../../users/user.model';
import { OrderStatus } from '../models/order-status';


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
      forkJoin(
        items.map(item => {
          const body: OrderDetailRequest = {
            productId: item.productId,
            quantity: item.quantity,
            observation: item.observation
          };
          return this.http.post<unknown>(`${this.url(branchId)}/${order.id}/items`, body);
        })
      ).pipe(map(() => order))
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
  Extract<OrderStatus, 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED'>,
  string
> = {
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



    private url(branchId: number): string {
        return `/api/branches/${branchId}/orders`;
    }

   
}
