import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MetricsFilter } from '../models/metrics-filter';
import { OrderInsight } from '../models/order-insight';
import { ProductInsight } from '../models/product-insight';
import { WaiterInsight } from '../models/waiter-insight';
@Injectable({ providedIn: 'root' })
export class MetricsService {
    private readonly url = '/api/statistics';

    getProductsReport(filter: () => MetricsFilter) {
        return httpResource<ProductInsight>(() => this.buildRequest('products', filter()));
    }

    getOrdersReport(filter: () => MetricsFilter) {
        return httpResource<OrderInsight>(() => this.buildRequest('orders', filter()));
    }
    getWaitersReport(filter: () => MetricsFilter) {
        return httpResource<WaiterInsight>(() => this.buildRequest('waiters', filter()));
    }


    private buildRequest(report: string, filter: MetricsFilter) {
        const scope = filter.branchId !== undefined ? `branch/${filter.branchId}` : 'global';
        return {
            url: `${this.url}/${scope}/${report}`,
            params: this.buildDateParams(filter),
        };
    }

    private buildDateParams({ start, end }: MetricsFilter): Record<string, string> {
        const params: Record<string, string> = {};
        if (start) {
            params['start'] = this.toLocalDateTime(start);
        }
        if (end) {
            params['end'] = this.toLocalDateTime(end);
        }
        return params;
    }

    
    private toLocalDateTime(date: Date): string {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
            + `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }
}
