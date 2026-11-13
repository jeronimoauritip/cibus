import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderResponse } from '../../models/order-response';
import { ReceiptComponent } from './receipt-component';

describe('ReceiptComponent', () => {
  let component: ReceiptComponent;
  let fixture: ComponentFixture<ReceiptComponent>;

  const paidOrder: OrderResponse = {
    id: 22,
    branchId: 1,
    branchName: 'Sucursal Centro',
    tableNumber: 2,
    waiterId: 2,
    waiterFirstName: 'Carlos',
    waiterLastName: 'Gómez',
    status: 'PAID',
    createdAt: '2026-11-13T12:00:00',
    closedAt: '2026-11-13T13:15:00',
    subtotal: 2000,
    discount: 200,
    finalTotal: 1800,
    remainingAmount: 0,
    items: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiptComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceiptComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('order', paidOrder);
    fixture.componentRef.setInput('payments', [
      { paymentMethodId: 1, amount: 1000 },
      { paymentMethodId: 2, amount: 800 },
    ]);
    fixture.componentRef.setInput('paymentMethods', [
      { id: 1, name: 'EFECTIVO' },
      { id: 2, name: 'CREDITO' },
    ]);
    fixture.detectChanges();
  });

  it('should map payment method names in breakdown and emit finish events', () => {
    expect(component).toBeTruthy();
    expect(component.paymentBreakdown()).toEqual([
      { methodName: 'EFECTIVO', amount: 1000 },
      { methodName: 'CREDITO', amount: 800 },
    ]);

    let freeCount = 0;
    component.finishAndFreeTable.subscribe(() => freeCount++);
    component.onFinishAndFreeTable();
    expect(freeCount).toBe(1);
  });
});

