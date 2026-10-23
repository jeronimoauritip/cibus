import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pin } from './pin';

describe('Pin', () => {
  let component: Pin;
  let fixture: ComponentFixture<Pin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pin],
    }).compileComponents();

    fixture = TestBed.createComponent(Pin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
