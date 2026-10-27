import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { UserService } from '../user.service';
import { Page, User } from '../user.model';
import { HeaderComponent } from '../../header-component/header-component';


@Component({
  imports: [FormsModule, HeaderComponent],
  selector: 'app-user-list',
  styleUrl: './user-list.css',
  templateUrl: './user-list.html',
})
export class UserList implements OnInit {
  
  private readonly userService = inject(UserService);

  usersPage = signal<Page<User> | undefined>(undefined);
  searchTerm = signal<string>('');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Signals para los menús desplegables
  isSortOpen = signal<boolean>(false);
  isFilterOpen = signal<boolean>(false);

  // Signals para guardar los criterios seleccionados
  currentSort = signal<string | undefined>(undefined);
  currentRoleId = signal<number | undefined>(undefined);
  currentBranchId = signal<number | undefined>(undefined);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Construimos los filtros con los valores actuales
    const filters: any = {
      name: this.searchTerm(),
      sort: this.currentSort(),
      userRoleId: this.currentRoleId(),
      branchId: this.currentBranchId()
    };

    this.userService.getAll(filters)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (page) => {
          this.usersPage.set(page);
        },
        error: (err) => {
          console.error('Objeto de error completo:', err);
          this.errorMessage.set(`Failed to load users: ${err.error?.message || err.message}`);
        }
      });
  }

  onSearch(): void {
    this.loadUsers();
  }

  // --- Lógica de Desplegables ---

  toggleSortMenu(event: MouseEvent): void {
    event.stopPropagation(); // Evita que el clic cierre el menú inmediatamente
    this.isSortOpen.update(prev => !prev);
    this.isFilterOpen.set(false); // Cierra el otro menú
  }

  toggleFilterMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isFilterOpen.update(prev => !prev);
    this.isSortOpen.set(false);
  }

  applySort(sortValue: string): void {
    this.currentSort.set(sortValue);
    this.isSortOpen.set(false);
    this.loadUsers();
  }

  applyFilter(type: 'role' | 'branch' | 'clear', id?: number): void {
    if (type === 'clear') {
      this.currentRoleId.set(undefined);
      this.currentBranchId.set(undefined);
    } else if (type === 'role') {
      this.currentRoleId.set(id);
    } else if (type === 'branch') {
      this.currentBranchId.set(id);
    }
    
    this.isFilterOpen.set(false);
    this.loadUsers();
  }

  // Cierra los menús si se hace clic en cualquier otra parte de la pantalla
  @HostListener('document:click')
  closeMenus(): void {
    this.isSortOpen.set(false);
    this.isFilterOpen.set(false);
  }
}
