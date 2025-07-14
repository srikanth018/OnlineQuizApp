import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderBoard } from './leader-board';
import { QuizService } from '../../services/QuizService';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CompletedQuizService } from '../../services/CompletedQuizService';
import { AuthService } from '../../services/AuthService';
import { StudentService } from '../../services/StudentService';
import { CompletedQuiz } from '../../models/CompletedQuiz';
import { Quiz } from '../../models/QuizModel';
const mockJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJlbWFpbCI6InN0dWRlbnRAZXhhbXBsZS5jb20iLCJyb2xlIjoiU3R1ZGVudCJ9.' +
  'signature';

import { of } from 'rxjs';

class MockCompletedQuizService {
  getCompletedQuizByStudentEmail = jasmine.createSpy().and.returnValue(
    of({
      $values: [
        new CompletedQuiz(
          '1',
          90,
          'student@gmail.com',
          'q1',
          null,
          '',
          '',
          '2025-07-01T00:00:00',
          new Quiz(),
          10
        ),
      ],
    })
  );

  getAllCompletedQuizzes = jasmine.createSpy().and.returnValue(
    of({
      $values: [
        new CompletedQuiz(
          '1',
          90,
          'student@gmail.com',
          'q1',
          null,
          '',
          '',
          '2025-07-01T00:00:00',
          new Quiz(),
          10
        ),
        new CompletedQuiz(
          '2',
          95,
          'user2@gmail.com',
          'q2',
          null,
          '',
          '',
          '2025-07-02T00:00:00',
          new Quiz(),
          15
        ),
      ],
    })
  );
}

class MockAuthService {
  decodeToken(mockJwt: string) {
    return { nameid: 'student@gmail.com' };
  }
}

class MockStudentService {
  getStudentByEmail(email: string) {
    return of({ name: email.split('@')[0] });
  }
}

describe('LeaderBoard', () => {
  let component: LeaderBoard;
  let fixture: ComponentFixture<LeaderBoard>;

  beforeEach(async () => {
    spyOn(localStorage, 'getItem').and.returnValue('mockToken');

    await TestBed.configureTestingModule({
      imports: [LeaderBoard],
      providers: [
        { provide: CompletedQuizService, useClass: MockCompletedQuizService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: StudentService, useClass: MockStudentService },
        QuizService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LeaderBoard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load completed quizzes for logged in user', () => {
    expect(component.completedQuizzesByUser.length).toBeGreaterThan(0);
    expect(component.completedQuizzesByUser[0].studentEmail).toEqual(
      'student@gmail.com'
    );
  });

  it('should load all completed quizzes and calculate leaderboard', async () => {
    await component.loadLeaderBoardData();
    expect(component.leaderBoardData.length).toBe(2);
    expect(component.leaderBoardData[0].totalCredits).toBeGreaterThanOrEqual(
      component.leaderBoardData[1].totalCredits
    );
  });

  it('should return current rank of the logged-in student', async () => {
    await component.loadLeaderBoardData();
    const rank = component.getCurrentRank();
    expect(rank).toBeGreaterThan(0);
  });

  it('should calculate credits needed for next rank', async () => {
    await component.loadLeaderBoardData();
    const creditsNeeded = component.getCreditsNeededForNextRank();
    expect(creditsNeeded).toBeGreaterThanOrEqual(0);
  });
});
