import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuItemRowComponent } from './menu-item-row-component';

describe('MenuItemRowComponent', () => {
  let component: MenuItemRowComponent;
  let fixture: ComponentFixture<MenuItemRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuItemRowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuItemRowComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
