import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderResponse } from '../../models/order-response';
import { TicketPreviewComponent } from './ticket-preview-component';

describe('TicketPreviewComponent', () => {
  let component: TicketPreviewComponent;
  let fixture: ComponentFixture<TicketPreviewComponent>;

  const mockOrder: OrderResponse = {
    id: 15,
    branchId: 1,
    branchName: 'Sucursal Centro',
    tableNumber: 4,
    waiterId: 2,
    waiterFirstName: 'Carlos',
    waiterLastName: 'Gómez',
    status: 'SERVED',
    createdAt: '2026-11-13T12:00:00',
    closedAt: null,
    subtotal: 2500,
    discount: 100,
    finalTotal: 2400,
    remainingAmount: 2400,
    items: [
      {
        productId: 1,
        productName: 'Hamburguesa Doble Cibus',
        quantity: 2,
        unitPrice: 1250,
        subtotal: 2500,
        observation: 'Sin cebolla',
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketPreviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketPreviewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('order', mockOrder);
    fixture.detectChanges();
  });

  it('should create and calculate live totals with draft discount', () => {
    expect(component).toBeTruthy();
    expect(component.totalDiscount()).toBe(100);
    expect(component.netTotal()).toBe(2400);
    expect(component.netRemaining()).toBe(2400);

    fixture.componentRef.setInput('draftDiscount', 400);
    fixture.detectChanges();

    expect(component.totalDiscount()).toBe(500);
    expect(component.netTotal()).toBe(2000);
    expect(component.netRemaining()).toBe(2000);
  });
});

