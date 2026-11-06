import { OrderMetric } from "./order-metric";

export interface OrderInsight {
    totalRevenue: number;
    averageTicket: number;
    averageRevenuePerDay: number;
    highestValueOrder: OrderMetric | null;
    lowestValueOrder: OrderMetric | null;
    totalOrders: number;
}
