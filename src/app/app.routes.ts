import { Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { AuthGuard } from './guard/auth.guard';
import { ProjectDashboardComponent } from './component/project-dashboard/project-dashboard.component';
import { NotAuthorizedComponent } from './component/not-authorized/not-authorized.component';
import { LoginGuard } from './guard/login.guard';

export const routes: Routes = [
  {
    path: '',
    component: ProjectDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'TEAMMEMBER', 'PROJECTMANAGER'] },
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'not-authorized',
    component: NotAuthorizedComponent,
  },
];
