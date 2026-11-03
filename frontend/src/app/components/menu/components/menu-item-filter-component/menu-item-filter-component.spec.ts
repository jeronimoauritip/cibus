import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuItemFilterComponent } from './menu-item-filter-component';

describe('MenuItemFilterComponent', () => {
  let component: MenuItemFilterComponent;
  let fixture: ComponentFixture<MenuItemFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuItemFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuItemFilterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
