import { Routes } from '@angular/router';

import { Local } from './Auth/pages/local/local';
import { Login } from './Auth/pages/login/login';
import { UserList } from './components/users/user-list/user-list';
import { UserCreate } from './components/users/user-create/user-create';
import { BranchComponent } from './components/branches/pages/branch/branch';
import { ProductsComponent } from './components/products/pages/products-component/products-component';
import { ProductListComponent } from './components/products/pages/product-list-component/product-list-component';

export const routes: Routes = [
    { path: '', component: Local, pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'users', component: UserList },
    { path: 'users/new', component: UserCreate },
    { path: 'branches', component: BranchComponent },
    { path: 'products/new', component: ProductsComponent },
    { path: 'list-of-products', component: ProductListComponent },

    { path: '**', redirectTo: '' }
];
