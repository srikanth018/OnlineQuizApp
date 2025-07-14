import { TestBed } from '@angular/core/testing';
import { StudentService } from '../StudentService';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('StudentService', () => {
  let service: StudentService;
  let httpMock: HttpTestingController;

  const mockToken = 'mock-token';
  const authHeader = { Authorization: `Bearer ${mockToken}` };

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return key === 'access_token' ? mockToken : null;
    });

    TestBed.configureTestingModule({
      providers: [
        StudentService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(StudentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch student by email', () => {
    const email = 'student@gmail.com';
    const mockResponse = { id: '1', name: 'Student A', email };

    service.getStudentByEmail(email).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `http://localhost:5038/api/v1/students/byEmail?email=${email}`
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(
      authHeader.Authorization
    );

    req.flush(mockResponse);
  });
});
