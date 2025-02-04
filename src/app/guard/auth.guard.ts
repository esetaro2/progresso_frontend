import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const isAuthenticated = this.authService.isAuthenticated();
    const userRole = this.authService.getUserRole();
    const requiredRoles = next.data['roles'] as string[];

    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return false;
    }

    if (requiredRoles && (!userRole || !requiredRoles.includes(userRole))) {
      this.router.navigate(['/not-authorized']);
      return false;
    }

    return true;
  }
}
