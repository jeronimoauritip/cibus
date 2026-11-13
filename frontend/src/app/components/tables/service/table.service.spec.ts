import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TableService } from './table.service';

describe('TableService', () => {
  let service: TableService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TableService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call POST .../serve when changing order status to SERVED', () => {
    service.changeOrderStatus(1, 42, 'SERVED').subscribe();
    const req = httpMock.expectOne('/api/branches/1/orders/42/serve');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 42, status: 'SERVED' });
  });
});
