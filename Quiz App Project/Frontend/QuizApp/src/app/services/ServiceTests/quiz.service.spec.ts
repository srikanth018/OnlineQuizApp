import { TestBed } from '@angular/core/testing';
import { QuizService } from '../QuizService';
import {
  HttpClientTestingModule,
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('QuizService', () => {
  let service: QuizService;
  let httpMock: HttpTestingController;

  const token = 'mock-token';
  const authHeader = { Authorization: `Bearer ${token}` };

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.returnValue(token);

    TestBed.configureTestingModule({
      providers: [QuizService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(QuizService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create a quiz', () => {
    const quizData = { title: 'Test Quiz' };

    service.createQuiz(quizData).subscribe((res) => {
      expect(res).toBe('Quiz created successfully');
    });

    const req = httpMock.expectOne('http://localhost:5038/api/v1/quizzes/quiz');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe(
      authHeader.Authorization
    );
    req.flush({}, { status: 201, statusText: 'Created' });
  });

  it('should download quiz template', () => {
    const blob = new Blob(['test'], { type: 'application/vnd.ms-excel' });

    service.downloadQuizTemplate(5, 4).subscribe((res) => {
      expect(res).toEqual(blob);
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url === 'http://localhost:5038/api/v1/quizzes/template' &&
        r.params.get('questionCount') === '5' &&
        r.params.get('optionCount') === '4'
    );

    expect(req.request.method).toBe('GET');
    req.flush(blob);
  });

  it('should bulk upload a quiz file', () => {
    const file = new File(['dummy content'], 'quiz.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const filedata = {
      title: 'Math Quiz',
      description: 'A basic math quiz',
      category: 'Mathematics',
      uploadedBy: 'teacher@gmail.com',
      totalMarks: 100,
      timeLimit: '30',
      file: file,
    };

    service.bulkUploadQuiz(filedata).subscribe((res) => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne(
      'http://localhost:5038/api/v1/quizzes/bulk-upload'
    );
    expect(req.request.method).toBe('POST');

    expect(req.request.body instanceof FormData).toBeTrue();
    expect(req.request.headers.get('Authorization')).toContain('Bearer');

    req.flush({ success: true });
  });

  it('should get uploaded quizzes by teacher email', () => {
    const email = 'teacher@gmail.com';

    service.getUploadedQuizzes(email).subscribe((res) => {
      expect(res).toEqual([{ id: 'q1' }]);
    });

    const req = httpMock.expectOne(
      `http://localhost:5038/api/v1/quizzes/getbyteacher?email=${email}`
    );
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 'q1' }]);
  });

  it('should get quiz by ID', () => {
    const quizId = '123';

    service.getQuizById(quizId).subscribe((res) => {
      expect(res).toEqual({ id: quizId });
    });

    const req = httpMock.expectOne(
      `http://localhost:5038/api/v1/quizzes/${quizId}`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ id: quizId });
  });

  it('should get all quizzes', () => {
    service.getAllQuizzes().subscribe((res) => {
      expect(res.length).toBeGreaterThan(0);
    });

    const req = httpMock.expectOne(`http://localhost:5038/api/v1/quizzes`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: '1' }, { id: '2' }]);
  });

  it('should attempt a quiz by ID', () => {
    const quizId = 'q123';

    service.attemptQuiz(quizId).subscribe((res) => {
      expect(res).toEqual({ quizId });
    });

    const req = httpMock.expectOne(
      `http://localhost:5038/api/v1/attempt-quiz/${quizId}`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ quizId });
  });

  it('should search quizzes', () => {
    const searchTerm = 'math';
    const limit = 5;
    const skip = 0;
    const category = 'Science';

    service
      .searchQuizzes(searchTerm, limit, skip, category)
      .subscribe((res) => {
        expect(res).toEqual([{ id: 'q1' }]);
      });

    const req = httpMock.expectOne(
      (r) =>
        r.url === 'http://localhost:5038/api/v1/quizzes/search' &&
        r.params.get('searchTerm') === searchTerm &&
        r.params.get('limit') === limit.toString() &&
        r.params.get('skip') === skip.toString() &&
        r.params.get('category') === category
    );
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 'q1' }]);
  });

  it('should submit quiz answers', () => {
    const submitData: any = {
      quizId: 'q1',
      studentEmail: 'student@gmail.com',
      answers: [],
    };

    service.submitQuiz(submitData).subscribe((res) => {
      expect(res).toEqual({ message: 'submitted' });
    });

    const req = httpMock.expectOne(
      'http://localhost:5038/api/v1/attempt-quiz/submit'
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(submitData);
    req.flush({ message: 'submitted' });
  });

  it('should update a question', () => {
    const quizId = 'q1';
    const questionId = 'qst1';
    const payload = { text: 'Updated?' };

    service.updateQuestion(quizId, questionId, payload).subscribe((res) => {
      expect(res).toEqual({ updated: true });
    });

    const req = httpMock.expectOne(
      `http://localhost:5038/api/v1/quizzes/question/${questionId}`
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ updated: true });
  });
});
