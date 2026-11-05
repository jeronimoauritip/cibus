import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { OrderResponse } from '../../models/order-response';

@Component({
  selector: 'app-kitchen-order-card',
  imports: [DatePipe],
  templateUrl: './kitchen-order-card-component.html',
  styleUrl: './kitchen-order-card-component.css'
})
export class KitchenOrderCardComponent {
  readonly order = input.required<OrderResponse>();
  readonly showAction = input(true);
  readonly ready = output<number>();

  onReady(): void {
    this.ready.emit(this.order().id);
  }
}
