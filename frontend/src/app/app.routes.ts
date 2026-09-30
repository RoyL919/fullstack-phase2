import { Routes } from '@angular/router';

import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { Admin } from './admin/admin';

import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';
import { Groups } from './groups/groups';
import { Chat } from './chat/chat';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'groups',
    component: Groups,
    canActivate: [authGuard]
  },
  {
    path: 'chat/:channelId/:channelName',
    component: Chat,
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  },
  
];