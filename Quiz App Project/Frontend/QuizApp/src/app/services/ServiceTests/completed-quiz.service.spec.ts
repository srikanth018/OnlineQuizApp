import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CompletedQuizService } from '../CompletedQuizService';

describe('CompletedQuizService', () => {
  let service: CompletedQuizService;
  let httpMock: HttpTestingController;

  const mockToken = 'mock-token';
  const mockHeaders = {
    Authorization: `Bearer ${mockToken}`,
  };

  beforeEach(() => {
    // Mock localStorage
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'access_token') {
        return mockToken;
      }
      return null;
    });

    TestBed.configureTestingModule({
      providers: [
        CompletedQuizService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(CompletedQuizService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch completed quizzes by quizId', () => {
    const quizId = '123';
    const mockResponse = [{ id: 1, quizId: '123' }];

    service.getCompletedQuizByQuizId(quizId).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `http://localhost:5038/api/v1/completed-quizzes/quizId/${quizId}`
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(
      mockHeaders.Authorization
    );
    req.flush(mockResponse);
  });

  it('should fetch completed quizzes by student email', () => {
    const email = 'test@gmail.com';
    const mockResponse = [{ id: 2, studentEmail: email }];

    service.getCompletedQuizByStudentEmail(email).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      (request) =>
        request.url ===
          `http://localhost:5038/api/v1/completed-quizzes/student` &&
        request.params.get('studentEmail') === email
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(
      mockHeaders.Authorization
    );
    req.flush(mockResponse);
  });

  it('should fetch completed quiz by ID', () => {
    const completedQuizId = 'abc';
    const mockResponse = { id: 'abc' };

    service.getCompletedQuizById(completedQuizId).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `http://localhost:5038/api/v1/completed-quizzes/${completedQuizId}`
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(
      mockHeaders.Authorization
    );
    req.flush(mockResponse);
  });

  it('should fetch all completed quizzes', () => {
    const mockResponse = [{ id: 1 }, { id: 2 }];

    service.getAllCompletedQuizzes().subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `http://localhost:5038/api/v1/completed-quizzes`
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(
      mockHeaders.Authorization
    );
    req.flush(mockResponse);
  });
});
