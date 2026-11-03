import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Page } from '../../users/user.model';
import {
  BranchTable,
  TableCreateRequest,
  TableOrder,
  TableUpdateRequest,
} from '../models/table.model';

@Injectable({ providedIn: 'root' })
export class TableService {
  private readonly http = inject(HttpClient);

  private tablesUrl(branchId: number): string {
    return `/api/branches/${branchId}/tables`;
  }

  private ordersUrl(branchId: number): string {
    return `/api/branches/${branchId}/orders`;
  }

  getTablesByBranch(branchId: number): Observable<BranchTable[]> {
    const params = new HttpParams().set('size', '200').set('sort', 'number,asc');
    return this.http
      .get<Page<BranchTable>>(this.tablesUrl(branchId), { params })
      .pipe(map((page) => page?.content ?? []));
  }

  getTableByNumber(branchId: number, tableNumber: number): Observable<BranchTable> {
    return this.http.get<BranchTable>(`${this.tablesUrl(branchId)}/${tableNumber}`);
  }

  createTable(branchId: number, request: TableCreateRequest): Observable<BranchTable> {
    return this.http.post<BranchTable>(this.tablesUrl(branchId), request);
  }

  updateTable(
    branchId: number,
    tableNumber: number,
    request: TableUpdateRequest
  ): Observable<BranchTable> {
    return this.http.put<BranchTable>(`${this.tablesUrl(branchId)}/${tableNumber}`, request);
  }

  deleteTable(branchId: number, tableNumber: number): Observable<void> {
    return this.http.delete<void>(`${this.tablesUrl(branchId)}/${tableNumber}`);
  }

  occupyTable(branchId: number, tableNumber: number, waiterId: number): Observable<BranchTable> {
    return this.http.patch<BranchTable>(
      `${this.tablesUrl(branchId)}/occupy/${tableNumber}`,
      { waiterId }
    );
  }

  freeTable(branchId: number, tableNumber: number): Observable<BranchTable> {
    return this.http.patch<BranchTable>(
      `${this.tablesUrl(branchId)}/free/${tableNumber}`,
      {}
    );
  }

  getBranchOrders(branchId: number, tableNumber?: number): Observable<TableOrder[]> {
    let params = new HttpParams().set('size', '200').set('sort', 'createdAt,desc');
    if (tableNumber !== undefined && tableNumber !== null) {
      params = params.set('tableNumber', tableNumber.toString());
    }
    return this.http
      .get<Page<TableOrder>>(this.ordersUrl(branchId), { params })
      .pipe(map((page) => page?.content ?? []));
  }

  changeOrderStatus(
    branchId: number,
    orderId: number,
    newStatus: string
  ): Observable<TableOrder> {
    const params = new HttpParams().set('newStatus', newStatus);
    return this.http.patch<TableOrder>(
      `${this.ordersUrl(branchId)}/${orderId}/status`,
      {},
      { params }
    );
  }
}

