import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionEditPopup } from './question-edit-popup';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('QuestionEditPopup', () => {
  let component: QuestionEditPopup;
  let fixture: ComponentFixture<QuestionEditPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionEditPopup, ReactiveFormsModule, ToastrModule.forRoot()],
      providers:[
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionEditPopup);
    component = fixture.componentInstance;

    component.questionform = new FormGroup({
      questionText: new FormControl('Sample question', Validators.required),
      mark: new FormControl(5, [Validators.required, Validators.min(1)]),
      options: new FormArray([
        new FormGroup({
          optionText: new FormControl('Option 1', Validators.required),
          isCorrect: new FormControl(false),
        }),
      ])
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit save when form is valid and submitted', () => {
    spyOn(component.save, 'emit');
    component.onSubmitUpdate();
    expect(component.save.emit).toHaveBeenCalled();
  });

  it('should emit cancel when cancelled', () => {
    spyOn(component.cancel, 'emit');
    component.onCancel();
    expect(component.cancel.emit).toHaveBeenCalled();
  });
});
