import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { BranchListComponent } from './branch-list';
import { BranchService } from '../../service/branch-service';
import { Branch } from '../../models/branch.model';

describe('BranchListComponent', () => {
  let component: BranchListComponent;
  let fixture: ComponentFixture<BranchListComponent>;
  let mockBranchService: any;

  const mockBranches: Branch[] = [
    { id: 1, name: 'Sucursal Centro', street: 'San Martín', number: 1234 },
    { id: 2, name: 'Sucursal Norte', street: 'Independencia', number: 567 },
  ];

  beforeEach(async () => {
    mockBranchService = {
      findAll: () => of(mockBranches),
      delete: () => of(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [BranchListComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: BranchService, useValue: mockBranchService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BranchListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the branch list component', () => {
    expect(component).toBeTruthy();
  });

  it('should load branches on initialization', () => {
    expect(component.branches().length).toBe(2);
    expect(component.filteredBranches().length).toBe(2);
  });

  it('should filter branches by search term', () => {
    component.searchTerm.set('centro');
    expect(component.filteredBranches().length).toBe(1);
    expect(component.filteredBranches()[0].name).toBe('Sucursal Centro');

    component.searchTerm.set('567');
    expect(component.filteredBranches().length).toBe(1);
    expect(component.filteredBranches()[0].name).toBe('Sucursal Norte');

    component.searchTerm.set('inexistente');
    expect(component.filteredBranches().length).toBe(0);
  });

  it('should sort branches alphabetically by name', () => {
    component.applySort('name-desc');
    const sorted = component.filteredBranches();
    expect(sorted[0].name).toBe('Sucursal Norte');
    expect(sorted[1].name).toBe('Sucursal Centro');

    component.applySort('name-asc');
    const sortedAsc = component.filteredBranches();
    expect(sortedAsc[0].name).toBe('Sucursal Centro');
    expect(sortedAsc[1].name).toBe('Sucursal Norte');
  });
});
