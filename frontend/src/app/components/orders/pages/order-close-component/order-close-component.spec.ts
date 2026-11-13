import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../../Auth/services/auth-service';
import { OrderResponse } from '../../models/order-response';
import { OrderCloseComponent } from './order-close-component';

describe('OrderCloseComponent', () => {
  let component: OrderCloseComponent;
  let fixture: ComponentFixture<OrderCloseComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockOrder = (overrides: Partial<OrderResponse> = {}): OrderResponse => ({
    id: 10,
    branchId: 1,
    branchName: 'Sucursal Centro',
    tableNumber: 3,
    waiterId: 2,
    waiterFirstName: 'Carlos',
    waiterLastName: 'Gómez',
    status: 'READY',
    createdAt: '2026-11-13T12:00:00',
    closedAt: null,
    subtotal: 1500,
    discount: 0,
    finalTotal: 1500,
    remainingAmount: 1500,
    items: [],
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
              paramMap: convertToParamMap({ tableNumber: '3', orderId: '10' }),
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

  it('should load order and payment methods and transition to receipt upon closing', () => {
    const orderReq = httpMock.expectOne('/api/branches/1/orders/10');
    orderReq.flush(mockOrder());

    const methodsReq = httpMock.expectOne('/api/payment-methods');
    methodsReq.flush([{ id: 1, name: 'EFECTIVO' }]);

    fixture.detectChanges();
    expect(component.loading()).toBe(false);
    expect(component.order()?.id).toBe(10);
    expect(component.closedOrder()).toBeNull();

    component.onConfirmPayment({
      payments: [{ paymentMethodId: 1, amount: 1500 }],
      discount: 0,
    });

    const serveReq = httpMock.expectOne('/api/branches/1/orders/10/serve');
    serveReq.flush(mockOrder({ status: 'SERVED' }));

    const payReq = httpMock.expectOne('/api/branches/1/orders/10/payments');
    payReq.flush({ paymentMethodId: 1, amount: 1500 });

    const finalReq = httpMock.expectOne('/api/branches/1/orders/10');
    finalReq.flush(
      mockOrder({
        status: 'PAID',
        closedAt: '2026-11-13T13:00:00',
        remainingAmount: 0,
      })
    );

    fixture.detectChanges();
    expect(component.closedOrder()?.status).toBe('PAID');
    expect(component.appliedPayments()).toEqual([{ paymentMethodId: 1, amount: 1500 }]);

    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.onFinishAndFreeTable();

    const freeReq = httpMock.expectOne('/api/branches/1/tables/free/3');
    expect(freeReq.request.method).toBe('PATCH');
    freeReq.flush({ id: 3, number: 3, available: true, waiterId: null });

    expect(navSpy).toHaveBeenCalledWith(['/tables']);
  });
});

