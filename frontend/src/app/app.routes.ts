import { Routes } from '@angular/router';
import { UserList } from './components/users/user-list/user-list';
import { UserCreate } from './components/users/user-create/user-create';
import { BranchComponent } from './components/branches/pages/branch/branch';
import { ProductsComponent } from './components/products/pages/products-component/products-component';

export const routes: Routes = [
    { path: '', redirectTo: 'branches', pathMatch: 'full' },
    { path: 'users', component: UserList },
    { path: 'users/new', component: UserCreate },
    { path: 'branches', component: BranchComponent },
    { path: 'new-product', component: ProductsComponent }
];
