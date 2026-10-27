import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { BranchService } from '../../service/branch-service';
import { Branch } from '../../models/branch.model';

type SortOption = 'name-asc' | 'name-desc' | 'address-asc';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-branch-list',
  styleUrl: './branch-list.css',
  templateUrl: './branch-list.html',
})
export class BranchListComponent implements OnInit {
  private readonly branchService = inject(BranchService);

  readonly branches = signal<Branch[]>([]);
  readonly searchTerm = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly deletingId = signal<number | null>(null);

  // Sorting
  readonly isSortOpen = signal<boolean>(false);
  readonly currentSort = signal<SortOption | undefined>(undefined);

  // Computed filtered & sorted list
  readonly filteredBranches = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    let list = this.branches();

    if (term) {
      list = list.filter((b) => {
        const nameMatch = b.name.toLowerCase().includes(term);
        const streetMatch = b.street.toLowerCase().includes(term);
        const numberMatch = b.number.toString().includes(term);
        return nameMatch || streetMatch || numberMatch;
      });
    }

    const sort = this.currentSort();
    if (sort) {
      list = [...list].sort((a, b) => {
        if (sort === 'name-asc') {
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        }
        if (sort === 'name-desc') {
          return b.name.localeCompare(a.name, undefined, { sensitivity: 'base' });
        }
        if (sort === 'address-asc') {
          const addrA = `${a.street} ${a.number}`;
          const addrB = `${b.street} ${b.number}`;
          return addrA.localeCompare(addrB, undefined, { sensitivity: 'base' });
        }
        return 0;
      });
    }

    return list;
  });

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.branchService
      .findAll()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.branches.set(data || []);
        },
        error: (err) => {
          console.error('Error fetching branches:', err);
          this.errorMessage.set(
            err.error?.message || err.error?.error || err.message || 'Failed to load branches'
          );
        },
      });
  }

  toggleSortMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isSortOpen.update((prev) => !prev);
  }

  applySort(sortValue: SortOption): void {
    this.currentSort.set(sortValue);
    this.isSortOpen.set(false);
  }

  clearSort(event: MouseEvent): void {
    event.stopPropagation();
    this.currentSort.set(undefined);
    this.isSortOpen.set(false);
  }

  deleteBranch(branch: Branch, event: MouseEvent): void {
    event.stopPropagation();
    if (!branch.id) return;

    const confirmed = window.confirm(`¿Estás seguro de eliminar la sucursal "${branch.name}"?`);
    if (!confirmed) return;

    this.deletingId.set(branch.id);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.branchService.delete(branch.id).subscribe({
      next: () => {
        this.branches.update((list) => list.filter((b) => b.id !== branch.id));
        this.successMessage.set(`Sucursal "${branch.name}" eliminada exitosamente.`);
        this.deletingId.set(null);
      },
      error: (err) => {
        console.error('Error deleting branch:', err);
        this.errorMessage.set(
          err.error?.message || err.error?.error || err.message || 'No se pudo eliminar la sucursal.'
        );
        this.deletingId.set(null);
      },
    });
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.isSortOpen.set(false);
  }
}

export { BranchListComponent as BranchList };

