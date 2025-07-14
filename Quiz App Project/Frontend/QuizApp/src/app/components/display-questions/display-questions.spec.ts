import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisplayQuestions } from './display-questions';
import { QuizService } from '../../services/QuizService';
import { AuthService } from '../../services/AuthService';
import { of } from 'rxjs';
import { AttemptQuizResponse } from '../../models/AttemptQuizResponse';
import { ToastrModule } from 'ngx-toastr';

describe('DisplayQuestions', () => {
  let component: DisplayQuestions;
  let fixture: ComponentFixture<DisplayQuestions>;

  const mockQuizService = {
    attemptQuiz: jasmine.createSpy('attemptQuiz').and.returnValue(
      of({
        questions: {
          $values: [
            {
              questionId: 'q1',
              questionText: 'What is Angular?',
              imageUrl: '',
              options: {
                $values: [
                  { optionId: 'opt1', optionText: 'Framework' },
                  { optionId: 'opt2', optionText: 'Library' },
                ],
              },
            },
          ],
        },
        timeLimit: '00:00:10',
      })
    ),
  };

  const mockAuthService = {
    decodeToken: jasmine.createSpy('decodeToken').and.returnValue({
      nameid: 'student@gmail.com',
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayQuestions, ToastrModule.forRoot()],
      providers: [
        { provide: QuizService, useValue: mockQuizService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DisplayQuestions);
    component = fixture.componentInstance;

    // Mock the input
    component.quizId = 'sample-quiz-id';

    // Set up fake token in localStorage
    localStorage.setItem('access_token', 'fake.jwt.token');

    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear(); // Clean up
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load quiz and initialize questions', () => {
    expect(component.questions.length).toBe(1);
    expect(component.questions[0].questionId).toBe('q1');
    expect(mockQuizService.attemptQuiz).toHaveBeenCalledWith('sample-quiz-id');
  });

  it('should calculate progress correctly', () => {
    component.addSelectedOption('q1', 'opt1');
    expect(component.completedPercentage).toBe(100);
    expect(component.isOptionSelected('q1', 'opt1')).toBeTrue();
  });
});
