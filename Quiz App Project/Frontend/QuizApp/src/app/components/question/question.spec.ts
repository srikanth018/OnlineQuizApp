import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Question } from './question';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

describe('Question', () => {
  let component: Question;
  let fixture: ComponentFixture<Question>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Question, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(Question);
    component = fixture.componentInstance;

    component.questionGroup = new FormGroup({
      questionText: new FormControl('Sample question', Validators.required),
      mark: new FormControl(5, [Validators.required, Validators.min(1)]),
      options: new FormArray([
        new FormGroup({
          optionText: new FormControl('Option 1', Validators.required),
          isCorrect: new FormControl(false),
        }),
      ])
    });

    component.questionIndex = 0; 
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add an option', () => {
    const initialCount = component.options.length;
    component.addOption();
    expect(component.options.length).toBe(initialCount + 1);
  });

  it('should remove an option', () => {
    component.addOption(); // Ensure there are multiple options
    const initialCount = component.options.length;
    component.removeOption(0);
    expect(component.options.length).toBe(initialCount - 1);
  });
});
