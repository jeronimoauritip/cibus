import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../../Auth/services/auth-service';
import { TableBill } from '../../models/table-bill';
import { OrderCloseComponent } from './order-close-component';

describe('OrderCloseComponent', () => {
  let component: OrderCloseComponent;
  let fixture: ComponentFixture<OrderCloseComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockBill = (overrides: Partial<TableBill> = {}): TableBill => ({
    branchId: 1,
    branchName: 'Sucursal Centro',
    tableNumber: 3,
    waiterId: 2,
    waiterFirstName: 'Carlos',
    waiterLastName: 'Gómez',
    openedAt: '2026-11-13T12:00:00',
    closedAt: null,
    allServed: true,
    subtotal: 1500,
    discount: 0,
    finalTotal: 1500,
    totalPaid: 0,
    remainingAmount: 1500,
    payments: [],
    orders: [
      {
        id: 10,
        branchId: 1,
        branchName: 'Sucursal Centro',
        tableNumber: 3,
        waiterId: 2,
        waiterFirstName: 'Carlos',
        waiterLastName: 'Gómez',
        status: 'SERVED',
        createdAt: '2026-11-13T12:00:00',
        closedAt: null,
        subtotal: 1500,
        discount: 0,
        finalTotal: 1500,
        remainingAmount: 1500,
        items: [],
      },
    ],
    ...overrides,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderCloseComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ tableNumber: '3' }),
              queryParamMap: convertToParamMap({ branchId: '1' }),
            },
          },
        },
        {
          provide: AuthService,
          useValue: {
            isAdmin: () => false,
            ensureProfileLoaded: () =>
              of({
                id: 2,
                branchId: 1,
                role: { role: 'Waiter' },
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderCloseComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load table bill and payment methods and transition to receipt upon checkout', () => {
    const billReq = httpMock.expectOne('/api/branches/1/tables/3/bill');
    expect(billReq.request.method).toBe('GET');
    billReq.flush(mockBill({ allServed: true }));

    const methodsReq = httpMock.expectOne('/api/payment-methods');
    methodsReq.flush([{ id: 1, name: 'EFECTIVO' }]);

    fixture.detectChanges();
    expect(component.loading()).toBe(false);
    expect(component.bill()?.tableNumber).toBe(3);
    expect(component.closedBill()).toBeNull();

    component.onConfirmPayment({
      payments: [{ paymentMethodId: 1, amount: 1500 }],
      discount: 0,
    });

    const checkoutReq = httpMock.expectOne('/api/branches/1/tables/3/checkout');
    expect(checkoutReq.request.method).toBe('POST');
    expect(checkoutReq.request.body).toEqual({
      orderIds: [10],
      discount: 0,
      payments: [{ paymentMethodId: 1, amount: 1500 }],
    });
    checkoutReq.flush(
      mockBill({
        closedAt: '2026-11-13T13:00:00',
        totalPaid: 1500,
        remainingAmount: 0,
        payments: [{ paymentMethodId: 1, amount: 1500 }],
        orders: [
          {
            ...mockBill().orders[0],
            status: 'PAID',
            closedAt: '2026-11-13T13:00:00',
            remainingAmount: 0,
          },
        ],
      })
    );

    fixture.detectChanges();
    expect(component.closedBill()?.remainingAmount).toBe(0);
    expect(component.appliedPayments()).toEqual([{ paymentMethodId: 1, amount: 1500 }]);

    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.onFinishAndFreeTable();

    const freeReq = httpMock.expectOne('/api/branches/1/tables/free/3');
    expect(freeReq.request.method).toBe('PATCH');
    freeReq.flush({ id: 3, number: 3, available: true, waiterId: null });

    expect(navSpy).toHaveBeenCalledWith(['/tables']);
  });

  it('should block charging a table when not all orders are SERVED', () => {
    const billReq = httpMock.expectOne('/api/branches/1/tables/3/bill');
    billReq.flush(
      mockBill({
        allServed: false,
        orders: [{ ...mockBill().orders[0], status: 'READY' }],
      })
    );

    const methodsReq = httpMock.expectOne('/api/payment-methods');
    methodsReq.flush([{ id: 1, name: 'EFECTIVO' }]);

    fixture.detectChanges();
    expect(component.loading()).toBe(false);
    expect(component.loadError()).toContain('All orders must be served');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-payment')).toBeNull();
    expect(el.querySelector('[role="alert"]')?.textContent).toContain(
      'All orders must be served'
    );
  });
});

