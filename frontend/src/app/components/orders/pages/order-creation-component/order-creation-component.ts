import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { HeaderComponent } from "../../../header-component/header-component";
import { OrderConfirmComponent } from "../../components/order-confirm-component/order-confirm-component";
import { OrderItemComponent } from "../../components/order-item-component/order-item-component";
import { OrderMenuComponent } from "../../components/order-menu-component/order-menu-component";
import { HttpErrorResponse, httpResource } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { OrderService } from "../../service/order-service";
import { AuthService } from "../../../../Auth/services/auth-service";
import { BackButtonDirective } from "../../../back-button/back-button.directive";
import { OrderDetail } from "../../models/order-detail";
import { DraftItem } from "../../models/draft-item";
import { BranchProduct } from "../../models/branch-product";
import { MenuProduct } from "../../models/menu-product";

@Component({
  selector: 'app-order-creation',
  standalone: true,
  imports: [OrderMenuComponent, OrderItemComponent, OrderConfirmComponent, HeaderComponent, BackButtonDirective],
  templateUrl: './order-creation-component.html',
  styleUrl: './order-creation-component.css'
})
export class OrderCreationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);

  readonly backFallback = computed(() => this.authService.isAdmin() ? '/admin/tables' : '/tables');

  readonly tableNumber = signal(0);
  readonly resolvedBranchId = signal<number | null>(null);
  readonly assignedWaiterId = signal<number | null>(null);
  readonly confirming = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private nextLineId = 0;

  readonly draftItems = signal<DraftItem[]>([]);

  readonly quantities = computed(() => {
    const totals: Record<number, number> = {};
    for (const i of this.draftItems()) {
      totals[i.productId] = (totals[i.productId] ?? 0) + i.quantity;
    }
    return totals;
  });

  readonly unitCount = computed(() =>
    this.draftItems().reduce((sum, i) => sum + i.quantity, 0)
  );

  // Prices, availability and product details come directly from the branch menu endpoint.
  readonly branchProducts = httpResource<BranchProduct[]>(
    () => {
      const branchId = this.resolvedBranchId() ?? this.authService.user()?.branchId;
      return branchId
        ? `/api/branches/${branchId}/products?page=0&size=200&isGlobalProductActive=true`
        : undefined;
    },
    { parse: (res: any) => res?.content ?? [] }
  );

  readonly menuProducts = computed<MenuProduct[]>(() =>
    (this.branchProducts.value() ?? [])
      .filter(bp => bp.product?.active !== false)
      .map(bp => ({
        ...bp.product,
        price: bp.price,
        available: bp.available
      }))
  );

  readonly loading = computed(() => this.branchProducts.isLoading());

  ngOnInit(): void {
    this.tableNumber.set(Number(this.route.snapshot.paramMap.get('tableNumber')));
    const queryBranch = Number(this.route.snapshot.queryParamMap.get('branchId')) || null;
    const queryWaiter = Number(this.route.snapshot.queryParamMap.get('waiterId')) || null;
    if (queryWaiter) {
      this.assignedWaiterId.set(queryWaiter);
    }

    this.authService.ensureProfileLoaded().subscribe(profile => {
      this.resolvedBranchId.set(queryBranch ?? profile?.branchId ?? null);
    });
  }

  // Tapping a product adds to its line without a note; lines with a note stay untouched,
  // so the same product can have several lines with different observations.
  addItem(product: MenuProduct, quantity = 1): void {
    const plain = this.draftItems().find(i => i.productId === product.id && !i.observation?.trim());
    if (plain) {
      this.updateQuantity(plain.lineId, plain.quantity + quantity);
      return;
    }
    this.draftItems.update(items => [...items, {
      lineId: this.nextLineId++,
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      subtotal: product.price * quantity
    }]);
  }

  updateQuantity(lineId: number, quantity: number): void {
    if (quantity <= 0) { this.removeItem(lineId); return; }
    this.draftItems.update(items =>
      items.map(i => i.lineId === lineId
        ? { ...i, quantity, subtotal: i.unitPrice * quantity }
        : i
      )
    );
  }

  updateObservation(lineId: number, observation: string): void {
    this.draftItems.update(items =>
      items.map(i => i.lineId === lineId ? { ...i, observation } : i)
    );
  }

  removeItem(lineId: number): void {
    this.draftItems.update(items => items.filter(i => i.lineId !== lineId));
  }

  // The backend keeps one detail per product, so lines of the same product are merged
  // into one, with each line's note listed in the observation.
  private toOrderDetails(): OrderDetail[] {
    const byProduct = new Map<number, DraftItem[]>();
    for (const line of this.draftItems()) {
      byProduct.set(line.productId, [...(byProduct.get(line.productId) ?? []), line]);
    }
    return Array.from(byProduct.values()).map(lines => {
      const [first] = lines;
      return {
        productId: first.productId,
        productName: first.productName,
        unitPrice: first.unitPrice,
        quantity: lines.reduce((sum, l) => sum + l.quantity, 0),
        subtotal: lines.reduce((sum, l) => sum + l.subtotal, 0),
        observation: lines.length === 1
          ? first.observation?.trim() || undefined
          : lines.map(l => `${l.quantity}x: ${l.observation?.trim() || 'no notes'}`).join(' / ')
      };
    });
  }

  onConfirm(): void {
    const user = this.authService.user();
    const branchId = this.resolvedBranchId() ?? user?.branchId;
    const waiterId = this.assignedWaiterId() ?? user?.id;
    if (!user || !branchId || !waiterId) {
      this.errorMessage.set('Invalid session');
      return;
    }
    this.confirming.set(true);
    this.errorMessage.set(null);
    this.orderService.confirmOrder(
      branchId,
      this.tableNumber(),
      waiterId,
      this.toOrderDetails()
    ).subscribe({
      next: () => this.navigateBackToTables(branchId),
      error: (err: Error | HttpErrorResponse) => {
        this.errorMessage.set(
          err instanceof HttpErrorResponse
            ? err.error?.message || err.error?.error || 'Could not confirm the order'
            : err.message
        );
        this.confirming.set(false);
      }
    });
  }

  onCancel(): void {
    this.navigateBackToTables(this.resolvedBranchId() ?? this.authService.user()?.branchId ?? null);
    // the draft is discarded together with the component
  }

  private navigateBackToTables(branchId: number | null): void {
    if (this.authService.isAdmin() && branchId) {
      this.router.navigate(['/admin/branches', branchId, 'tables']);
      return;
    }
    this.router.navigate(['/tables']);
  }
}