import { Component, computed, ElementRef, inject, input, output, signal } from '@angular/core';
import { MenuProduct } from '../../models/menu-product';

export type PriceSort = 'none' | 'asc' | 'desc';
type OpenDropdown = 'categories' | 'price' | null;

@Component({
  selector: 'app-order-menu',
  standalone: true,
  templateUrl: './order-menu-component.html',
  styleUrl: './order-menu-component.css',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeMenus()'
  }
})
export class OrderMenuComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly products = input.required<MenuProduct[]>();
  readonly quantities = input<Record<number, number>>({});
  readonly add = output<MenuProduct>();

  readonly search = signal('');
  readonly selectedCategory = signal<string | null>(null);
  readonly priceSort = signal<PriceSort>('none');
  readonly openMenu = signal<OpenDropdown>(null);

  readonly categories = computed(() => [...new Set(this.products().map(p => p.categoryName))]);

  readonly priceSortLabel = computed(() => {
    switch (this.priceSort()) {
      case 'asc':
        return 'Price: Low to High';
      case 'desc':
        return 'Price: High to Low';
      default:
        return 'Sort by price';
    }
  });

  readonly groupedProducts = computed(() => {
    const term = this.search().trim().toLowerCase();
    const category = this.selectedCategory();
    const sort = this.priceSort();
    const map = new Map<string, MenuProduct[]>();
    for (const p of this.products()) {
      if (category && p.categoryName !== category) continue;
      if (term && !p.name.toLowerCase().includes(term)) continue;
      const list = map.get(p.categoryName) ?? [];
      list.push(p);
      map.set(p.categoryName, list);
    }
    return Array.from(map.entries()).map(([category, items]) => ({
      category,
      items:
        sort === 'none'
          ? items
          : [...items].sort((a, b) => (sort === 'asc' ? a.price - b.price : b.price - a.price))
    }));
  });

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  toggleMenu(menu: Exclude<OpenDropdown, null>): void {
    this.openMenu.update(current => (current === menu ? null : menu));
  }

  closeMenus(): void {
    this.openMenu.set(null);
  }

  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (this.openMenu() && target && !this.elementRef.nativeElement.contains(target)) {
      this.closeMenus();
    }
  }

  selectCategory(category: string | null): void {
    this.selectedCategory.set(category);
    this.closeMenus();
  }

  selectPriceSort(sort: PriceSort): void {
    this.priceSort.set(sort);
    this.closeMenus();
  }

  onAdd(product: MenuProduct): void {
    this.add.emit(product);
  }
}
