import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './services/AuthService';
import { provideState, provideStore } from '@ngrx/store';
import { authReducer } from './ngrx/authStore/auth.reducer';
import { provideEffects } from '@ngrx/effects';
import { AuthEffects } from './ngrx/authStore/auth.effect';
import { RegisterService } from './services/RegisterService';
import { QuizService } from './services/QuizService';
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { AuthGuard } from './guard/auth-guard';
import { RedirectGuard } from './guard/redirect-guard-guard';
import { CompletedQuizService } from './services/CompletedQuizService';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { MessageService } from 'primeng/api';
import { StudentService } from './services/StudentService';
import { TeacherService } from './services/TeacherService';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    AuthService,
    RegisterService,
    QuizService,
    CompletedQuizService,
    StudentService,
    TeacherService,
    provideStore(),
    provideState('auth', authReducer),
    provideEffects(AuthEffects),
    provideLottieOptions({ player: () => player }),
    AuthGuard,
    RedirectGuard,
    // provideAnimationsAsync(),
    provideAnimations(), // required for toast animations
    provideToastr({
      timeOut: 5000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),

    MessageService,
  ],
};
