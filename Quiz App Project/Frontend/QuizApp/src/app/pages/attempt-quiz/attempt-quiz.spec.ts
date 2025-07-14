import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { AttemptQuiz } from './attempt-quiz';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { QuizService } from '../../services/QuizService';
import { CompletedQuizService } from '../../services/CompletedQuizService';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { SubmitQuiz } from '../../models/SubmitQuiz';
import { FormControl, FormGroup } from '@angular/forms';

describe('AttemptQuiz', () => {
  let component: AttemptQuiz;
  let fixture: ComponentFixture<AttemptQuiz>;

  beforeEach(async () => {
    
    await TestBed.configureTestingModule({
      imports: [AttemptQuiz, ToastrModule.forRoot()],
      providers:[
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: 'sampleId' }),
            snapshot: {
              paramMap: {
                get: (key: string) => 'sampleId'
              },
              params: { id: 'sampleId' }
            }
          }
        },
        QuizService,
        CompletedQuizService,
        
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttemptQuiz);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should initialize agreementForm with required rules', () => {
    component.ngOnInit();
    expect(component.agreementForm instanceof FormGroup).toBeTrue();
    expect(Object.keys(component.agreementForm.controls).length).toBe(component.rules.length);
  });

  it('should start quiz when agreementForm is valid', () => {
    component.ngOnInit();
    Object.values(component.agreementForm.controls).forEach((control) => {
      control.setValue(true); // Accept rules
    });

    spyOn(component as any, 'enterFullScreen');
    spyOn(component['toastr'], 'info');

    component.startQuiz();

    expect(component.isStarted).toBeTrue();
    expect(component.exitCount).toBe(0);
    expect(component['toastr'].info).toHaveBeenCalledWith('Quiz Started', 'Information', jasmine.any(Object));
    expect((component as any).enterFullScreen).toHaveBeenCalled();
  });

  it('should not start quiz if agreementForm is invalid', () => {
    component.ngOnInit(); // Form starts with all rules false
    component.startQuiz();
    expect(component.isStarted).toBeFalse();
  });

  it('should handle getDurationInMinutes correctly', () => {
    const duration = component.getDurationInMinutes('2024-07-01T10:00:00Z', '2024-07-01T10:30:00Z');
    expect(duration).toBe(30);
  });

  it('should prevent reload on F5', () => {
    const event = new KeyboardEvent('keydown', { key: 'F5' });
    const toastrSpy = spyOn(component['toastr'], 'warning');

    component.handleKeyDown(event);
    expect(toastrSpy).toHaveBeenCalledWith("Refresh/Reload the page is disabled", 'Note');
  });

  it('should prevent reload on Ctrl+R', () => {
    const event = new KeyboardEvent('keydown', { key: 'r', ctrlKey: true });
    const toastrSpy = spyOn(component['toastr'], 'warning');

    component.handleKeyDown(event);
    expect(toastrSpy).toHaveBeenCalledWith("Refresh/Reload the page is disabled", 'Note');
  });

  it('should remove event listener on destroy', () => {
    spyOn(window, 'removeEventListener');
    component.ngOnDestroy();
    expect(window.removeEventListener).toHaveBeenCalledWith('beforeunload', component.preventReload);
  });

  it('should handle quiz submission success', fakeAsync(() => {
    component.quiz = { totalMarks: 10 };
    const mockSubmitData = new SubmitQuiz();
    const mockResponse = { message: 'Submitted' };

    spyOn(component['quizService'], 'submitQuiz').and.returnValue(of(mockResponse));
    const toastrSpy = spyOn(component['toastr'], 'success');

    component.handleQuizSubmit(mockSubmitData);
    tick(2000); // simulate timeout

    expect(component.response).toEqual(mockResponse);
    expect(component.isCompleted).toBeTrue();
    expect(component.showLoader).toBeFalse();
    expect(toastrSpy).toHaveBeenCalled();
  }));

  it('should handle quiz submission error', () => {
    const mockSubmitData = new SubmitQuiz();
    spyOn(component['quizService'], 'submitQuiz').and.returnValue(throwError(() => new Error('Submit failed')));
    const toastrSpy = spyOn(component['toastr'], 'error');

    component.handleQuizSubmit(mockSubmitData);

    expect(component.showLoader).toBeFalse();
    expect(toastrSpy).toHaveBeenCalledWith(
      'Error submitting quiz. Please try again.',
      'Error',
      jasmine.any(Object)
    );
  });

});
