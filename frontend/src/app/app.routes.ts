import { Routes } from '@angular/router';
import { UserList } from './user/user-list/user-list';
import { BranchComponent } from './components/branches/pages/branch/branch';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/main-page/pages/main-page/main-page.component').then(
        m => m.MainPageComponent
      ),
    title: 'Cibus · Inicio'
  },
  { path: 'users', component: UserList, title: 'Cibus · Empleados' },
  { path: 'branches', component: BranchComponent, title: 'Cibus · Sucursales' },
  { path: '**', redirectTo: 'home' }
];
