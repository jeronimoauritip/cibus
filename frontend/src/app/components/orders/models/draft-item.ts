import { OrderDetail } from './order-detail';

export interface DraftItem extends OrderDetail {
    lineId: number;
}
