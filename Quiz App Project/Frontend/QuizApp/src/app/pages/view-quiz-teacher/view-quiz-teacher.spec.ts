import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { ViewQuizTeacher } from './view-quiz-teacher';
import { of } from 'rxjs';
import { QuizService } from '../../services/QuizService';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CompletedQuizService } from '../../services/CompletedQuizService';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';

describe('ViewQuizTeacher', () => {
  let component: ViewQuizTeacher;
  let fixture: ComponentFixture<ViewQuizTeacher>;

  let mockQuizService: jasmine.SpyObj<QuizService>;
  let mockCompletedQuizService: jasmine.SpyObj<CompletedQuizService>;

  beforeEach(async () => {
    
    mockQuizService = jasmine.createSpyObj('QuizService', ['getQuizById', 'updateQuestion']);
    mockCompletedQuizService = jasmine.createSpyObj('CompletedQuizService', ['getCompletedQuizByQuizId']);

    mockQuizService.getQuizById.and.returnValue(of({
      id: 'quiz1',
      timeLimit: '00:30:00',
      totalMarks: 10,
      questions: []
    }));

    mockCompletedQuizService.getCompletedQuizByQuizId.and.returnValue(of({
      $values: [
        {
          startedAt: new Date('2023-01-01T10:00:00Z'),
          endedAt: new Date('2023-01-01T10:20:00Z'),
          totalScore: 8
        }
      ]
    }));

    await TestBed.configureTestingModule({
      imports: [ViewQuizTeacher, ToastrModule.forRoot()],
      providers: [
        { provide: QuizService, useValue: mockQuizService },
        { provide: CompletedQuizService, useValue: mockCompletedQuizService },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: 'sampleId' }),
            snapshot: {
              paramMap: { get: () => 'sampleId' },
              params: { id: 'sampleId' }
            }
          }
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewQuizTeacher);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call getQuizData and load quiz & completedQuizzes', () => {
    expect(mockCompletedQuizService.getCompletedQuizByQuizId).toHaveBeenCalledWith('sampleId');
    expect(component.quiz.id).toBe('quiz1');
    expect(component.completedQuizzes.length).toBe(1);
  });


    it('should calculate average time percentage correctly', () => {
    const completedQuizzes = [
      { startedAt: new Date('2023-01-01T10:00:00Z'), endedAt: new Date('2023-01-01T10:30:00Z') },
      { startedAt: new Date('2023-01-01T11:00:00Z'), endedAt: new Date('2023-01-01T11:15:00Z') },
    ];
    const result = component.getAverageTimePercentage(completedQuizzes, 60); // 60 mins
    expect(result).toBe('23m');
  });

  it('should calculate average score correctly', () => {
    const completedQuizzes = [
      { totalScore: 8 },
      { totalScore: 6 },
      { totalScore: 10 },
    ];
    const result = component.getAverageScore(completedQuizzes);
    expect(result).toBeCloseTo(8.0);
  });

  it('should calculate average percentage correctly', () => {
    const completedQuizzes = [
      { totalScore: 8 },
      { totalScore: 6 },
    ];
    const result = component.getAveragePercentage(completedQuizzes, 10); // totalMarks = 10
    expect(result).toBe('70.0%');
  });

  it('should convert timespan string to minutes', () => {
    const result = component.timespanToMinutes('01:45:00'); // 1hr 45mins
    expect(result).toBe(105);
  });

  it('should initialize editQuestionForm with correct values', () => {
    component.quiz = {
      questions: [
        {
          id: 'q1',
          questionText: 'What is Angular?',
          mark: 5,
          options: [
            { id: 'o1', optionText: 'Framework', isCorrect: true },
            { id: 'o2', optionText: 'Library', isCorrect: false },
          ],
        },
      ],
    };

    component.editQuestion('quiz1', 'q1', 0);

    expect(component.editQuestionForm.value.questionText).toBe('What is Angular?');
    expect(component.editQuestionForm.value.mark).toBe(5);
    expect(component.editQuestionForm.value.options.length).toBe(2);
    expect(component.isEditing).toBeTrue();
  });

  it('should not call updateQuestion if editQuestionForm is invalid', () => {
    component.editQuestionForm = new FormGroup({
      questionText: new FormControl('', Validators.required),
      mark: new FormControl('', Validators.required),
      options: new FormArray([]),
    });

    component.onSaveEdit();
    expect(component['quizService'].updateQuestion).not.toHaveBeenCalled();
  });

  it('should call updateQuestion if editQuestionForm is valid', () => {
    const mockUpdateSpy = jasmine.createSpyObj('QuizService', ['updateQuestion']);
    mockUpdateSpy.updateQuestion.and.returnValue(of({}));

    component['quizService'] = mockUpdateSpy;

    component.quiz = {
      id: 'quiz1',
      questions: [
        {
          options: [{ id: 'opt1' }, { id: 'opt2' }],
        },
      ],
    };

    component.currentQuestionIndex = 0;
    component.currentQuestionId = 'q1';

    component.editQuestionForm = new FormGroup({
      questionText: new FormControl('Valid question text'),
      mark: new FormControl(5),
      options: new FormArray([
        new FormGroup({
          optionText: new FormControl('Option 1'),
          isCorrect: new FormControl(true),
        }),
        new FormGroup({
          optionText: new FormControl('Option 2'),
          isCorrect: new FormControl(false),
        }),
      ]),
    });

    component.onSaveEdit();
    expect(mockUpdateSpy.updateQuestion).toHaveBeenCalled();
  });

});
