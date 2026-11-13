import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../../Auth/services/auth-service';
import { OrderCreationComponent } from './order-creation-component';

describe('OrderCreationComponent', () => {
  let component: OrderCreationComponent;
  let fixture: ComponentFixture<OrderCreationComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderCreationComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ tableNumber: '4' }),
              queryParamMap: convertToParamMap({ branchId: '1', waiterId: '2' }),
            },
          },
        },
        {
          provide: AuthService,
          useValue: {
            user: () => ({ id: 2, branchId: 1, role: { role: 'Waiter' } }),
            isAdmin: () => false,
            ensureProfileLoaded: () => of({ id: 2, branchId: 1, role: { role: 'Waiter' } }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderCreationComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load menu products solely from branch products endpoint and map nested product DTOs', async () => {
    const req = httpMock.expectOne('/api/branches/1/products?page=0&size=200&isGlobalProductActive=true');
    req.flush({
      content: [
        {
          id: 11,
          available: true,
          price: 4500,
          branchId: 1,
          branchName: 'Centro',
          product: {
            id: 101,
            name: 'Milanesa',
            description: 'Con papas fritas',
            categoryName: 'Platos',
            active: true,
          },
        },
        {
          id: 12,
          available: true,
          price: 1200,
          branchId: 1,
          branchName: 'Centro',
          product: {
            id: 102,
            name: 'Producto inactivo',
            categoryName: 'Platos',
            active: false,
          },
        },
      ],
    });

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.menuProducts()).toEqual([
      {
        id: 101,
        name: 'Milanesa',
        description: 'Con papas fritas',
        categoryName: 'Platos',
        active: true,
        price: 4500,
        available: true,
      },
    ]);
    expect(fixture.nativeElement.textContent).toContain('Milanesa');
    expect(fixture.nativeElement.textContent).not.toContain('Producto inactivo');
  });
});
