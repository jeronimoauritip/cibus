import { WaiterMetric } from "./waiter-metric";

export interface WaiterInsight {
    facturationRanking: WaiterMetric[];
    ordersQuantityRanking: WaiterMetric[];
    averageOrdersPerWaiter: number;
}
