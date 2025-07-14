import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Observable, of } from 'rxjs';
import { selectUser } from '../ngrx/authStore/auth.selector';
import { AuthService } from '../services/AuthService';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
  private store = inject(Store);
  private authService = inject(AuthService);
  constructor(private router: Router) {}

canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.validateAccess(childRoute);
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.validateAccess(route);
  }

  private validateAccess(route: ActivatedRouteSnapshot): Observable<boolean> {
    const token = localStorage.getItem("access_token");

    if (!token) {
      this.router.navigate(['']);
      return of(false);
    }

    const user = this.authService.decodeToken(token);
    const expectedRoles = route.data['roles'] as string[];

    console.log('User roles:', user?.role);
    console.log('Expected roles:', expectedRoles);

    if (expectedRoles && expectedRoles.length > 0) {
      const userRoles = user?.role ? user.role.split(',') : [];
      const hasRole = expectedRoles.some(role => userRoles.includes(role));
      if (!hasRole) {
        this.router.navigate(['']);
        return of(false);
      }
    }

    return of(true);
  }

}
