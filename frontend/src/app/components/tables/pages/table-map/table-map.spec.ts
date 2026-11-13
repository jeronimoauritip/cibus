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

  it('should expand trash pill next to close button and show distinct confirmation modals for Free Table vs Cancel Order', () => {
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
    expect(el.textContent ?? '').not.toContain('Guests');
    expect(el.textContent ?? '').not.toContain('Floor & Kitchen State');
    expect(el.querySelector('.drawer-subtitle')?.textContent?.trim()).toBe('Occupied at: 12:41 PM');

    const trashBtn = el.querySelector('.btn-header-trash') as HTMLButtonElement;
    expect(trashBtn).toBeTruthy();
    expect(trashBtn.classList.contains('expanded')).toBe(false);
    expect(el.querySelector('.trash-label')?.textContent?.trim()).toBe('Free Table');

    // First click expands the pill
    trashBtn.click();
    fixture.detectChanges();
    expect(trashBtn.classList.contains('expanded')).toBe(true);
    expect(component.headerActionConfirmType()).toBeNull();

    // Second click opens Free Table confirmation modal (no cancellation warning)
    trashBtn.click();
    fixture.detectChanges();
    expect(component.headerActionConfirmType()).toBe('free-table');
    expect(el.querySelector('#header-action-confirm-title')?.textContent?.trim()).toBe(
      'Free Table #4?'
    );
    expect(el.querySelector('.delete-confirm-subtitle')?.textContent?.trim()).not.toContain(
      'CANCELLED'
    );

    component.dismissHeaderActionConfirm();
    fixture.detectChanges();

    // Now simulate an active order on the table
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

    expect(el.querySelector('.trash-label')?.textContent?.trim()).toBe('Cancel Order');

    // First click expands, second click opens Cancel Order confirmation modal with CANCELLED warning
    trashBtn.click();
    fixture.detectChanges();
    expect(trashBtn.classList.contains('expanded')).toBe(true);

    trashBtn.click();
    fixture.detectChanges();
    expect(component.headerActionConfirmType()).toBe('cancel-order');
    expect(el.querySelector('#header-action-confirm-title')?.textContent?.trim()).toBe(
      'Cancel Order #88?'
    );
    expect(el.querySelector('.delete-confirm-subtitle')?.textContent?.trim()).toContain(
      'CANCELLED'
    );

    const confirmBtn = el.querySelector('.btn-delete-confirm') as HTMLButtonElement;
    confirmBtn.click();

    const cancelReq = httpMock.expectOne('/api/branches/2/orders/88/cancel');
    expect(cancelReq.request.method).toBe('POST');
    cancelReq.flush({ ...component.branchOrders()[0], status: 'CANCELLED' });

    fixture.detectChanges();
    expect(component.headerActionConfirmType()).toBeNull();
    expect(el.querySelector('.trash-label')?.textContent?.trim()).toBe('Free Table');
  });
});
