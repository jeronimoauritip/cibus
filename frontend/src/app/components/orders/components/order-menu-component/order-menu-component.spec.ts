import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuProduct } from '../../models/menu-product';
import { OrderMenuComponent } from './order-menu-component';

describe('OrderMenuComponent', () => {
  let component: OrderMenuComponent;
  let fixture: ComponentFixture<OrderMenuComponent>;

  const sampleProducts: MenuProduct[] = [
    { id: 1, name: 'Pasta', categoryName: 'Mains', active: true, price: 3200, available: true },
    { id: 2, name: 'Salad', categoryName: 'Mains', active: true, price: 1800, available: true },
    { id: 3, name: 'Water', categoryName: 'Drinks', active: true, price: 900, available: true },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderMenuComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('products', sampleProducts);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create and filter categories from the categories dropdown pill', () => {
    expect(component).toBeTruthy();

    component.toggleMenu('categories');
    fixture.detectChanges();
    expect(component.openMenu()).toBe('categories');

    component.selectCategory('Drinks');
    fixture.detectChanges();
    expect(component.openMenu()).toBeNull();
    expect(component.groupedProducts().map(g => g.category)).toEqual(['Drinks']);
  });

  it('should sort items by price using the price sort dropdown pill', () => {
    component.toggleMenu('price');
    component.selectPriceSort('asc');
    fixture.detectChanges();

    const mainsAsc = component.groupedProducts().find(g => g.category === 'Mains')?.items.map(i => i.name);
    expect(mainsAsc).toEqual(['Salad', 'Pasta']);

    component.selectPriceSort('desc');
    fixture.detectChanges();

    const mainsDesc = component.groupedProducts().find(g => g.category === 'Mains')?.items.map(i => i.name);
    expect(mainsDesc).toEqual(['Pasta', 'Salad']);
  });
});
