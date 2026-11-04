import { CommonModule, Location } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AuthService } from '../../../../Auth/services/auth-service';
import { Branch } from '../../../branches/models/branch.model';
import { BranchService } from '../../../branches/service/branch-service';
import { User } from '../../../users/user.model';
import { UserService } from '../../../users/user.service';
import { TicketModalComponent } from '../../components/ticket-modal/ticket-modal';
import { TableEditModalComponent } from '../../components/table-edit-modal/table-edit-modal';
import {
  AssignableWaiterOption,
  BranchTable,
  calculateChairs,
  ChairDistribution,
  TableFilterMode,
  TableOrder,
  TableShape,
  TableVisualState,
} from '../../models/table.model';
import { TableService } from '../../service/table.service';

@Component({
  selector: 'app-table-map',
  standalone: true,
  imports: [CommonModule, FormsModule, TicketModalComponent, TableEditModalComponent],
  templateUrl: './table-map.html',
  styleUrl: './table-map.css',
})
export class TableMapComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly authService = inject(AuthService);
  private readonly tableService = inject(TableService);
  private readonly branchService = inject(BranchService);
  private readonly userService = inject(UserService);

  @ViewChild('floorStage') floorStageRef?: ElementRef<HTMLElement>;
  @ViewChild('floorCanvas') floorCanvasRef?: ElementRef<HTMLElement>;

  // Session & Branch state
  readonly currentUser = this.authService.user;
  readonly role = this.authService.role;
  readonly branches = signal<Branch[]>([]);
  readonly activeBranchId = signal<number | null>(null);
  readonly isBranchMenuOpen = signal<boolean>(false);

  // Tables, Orders, Employees state
  readonly tables = signal<BranchTable[]>([]);
  readonly branchOrders = signal<TableOrder[]>([]);
  readonly branchUsers = signal<User[]>([]);
  readonly localVisualOverrides = signal<Record<number, TableVisualState>>({});

  // UI state
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly toastMessage = signal<string | null>(null);
  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // Map HUD & Filter state
  readonly activeFilter = signal<TableFilterMode>('all');
  readonly isCircleMenuOpen = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly isTableModalOpen = signal<boolean>(false);
  readonly isNewTableModalOpen = this.isTableModalOpen;
  readonly tableModalMode = signal<'create' | 'edit'>('create');
  readonly modalTableNumber = signal<number>(1);
  readonly modalInitialShape = signal<TableShape>('round');
  readonly modalInitialCapacity = signal<number>(4);
  readonly editingTableNumber = signal<number | null>(null);
  readonly zoomLevel = signal<number>(1);

  readonly nextNewTableNumber = computed(() => {
    const existing = this.tables().map((t) => t.number);
    return existing.length > 0 ? Math.max(...existing) + 1 : 1;
  });

  // Right Drawer & Ticket Modal state
  readonly selectedTableNumber = signal<number | null>(null);
  readonly isWaiterSelectOpen = signal<boolean>(false);
  readonly selectedTicketOrder = signal<TableOrder | null>(null);

  // Edit mode form fields for selected table
  readonly editNumber = signal<number>(1);
  readonly editCapacity = signal<number>(4);
  readonly editPosX = signal<number>(80);
  readonly editPosY = signal<number>(80);

  // Dragging state
  readonly draggingTableNumber = signal<number | null>(null);
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private dragMoved = false;

  // Role-based permissions
  readonly isAdmin = computed(() => this.role() === 'Admin');
  readonly isManager = computed(() => this.role() === 'Manager');
  readonly isHost = computed(() => this.role() === 'Host');
  readonly isWaiter = computed(() => this.role() === 'Waiter');
  readonly canSwitchBranch = computed(() => this.isAdmin() && this.branches().length > 1);

  /**
   * Only Admin (any branch) and Manager (within their assigned branch) can edit layout.
   * Host and Waiter cannot edit layout.
   */
  readonly canEditLayout = computed(() => {
    const r = this.role();
    if (r === 'Admin') return true;
    if (r === 'Manager') {
      const userBranchId = this.currentUser()?.branchId;
      const currentBranch = this.activeBranchId();
      return !!userBranchId && userBranchId === currentBranch;
    }
    return false;
  });

  /**
   * Admin, Manager (in their branch), and Host (in their branch) can open free tables
   * and assign a waiter or self-assign. Waiter cannot open unassigned tables.
   */
  readonly canOpenTables = computed(() => {
    const r = this.role();
    if (r === 'Admin') return true;
    if (r === 'Manager' || r === 'Host') {
      const userBranchId = this.currentUser()?.branchId;
      const currentBranch = this.activeBranchId();
      return !!userBranchId && userBranchId === currentBranch;
    }
    return false;
  });

  readonly activeBranch = computed(() => {
    const id = this.activeBranchId();
    return this.branches().find((b) => b.id === id) ?? null;
  });

  readonly activeBranchName = computed(() => {
    const branch = this.activeBranch();
    if (branch) return branch.name;
    const userBranchName = this.currentUser()?.branchName;
    if (userBranchName) return userBranchName;
    const id = this.activeBranchId();
    return id ? `Branch #${id}` : 'Branch Floor';
  });

  readonly zoomPercent = computed(() => Math.round(this.zoomLevel() * 100));

  readonly selectedTable = computed(() => {
    const num = this.selectedTableNumber();
    if (num === null) return null;
    return this.tables().find((t) => t.number === num) ?? null;
  });

  /**
   * Determines whether the current user can perform operational actions on the selected table:
   * - Admin: all tables
   * - Manager / Host: all tables in their assigned branch
   * - Waiter: ONLY tables currently assigned to their own user ID
   */
  readonly canActOnSelectedTable = computed(() => {
    const table = this.selectedTable();
    if (!table) return false;
    const r = this.role();
    if (r === 'Admin') return true;
    const user = this.currentUser();
    if (!user) return false;

    if (r === 'Manager' || r === 'Host') {
      return !user.branchId || user.branchId === table.branchId;
    }
    if (r === 'Waiter') {
      return !table.available && table.waiterId !== null && table.waiterId === user.id;
    }
    return false;
  });

  /**
   * Orders belonging to the currently selected table, newest first.
   */
  readonly selectedTableOrders = computed(() => {
    const table = this.selectedTable();
    if (!table) return [];
    return this.branchOrders()
      .filter((o) => o.tableNumber === table.number)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  });

  /**
   * Active (non-paid, non-cancelled) order for the currently selected table.
   */
  readonly selectedTableActiveOrder = computed(() => {
    return (
      this.selectedTableOrders().find(
        (o) =>
          o.status?.toUpperCase() !== 'PAID' &&
          o.status?.toUpperCase() !== 'CANCELLED'
      ) ?? null
    );
  });

  /**
   * Counts for the top HUD filter pills.
   */
  readonly countAll = computed(() => this.tables().length);
  readonly countFree = computed(
    () => this.tables().filter((t) => this.getTableVisualState(t) === 'available').length
  );
  readonly countOccupied = computed(
    () => this.tables().filter((t) => this.getTableVisualState(t) !== 'available').length
  );
  readonly countReady = computed(
    () => this.tables().filter((t) => this.getTableVisualState(t) === 'ready').length
  );

  /**
   * Assignable waiters for the upward "Open Table" select, plus the logged-in user
   * at the bottom with "(Self-assign)".
   */
  readonly assignableWaiterOptions = computed<AssignableWaiterOption[]>(() => {
    const currentTables = this.tables();
    const user = this.currentUser();
    const countServing = (userId: number): number =>
      currentTables.filter((t) => !t.available && t.waiterId === userId).length;

    const waiters = this.branchUsers()
      .filter(
        (u) =>
          u.role?.toUpperCase() === 'WAITER' &&
          (!user?.id || u.id !== user.id)
      )
      .map((w) => ({
        id: w.id,
        fullName: `${w.firstName} ${w.lastName}`.trim(),
        roleLabel: 'Waiter',
        servingCount: countServing(w.id),
        isSelf: false,
      }));

    if (user && user.id) {
      const fullName =
        `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
        user.email ||
        'Current User';
      waiters.push({
        id: user.id,
        fullName,
        roleLabel: user.role?.role ?? 'Staff',
        servingCount: countServing(user.id),
        isSelf: true,
      });
    }

    return waiters;
  });

  ngOnInit(): void {
    this.initializeContext();
  }

  private initializeContext(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const routeBranchParam = this.route.snapshot.paramMap.get('branchId');
    const parsedRouteBranchId = routeBranchParam ? Number(routeBranchParam) : null;

    this.authService.ensureProfileLoaded().subscribe((profile) => {
      this.branchService
        .findAll()
        .pipe(catchError(() => of([] as Branch[])))
        .subscribe((branchList) => {
          this.branches.set(branchList ?? []);

          let targetBranchId: number | null = null;
          if (this.isAdmin() && parsedRouteBranchId) {
            targetBranchId = parsedRouteBranchId;
          } else if (profile?.branchId) {
            targetBranchId = profile.branchId;
          } else if (parsedRouteBranchId) {
            targetBranchId = parsedRouteBranchId;
          } else if (branchList.length > 0 && branchList[0].id) {
            targetBranchId = branchList[0].id!;
          }

          if (targetBranchId) {
            this.activeBranchId.set(targetBranchId);
            this.loadBranchFloorData(targetBranchId);
          } else {
            this.isLoading.set(false);
            this.errorMessage.set('No branch available to display the table map.');
          }
        });
    });
  }

  loadBranchFloorData(branchId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      tables: this.tableService.getTablesByBranch(branchId),
      orders: this.tableService
        .getBranchOrders(branchId)
        .pipe(catchError(() => of([] as TableOrder[]))),
      users: this.userService
        .getAll({ branchId, size: 100 })
        .pipe(catchError(() => of({ content: [] as User[] }))),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ tables, orders, users }) => {
          this.tables.set(tables ?? []);
          this.branchOrders.set(orders ?? []);
          this.branchUsers.set(users?.content ?? []);

          const selNum = this.selectedTableNumber();
          if (selNum !== null) {
            const updatedSel = (tables ?? []).find((t) => t.number === selNum);
            if (updatedSel) {
              this.syncEditForm(updatedSel);
            } else {
              this.selectedTableNumber.set(null);
            }
          }
        },
        error: (err) => {
          this.errorMessage.set(
            err?.error?.message ||
              err?.error?.error ||
              err?.message ||
              'Could not load branch floor map.'
          );
        },
      });
  }

  switchBranch(branchId: number, event?: MouseEvent): void {
    event?.stopPropagation();
    this.isBranchMenuOpen.set(false);
    if (!this.isAdmin() || branchId === this.activeBranchId()) return;

    this.selectedTableNumber.set(null);
    this.isWaiterSelectOpen.set(false);
    this.isEditMode.set(false);
    this.activeBranchId.set(branchId);
    this.loadBranchFloorData(branchId);
  }

  toggleBranchMenu(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.canSwitchBranch()) return;
    this.isBranchMenuOpen.update((v) => !v);
    this.isCircleMenuOpen.set(false);
  }

  // ── Visual State & Spotlight Filter ──────────────────────

  getTableVisualState(table: BranchTable): TableVisualState {
    if (table.available) {
      return 'available';
    }
    const override = this.localVisualOverrides()[table.number];
    if (override && override !== 'available') {
      return override;
    }
    const activeOrder = this.branchOrders().find(
      (o) =>
        o.tableNumber === table.number &&
        o.status?.toUpperCase() !== 'PAID' &&
        o.status?.toUpperCase() !== 'CANCELLED'
    );
    if (!activeOrder) {
      return 'occupied';
    }
    const st = activeOrder.status.toUpperCase();
    if (st === 'READY') return 'ready';
    if (st === 'PREPARING' || st === 'PENDING') return 'preparing';
    if (st === 'SERVED') return 'served';
    return 'occupied';
  }

  getStateBadgeText(state: TableVisualState): string {
    switch (state) {
      case 'available':
        return 'FREE';
      case 'occupied':
        return 'SEATED';
      case 'preparing':
        return 'KITCHEN';
      case 'ready':
        return 'READY!';
      case 'served':
        return 'SERVED';
    }
  }

  getStateReadableLabel(state: TableVisualState): string {
    switch (state) {
      case 'available':
        return 'Available (Free)';
      case 'occupied':
        return 'Occupied — Seated';
      case 'preparing':
        return 'Order in Kitchen';
      case 'ready':
        return 'Order Ready to Serve!';
      case 'served':
        return 'Served at Table';
    }
  }

  setFilter(mode: TableFilterMode): void {
    this.activeFilter.set(mode);
  }

  matchesActiveFilter(table: BranchTable): boolean {
    const filter = this.activeFilter();
    if (filter === 'all') return true;
    const state = this.getTableVisualState(table);
    if (filter === 'available') return state === 'available';
    if (filter === 'ready') return state === 'ready';
    if (filter === 'occupied') return state !== 'available';
    return true;
  }

  inferShape(table: BranchTable): TableShape {
    if (table.shape) {
      const s = table.shape.toLowerCase() as TableShape;
      if (s === 'square' || s === 'rectangular' || s === 'round') return s;
    }
    if (table.capacity <= 2) return 'round';
    if (table.capacity <= 4) return 'square';
    return 'rectangular';
  }

  getTableShapeClass(table: BranchTable): string {
    return 'shape-' + this.inferShape(table);
  }

  getTableSizeClass(capacity: number): string {
    if (capacity <= 2) return 'size-2';
    if (capacity <= 4) return 'size-4';
    if (capacity <= 6) return 'size-6';
    return 'size-8';
  }

  getChairDistribution(table: BranchTable): ChairDistribution {
    return calculateChairs(this.inferShape(table), table.capacity);
  }

  getWaiterDisplayName(table: BranchTable): string {
    if (table.available || !table.waiterId) return 'Unassigned';
    const current = this.currentUser();
    if (current && current.id === table.waiterId) {
      const full = `${current.firstName ?? ''} ${current.lastName ?? ''}`.trim();
      return full ? `${full} (You)` : 'Assigned to You';
    }
    const foundUser = this.branchUsers().find((u) => u.id === table.waiterId);
    if (foundUser) {
      return `${foundUser.firstName} ${foundUser.lastName}`.trim();
    }
    const orderWithWaiter = this.branchOrders().find(
      (o) => o.tableNumber === table.number && o.waiterId === table.waiterId
    );
    if (orderWithWaiter) {
      return `${orderWithWaiter.waiterFirstName} ${orderWithWaiter.waiterLastName}`.trim();
    }
    return `Staff #${table.waiterId}`;
  }

  getTableSubtext(table: BranchTable): string {
    if (this.isEditMode()) {
      return `(${table.posX}, ${table.posY})`;
    }
    if (table.available) {
      return 'Tap to open';
    }
    const current = this.currentUser();
    if (current && current.id === table.waiterId) {
      return '★ Your table';
    }
    const waiterName = this.getWaiterDisplayName(table);
    const shortName = waiterName.split(' ')[0];
    return shortName;
  }

  isAssignedToCurrentUser(table: BranchTable): boolean {
    const user = this.currentUser();
    return !table.available && !!user?.id && table.waiterId === user.id;
  }

  // ── Top-Right Floating Circle Menu & Zoom ────────────────

  toggleCircleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isCircleMenuOpen.update((v) => !v);
    this.isBranchMenuOpen.set(false);
  }

  toggleEditMode(event?: MouseEvent): void {
    event?.stopPropagation();
    if (!this.canEditLayout()) return;
    const next = !this.isEditMode();
    this.isEditMode.set(next);
    this.isWaiterSelectOpen.set(false);
    this.selectedTableNumber.set(null);
    this.showToast(next ? 'Floor layout edit mode enabled' : 'Floor layout saved');
  }

  adjustZoom(delta: number, event?: MouseEvent): void {
    event?.stopPropagation();
    const clamped = Math.min(1.3, Math.max(0.65, Math.round((this.zoomLevel() + delta) * 100) / 100));
    this.zoomLevel.set(clamped);
  }

  setZoomPreset(value: number, event?: MouseEvent): void {
    event?.stopPropagation();
    this.zoomLevel.set(value);
  }

  fitZoomToViewport(event?: MouseEvent): void {
    event?.stopPropagation();
    const stageEl = this.floorStageRef?.nativeElement;
    if (!stageEl) {
      this.zoomLevel.set(1);
      return;
    }
    const availW = stageEl.clientWidth - 48;
    const availH = stageEl.clientHeight - 120;
    const scaleX = availW / 980;
    const scaleY = availH / 640;
    const best = Math.min(1.15, Math.max(0.65, Math.round(Math.min(scaleX, scaleY) * 100) / 100));
    this.zoomLevel.set(best);
  }

  // ── Table Selection, Drag & Drop, and Layout Editing ─────

  onTablePointerDown(table: BranchTable, event: PointerEvent): void {
    event.stopPropagation();
    if (!this.isEditMode() || !this.canEditLayout()) {
      return;
    }
    const canvasEl = this.floorCanvasRef?.nativeElement;
    if (!canvasEl) return;

    this.selectedTableNumber.set(table.number);
    this.syncEditForm(table);
    this.draggingTableNumber.set(table.number);
    this.dragMoved = false;

    const rect = canvasEl.getBoundingClientRect();
    const scale = this.zoomLevel();
    const pointerX = (event.clientX - rect.left) / scale;
    const pointerY = (event.clientY - rect.top) / scale;
    this.dragOffsetX = pointerX - table.posX;
    this.dragOffsetY = pointerY - table.posY;
  }

  @HostListener('window:pointermove', ['$event'])
  onWindowPointerMove(event: PointerEvent): void {
    const draggingNum = this.draggingTableNumber();
    if (draggingNum === null || !this.isEditMode() || !this.canEditLayout()) return;
    const canvasEl = this.floorCanvasRef?.nativeElement;
    if (!canvasEl) return;

    const rect = canvasEl.getBoundingClientRect();
    const scale = this.zoomLevel();
    const rawX = (event.clientX - rect.left) / scale - this.dragOffsetX;
    const rawY = (event.clientY - rect.top) / scale - this.dragOffsetY;

    const snappedX = Math.max(20, Math.min(840, Math.round(rawX / 20) * 20));
    const snappedY = Math.max(40, Math.min(500, Math.round(rawY / 20) * 20));

    this.tables.update((list) =>
      list.map((t) => {
        if (t.number !== draggingNum) return t;
        if (t.posX !== snappedX || t.posY !== snappedY) {
          this.dragMoved = true;
        }
        return { ...t, posX: snappedX, posY: snappedY };
      })
    );
    this.editPosX.set(snappedX);
    this.editPosY.set(snappedY);
  }

  @HostListener('window:pointerup')
  onWindowPointerUp(): void {
    const draggingNum = this.draggingTableNumber();
    if (draggingNum === null) return;
    this.draggingTableNumber.set(null);

    if (!this.dragMoved) return;
    const branchId = this.activeBranchId();
    const table = this.tables().find((t) => t.number === draggingNum);
    if (!branchId || !table) return;

    this.tableService
      .updateTable(branchId, table.number, {
        number: table.number,
        capacity: table.capacity,
        posX: table.posX,
        posY: table.posY,
        waiterId: table.waiterId ?? undefined,
      })
      .subscribe({
        next: (updated) => {
          this.tables.update((list) =>
            list.map((t) => (t.id === updated.id ? updated : t))
          );
          this.showToast(`Table #${updated.number} moved to (${updated.posX}, ${updated.posY})`);
        },
        error: () => {
          this.showToast('Could not save new table position');
          this.loadBranchFloorData(branchId);
        },
      });
  }

  onTableClick(table: BranchTable, event: MouseEvent): void {
    event.stopPropagation();
    if (this.dragMoved) {
      this.dragMoved = false;
      return;
    }

    if (this.isEditMode()) {
      if (!this.canEditLayout()) return;
      this.selectedTableNumber.set(table.number);
      this.openEditTableModal(table);
      return;
    }

    this.selectedTableNumber.set(table.number);
    this.isWaiterSelectOpen.set(false);
    this.isCircleMenuOpen.set(false);
    this.isBranchMenuOpen.set(false);
    this.syncEditForm(table);
  }

  onStageBackgroundClick(): void {
    this.isCircleMenuOpen.set(false);
    this.isBranchMenuOpen.set(false);
    this.isWaiterSelectOpen.set(false);
  }

  closeDrawer(): void {
    this.selectedTableNumber.set(null);
    this.isWaiterSelectOpen.set(false);
  }

  private syncEditForm(table: BranchTable): void {
    this.editNumber.set(table.number);
    this.editCapacity.set(table.capacity);
    this.editPosX.set(table.posX);
    this.editPosY.set(table.posY);
  }

  openNewTableModal(event?: MouseEvent): void {
    event?.stopPropagation();
    if (!this.canEditLayout()) return;
    this.tableModalMode.set('create');
    this.editingTableNumber.set(null);
    this.modalTableNumber.set(this.nextNewTableNumber());
    this.modalInitialShape.set('round');
    this.modalInitialCapacity.set(4);
    this.isTableModalOpen.set(true);
    this.isCircleMenuOpen.set(false);
  }

  openEditTableModal(table: BranchTable): void {
    if (!this.canEditLayout()) return;
    this.tableModalMode.set('edit');
    this.editingTableNumber.set(table.number);
    this.modalTableNumber.set(table.number);
    this.modalInitialShape.set(this.inferShape(table));
    this.modalInitialCapacity.set(table.capacity);
    this.isTableModalOpen.set(true);
    this.isCircleMenuOpen.set(false);
  }

  closeTableModal(): void {
    this.isTableModalOpen.set(false);
  }

  closeNewTableModal(): void {
    this.closeTableModal();
  }

  onCreateTableFromModal(config: { shape: TableShape; capacity: number }): void {
    this.onTableModalConfirm(config);
  }

  onTableModalConfirm(config: { shape: TableShape; capacity: number }): void {
    if (!this.canEditLayout()) return;
    const branchId = this.activeBranchId();
    if (!branchId) return;

    if (this.tableModalMode() === 'create') {
      const nextNumber = this.modalTableNumber();
      this.isSaving.set(true);
      this.tableService
        .createTable(branchId, {
          number: nextNumber,
          capacity: config.capacity,
          posX: 400,
          posY: 240,
          shape: config.shape,
        })
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: (created) => {
            this.tables.update((list) => [...list, created]);
            this.selectedTableNumber.set(created.number);
            this.syncEditForm(created);
            this.isTableModalOpen.set(false);
            this.showToast(`Table #${created.number} added to the floor. Drag to place.`);
          },
          error: (err) => {
            this.showToast(
              err?.error?.message || err?.error?.error || 'Could not create table'
            );
          },
        });
    } else {
      const tableNumber = this.editingTableNumber();
      const existing = this.tables().find((t) => t.number === tableNumber);
      if (!existing) return;

      this.isSaving.set(true);
      this.tableService
        .updateTable(branchId, existing.number, {
          number: existing.number,
          capacity: config.capacity,
          shape: config.shape,
          posX: existing.posX,
          posY: existing.posY,
          waiterId: existing.waiterId ?? undefined,
        })
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: (updated) => {
            this.tables.update((list) =>
              list.map((t) => (t.id === updated.id ? updated : t))
            );
            this.selectedTableNumber.set(updated.number);
            this.syncEditForm(updated);
            this.isTableModalOpen.set(false);
            this.showToast(`Table #${updated.number} updated`);
          },
          error: (err) => {
            this.showToast(
              err?.error?.message || err?.error?.error || 'Could not update table'
            );
          },
        });
    }
  }

  onDeleteTableFromHud(event?: MouseEvent): void {
    event?.stopPropagation();
    if (!this.canEditLayout()) return;

    if (this.selectedTableNumber() === null) {
      this.showToast('Please tap a table on the map to select it for deletion');
      return;
    }

    const table = this.selectedTable();
    if (!table) return;

    if (!table.available) {
      this.showToast('Cannot delete an occupied table. Free it first.');
      return;
    }

    const confirmed = window.confirm(`Delete Table #${table.number}?`);
    if (!confirmed) return;

    this.deleteSelectedTable();
  }

  saveTableEdits(): void {
    if (!this.canEditLayout()) return;
    const branchId = this.activeBranchId();
    const table = this.selectedTable();
    if (!branchId || !table) return;

    const newNum = Math.max(1, Number(this.editNumber()) || table.number);
    const newCap = Math.max(1, Number(this.editCapacity()) || table.capacity);
    const newX = Math.max(0, Number(this.editPosX()) || 0);
    const newY = Math.max(0, Number(this.editPosY()) || 0);

    this.isSaving.set(true);
    this.tableService
      .updateTable(branchId, table.number, {
        number: newNum,
        capacity: newCap,
        posX: newX,
        posY: newY,
        waiterId: table.waiterId ?? undefined,
      })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (updated) => {
          this.tables.update((list) =>
            list.map((t) => (t.id === updated.id ? updated : t))
          );
          this.selectedTableNumber.set(updated.number);
          this.syncEditForm(updated);
          this.showToast(`Table #${updated.number} layout updated`);
        },
        error: (err) => {
          this.showToast(
            err?.error?.message || err?.error?.error || 'Could not update table'
          );
        },
      });
  }

  deleteSelectedTable(): void {
    if (!this.canEditLayout()) return;
    const branchId = this.activeBranchId();
    const table = this.selectedTable();
    if (!branchId || !table) return;

    if (!table.available) {
      this.showToast('Cannot delete an occupied table. Free it first.');
      return;
    }

    this.isSaving.set(true);
    this.tableService
      .deleteTable(branchId, table.number)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.tables.update((list) => list.filter((t) => t.number !== table.number));
          this.selectedTableNumber.set(null);
          this.showToast(`Table #${table.number} deleted`);
        },
        error: (err) => {
          this.showToast(
            err?.error?.message || err?.error?.error || 'Could not delete table'
          );
        },
      });
  }

  // ── Operational Actions: Open Table, State Change, Free Table ─

  toggleWaiterSelect(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.canOpenTables()) return;
    this.isWaiterSelectOpen.update((v) => !v);
  }

  openTableWithWaiter(option: AssignableWaiterOption, event: MouseEvent): void {
    event.stopPropagation();
    if (!this.canOpenTables()) return;
    const branchId = this.activeBranchId();
    const table = this.selectedTable();
    if (!branchId || !table) return;

    this.isSaving.set(true);
    this.tableService
      .occupyTable(branchId, table.number, option.id)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (updated) => {
          this.tables.update((list) =>
            list.map((t) => (t.number === updated.number ? updated : t))
          );
          this.localVisualOverrides.update((prev) => ({
            ...prev,
            [updated.number]: 'occupied',
          }));
          this.isWaiterSelectOpen.set(false);
          const suffix = option.isSelf ? ' (Self-assign)' : '';
          this.showToast(
            `Table #${updated.number} opened — Assigned to ${option.fullName}${suffix}`
          );
        },
        error: (err) => {
          this.showToast(
            err?.error?.message || err?.error?.error || 'Could not open table'
          );
        },
      });
  }

  setTableFloorState(state: TableVisualState): void {
    const branchId = this.activeBranchId();
    const table = this.selectedTable();
    if (!branchId || !table || !this.canActOnSelectedTable()) return;

    this.localVisualOverrides.update((prev) => ({
      ...prev,
      [table.number]: state,
    }));

    const activeOrder = this.selectedTableActiveOrder();
    if (activeOrder) {
      let targetOrderStatus: string | null = null;
      if (state === 'preparing') targetOrderStatus = 'PREPARING';
      else if (state === 'ready') targetOrderStatus = 'READY';
      else if (state === 'served') targetOrderStatus = 'SERVED';

      if (targetOrderStatus && activeOrder.status.toUpperCase() !== targetOrderStatus) {
        this.tableService
          .changeOrderStatus(branchId, activeOrder.id, targetOrderStatus)
          .subscribe({
            next: (updatedOrder) => {
              this.branchOrders.update((list) =>
                list.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o))
              );
              this.showToast(
                `Order #${updatedOrder.id} marked as ${targetOrderStatus}`
              );
            },
            error: () => {
              this.showToast(
                `Table #${table.number} state set to ${this.getStateReadableLabel(state)}`
              );
            },
          });
        return;
      }
    }

    this.showToast(
      `Table #${table.number} state set to ${this.getStateReadableLabel(state)}`
    );
  }

  freeSelectedTable(): void {
    const branchId = this.activeBranchId();
    const table = this.selectedTable();
    if (!branchId || !table || !this.canActOnSelectedTable()) return;

    this.isSaving.set(true);
    this.tableService
      .freeTable(branchId, table.number)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (updated) => {
          this.tables.update((list) =>
            list.map((t) => (t.number === updated.number ? updated : t))
          );
          this.localVisualOverrides.update((prev) => {
            const copy = { ...prev };
            delete copy[updated.number];
            return copy;
          });
          this.showToast(`Table #${updated.number} is now free`);
        },
        error: (err) => {
          this.showToast(
            err?.error?.message || err?.error?.error || 'Could not free table'
          );
        },
      });
  }

  navigateToCreateOrder(tableNumber: number): void {
    this.router.navigate(['/tables', tableNumber, 'order']);
  }

  // ── Ticket Modal & Helpers ───────────────────────────────

  openTicketModal(order: TableOrder, event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectedTicketOrder.set(order);
  }

  closeTicketModal(): void {
    this.selectedTicketOrder.set(null);
  }

  getOrderItemsPreview(order: TableOrder): string {
    if (!order.items || order.items.length === 0) {
      return 'No items recorded yet';
    }
    return order.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ');
  }

  formatOrderTimestamp(iso: string | undefined | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  goBack(): void {
    if (this.isAdmin()) {
      this.router.navigate(['/admin/branches']);
      return;
    }
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  logout(): void {
    this.authService.logout();
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }
    this.toastTimeoutId = setTimeout(() => {
      this.toastMessage.set(null);
    }, 2800);
  }
}
