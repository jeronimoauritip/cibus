import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BranchComponent } from './branch';

describe('Branch', () => {
  let component: BranchComponent;
  let fixture: ComponentFixture<BranchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BranchComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
