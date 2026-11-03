import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HeaderComponent } from '../../../header-component/header-component';
import { MenuItemRowComponent } from '../../components/menu-item-row-component/menu-item-row-component';
import { MenuItemFilterComponent } from '../../components/menu-item-filter-component/menu-item-filter-component';
import { MenuService } from '../../service/menu-service';
import { MenuItem, MenuItemUpdate, ProductFilter } from '../../models/menu-item';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  imports: [HeaderComponent, MenuItemRowComponent, MenuItemFilterComponent],
  selector: 'app-menu-component',
  styleUrl: './menu-component.css',
  templateUrl: './menu-component.html',
})
export class MenuComponent implements OnInit {
  private readonly menuService = inject(MenuService);
  private readonly route = inject(ActivatedRoute);

  readonly filter = signal<ProductFilter>({ name: '', category: '' });
  readonly menuItems = signal<MenuItem[]>([]);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly branchId = signal<number | null>(null);

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
    
    // Pass branchId to the service to use in the URL
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
        // Update the list in memory using Signals without reloading the page
        this.menuItems.update(currentList => 
          currentList.map(item => item.id === event.id ? updatedItem : item)
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

    // Pass branchId and productId to the service for deletion
    this.menuService.delete(currentBranchId, item.id).subscribe({
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

  onAddMenuItem(): void {
    console.log('Open selector to add a product to branch:', this.branchId());
  }
}
