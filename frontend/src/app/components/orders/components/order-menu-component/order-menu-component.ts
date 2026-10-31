import { Component, computed, input, output, signal } from '@angular/core';
import { MenuProduct } from '../../models/menu-product';

@Component({
  selector: 'app-order-menu',
  standalone: true,
  templateUrl: './order-menu-component.html',
  styleUrl: './order-menu-component.css'
})
export class OrderMenuComponent {
  readonly products = input.required<MenuProduct[]>();
  readonly quantities = input<Record<number, number>>({});
  readonly add = output<MenuProduct>();

  readonly search = signal('');
  readonly selectedCategory = signal<string | null>(null);

  readonly categories = computed(() => [...new Set(this.products().map(p => p.categoryName))]);

  readonly groupedProducts = computed(() => {
    const term = this.search().trim().toLowerCase();
    const category = this.selectedCategory();
    const map = new Map<string, MenuProduct[]>();
    for (const p of this.products()) {
      if (category && p.categoryName !== category) continue;
      if (term && !p.name.toLowerCase().includes(term)) continue;
      const list = map.get(p.categoryName) ?? [];
      list.push(p);
      map.set(p.categoryName, list);
    }
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  });

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  selectCategory(category: string | null): void {
    this.selectedCategory.set(category);
  }

  onAdd(product: MenuProduct): void {
    this.add.emit(product);
  }
}
