import {
  Component,
  inject,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { createQuizFormValidators } from '../../misc/createQuizFormValidators';
import { Store } from '@ngrx/store';
import { selectUser } from '../../ngrx/authStore/auth.selector';
import { map, Subscription } from 'rxjs';
import { Question } from '../../components/question/question';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { QuizService } from '../../services/QuizService';
import { AuthService } from '../../services/AuthService';
import { Loading } from '../../components/loading/loading';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-create-quiz',
  imports: [Question, NgFor, NgIf, ReactiveFormsModule, Loading, NgClass],
  templateUrl: './create-quiz.html',
  styleUrl: './create-quiz.css',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
})
export class CreateQuiz implements OnInit {
  private authService = inject(AuthService);
  private formSubscription: Subscription | undefined;

  private store = inject(Store);
  private toastr = inject(ToastrService);
  quizForm: FormGroup;

  isloading: boolean = false;

  constructor(public fb: FormBuilder, private quizService: QuizService) {
    this.quizForm = new FormGroup({
      title: new FormControl(null, [
        Validators.required,
        createQuizFormValidators.titleValidator(),
      ]),
      description: new FormControl(null, [
        Validators.required,
        createQuizFormValidators.descriptionValidator(),
      ]),
      category: new FormControl(null, [Validators.required]),
      uploadedBy: new FormControl(
        { value: this.getTeacherEmail(), disabled: true },
        [Validators.required]
      ),
      totalMarks: new FormControl(null, [
        Validators.required,
        createQuizFormValidators.totalMarksValidator(),
      ]),
      timeLimit: new FormControl(null, [Validators.required]),
      questions: new FormArray([]),
    });
  }

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  addQuestion(): void {
    const questionGroup = this.fb.group({
      questionText: new FormControl(null, [
        Validators.required,
        Validators.minLength(10),
      ]),
      mark: new FormControl(1, [Validators.required, Validators.min(1)]),
      image: null,
      options: this.fb.array([]),
    });

    this.questions.push(questionGroup);
  }

  removeQuestion(i: number): void {
    this.questions.removeAt(i);
  }

  teacherEmail: string | null = '';
  getTeacherEmail(): string | null {
    const user = this.authService.decodeToken(
      localStorage.getItem('access_token') || ''
    );
    this.teacherEmail = user?.nameid ?? null;
    return this.teacherEmail;
  }

  getQuestionGroup(index: number): FormGroup {
    return this.questions.at(index) as FormGroup;
  }

  ngOnInit() {
    this.loadFormFromLocalStorage();
    this.formSubscription = this.quizForm.valueChanges.subscribe(() => {
      localStorage.setItem(
        'createQuizForm',
        JSON.stringify(this.quizForm.getRawValue())
      );
    });
  }

  validateQuiz(): string | null {
    const questions = this.quizForm.get('questions') as FormArray;

    if (!questions || questions.length === 0) {
      return 'The quiz must have at least one question.';
    }

    let calculatedTotalMarks = 0;

    for (let i = 0; i < questions.length; i++) {
      const question = questions.at(i) as FormGroup;
      const mark = question.get('mark')?.value || 0;
      const options = question.get('options') as FormArray;

      calculatedTotalMarks += Number(mark);

      const hasCorrectOption = options.controls.some(
        (opt) => opt.get('isCorrect')?.value === true
      );

      if (!hasCorrectOption) {
        return `Question ${i + 1} must have at least one correct option.`;
      }
    }

    const totalMarks = this.quizForm.get('totalMarks')?.value;

    if (Number(totalMarks) !== calculatedTotalMarks) {
      return `Total marks (${totalMarks}) must equal the sum of question marks (${calculatedTotalMarks}).`;
    }

    return null;
  }

  submitQuiz() {
    if (this.quizForm.valid) {
      const validationError = this.validateQuiz();
      if (validationError) {
        console.error('Validation Error:', validationError);
        this.toastr.warning(validationError);
        return;
      }

      const formData = { ...this.quizForm.value };
      const totalMinutes = Number(formData.timeLimit || 0);

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:00`;

      formData.timeLimit = formattedTime;

      this.quizService.createQuiz(formData).subscribe({
        next: (response) => {
          console.log('Quiz created successfully:', response);
          this.toastr.success('Quiz created successfully!');
          this.formSubscription?.unsubscribe();
          this.clearform();
        },
        error: (error) => {
          console.error('Error creating quiz:', error);
          this.toastr.error('Failed to create quiz. Please try again.');
        },
      });
      console.log('Quiz submitted:', this.quizForm.value);
    } else {
      console.log('Form is invalid');
    }
  }

  loadFormFromLocalStorage() {
    const saved = localStorage.getItem('createQuizForm');
    if (saved) {
      const parsed = JSON.parse(saved);

      this.quizForm.patchValue({
        title: parsed.title,
        category: parsed.category,
        uploadedBy: parsed.uploadedBy || this.getTeacherEmail(),
        totalMarks: parsed.totalMarks,
        description: parsed.description,
        timeLimit: parsed.timeLimit,
      });

      const questionsArray = this.quizForm.get('questions') as FormArray;
      // questionsArray.clear();

      parsed.questions.forEach((q: any) => {
        const questionGroup = this.fb.group({
          questionText: [q.questionText],
          mark: [q.mark],
          image: null,
          options: this.fb.array([]),
        });

        q.options.forEach((o: any) => {
          (questionGroup.get('options') as FormArray).push(
            this.fb.group({
              optionText: [o.optionText],
              isCorrect: [o.isCorrect],
            })
          );
        });

        questionsArray.push(questionGroup);
      });
    }
  }

  downloadTemplate() {
    this.isloading = true;
    this.quizService.downloadQuizTemplate(5, 4).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'QuizTemplate.xlsx'; // file name
        a.click();
        window.URL.revokeObjectURL(url);
        this.isloading = false;
      },
      error: (err) => {
        console.error('Error downloading file:', err);
        this.isloading = false;
      },
    });
  }

  fileuploadErrorMessage: string | null = '';
  onFileSelected(event: any) {
    this.fileuploadErrorMessage = '';
    const quizData = this.quizForm.value;
    const totalMinutes = Number(quizData.timeLimit || 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:00`;

    quizData.timeLimit = formattedTime;
    quizData.uploadedBy = this.getTeacherEmail();

    this.isloading = true;
    const file: File = event.target.files[0];
    if (!file) {
      this.toastr.error('Please select a file to upload.');
      this.isloading = false;
      return;
    }
    quizData.file = file;
    console.log(quizData);

    if (file) {
      this.quizService.bulkUploadQuiz(quizData).subscribe({
        next: (res) => {
          console.log('Bulk upload success:', res);
          this.toastr.success(`Quiz "${res.title}" uploaded successfully!`);
          this.isloading = false;
          this.clearform();
          this.fileuploadErrorMessage = null;
        },
        error: (err) => {
          console.error('Error uploading file:', err);
          this.toastr.error('Error uploading quiz. Please try again.');
          this.fileuploadErrorMessage = `Error: ${
            err.error.message || 'Unknown error occurred'
          }. Please correct the file and try again.`;
          this.isloading = false;
        },
      });
    }
  }

  clearform() {
    this.quizForm.reset();
    this.questions.clear();
    localStorage.removeItem('createQuizForm');
    this.formSubscription?.unsubscribe();
  }
}
