import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { AuthService } from '../../services/AuthService';
import { MessageService } from 'primeng/api';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as AuthActions from '../../ngrx/authStore/auth.action';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('Login Component', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let store: MockStore;
  let dispatchSpy: jasmine.Spy;
  let routerNavigateSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login, ToastrModule.forRoot()],
      providers: [
        AuthService,
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({
          initialState: {
            auth: {
              user: null,
              isAuthenticated: false,
              error: 'Invalid credentials',
              loading: false,
            },
          },
        }),

        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
          },
        },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;

    routerNavigateSpy = TestBed.inject(Router).navigate as jasmine.Spy;

    fixture.detectChanges();
  });

  it('should create the Login component', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form if fields are empty', () => {
    component.loginForm.setValue({ email: '', password: '' });
    expect(component.loginForm.invalid).toBeTrue();
  });

  it('should have a valid form with correct inputs', () => {
    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'pass123',
    });
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should dispatch login action when form is valid and login is called', () => {
    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'pass123',
    });
    component.login();
    expect(dispatchSpy).toHaveBeenCalledWith(
      AuthActions.login({ email: 'test@example.com', password: 'pass123' })
    );
  });

  it('should toggle showLogin flag on toggleForm()', () => {
    const initial = component.showLogin;
    component.toggleForm();
    expect(component.showLogin).toBe(!initial);
  });

  it('should dispatch loginSuccess if token is in localStorage', () => {
    const mockUser = { nameid: 'abc', role: 'Student' };
    spyOn(localStorage, 'getItem').and.returnValue('mockToken');
    spyOn(component['authService'], 'decodeToken').and.returnValue(mockUser);

    component.ngOnInit();

    expect(dispatchSpy).toHaveBeenCalledWith(
      AuthActions.loginSuccess({ token: 'mockToken', user: mockUser })
    );
  });

  it('should set errorMessage when error occurs', () => {
    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'wrongpass',
    });
    component.login();

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Invalid credentials');
  });


});
