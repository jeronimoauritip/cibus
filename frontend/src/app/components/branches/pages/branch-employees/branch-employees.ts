import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { HeaderComponent } from '../../../header-component/header-component';
import { User } from '../../../users/user.model';
import { UserService } from '../../../users/user.service';
import { Branch } from '../../models/branch.model';
import { BranchService } from '../../service/branch-service';
import { EmployeeEditModalComponent } from '../../components/employee-edit-modal/employee-edit-modal';
import { EmployeeAddModalComponent } from '../../components/employee-add-modal/employee-add-modal';

@Component({
  selector: 'app-branch-employees',
  imports: [
    FormsModule,
    RouterLink,
    HeaderComponent,
    EmployeeEditModalComponent,
    EmployeeAddModalComponent,
  ],
  templateUrl: './branch-employees.html',
  styleUrl: './branch-employees.css',
})
export class BranchEmployeesComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly branchService = inject(BranchService);

  // Route parameter bound via withComponentInputBinding()
  readonly branchId = input<string>();

  readonly branch = signal<Branch | null>(null);
  readonly employees = signal<User[]>([]);
  readonly roles = signal<string[]>(['MANAGER', 'HOST', 'WAITER', 'KITCHEN']);
  readonly searchTerm = signal<string>('');

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Modal states
  readonly selectedEmployee = signal<User | null>(null);
  readonly isAddModalOpen = signal<boolean>(false);

  readonly parsedBranchId = computed<number | null>(() => {
    const raw = this.branchId();
    if (!raw) return null;
    const num = Number(raw);
    return Number.isNaN(num) ? null : num;
  });

  // Central list filtered reactively by employee name
  readonly filteredEmployees = computed<User[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const currentId = this.parsedBranchId();

    const activeInBranch = this.employees().filter((user) => {
      if (user.role?.toUpperCase() === 'ADMIN') return false;
      if (currentId !== null && user.branchId !== undefined && user.branchId !== null) {
        return user.branchId === currentId;
      }
      return Boolean(user.branchId || user.branchName);
    });

    if (!term) {
      return activeInBranch;
    }

    return activeInBranch.filter((user) => {
      const first = user.firstName.toLowerCase();
      const last = user.lastName.toLowerCase();
      const fullName = `${first} ${last}`;
      return first.includes(term) || last.includes(term) || fullName.includes(term);
    });
  });

  constructor() {
    effect(() => {
      const id = this.parsedBranchId();
      if (id !== null) {
        this.loadBranchDetails(id);
        this.loadBranchEmployees(id);
      }
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    if (this.parsedBranchId() === null) {
      this.loadBranchEmployees(undefined);
    }
  }

  loadBranchDetails(id: number): void {
    this.branchService.findById(id).subscribe({
      next: (data) => this.branch.set(data),
      error: () => this.branch.set(null),
    });
  }

  loadBranchEmployees(branchId?: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService
      .getAll({ branchId, size: 100 })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (page) => {
          this.employees.set(page?.content || []);
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || err.error?.error || err.message || 'Failed to load branch employees.'
          );
        },
      });
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (data) => {
        if (data?.length) {
          this.roles.set(data.filter((r) => r.toUpperCase() !== 'ADMIN'));
        }
      },
      error: () => {
        // Fallback default non-admin roles already set
      },
    });
  }

  openEditModal(employee: User): void {
    this.successMessage.set(null);
    this.selectedEmployee.set(employee);
  }

  closeEditModal(): void {
    this.selectedEmployee.set(null);
  }

  openAddModal(): void {
    this.successMessage.set(null);
    this.isAddModalOpen.set(true);
  }

  onEmployeeUpdated(updatedUser: User): void {
    this.employees.update((list) =>
      list.map((emp) => (emp.id === updatedUser.id ? updatedUser : emp))
    );
    this.successMessage.set(
      `Role for ${updatedUser.firstName} ${updatedUser.lastName} updated to ${updatedUser.role}.`
    );
  }

  onEmployeeDeleted(deletedId: number): void {
    const removed = this.employees().find((emp) => emp.id === deletedId);
    this.employees.update((list) => list.filter((emp) => emp.id !== deletedId));
    if (removed) {
      this.successMessage.set(
        `Employee ${removed.firstName} ${removed.lastName} removed from the branch.`
      );
    } else {
      this.successMessage.set('Employee removed from the branch.');
    }
  }
}

export { BranchEmployeesComponent as BranchEmployees };

