import { TestBed } from '@angular/core/testing';
import { TeacherService } from '../TeacherService';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('TeacherService', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;

  const mockToken = 'mock-token';
  const authHeader = { Authorization: `Bearer ${mockToken}` };

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return key === 'access_token' ? mockToken : null;
    });

    TestBed.configureTestingModule({
      providers: [
        TeacherService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch teacher by email', () => {
    const email = 'teacher@gmail.com';
    const mockResponse = { id: 't1', name: 'Teacher A', email };

    service.getTeacherByEmail(email).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `http://localhost:5038/api/v1/teachers/byEmail?email=${email}`
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(
      authHeader.Authorization
    );

    req.flush(mockResponse);
  });
});
