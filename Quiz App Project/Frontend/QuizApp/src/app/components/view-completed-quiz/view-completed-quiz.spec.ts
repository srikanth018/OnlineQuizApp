import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ViewCompletedQuiz } from './view-completed-quiz';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { QuizService } from '../../services/QuizService';
import { CompletedQuizService } from '../../services/CompletedQuizService';
import { StudentService } from '../../services/StudentService';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ViewCompletedQuiz', () => {
  let component: ViewCompletedQuiz;
  let fixture: ComponentFixture<ViewCompletedQuiz>;
  const mockCompletedQuiz = {
    id: '1',
    quizId: 'q1',
    studentEmail: 'test@gmail.com',
    totalScore: 80,
    startedAt: '2025-07-07T10:00:00Z',
    endedAt: '2025-07-07T10:30:00Z',
    student: { name: 'Test', email: 'test@gmail.com' },
    createdAt: '2025-07-07T09:55:00Z',
    quizData: { title: 'Mock Quiz', totalMarks: 100, timeLimit: '01:00:00' },
    creditPoints: 10,
  };

  const mockQuiz = {
    title: 'Mock Quiz',
    totalMarks: 100,
    timeLimit: '01:00:00',
  };

  const mockStudent = {
    name: 'Test',
    email: 'test@gmail.com',
  };

  const mockCompletedQuizService = {
    getCompletedQuizById: jasmine
      .createSpy()
      .and.returnValue(of({ ...mockCompletedQuiz })),
  };

  const mockQuizService = {
    getQuizById: jasmine.createSpy().and.returnValue(of({ ...mockQuiz })),
  };

  const mockStudentService = {
    getStudentByEmail: jasmine
      .createSpy()
      .and.returnValue(of({ ...mockStudent })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCompletedQuiz],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'sampleId',
              },
            },
          },
        },
        { provide: CompletedQuizService, useValue: mockCompletedQuizService },
        { provide: QuizService, useValue: mockQuizService },
        { provide: StudentService, useValue: mockStudentService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewCompletedQuiz);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load completed quiz on init', () => {
    expect(component.completedQuizId).toBe('sampleId');
    expect(mockCompletedQuizService.getCompletedQuizById).toHaveBeenCalledWith(
      'sampleId'
    );
    expect(component.completedQuiz).toEqual(
      jasmine.objectContaining(mockCompletedQuiz)
    );
  });

  it('should calculate score percentage', () => {
    const percent = component.getScorePercentage({
      totalScore: 80,
      quizData: { totalMarks: 100 },
    });
    expect(percent).toBe(80);
  });

  it('should return 0% score if totalMarks is 0', () => {
    const percent = component.getScorePercentage({
      totalScore: 80,
      quizData: { totalMarks: 0 },
    });
    expect(percent).toBe(0);
  });

  it('should calculate time percentage', () => {
    const result = component.getTimePercentage({
      quizData: { timeLimit: '00:30:00' },
      startedAt: '2025-07-07T10:00:00Z',
      endedAt: '2025-07-07T10:15:00Z',
    });
    expect(result).toBe(50);
  });

  it('should return 0% if time limit is invalid or 0', () => {
    const result = component.getTimePercentage({
      quizData: { timeLimit: '00:00:00' },
      startedAt: '2025-07-07T10:00:00Z',
      endedAt: '2025-07-07T10:15:00Z',
    });
    expect(result).toBe(0);
  });

  it('should calculate completed duration', () => {
    const duration = component.getCompletedDuration(
      '2025-07-07T10:00:00Z',
      '2025-07-07T10:15:30Z'
    );
    expect(duration).toBe('15m 30s');
  });

  it('should parse time to seconds', () => {
    const seconds = component.parseTimeToSeconds('01:02:03');
    expect(seconds).toBe(3723);
  });
});
