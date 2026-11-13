import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../../../Auth/services/auth-service';
import { TableMapComponent } from './table-map';

describe('TableMapComponent', () => {
  let component: TableMapComponent;
  let fixture: ComponentFixture<TableMapComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableMapComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TableMapComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should only allow switching branch when user is admin and multiple branches exist', () => {
    expect(component.canSwitchBranch()).toBe(false);

    component.branches.set([
      { id: 1, name: 'Palermo' } as any,
      { id: 2, name: 'Recoleta' } as any,
    ]);
    expect(component.canSwitchBranch()).toBe(false);
  });

  it('should navigate to order creation and order close with branchId query param', () => {
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.activeBranchId.set(2);

    const table = {
      id: 5,
      number: 3,
      capacity: 4,
      available: false,
      posX: 100,
      posY: 100,
      waiterId: 7,
      branchId: 2,
    };

    component.goToNewOrder(table);
    expect(navSpy).toHaveBeenCalledWith(['/tables', 3, 'order'], {
      queryParams: { branchId: 2, waiterId: 7 },
    });

    component.goToCloseOrder(table, 99);
    expect(navSpy).toHaveBeenCalledWith(['/tables', 3, 'order', 99, 'close'], {
      queryParams: { branchId: 2 },
    });
  });

  it('should display Occupied at in 12h format, remove Guests & Floor & Kitchen State, and switch between Free and Cancel Order', () => {
    const auth = TestBed.inject(AuthService) as any;
    auth._user.set({ id: 7, branchId: 2, role: { role: 'Waiter' } });

    component.activeBranchId.set(2);
    const table = {
      id: 5,
      number: 4,
      capacity: 4,
      available: false,
      posX: 100,
      posY: 100,
      waiterId: 7,
      branchId: 2,
    };
    component.tables.set([table]);
    component.tableOccupiedAt.set({ 4: '2026-11-13T12:41:00' });
    component.selectedTableNumber.set(4);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const text = el.textContent ?? '';
    expect(text).not.toContain('Guests');
    expect(text).not.toContain('Floor & Kitchen State');
    expect(el.querySelector('.drawer-subtitle')?.textContent?.trim()).toBe('Occupied at: 12:41 PM');
    expect(el.querySelector('.btn-header-danger')?.textContent?.trim()).toBe('Free');

    component.branchOrders.set([
      {
        id: 88,
        branchId: 2,
        branchName: 'Sucursal Norte',
        tableNumber: 4,
        waiterId: 7,
        waiterFirstName: 'Martina',
        waiterLastName: 'Romero',
        status: 'PREPARING',
        createdAt: '2026-11-13T12:45:00',
        subtotal: 1000,
        discount: 0,
        finalTotal: 1000,
        remainingAmount: 1000,
        items: [],
      },
    ]);
    fixture.detectChanges();

    const cancelBtn = el.querySelector('.btn-header-danger') as HTMLButtonElement;
    expect(cancelBtn.textContent?.trim()).toBe('Cancel Order');

    cancelBtn.click();
    const cancelReq = httpMock.expectOne('/api/branches/2/orders/88/cancel');
    expect(cancelReq.request.method).toBe('POST');
    cancelReq.flush({ ...component.branchOrders()[0], status: 'CANCELLED' });

    fixture.detectChanges();
    expect(el.querySelector('.btn-header-danger')?.textContent?.trim()).toBe('Free');
  });
});
