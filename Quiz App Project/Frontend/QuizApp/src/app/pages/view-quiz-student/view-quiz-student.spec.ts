import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewQuizStudent } from './view-quiz-student';
import { QuizService } from '../../services/QuizService';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { CompletedQuizService } from '../../services/CompletedQuizService';
import { AuthService } from '../../services/AuthService';

describe('ViewQuizStudent', () => {
  let component: ViewQuizStudent;
  let fixture: ComponentFixture<ViewQuizStudent>;
  let mockQuizService: jasmine.SpyObj<QuizService>;

  beforeEach(async () => {
    mockQuizService = jasmine.createSpyObj('QuizService', ['getQuizById']);
    mockQuizService.getQuizById.and.returnValue(
      of({
        id: 'sampleId',
        title: 'Sample Quiz',
        timeLimit: '00:30:00',
        questions: [],
        totalMarks: 20
      })
    );

    await TestBed.configureTestingModule({
      imports: [ViewQuizStudent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'sampleId'
              }
            }
          }
        },
        {
          provide: QuizService,
          useValue: mockQuizService
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigate'])
        },
        CompletedQuizService,
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewQuizStudent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get quizId from route and fetch quiz data', () => {
    expect(component.quizId).toBe('sampleId');
    expect(mockQuizService.getQuizById).toHaveBeenCalledWith('sampleId');
    expect(component.quiz.title).toBe('Sample Quiz');
    expect(component.quiz.timeLimit).toBe(30); // converted to minutes
  });

  it('should navigate to attempt quiz page', () => {
    const router = TestBed.inject(Router);
    component.quizId = 'sampleId';
    component.attempQuiz();
    expect(router.navigate).toHaveBeenCalledWith(['attempt-quiz', 'sampleId']);
  });

  it('should convert timespan to minutes', () => {
    const result = component.timespanToMinutes('01:15:30');
    expect(result).toBe(75);
  });
});
