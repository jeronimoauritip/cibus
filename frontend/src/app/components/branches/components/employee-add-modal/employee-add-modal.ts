import { Component, computed, effect, HostListener, inject, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { User } from '../../../users/user.model';
import { UserService } from '../../../users/user.service';

@Component({
  selector: 'app-employee-add-modal',
  imports: [FormsModule],
  templateUrl: './employee-add-modal.html',
  styleUrl: './employee-add-modal.css',
})
export class EmployeeAddModalComponent {
  private readonly userService = inject(UserService);

  readonly isOpen = model<boolean>(false);
  readonly currentBranchId = input<number | null>(null);

  readonly allEmployees = signal<User[]>([]);
  readonly modalSearchTerm = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly filteredEmployees = computed(() => {
    const term = this.modalSearchTerm().trim().toLowerCase();
    const list = this.allEmployees().filter((u) => u.role?.toUpperCase() !== 'ADMIN');

    if (!term) {
      return list;
    }

    return list.filter((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      const branch = (u.branchName || '').toLowerCase();
      return (
        u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        fullName.includes(term) ||
        branch.includes(term)
      );
    });
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.modalSearchTerm.set('');
        this.loadAllEmployees();
      }
    });
  }

  loadAllEmployees(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService
      .getAll({ size: 200 })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (page) => {
          this.allEmployees.set(page?.content || []);
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || err.error?.error || err.message || 'Failed to load employees.'
          );
        },
      });
  }

  close(): void {
    this.isOpen.set(false);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen()) {
      this.close();
    }
  }
}

