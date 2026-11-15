import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableBill } from '../../models/table-bill';
import { TicketPreviewComponent } from './ticket-preview-component';

describe('TicketPreviewComponent', () => {
  let component: TicketPreviewComponent;
  let fixture: ComponentFixture<TicketPreviewComponent>;

  const mockBill: TableBill = {
    branchId: 1,
    branchName: 'Sucursal Centro',
    tableNumber: 4,
    waiterId: 2,
    waiterFirstName: 'Carlos',
    waiterLastName: 'Gómez',
    openedAt: '2026-11-13T12:00:00',
    closedAt: null,
    allServed: true,
    subtotal: 3500,
    discount: 100,
    finalTotal: 3400,
    totalPaid: 0,
    remainingAmount: 3400,
    payments: [],
    orders: [
      {
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
      },
      {
        id: 16,
        branchId: 1,
        branchName: 'Sucursal Centro',
        tableNumber: 4,
        waiterId: 2,
        waiterFirstName: 'Carlos',
        waiterLastName: 'Gómez',
        status: 'SERVED',
        createdAt: '2026-11-13T12:20:00',
        closedAt: null,
        subtotal: 1000,
        discount: 0,
        finalTotal: 1000,
        remainingAmount: 1000,
        items: [
          {
            productId: 2,
            productName: 'Agua Mineral',
            quantity: 1,
            unitPrice: 1000,
            subtotal: 1000,
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketPreviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketPreviewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('bill', mockBill);
    fixture.detectChanges();
  });

  it('should create and calculate live consolidated totals with draft discount', () => {
    expect(component).toBeTruthy();
    expect(component.orderIdsLabel()).toBe('#15, #16');
    expect(component.totalItemsCount()).toBe(2);
    expect(component.totalDiscount()).toBe(100);
    expect(component.netTotal()).toBe(3400);
    expect(component.netRemaining()).toBe(3400);

    fixture.componentRef.setInput('draftDiscount', 400);
    fixture.detectChanges();

    expect(component.totalDiscount()).toBe(500);
    expect(component.netTotal()).toBe(3000);
    expect(component.netRemaining()).toBe(3000);
  });
});

