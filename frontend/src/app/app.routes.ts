import { Routes } from '@angular/router';
import { UserList } from './components/users/user-list/user-list';
import { BranchComponent } from './components/branches/pages/branch/branch';
import { ProductsComponent } from './components/products/pages/products-component/products-component';
import { UserCreate } from './components/users/user-create/user-create';
import { HeaderComponent } from './components/header-component/header-component';

export const routes: Routes = [
    { path: '', redirectTo: 'branches', pathMatch: 'full' },
    { path: 'users', component: UserList },
    { path: 'users/new', component: UserCreate },
    { path: 'branches', component: BranchComponent },
    { path: 'product/new', component: ProductsComponent },
    { path: 'header', component: HeaderComponent }
];
