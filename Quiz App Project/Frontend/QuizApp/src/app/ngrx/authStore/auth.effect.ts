import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../services/AuthService';
import * as AuthActions from './auth.action';
import { catchError, map, of, switchMap, tap } from 'rxjs';

@Injectable()
export class AuthEffects {
  private actions = inject(Actions);
  private authservice = inject(AuthService);

  login$ = createEffect(() =>
    this.actions.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.authservice.login(email, password).pipe(
          map((response) => {
            const token = response.token;
            const user = this.authservice.decodeToken(response.token);
            localStorage.setItem('access_token', token);
            return AuthActions.loginSuccess({ token, user });
          }),
          catchError((error) =>
            of(
              AuthActions.loginFailure({
                error: error.error?.message || error.message || 'Login failed',
              })
            )
          )
        )
      )
    )
  );

  logout$ = createEffect(
    () =>
      this.actions.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          localStorage.removeItem('access_token');
        })
      ),
    { dispatch: false } // <-- tap doesn't dispatch, so we add this
  );
}
