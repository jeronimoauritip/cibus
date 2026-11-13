import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentMethod } from '../../models/payment-method';
import { PaymentComponent } from './payment-component';

describe('PaymentComponent', () => {
  let component: PaymentComponent;
  let fixture: ComponentFixture<PaymentComponent>;

  const methods: PaymentMethod[] = [
    { id: 1, name: 'EFECTIVO' },
    { id: 2, name: 'CREDITO' },
    { id: 3, name: 'DEBITO' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('paymentMethods', methods);
    fixture.componentRef.setInput('subtotal', 1000);
    fixture.componentRef.setInput('remainingAmount', 1000);
    fixture.detectChanges();
  });

  it('should default to a single payment line matching remainingAmount and allow confirmation', () => {
    expect(component.paymentLines().length).toBe(1);
    expect(component.paymentLines()[0].amount).toBe(1000);
    expect(component.canConfirm()).toBe(true);
  });

  it('should prevent 100% discount and keep at least $0.01 payable', () => {
    component.onDiscountInput({ target: { value: '1000' } } as unknown as Event);
    expect(component.discountError()).toContain('Maximum allowed discount');
    expect(component.canConfirm()).toBe(false);

    component.onDiscountInput({ target: { value: '200' } } as unknown as Event);
    fixture.detectChanges();
    expect(component.discountError()).toBeNull();
    expect(component.netRemaining()).toBe(800);
    expect(component.paymentLines()[0].amount).toBe(800);
    expect(component.canConfirm()).toBe(true);
  });

  it('should support split payments and emit payments and discount on confirm', () => {
    const emitted: Array<{ payments: unknown[]; discount: number }> = [];
    component.confirmPayment.subscribe((val) => emitted.push(val));

    const firstId = component.paymentLines()[0].lineId;
    component.updateLineAmount(firstId, { target: { value: '600' } } as unknown as Event);
    expect(component.unallocatedBalance()).toBe(400);
    expect(component.canConfirm()).toBe(false);

    component.addPaymentLine();
    expect(component.paymentLines().length).toBe(2);
    expect(component.paymentLines()[1].amount).toBe(400);
    expect(component.canConfirm()).toBe(true);

    component.onConfirm();
    expect(emitted.length).toBe(1);
    expect(emitted[0].discount).toBe(0);
    expect(emitted[0].payments).toEqual([
      { paymentMethodId: 1, amount: 600 },
      { paymentMethodId: 2, amount: 400 },
    ]);
  });
});

