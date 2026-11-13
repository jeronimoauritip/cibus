import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { BackButtonDirective } from '../../../back-button/back-button.directive';
import { HeaderComponent } from '../../../header-component/header-component';
import { MenuItemRowComponent } from '../../components/menu-item-row-component/menu-item-row-component';
import { MenuItemFilterComponent } from '../../components/menu-item-filter-component/menu-item-filter-component';
import { MenuService } from '../../service/menu-service';
import { MenuItem, MenuItemRequest, MenuItemUpdate, ProductFilter } from '../../models/menu-item';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../products/models/product';
import { ProductListComponent } from '../../../products/pages/product-list-component/product-list-component';

@Component({
  imports: [BackButtonDirective, HeaderComponent, MenuItemRowComponent, MenuItemFilterComponent, ProductListComponent],
  selector: 'app-menu-component',
  styleUrl: './menu-component.css',
  templateUrl: './menu-component.html',
})
export class MenuComponent implements OnInit {
  private readonly menuService = inject(MenuService);
  private readonly route = inject(ActivatedRoute);

  readonly filter = signal<ProductFilter>({ name: '', category: '' });
  readonly menuItems = signal<MenuItem[]>([]);
  readonly currentProductIds = computed<number[]>(() => 
    this.menuItems().map(item => item.product.id)
  );
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly branchId = signal<number | null>(null);

  // Modal State Signals
  readonly isAddModalOpen = signal<boolean>(false);
  readonly selectedProductForAdd = signal<Product | null>(null);
  readonly newProductPrice = signal<number>(0);
  readonly isAdding = signal<boolean>(false);
  readonly addErrorMessage = signal<string | null>(null);
  readonly addSuccessMessage = signal<string | null>(null);

  // Filter accessing nested 'product' properties
  readonly filteredMenuItems = computed<MenuItem[]>(() =>
    this.menuItems().filter(item =>
      item.product.name.toLowerCase().includes(this.filter().name.toLowerCase()) &&
      (this.filter().category === '' || item.product.categoryName === this.filter().category)
    )
  );

  // Group by product category
  readonly groupedMenuItems = computed(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of this.filteredMenuItems()) {
      const category = item.product.categoryName;
      const list = map.get(category) ?? [];
      list.push(item);
      map.set(category, list);
    }
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('branchId'));
      this.branchId.set(id);
      this.loadMenu(id);
    });
  }

  loadMenu(branchId: number): void {
    this.loading.set(true);
    this.error.set(false);

    this.menuService.getAll(branchId).subscribe({
      next: (page) => {
        this.menuItems.set(page.content);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  onSaveEdit(event: { id: number, data: MenuItemUpdate }): void {
    const currentBranchId = this.branchId();
    if (!currentBranchId) return;

    this.menuService.update(currentBranchId, event.id, event.data).subscribe({
      next: (updatedItem) => {
        this.menuItems.update(currentList =>
          currentList.map(item => item.product.id === event.id ? updatedItem : item)
        );
      },
      error: () => {
        alert('An error occurred while updating the menu item.');
      }
    });
  }

  onDelete(item: MenuItem): void {
    const currentBranchId = this.branchId();
    if (!currentBranchId) return;

    this.menuService.delete(currentBranchId, item.product.id).subscribe({
      next: () => {
        this.menuItems.update(currentList =>
          currentList.filter(i => i.id !== item.id) 
        );
      },
      error: () => {
        alert('An error occurred while deleting the item from the menu.');
      }
    });
  }

  // --- Modal Logic ---
  onAddMenuItem(): void {
    this.addErrorMessage.set(null);
    this.addSuccessMessage.set(null);
    this.selectedProductForAdd.set(null);
    this.newProductPrice.set(0);
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    if (this.isAdding()) return;
    this.isAddModalOpen.set(false);
    this.selectedProductForAdd.set(null);
    this.addErrorMessage.set(null);
    this.addSuccessMessage.set(null);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeAddModal();
    }
  }

  onProductSelectedFromList(product: Product): void {
    const alreadyExists = this.menuItems().some(item => item.product.id === product.id);
    if (alreadyExists) {
      this.addErrorMessage.set(`Product '${product.name}' is already in this branch's menu.`);
      this.addSuccessMessage.set(null);
      return;
    }

    this.selectedProductForAdd.set(product);
    this.newProductPrice.set(0);
    this.addErrorMessage.set(null);
    this.addSuccessMessage.set(null);
  }

  cancelProductSelection(): void {
    this.selectedProductForAdd.set(null);
    this.addErrorMessage.set(null);
    this.addSuccessMessage.set(null);
  }

  updateNewPrice(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.newProductPrice.set(Number(value));
  }

  confirmAddProduct(): void {
    const currentBranchId = this.branchId();
    const product = this.selectedProductForAdd();
    const price = this.newProductPrice();

    if (!currentBranchId || !product) return;

    if (price <= 0) {
      this.addErrorMessage.set('Price must be greater than 0.');
      return;
    }

    this.isAdding.set(true);
    this.addErrorMessage.set(null);
    this.addSuccessMessage.set(null);

    const request: MenuItemRequest = {
      productId: product.id,
      price: price
    };

    this.menuService.create(currentBranchId, request).subscribe({
      next: (newItem) => {
        this.menuItems.update(current => [...current, newItem]);
        this.isAdding.set(false);
        this.addSuccessMessage.set(`'${product.name}' successfully added to the menu.`);
        this.selectedProductForAdd.set(null);
      },
      error: (err) => {
        console.error('Error adding product to menu', err);
        this.addErrorMessage.set('Failed to add the product to the branch menu.');
        this.isAdding.set(false);
      }
    });
  }
}
