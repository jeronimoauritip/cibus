import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { BranchComponent } from './branch';
import { BranchService } from '../../service/branch-service';
import { Branch } from '../../models/branch.model';

describe('BranchComponent Signal Forms Validations', () => {
  let component: BranchComponent;
  let fixture: ComponentFixture<BranchComponent>;
  let branchServiceMock: any;

  beforeEach(async () => {
    branchServiceMock = {
      findAll: () => of([]),
      create: (branch: Branch) => of({ id: 1, ...branch }),
      update: (branch: Branch) => of(branch),
      delete: () => of(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [BranchComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: BranchService, useValue: branchServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BranchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the branch component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize signal form as invalid when empty', () => {
    expect(component.branchForm().valid()).toBe(false);
  });

  it('should validate name required and not blank', () => {
    component.branchForm.name().value.set('');
    expect(component.branchForm.name().valid()).toBe(false);
    expect(component.getNameErrorMessage()).toBe('Name is mandatory');

    component.branchForm.name().value.set('   ');
    expect(component.branchForm.name().valid()).toBe(false);
    expect(component.getNameErrorMessage()).toBe('Name is mandatory');

    component.branchForm.name().value.set('Sucursal Centro');
    expect(component.branchForm.name().valid()).toBe(true);
  });

  it('should validate street required and not blank', () => {
    component.branchForm.street().value.set('');
    expect(component.branchForm.street().valid()).toBe(false);
    expect(component.getStreetErrorMessage()).toBe('Street is mandatory');

    component.branchForm.street().value.set('   ');
    expect(component.branchForm.street().valid()).toBe(false);
    expect(component.getStreetErrorMessage()).toBe('Street is mandatory');

    component.branchForm.street().value.set('San Martín');
    expect(component.branchForm.street().valid()).toBe(true);
  });

  it('should validate number constraints according to BranchRequestDTO (@Min 10, @Max 9999)', () => {
    component.branchForm.number().value.set(null);
    expect(component.branchForm.number().valid()).toBe(false);
    expect(component.getNumberErrorMessage()).toBe('Number is mandatory');

    // Menos de 2 dígitos (valor < 10)
    component.branchForm.number().value.set(9);
    expect(component.branchForm.number().valid()).toBe(false);
    expect(component.getNumberErrorMessage()).toBe('Number must have at least 2 digits');

    // Más de 4 dígitos (valor > 9999)
    component.branchForm.number().value.set(10000);
    expect(component.branchForm.number().valid()).toBe(false);
    expect(component.getNumberErrorMessage()).toBe('Number must have at most 4 digits');

    // Válido (entre 10 y 9999)
    component.branchForm.number().value.set(1250);
    expect(component.branchForm.number().valid()).toBe(true);
    expect(component.getNumberErrorMessage()).toBe('');
  });

  it('should mark form valid and submit when data matches backend requirements', () => {
    component.branchModel.set({
      name: 'Sucursal Norte',
      street: 'Independencia',
      number: 2821,
    });

    expect(component.branchForm().valid()).toBe(true);

    component.onSubmit();
    expect(component.successMessage()).toBe('Branch created successfully!');
  });
});
