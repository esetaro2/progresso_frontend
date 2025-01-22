import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const isAuthenticated = this.authService.isAuthenticated();
    const userRole = this.authService.getUserRole();
    const requiredRole = next.data['role'] as string;

    if (isAuthenticated && userRole === requiredRole) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
