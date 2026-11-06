import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WaitersReportComponent } from './waiters-report-component';

describe('WaitersReportComponent', () => {
  let component: WaitersReportComponent;
  let fixture: ComponentFixture<WaitersReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaitersReportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WaitersReportComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
