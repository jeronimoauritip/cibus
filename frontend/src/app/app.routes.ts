import { Routes } from '@angular/router';
import { UserList } from './user/user-list/user-list';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path:'users', component: UserList}
];
