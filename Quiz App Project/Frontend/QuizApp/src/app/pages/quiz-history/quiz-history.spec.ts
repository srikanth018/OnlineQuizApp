import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizHistory } from './quiz-history';
import { QuizService } from '../../services/QuizService';
import { AuthService } from '../../services/AuthService';
import { CompletedQuizService } from '../../services/CompletedQuizService';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { of } from 'rxjs';
import { CompletedQuiz } from '../../models/CompletedQuiz';
import { Quiz } from '../../models/QuizModel';

const mockCompletedQuizzes = [
  new CompletedQuiz(
    '1',
    85,
    'test@email.com',
    'quiz1',
    null,
    '',
    '',
    '2025-07-07T10:00:00',
    new Quiz('quiz1', 'Math Basics', 'Math'),
    10
  ),
  new CompletedQuiz(
    '2',
    90,
    'test@email.com',
    'quiz2',
    null,
    '',
    '',
    '2025-07-06T10:00:00',
    new Quiz('quiz2', 'Algebra Intro', 'Math'),
    15
  ),
  new CompletedQuiz(
    '3',
    78,
    'test@email.com',
    'quiz3',
    null,
    '',
    '',
    '2025-07-05T10:00:00',
    new Quiz('quiz3', 'English Basics', 'English'),
    8
  ),
];

class MockCompletedQuizService {
  getCompletedQuizByStudentEmail(email: string) {
    return of({ $values: mockCompletedQuizzes });
  }
}

class MockQuizService {
  getQuizById(quizId: string) {
    const quiz = mockCompletedQuizzes.find(
      (q) => q.quizId === quizId
    )?.quizData;
    return of(quiz);
  }
}

class MockAuthService {
  decodeToken(token: string) {
    return { nameid: 'test@email.com' };
  }
}

describe('QuizHistory', () => {
  let component: QuizHistory;
  let fixture: ComponentFixture<QuizHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizHistory],
      providers: [
        { provide: CompletedQuizService, useClass: MockCompletedQuizService },
        { provide: QuizService, useClass: MockQuizService },
        { provide: AuthService, useClass: MockAuthService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'access_token') {
        return 'mockToken';
      }
      return null;
    });

    fixture = TestBed.createComponent(QuizHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load completed quizzes and quiz data', async () => {
    await component.getQuizData();
    expect(component.completedQuizzes.length).toBe(3);
    expect(component.filteredQuizzes.length).toBe(3);
  });

  it('should filter quizzes by search value', () => {
    component.searchValue = 'algebra';
    component.filterSearchQuizzes();
    expect(component.filteredQuizzes.length).toBe(1);
    expect(component.filteredQuizzes[0].quizData.title).toBe('Algebra Intro');
  });
});
