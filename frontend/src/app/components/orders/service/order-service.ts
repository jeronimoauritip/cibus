import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap, throwError } from 'rxjs';
import { OrderDetail } from '../models/order-detail';
import { OrderDetailRequest } from '../models/order-detail-request';
import { OrderRequest } from '../models/order-request';
import { OrderResponse } from '../models/order-response';

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

    private url(branchId: number): string {
        return `/api/branches/${branchId}/orders`;
    }
   
}
