import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OrderResponse } from '../models/order-response';
import { OrderService } from './order-service';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  const mockOrder = (overrides: Partial<OrderResponse> = {}): OrderResponse => ({
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
    subtotal: 1000,
    discount: 0,
    finalTotal: 1000,
    remainingAmount: 1000,
    items: [],
    ...overrides,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch an order by id and payment methods', () => {
    let orderResult: OrderResponse | undefined;
    service.getOrderById(1, 10).subscribe((res) => (orderResult = res));

    const orderReq = httpMock.expectOne('/api/branches/1/orders/10');
    expect(orderReq.request.method).toBe('GET');
    orderReq.flush(mockOrder());
    expect(orderResult?.id).toBe(10);

    let methodsCount = 0;
    service.getPaymentMethods().subscribe((res) => (methodsCount = res.length));
    const methodsReq = httpMock.expectOne('/api/payment-methods');
    expect(methodsReq.request.method).toBe('GET');
    methodsReq.flush([
      { id: 1, name: 'EFECTIVO' },
      { id: 2, name: 'CREDITO' },
    ]);
    expect(methodsCount).toBe(2);
  });

  it('should close a SERVED order with a single payment', () => {
    let closed: OrderResponse | undefined;
    service
      .closeOrder(1, 10, [{ paymentMethodId: 1, amount: 1000 }], 0, 'SERVED')
      .subscribe((res) => (closed = res));

    const payReq = httpMock.expectOne('/api/branches/1/orders/10/payments');
    expect(payReq.request.method).toBe('POST');
    expect(payReq.request.body).toEqual({ paymentMethodId: 1, amount: 1000 });
    payReq.flush({ paymentMethodId: 1, amount: 1000 });

    const finalReq = httpMock.expectOne('/api/branches/1/orders/10');
    expect(finalReq.request.method).toBe('GET');
    finalReq.flush(
      mockOrder({
        status: 'PAID',
        closedAt: '2026-11-13T13:00:00',
        remainingAmount: 0,
      })
    );

    expect(closed?.status).toBe('PAID');
    expect(closed?.remainingAmount).toBe(0);
    expect(closed?.closedAt).toBe('2026-11-13T13:00:00');
  });

  it('should transition a READY order to SERVED before applying discount and split payments sequentially', () => {
    let closed: OrderResponse | undefined;
    service
      .closeOrder(
        1,
        10,
        [
          { paymentMethodId: 1, amount: 400 },
          { paymentMethodId: 2, amount: 400 },
        ],
        200,
        'READY'
      )
      .subscribe((res) => (closed = res));

    const serveReq = httpMock.expectOne('/api/branches/1/orders/10/serve');
    expect(serveReq.request.method).toBe('POST');
    serveReq.flush(mockOrder({ status: 'SERVED' }));

    const discountReq = httpMock.expectOne('/api/branches/1/orders/10/discount');
    expect(discountReq.request.method).toBe('PATCH');
    expect(discountReq.request.body).toEqual({ amount: 200 });
    discountReq.flush(
      mockOrder({ status: 'SERVED', discount: 200, finalTotal: 800, remainingAmount: 800 })
    );

    const firstPayReq = httpMock.expectOne('/api/branches/1/orders/10/payments');
    expect(firstPayReq.request.method).toBe('POST');
    expect(firstPayReq.request.body).toEqual({ paymentMethodId: 1, amount: 400 });
    firstPayReq.flush({ paymentMethodId: 1, amount: 400 });

    const secondPayReq = httpMock.expectOne('/api/branches/1/orders/10/payments');
    expect(secondPayReq.request.method).toBe('POST');
    expect(secondPayReq.request.body).toEqual({ paymentMethodId: 2, amount: 400 });
    secondPayReq.flush({ paymentMethodId: 2, amount: 400 });

    const finalReq = httpMock.expectOne('/api/branches/1/orders/10');
    expect(finalReq.request.method).toBe('GET');
    finalReq.flush(
      mockOrder({
        status: 'PAID',
        discount: 200,
        finalTotal: 800,
        remainingAmount: 0,
        closedAt: '2026-11-13T13:05:00',
      })
    );

    expect(closed?.status).toBe('PAID');
    expect(closed?.discount).toBe(200);
    expect(closed?.finalTotal).toBe(800);
  });

  it('should reject closing an order with empty payments or non-positive amounts', () => {
    let emptyError: Error | undefined;
    service.closeOrder(1, 10, [], 0, 'SERVED').subscribe({
      error: (err: Error) => (emptyError = err),
    });
    expect(emptyError?.message).toContain('At least one payment');

    let amountError: Error | undefined;
    service
      .closeOrder(1, 10, [{ paymentMethodId: 1, amount: 0 }], 0, 'SERVED')
      .subscribe({
        error: (err: Error) => (amountError = err),
      });
    expect(amountError?.message).toContain('greater than zero');
  });
});
