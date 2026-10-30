import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderConfirmComponent } from './order-confirm-component';

describe('OrderConfirmComponent', () => {
  let component: OrderConfirmComponent;
  let fixture: ComponentFixture<OrderConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderConfirmComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderConfirmComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
