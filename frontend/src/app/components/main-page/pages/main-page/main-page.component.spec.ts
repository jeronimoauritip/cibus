import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MainPageComponent } from './main-page.component';

describe('MainPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient()
      ]
    }).compileComponents();
  });

  it('should create the main dashboard component', () => {
    const fixture = TestBed.createComponent(MainPageComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render top bar and main content area', () => {
    const fixture = TestBed.createComponent(MainPageComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-top-bar')).toBeTruthy();
    expect(compiled.querySelector('app-greeting-hero')).toBeTruthy();
    expect(compiled.querySelector('app-branch-mosaic')).toBeTruthy();
  });
});
