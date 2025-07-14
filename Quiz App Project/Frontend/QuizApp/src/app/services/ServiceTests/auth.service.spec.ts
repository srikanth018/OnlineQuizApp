import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../AuthService';
import { provideHttpClient } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [AuthService, provideHttpClientTesting(), provideHttpClient(), ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('should decode the token correctly', () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
      + 'eyJ1c2VySWQiOiIxMjM0NTYiLCJlbWFpbCI6InRlc3RAZW1haWwuY29tIiwicm9sZSI6InN0dWRlbnQifQ.'
      + 's3gX1rhJBPYz9pGzZz-nRgaL9PlzZn-YTLKNUZrxRls';

    const decoded = service.decodeToken(fakeToken);
    expect(decoded).toEqual(jasmine.objectContaining({
      userId: '123456',
      email: 'test@email.com',
      role: 'student'
    }));
  });
});
