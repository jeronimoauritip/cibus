import { Routes } from '@angular/router';
import { roleGuard } from './Auth/guards/role-guard';
import { Local } from './Auth/pages/local/local';
import { Login } from './Auth/pages/login/login';
import { UserList } from './components/users/user-list/user-list';
import { UserCreate } from './components/users/user-create/user-create';
import { BranchComponent } from './components/branches/pages/branch/branch';
import { BranchListComponent } from './components/branches/pages/branch-list/branch-list';
import { BranchEmployeesComponent } from './components/branches/pages/branch-employees/branch-employees';
import { ProductsComponent } from './components/products/pages/products-component/products-component';
import { ProductListComponent } from './components/products/pages/product-list-component/product-list-component';
import { AdminPanelComponent } from './components/admin/pages/admin-panel-component/admin-panel-component';

export const routes: Routes = [
    { path: '', component: Local, pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'users', component: UserList },
    { path: 'users/new', component: UserCreate },
    { path: 'branches', component: BranchListComponent },
    { path: 'branches/new', component: BranchComponent },
    { path: 'branches/employees', component: BranchEmployeesComponent },
    { path: 'branches/:branchId/employees', component: BranchEmployeesComponent },
    { path: 'products', component: ProductListComponent },
    { path: 'products/new', component: ProductsComponent },
    { path: 'list-of-products', component: ProductListComponent },
    {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        children: [
            { path: '', component: AdminPanelComponent },
            { path: 'branches', component: BranchListComponent },
            { path: 'branches/new', component: BranchComponent },
            { path: 'employees', component: UserList },
            { path: 'menu', component: ProductListComponent }
        ]
    },
    { path: '**', redirectTo: '' }
];
