import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateQuiz } from './create-quiz';
import { QuizService } from '../../services/QuizService';
import { AuthService } from '../../services/AuthService';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { ToastrModule } from 'ngx-toastr';
import { FormGroup } from '@angular/forms';

describe('CreateQuiz', () => {
  let component: CreateQuiz;
  let fixture: ComponentFixture<CreateQuiz>;

  const mockJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    'eyJlbWFpbCI6InRlYWNoZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoiVGVhY2hlciJ9.' +
    'dummy-signature';

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'access_token') {
        return mockJwt;
      }
      return null;
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateQuiz, ToastrModule.forRoot()],
      providers: [
        QuizService,
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({}),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateQuiz);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with correct controls', () => {
    const form = component.quizForm;
    expect(form.contains('title')).toBeTrue();
    expect(form.contains('description')).toBeTrue();
    expect(form.contains('category')).toBeTrue();
    expect(form.contains('totalMarks')).toBeTrue();
    expect(form.contains('timeLimit')).toBeTrue();
    expect(form.contains('questions')).toBeTrue();
  });

  it('should add a question to the form array', () => {
    component.addQuestion();
    expect(component.questions.length).toBe(1);
  });

  it('should remove a question at the given index', () => {
    component.addQuestion();
    component.addQuestion();
    expect(component.questions.length).toBe(2);

    component.removeQuestion(0);
    expect(component.questions.length).toBe(1);
  });

  it('should return error if question has no correct option', () => {
    component.addQuestion();
    const q = component.questions.at(0) as FormGroup;
    const options = component.fb.array([
      component.fb.group({ optionText: 'Option 1', isCorrect: false }),
      component.fb.group({ optionText: 'Option 2', isCorrect: false }),
    ]);
    q.setControl('options', options);
    q.patchValue({ mark: 10 });

    component.quizForm.get('totalMarks')?.setValue(10);

    const error = component.validateQuiz();
    expect(error).toContain('must have at least one correct option');
  });

  it('should return error if total marks do not match question marks', () => {
    component.addQuestion();
    const q = component.questions.at(0) as FormGroup;
    const options = component.fb.array([
      component.fb.group({ optionText: 'Option 1', isCorrect: true }),
    ]);
    q.setControl('options', options);
    q.patchValue({ mark: 10 });

    component.quizForm.get('totalMarks')?.setValue(5); // mismatch
    const error = component.validateQuiz();
    expect(error).toContain('Total marks');
  });

  it('should reset the form and clear questions', () => {
    component.addQuestion();
    expect(component.questions.length).toBe(1);

    component.clearform();
    expect(component.quizForm.value.title).toBeNull();
    expect(component.questions.length).toBe(0);
  });

  it('should return validation error if total marks do not match sum of question marks', () => {
    component.addQuestion();
    const question = component.questions.at(0) as FormGroup;
    question.patchValue({ questionText: 'What is 2+2?', mark: 3 });
    const options = component.fb.array([
      component.fb.group({ optionText: '4', isCorrect: true }),
    ]);
    question.setControl('options', options);

    component.quizForm.get('totalMarks')?.setValue(5); // mismatch
    const error = component.validateQuiz();
    expect(error).toContain('must equal the sum of question marks');
  });

  it('should return error if a question has no correct option', () => {
    component.addQuestion();
    const question = component.questions.at(0) as FormGroup;
    question.patchValue({ questionText: 'What is 2+2?', mark: 4 });
    const options = component.fb.array([
      component.fb.group({ optionText: '3', isCorrect: false }),
      component.fb.group({ optionText: '5', isCorrect: false }),
    ]);
    question.setControl('options', options);
    component.quizForm.get('totalMarks')?.setValue(4);

    const error = component.validateQuiz();
    expect(error).toContain('must have at least one correct option');
  });
});
