import { Routes } from '@angular/router';
import { UserList } from './user/user-list/user-list';
import { BranchComponent } from './components/branches/pages/branch/branch';
import { ProductsComponent } from './components/products/pages/products-component/products-component';
import { ProductListComponent } from './components/products/pages/product-list-component/product-list-component';

export const routes: Routes = [
    { path: '', redirectTo: 'branches', pathMatch: 'full' },
    { path: 'users', component: UserList },
    { path: 'branches', component: BranchComponent },
    { path: 'new-product', component: ProductsComponent },
    { path: 'list-of-products', component: ProductListComponent }
];
