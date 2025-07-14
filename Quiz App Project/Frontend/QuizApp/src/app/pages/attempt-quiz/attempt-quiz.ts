import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { QuizService } from '../../services/QuizService';
import { QuizResponseMapper } from '../../misc/QuizResponseMapper';
// import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { DisplayQuestions } from '../../components/display-questions/display-questions';
import { SubmitQuiz } from '../../models/SubmitQuiz';
import { Loading } from '../../components/loading/loading';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-attempt-quiz',
  imports: [
    FormsModule,
    NgFor,
    NgIf,
    ReactiveFormsModule,
    RouterOutlet,
    DisplayQuestions,
    Loading,
  ],
  templateUrl: './attempt-quiz.html',
  styleUrl: './attempt-quiz.css',
})
export class AttemptQuiz implements OnInit, OnDestroy {
  exitCount: number = 0;
  message: string = ``;
  isFullScreen: boolean = false;
  isStarted: boolean = false;
  isCompleted: boolean = false;
  openbutton: boolean = false;
  negativePoints: number = 0;
  private quizService = inject(QuizService);
  quiz: any;

  constructor(
    private router: ActivatedRoute,
    private fb: FormBuilder,
    private route: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getQuizData();
    const controls = this.rules.map(
      () => new FormControl(false, Validators.requiredTrue)
    );
    this.agreementForm = this.fb.group(controls);

    window.addEventListener('beforeunload', this.preventReload);

    document.addEventListener('fullscreenchange', () => {
      const isNowFullScreen = !!document.fullscreenElement;

      if (!isNowFullScreen && this.isFullScreen) {
        this.exitCount++;
        this.message = `You've exited fullscreen ${this.exitCount} time${
          this.exitCount > 1 ? 's' : ''
        }. Stay focused!`;
        console.warn(this.message);
        this.toastr.warning(this.message, 'Fullscreen Warning', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
        // this.enterFullScreen();
        this.openbutton = true;
        if (this.isStarted && !this.isCompleted) {
          // this.enterFullScreen();
          this.openbutton = true;

          if (this.exitCount >= 3) {
            this.negativePoints += 1;

            this.toastr.warning(
              `You have exited fullscreen ${this.exitCount} times. ${this.negativePoints} point will be deducted from your Credit Points.`,
              'Negative Points',
              {
                timeOut: 3000,
                positionClass: 'toast-top-center',
              }
            );
          }
        }
      }
      this.isFullScreen = isNowFullScreen;
    });
  }

  enterFullScreen() {
    console.log('Entering Full Screen Mode');

    const elem = document.documentElement;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if ((elem as any).webkitRequestFullscreen) {
      (elem as any).webkitRequestFullscreen();
    }

    this.isFullScreen = true;
    this.openbutton = false;
  }

  toggleFullScreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      this.enterFullScreen();
    }
  }

  startQuiz() {
    if (this.agreementForm.valid) {
      console.log('Quiz Started');
      this.toastr.info('Quiz Started', 'Information', {
        timeOut: 2000,
        positionClass: 'toast-top-right',
      });
      this.isStarted = true;
      this.exitCount = 0;
      this.enterFullScreen();
    } else {
      this.isStarted = false;
      console.log('Please accept all rules before starting.');
    }
  }

  getQuizData() {
    const id = this.router.snapshot.paramMap.get('id');
    if (id) {
      this.quizService.getQuizById(id).subscribe({
        next: (data: any) => {
          this.quiz = QuizResponseMapper.mapResponseToQuiz(data);

          console.log(this.quiz);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  agreementForm!: FormGroup;
  rules: string[] = [
    'I agree to enable Full Screen Mode while attempting the quiz.',
    'If I exit Full Screen Mode more than 3 times, I understand that credit points will reduce by 1 for each exit.',
    'I will not refresh or close the browser window until I submit the quiz.',
    'I understand the quiz will auto-submit when the timer ends.',
  ];

  showLoader: boolean = true;
  response: any = null;
  totalPossibleScore: number = 0;

  handleQuizSubmit(submittedData: SubmitQuiz) {
    this.totalPossibleScore = this.quiz?.totalMarks || 0;
    submittedData.negativePoints = this.negativePoints;

    console.log('Quiz submitted: from attempt', submittedData);
    this.quizService.submitQuiz(submittedData).subscribe({
      next: (response) => {
        console.log('Quiz submitted successfully:', response);
        this.toastr.success('Quiz Completed successfully!', 'Success', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
        this.response = response;
        this.isStarted = false;
        this.isCompleted = true;

        setTimeout(() => {
          this.showLoader = false;
        }, 2000);

        if (document.fullscreenElement) {
          document.exitFullscreen();
          this.isFullScreen = false;
          this.openbutton = false;
        }
      },
      error: (error) => {
        console.error('Error submitting quiz:', error);
        this.showLoader = false;
        this.toastr.error('Error submitting quiz. Please try again.', 'Error', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
      },
    });
  }

  // Add this method for navigation
  backToQuizzes() {
    this.route.navigate(['/main/available-quizzes']);
  }

  getDurationInMinutes(start: string, end: string): number {
    if (!start || !end) return 0;

    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffInMs = endTime - startTime;
    return Math.round(diffInMs / (1000 * 60)); // convert to minutes
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'F5') {
      event.preventDefault();
      this.toastr.warning("Refresh/Reload the page is disabled",'Note');
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'r') {
      event.preventDefault();
      this.toastr.warning("Refresh/Reload the page is disabled",'Note');
    }
  }
  preventReload = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = '';
  };

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.preventReload);
  }
}
