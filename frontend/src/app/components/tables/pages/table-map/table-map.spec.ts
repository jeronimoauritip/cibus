import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TableMapComponent } from './table-map';

describe('TableMapComponent', () => {
  let component: TableMapComponent;
  let fixture: ComponentFixture<TableMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableMapComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TableMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should only allow switching branch when user is admin and multiple branches exist', () => {
    // Default state: not admin or empty branches
    expect(component.canSwitchBranch()).toBe(false);

    // If branches are added but role is not admin
    component.branches.set([
      { id: 1, name: 'Palermo' } as any,
      { id: 2, name: 'Recoleta' } as any,
    ]);
    expect(component.canSwitchBranch()).toBe(false);
  });
});

