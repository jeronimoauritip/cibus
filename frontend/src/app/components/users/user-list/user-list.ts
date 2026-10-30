import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { UserService } from '../user.service';
import { Page, User } from '../user.model';
import { HeaderComponent } from '../../header-component/header-component';
import { Branch } from '../../branches/models/branch.model';
import { BranchService } from '../../branches/service/branch-service';

@Component({
  imports: [FormsModule, HeaderComponent, RouterLink],
  selector: 'app-user-list',
  styleUrl: './user-list.css',
  templateUrl: './user-list.html',
})
export class UserList implements OnInit {
  private readonly userService = inject(UserService);
  private readonly branchService = inject(BranchService);
  private readonly router = inject(Router);

  usersPage = signal<Page<User> | undefined>(undefined);
  searchTerm = signal<string>('');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Signals for the dropdown menus
  isSortOpen = signal<boolean>(false);
  isFilterOpen = signal<boolean>(false);

  // Signals to store the selected criteria
  currentSort = signal<string | undefined>(undefined);
  currentRoleId = signal<number | undefined>(undefined);
  currentBranchId = signal<number | undefined>(undefined);
  onlyInactive = signal<boolean>(false);

  // Reactivation modal state
  isReactivateModalOpen = signal<boolean>(false);
  selectedInactiveUser = signal<User | null>(null);
  reactivationStep = signal<'confirm' | 'branch'>('confirm');
  branches = signal<Branch[]>([]);
  isLoadingBranches = signal<boolean>(false);
  selectedBranchId = signal<number | null>(null);
  isReactivating = signal<boolean>(false);
  reactivationError = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  isInactive(user: User): boolean {
    return !user.branchId && !user.branchName;
  }

  getNewEmployeeRoute(): string {
    return this.router.url.startsWith('/admin') ? '/admin/employees/new' : '/users/new';
  }

  onSelectEmployee(user: User): void {
    if (this.isInactive(user)) {
      this.selectedInactiveUser.set(user);
      this.reactivationStep.set('confirm');
      this.selectedBranchId.set(null);
      this.reactivationError.set(null);
      this.isReactivateModalOpen.set(true);
      return;
    }

    const baseRoute = this.router.url.startsWith('/admin') ? '/admin/employees' : '/users';
    this.router.navigate([baseRoute, user.id]);
  }

  proceedToBranchSelection(): void {
    this.reactivationError.set(null);
    this.reactivationStep.set('branch');
    this.loadBranches();
  }

  loadBranches(): void {
    this.isLoadingBranches.set(true);
    this.branchService
      .findAll()
      .pipe(finalize(() => this.isLoadingBranches.set(false)))
      .subscribe({
        next: (data) => {
          this.branches.set(data || []);
        },
        error: (err) => {
          console.error('Error loading branches', err);
          this.reactivationError.set(err.error?.message || 'Failed to load branches.');
        },
      });
  }

  selectBranch(branchId?: number): void {
    if (branchId) {
      this.selectedBranchId.set(branchId);
      this.reactivationError.set(null);
    }
  }

  confirmReactivation(): void {
    const user = this.selectedInactiveUser();
    const branchId = this.selectedBranchId();

    if (!user || !branchId || this.isReactivating()) {
      this.reactivationError.set('Please select a branch to reincorporate the employee.');
      return;
    }

    this.isReactivating.set(true);
    this.reactivationError.set(null);

    this.userService
      .update(user.id, { branchId })
      .pipe(finalize(() => this.isReactivating.set(false)))
      .subscribe({
        next: () => {
          this.isReactivating.set(false);
          this.closeReactivateModal();
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error reactivating employee', err);
          this.reactivationError.set(
            err.error?.message || err.error?.error || 'Failed to reactivate the employee.'
          );
        },
      });
  }

  closeReactivateModal(): void {
    if (this.isReactivating()) return;
    this.isReactivateModalOpen.set(false);
    this.selectedInactiveUser.set(null);
    this.selectedBranchId.set(null);
    this.reactivationError.set(null);
  }

  onModalBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeReactivateModal();
    }
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const filters: any = {
      name: this.searchTerm(),
      sort: this.currentSort(),
      userRoleId: this.currentRoleId(),
      branchId: this.currentBranchId(),
    };

    this.userService
      .getAll(filters)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (page) => {
          if (page?.content) {
            let filtered = page.content.filter((u) => u.role?.toUpperCase() !== 'ADMIN');
            if (this.onlyInactive()) {
              filtered = filtered.filter((u) => this.isInactive(u));
            }
            page = {
              ...page,
              content: filtered,
            };
          }
          this.usersPage.set(page);
        },
        error: (err) => {
          console.error('Full error object:', err);
          this.errorMessage.set(`Failed to load users: ${err.error?.message || err.message}`);
        },
      });
  }

  onSearch(): void {
    this.loadUsers();
  }

  // --- Dropdown logic ---

  toggleSortMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isSortOpen.update((prev) => !prev);
    this.isFilterOpen.set(false);
  }

  toggleFilterMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isFilterOpen.update((prev) => !prev);
    this.isSortOpen.set(false);
  }

  applySort(sortValue: string): void {
    this.currentSort.set(sortValue);
    this.isSortOpen.set(false);
    this.loadUsers();
  }

  applyFilter(type: 'role' | 'branch' | 'inactive' | 'clear', id?: number): void {
    if (type === 'clear') {
      this.currentRoleId.set(undefined);
      this.currentBranchId.set(undefined);
      this.onlyInactive.set(false);
    } else if (type === 'role') {
      this.currentRoleId.set(id);
    } else if (type === 'branch') {
      this.currentBranchId.set(id);
      this.onlyInactive.set(false);
    } else if (type === 'inactive') {
      this.currentBranchId.set(undefined);
      this.onlyInactive.update((prev) => !prev);
    }

    this.isFilterOpen.set(false);
    this.loadUsers();
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.isSortOpen.set(false);
    this.isFilterOpen.set(false);
  }
}
