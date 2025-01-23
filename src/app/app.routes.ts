import { Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { AuthGuard } from './guard/auth.guard';
import { ProjectDashboardComponent } from './component/project-dashboard/project-dashboard.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [AuthGuard],
    data: { role: 'ADMIN' },
  },
  {
    path: 'dashboard/projects',
    component: ProjectDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'TEAMMEMBER', 'PROJECTMANAGER'] },
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
