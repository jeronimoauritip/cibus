import { Component, inject, OnInit, signal } from '@angular/core';
import { form, required, min, max, pattern, FormField, FormRoot } from '@angular/forms/signals';
import { BranchService } from '../../service/branch-service';
import { Branch } from '../../models/branch.model';

export interface BranchFormModel {
  name: string;
  street: string;
  number: number | null;
}

@Component({
  imports: [FormField, FormRoot],
  selector: 'app-branch',
  styleUrl: './branch.css',
  templateUrl: './branch.html',
})
export class BranchComponent implements OnInit {
  private readonly service = inject(BranchService);

  readonly branches = signal<Branch[]>([]);
  readonly isSubmitting = signal<boolean>(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly submitted = signal<boolean>(false);

  // Modelo reactivo para el Signal Form
  readonly branchModel = signal<BranchFormModel>({
    name: '',
    street: '',
    number: null,
  });

  // Signal Form con validaciones que replican BranchRequestDTO de Spring Boot
  readonly branchForm = form(this.branchModel, (b) => {
    required(b.name, { message: 'Name is mandatory' });
    pattern(b.name, /\S+/, { message: 'Name is mandatory' });

    required(b.street, { message: 'Street is mandatory' });
    pattern(b.street, /\S+/, { message: 'Street is mandatory' });

    required(b.number, { message: 'Number is mandatory' });
    min(b.number, 10, { message: 'Number must have at least 2 digits' });
    max(b.number, 9999, { message: 'Number must have at most 4 digits' });
  });

  ngOnInit(): void {
    this.service.findAll().subscribe({
      next: (data) => this.branches.set(data),
      error: (err) => this.errorMessage.set(err.error?.message || err.message),
    });
  }

  isFieldInvalid(fieldName: 'name' | 'street' | 'number'): boolean {
    const field = this.branchForm[fieldName]();
    return field.invalid() && (field.dirty() || field.touched() || this.submitted());
  }

  getNameErrorMessage(): string {
    const errors = this.branchForm.name().errors();
    return errors.length > 0 ? (errors[0].message || 'Name is mandatory') : '';
  }

  getStreetErrorMessage(): string {
    const errors = this.branchForm.street().errors();
    return errors.length > 0 ? (errors[0].message || 'Street is mandatory') : '';
  }

  getNumberErrorMessage(): string {
    const errors = this.branchForm.number().errors();
    return errors.length > 0 ? (errors[0].message || 'Number is mandatory') : '';
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.branchForm().invalid()) {
      this.branchForm().markAsTouched();
      return;
    }

    const { name, street, number } = this.branchModel();
    if (number === null) {
      return;
    }

    const branch: Branch = {
      name: name.trim(),
      street: street.trim(),
      number: Number(number),
    };

    this.isSubmitting.set(true);

    this.service.create(branch).subscribe({
      next: (data) => {
        this.branches.update((prev) => [...prev, data]);
        this.successMessage.set('Branch created successfully!');
        this.branchForm().reset({
          name: '',
          street: '',
          number: null,
        });
        this.submitted.set(false);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err.error?.message || err.error?.error || err.message || 'Failed to create branch'
        );
        this.isSubmitting.set(false);
      },
    });
  }
}
