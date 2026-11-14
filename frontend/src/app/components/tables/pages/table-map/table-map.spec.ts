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
    component.isLoading.set(false);
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

  it('should display PENDING when an order is created and PREPARING when kitchen starts preparing', () => {
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
    component.isLoading.set(false);
    component.tables.set([table]);
    component.branchOrders.set([
      {
        id: 88,
        branchId: 2,
        branchName: 'Sucursal Norte',
        tableNumber: 4,
        waiterId: 7,
        waiterFirstName: 'Martina',
        waiterLastName: 'Romero',
        status: 'PENDING',
        createdAt: '2026-11-13T12:45:00',
        subtotal: 1000,
        discount: 0,
        finalTotal: 1000,
        remainingAmount: 1000,
        items: [],
      },
    ]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(component.getTableVisualState(table)).toBe('pending');
    expect(el.querySelector('.table-node')?.classList.contains('state-pending')).toBe(true);
    expect(el.querySelector('.t-badge')?.textContent?.trim()).toBe('PENDING');

    component.branchOrders.set([
      { ...component.branchOrders()[0], status: 'PREPARING' },
    ]);
    fixture.detectChanges();

    expect(component.getTableVisualState(table)).toBe('preparing');
    expect(el.querySelector('.table-node')?.classList.contains('state-preparing')).toBe(true);
    expect(el.querySelector('.t-badge')?.textContent?.trim()).toBe('PREPARING');
  });

  it('should omit the readonly banner and show a disabled "TABLE NOT ASSIGNED TO YOU" footer button for waiter on free or other-waiter tables', () => {
    const auth = TestBed.inject(AuthService) as any;
    auth._user.set({ id: 7, branchId: 2, role: { role: 'Waiter' } });

    component.activeBranchId.set(2);
    component.isLoading.set(false);
    component.tables.set([
      {
        id: 1,
        number: 1,
        capacity: 4,
        available: true,
        posX: 100,
        posY: 100,
        waiterId: null,
        branchId: 2,
      },
      {
        id: 2,
        number: 2,
        capacity: 4,
        available: false,
        posX: 220,
        posY: 100,
        waiterId: 99,
        branchId: 2,
      },
      {
        id: 3,
        number: 3,
        capacity: 4,
        available: false,
        posX: 340,
        posY: 100,
        waiterId: 7,
        branchId: 2,
      },
    ]);

    const el = fixture.nativeElement as HTMLElement;

    // 1. Free table
    component.selectedTableNumber.set(1);
    fixture.detectChanges();
    expect(el.querySelector('.role-readonly-banner')).toBeNull();
    const freeFooterBtn = el.querySelector('.drawer-footer button') as HTMLButtonElement;
    expect(freeFooterBtn).toBeTruthy();
    expect(freeFooterBtn.disabled).toBe(true);
    expect(freeFooterBtn.textContent?.trim()).toBe('TABLE NOT ASSIGNED TO YOU');

    // 2. Occupied table assigned to another waiter
    component.selectedTableNumber.set(2);
    fixture.detectChanges();
    expect(el.querySelector('.role-readonly-banner')).toBeNull();
    const otherFooterBtn = el.querySelector('.drawer-footer button') as HTMLButtonElement;
    expect(otherFooterBtn).toBeTruthy();
    expect(otherFooterBtn.disabled).toBe(true);
    expect(otherFooterBtn.textContent?.trim()).toBe('TABLE NOT ASSIGNED TO YOU');

    // 3. Occupied table assigned to this waiter
    component.selectedTableNumber.set(3);
    fixture.detectChanges();
    const ownFooterBtn = el.querySelector('.drawer-footer button') as HTMLButtonElement;
    expect(ownFooterBtn).toBeTruthy();
    expect(ownFooterBtn.disabled).toBe(false);
    expect(ownFooterBtn.textContent?.trim()).toBe('NEW ORDER');
  });

  it('should show split NEW ORDER + PAY TABLE buttons once an active order exists, keep PAY TABLE opaque if unserved, and show modal on click', () => {
    const auth = TestBed.inject(AuthService) as any;
    auth._user.set({ id: 7, branchId: 2, role: { role: 'Waiter' } });
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.activeBranchId.set(2);
    component.isLoading.set(false);
    component.tables.set([
      {
        id: 5,
        number: 4,
        capacity: 4,
        available: false,
        posX: 100,
        posY: 100,
        waiterId: 7,
        branchId: 2,
      },
    ]);
    component.branchOrders.set([
      {
        id: 88,
        branchId: 2,
        branchName: 'Sucursal Norte',
        tableNumber: 4,
        waiterId: 7,
        waiterFirstName: 'Martina',
        waiterLastName: 'Romero',
        status: 'READY',
        createdAt: '2026-11-13T12:45:00',
        subtotal: 1000,
        discount: 0,
        finalTotal: 1000,
        remainingAmount: 1000,
        items: [],
      },
    ]);
    component.selectedTableNumber.set(4);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const splitButtons = Array.from(
      el.querySelectorAll('.drawer-footer-split .btn-order-pill-trigger')
    ) as HTMLButtonElement[];
    expect(splitButtons.length).toBe(2);

    const [newOrderBtn, payTableBtn] = splitButtons;
    expect(newOrderBtn.textContent?.trim()).toBe('NEW ORDER');
    expect(newOrderBtn.disabled).toBe(false);
    expect(payTableBtn.textContent?.trim()).toBe('PAY ORDER');
    expect(payTableBtn.disabled).toBe(false);
    expect(payTableBtn.classList.contains('btn-order-pill-trigger--unserved')).toBe(true);

    // Clicking left NEW ORDER allows creating an additional order
    newOrderBtn.click();
    expect(navSpy).toHaveBeenCalledWith(['/tables', 4, 'order'], {
      queryParams: { branchId: 2, waiterId: 7 },
    });
    navSpy.mockClear();

    // Clicking unserved PAY TABLE opens warning modal and does not navigate
    payTableBtn.click();
    fixture.detectChanges();
    expect(navSpy).not.toHaveBeenCalled();
    expect(component.isUnservedOrderModalOpen()).toBe(true);
    expect(el.querySelector('#unserved-order-modal-title')?.textContent?.trim()).toBe(
      'Orders Not Served Yet'
    );
    expect(el.querySelector('.unserved-modal-subtitle')?.textContent?.trim()).toContain(
      'All orders must be served'
    );

    const okBtn = el.querySelector('.btn-unserved-ok') as HTMLButtonElement;
    okBtn.click();
    fixture.detectChanges();
    expect(component.isUnservedOrderModalOpen()).toBe(false);

    // Once order is SERVED, PAY ORDER is no longer opaque and navigates on click
    component.branchOrders.set([
      { ...component.branchOrders()[0], status: 'SERVED' },
    ]);
    fixture.detectChanges();

    expect(payTableBtn.textContent?.trim()).toBe('PAY ORDER');
    expect(payTableBtn.classList.contains('btn-order-pill-trigger--unserved')).toBe(false);

    // When 2+ active orders exist, button label becomes PAY ORDERS
    component.branchOrders.set([
      { ...component.branchOrders()[0], status: 'SERVED' },
      { ...component.branchOrders()[0], id: 89, status: 'SERVED' },
    ]);
    fixture.detectChanges();
    expect(payTableBtn.textContent?.trim()).toBe('PAY ORDERS');

    payTableBtn.click();
    fixture.detectChanges();
    expect(component.isUnservedOrderModalOpen()).toBe(false);
    expect(navSpy).toHaveBeenCalledWith(['/tables', 4, 'order', 88, 'close'], {
      queryParams: { branchId: 2 },
    });
  });

  it('should pan freely while dragging, snap back to center in Locked mode, stay panned in Free mode, and recenter on zoom', () => {
    component.isLoading.set(false);
    component.errorMessage.set(null);
    component.tables.set([]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const stage = el.querySelector('.floor-stage') as HTMLElement;
    expect(stage).toBeTruthy();

    // Default is Map View: Locked
    expect(component.isMapViewFree()).toBe(false);
    expect(el.querySelector('.circle-dropdown')?.textContent).toContain('Map View: Locked');

    // Drag in Locked mode -> moves during drag, snaps back on release
    component.onStagePointerDown({
      pointerType: 'mouse',
      button: 0,
      clientX: 100,
      clientY: 100,
      target: stage,
    } as unknown as PointerEvent);
    component.onWindowPointerMove({ clientX: 220, clientY: 160 } as PointerEvent);
    expect(component.isPanning()).toBe(true);
    expect(component.panX()).toBe(120);
    expect(component.panY()).toBe(60);

    component.onWindowPointerUp();
    expect(component.isPanning()).toBe(false);
    expect(component.panX()).toBe(0);
    expect(component.panY()).toBe(0);

    // Toggle to Map View: Free via menu button
    const mapViewBtn = Array.from(
      el.querySelectorAll('.circle-dropdown .dropdown-action-btn')
    ).find((b) => b.textContent?.includes('Map View:')) as HTMLButtonElement;
    expect(mapViewBtn).toBeTruthy();
    mapViewBtn.click();
    fixture.detectChanges();

    expect(component.isMapViewFree()).toBe(true);
    expect(mapViewBtn.textContent).toContain('Map View: Free');

    // Drag in Free mode -> stays at new position on release
    component.onStagePointerDown({
      pointerType: 'mouse',
      button: 0,
      clientX: 100,
      clientY: 100,
      target: stage,
    } as unknown as PointerEvent);
    component.onWindowPointerMove({ clientX: 250, clientY: 190 } as PointerEvent);
    component.onWindowPointerUp();
    expect(component.panX()).toBe(150);
    expect(component.panY()).toBe(90);

    // Pressing any zoom button recenters the map
    component.adjustZoom(0.1);
    expect(component.panX()).toBe(0);
    expect(component.panY()).toBe(0);

    // Pan again, then test preset + fit zoom recenter, and toggling back to Locked recenters
    component.panX.set(80);
    component.panY.set(-40);
    component.setZoomPreset(0.75);
    expect(component.panX()).toBe(0);
    expect(component.panY()).toBe(0);

    component.panX.set(80);
    component.panY.set(-40);
    component.fitZoomToViewport();
    expect(component.panX()).toBe(0);
    expect(component.panY()).toBe(0);

    component.panX.set(60);
    component.panY.set(30);
    mapViewBtn.click();
    fixture.detectChanges();
    expect(component.isMapViewFree()).toBe(false);
    expect(component.panX()).toBe(0);
    expect(component.panY()).toBe(0);
  });

  it('should open delete confirmation modal and delete a free table (even with PAID history) on Tap to delete, and show error modal when occupied', () => {
    const auth = TestBed.inject(AuthService) as any;
    auth._user.set({ id: 1, branchId: 2, role: { role: 'Admin' } });

    component.activeBranchId.set(2);
    component.isLoading.set(false);
    component.tables.set([
      {
        id: 10,
        number: 1,
        capacity: 4,
        available: true,
        posX: 100,
        posY: 100,
        waiterId: null,
        branchId: 2,
      },
      {
        id: 11,
        number: 2,
        capacity: 4,
        available: false,
        posX: 260,
        posY: 100,
        waiterId: 7,
        branchId: 2,
      },
    ]);
    component.branchOrders.set([
      {
        id: 50,
        branchId: 2,
        branchName: 'Sucursal Norte',
        tableNumber: 1,
        waiterId: 7,
        waiterFirstName: 'Martina',
        waiterLastName: 'Romero',
        status: 'PAID',
        createdAt: '2026-11-13T11:00:00',
        subtotal: 500,
        discount: 0,
        finalTotal: 500,
        remainingAmount: 0,
        items: [],
      },
    ]);
    component.isEditMode.set(true);
    component.isDeleteMode.set(true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const tableNodes = Array.from(el.querySelectorAll('.table-node')) as HTMLElement[];
    expect(tableNodes.length).toBe(2);

    // Clicking occupied table #2 opens informative modal instead of silently doing nothing
    tableNodes[1].click();
    fixture.detectChanges();
    expect(component.isDeleteConfirmModalOpen()).toBe(true);
    expect(el.querySelector('#delete-confirm-title')?.textContent?.trim()).toBe(
      'Cannot Delete Table #2'
    );
    expect(el.querySelector('.delete-confirm-subtitle')?.textContent).toContain('occupied');
    (el.querySelector('.btn-delete-cancel') as HTMLButtonElement).click();
    fixture.detectChanges();

    // Pointerdown on table #1 in delete mode does NOT start dragging, and click opens confirmation modal
    component.onTablePointerDown(component.tables()[0], {
      stopPropagation: () => {},
    } as unknown as PointerEvent);
    expect(component.draggingTableNumber()).toBeNull();

    tableNodes[0].click();
    fixture.detectChanges();
    expect(component.isDeleteConfirmModalOpen()).toBe(true);
    expect(component.deleteErrorMessage()).toBeNull();
    expect(el.querySelector('#delete-confirm-title')?.textContent?.trim()).toBe(
      'Do you want to delete Table #1?'
    );

    const confirmBtn = el.querySelector('.btn-delete-confirm') as HTMLButtonElement;
    confirmBtn.click();

    const delReq = httpMock.expectOne('/api/branches/2/tables/1');
    expect(delReq.request.method).toBe('DELETE');
    delReq.flush(null);

    fixture.detectChanges();
    expect(component.isDeleteConfirmModalOpen()).toBe(false);
    expect(component.tables().map((t) => t.number)).toEqual([2]);
  });

  it('should display MARK AS SERVED pill above split footer only when a READY order exists, call /serve, and collapse to SERVED', () => {
    const auth = TestBed.inject(AuthService) as any;
    auth._user.set({ id: 7, branchId: 2, role: { role: 'Waiter' } });

    component.activeBranchId.set(2);
    component.isLoading.set(false);
    component.tables.set([
      {
        id: 5,
        number: 4,
        capacity: 4,
        available: false,
        posX: 100,
        posY: 100,
        waiterId: 7,
        branchId: 2,
      },
    ]);
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
        items: [{ productId: 10, productName: 'Burger', quantity: 1, unitPrice: 1000, subtotal: 1000 }],
      },
    ]);
    component.selectedTableNumber.set(4);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const collapseBox = el.querySelector('.drawer-footer .mark-served-collapse') as HTMLElement;
    const markServedBtn = el.querySelector('.btn-order-pill-trigger--ready') as HTMLButtonElement;
    expect(collapseBox).toBeTruthy();
    expect(markServedBtn).toBeTruthy();

    // Hidden / collapsed when no order is READY
    expect(collapseBox.classList.contains('visible')).toBe(false);
    expect(collapseBox.getAttribute('aria-hidden')).toBe('true');
    expect(markServedBtn.disabled).toBe(true);
    expect(markServedBtn.getAttribute('tabindex')).toBe('-1');

    // Visible directly above split footer when an order becomes READY
    component.branchOrders.set([
      { ...component.branchOrders()[0], status: 'READY' },
    ]);
    fixture.detectChanges();

    const footerChildren = Array.from(el.querySelector('.drawer-footer')!.children);
    expect(footerChildren[0]).toBe(collapseBox);
    expect(footerChildren[1].classList.contains('drawer-footer-split')).toBe(true);
    expect(collapseBox.classList.contains('visible')).toBe(true);
    expect(collapseBox.getAttribute('aria-hidden')).toBe('false');
    expect(markServedBtn.disabled).toBe(false);
    expect(markServedBtn.textContent?.trim()).toBe('MARK AS SERVED');
    expect(component.getTableVisualState(component.tables()[0])).toBe('ready');

    // Clicking MARK AS SERVED calls /serve and smoothly collapses it
    markServedBtn.click();
    const serveReq = httpMock.expectOne('/api/branches/2/orders/88/serve');
    expect(serveReq.request.method).toBe('POST');
    serveReq.flush({
      ...component.branchOrders()[0],
      status: 'SERVED',
      items: undefined,
    });
    fixture.detectChanges();

    expect(collapseBox.classList.contains('visible')).toBe(false);
    expect(collapseBox.getAttribute('aria-hidden')).toBe('true');
    expect(component.branchOrders()[0].status).toBe('SERVED');
    expect(component.branchOrders()[0].items.length).toBe(1);
    expect(component.getTableVisualState(component.tables()[0])).toBe('served');
    expect(component.hasUnservedActiveOrder()).toBe(false);
  });
});
