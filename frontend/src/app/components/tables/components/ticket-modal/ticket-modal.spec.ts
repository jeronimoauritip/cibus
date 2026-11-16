import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketModalComponent } from './ticket-modal';

describe('TicketModalComponent', () => {
  let component: TicketModalComponent;
  let fixture: ComponentFixture<TicketModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show Cancel Order pill for active orders and emit cancelOrder, hiding it for PAID or CANCELLED', () => {
    const baseOrder = {
      id: 42,
      branchId: 1,
      tableNumber: 3,
      waiterId: 2,
      waiterFirstName: 'Carlos',
      waiterLastName: 'Gómez',
      status: 'PENDING',
      createdAt: '2026-11-16T12:00:00',
      subtotal: 1500,
      discount: 0,
      finalTotal: 1500,
      remainingAmount: 1500,
      items: [],
    };

    const el = fixture.nativeElement as HTMLElement;

    for (const status of ['PENDING', 'PREPARING', 'SERVED']) {
      fixture.componentRef.setInput('ticket', { ...baseOrder, status });
      fixture.detectChanges();
      const cancelBtn = el.querySelector('.btn-cancel-ticket-pill') as HTMLButtonElement | null;
      expect(cancelBtn).not.toBeNull();
      expect(cancelBtn?.textContent?.trim()).toBe('Cancel Order');
    }

    let emittedId: number | null = null;
    component.cancelOrder.subscribe((o) => (emittedId = o.id));
    (el.querySelector('.btn-cancel-ticket-pill') as HTMLButtonElement).click();
    expect(emittedId).toBe(42);

    for (const status of ['PAID', 'CANCELLED']) {
      fixture.componentRef.setInput('ticket', { ...baseOrder, status });
      fixture.detectChanges();
      expect(el.querySelector('.btn-cancel-ticket-pill')).toBeNull();
    }
  });
});

