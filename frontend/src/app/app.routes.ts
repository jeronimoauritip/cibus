import { Routes } from '@angular/router'

import { Local } from './Auth/pages/local/local'
import { Login } from './Auth/pages/login/login'


export const routes: Routes = [
  { path: '',      component: Local, pathMatch: 'full' },
  { path: 'login', component: Login },

  { path: '**', redirectTo: '' }
]
