import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { QuizService } from '../../services/QuizService';
import {
  AttemptQuizResponse,
  QuestionForAttempt,
} from '../../models/AttemptQuizResponse';
import { QuestionsArray, SubmitQuiz } from '../../models/SubmitQuiz';
import { AuthService } from '../../services/AuthService';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-display-questions',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './display-questions.html',
  styleUrls: ['./display-questions.css'],
})
export class DisplayQuestions implements OnInit {
  @Input() quizId: string = '';
  @Output() submitQuiz = new EventEmitter<SubmitQuiz>();
  questions: QuestionForAttempt[] = [];
  currentQuestionIndex: number = 0;
  isLoading: boolean = false;
  answerData!: QuestionsArray[];
  submitQuizData: SubmitQuiz = new SubmitQuiz();

  constructor(
    private quizService: QuizService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getQuiz();
    this.AllCompleted();
  }

  getQuiz() {
    this.isLoading = true;
    this.quizService.attemptQuiz(this.quizId).subscribe({
      next: async (data: any) => {
        await this.preSettings(data);
      },
      error: (err) => {
        console.error('Error loading quiz:', err);
        this.isLoading = false;
      },
    });
  }

  async preSettings(data: any) {
    const rawQuestions = data.questions?.$values || [];
    const formattedQuestions = rawQuestions.map((q: any) => ({
      questionId: q.questionId,
      questionText: q.questionText,
      imageUrl: q.imageUrl,
      options: q.options?.$values || [],
    }));

    this.questions = formattedQuestions;
    this.allotedTimeLimit = data.timeLimit;
    await this.populateQuestionIds();
    this.isLoading = false;
    await this.startTimer();
    const nowUtc = new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    );
    this.submitQuizData.startedAt = nowUtc.toISOString();
    this.submitQuizData.quizId = this.quizId;
    await this.getStudentEmail();
  }

  getStudentEmail() {
    const token = localStorage.getItem('access_token');
    const userData = this.authService.decodeToken(token ?? '');
    if (userData && userData.nameid) {
      this.submitQuizData.studentEmail = userData.nameid;
    } else {
      console.error('User email not found in token');
    }
  }

  populateQuestionIds() {
    this.answerData = this.questions.map((question) => {
      return new QuestionsArray(question?.questionId, []);
    });
    localStorage.setItem('answerData', JSON.stringify(this.answerData));
  }

  navigateToQuestion(index: number) {
    this.currentQuestionIndex = index;
  }

  addSelectedOption(p_questionId: string, p_optionId: string) {
    this.answerData.forEach((qu) => {
      if (qu.questionId === p_questionId) {
        qu.selectedOptionIds = [`${p_optionId}`];
        this.progressPercentage();
        this.AllCompleted();
        localStorage.setItem('answerData', JSON.stringify(this.answerData));
      }
    });
  }

  markAsComplete(p_questionId: string): boolean {
    const q = this.answerData.find((q) => q.questionId === p_questionId);
    return !!q && q.selectedOptionIds?.length == 1;
  }

  isOptionSelected(p_questionId: string, p_optionId: string) {
    let isSelected = false;
    this.answerData.forEach((qu) => {
      if (qu.questionId === p_questionId) {
        isSelected = qu.selectedOptionIds.includes(p_optionId);
        if (isSelected) {
          this.questionsAttended++;
        }
      }
    });
    return isSelected;
  }

  completedPercentage: number = 0;
  progressPercentage() {
    const total = this.answerData.length;
    const completed = this.answerData.filter(
      (q) => q.selectedOptionIds.length > 0
    ).length;
    this.completedPercentage = Math.floor(
      total > 0 ? (completed / total) * 100 : 0
    );
    this.AllCompleted();
  }

  isAllCompleted: boolean = false;
  AllCompleted() {
    this.isAllCompleted =
      this.answerData?.every((q) => q.selectedOptionIds.length > 0) ?? false;
  }

  allotedTimeLimit: string = '';
  runningTime: string = '';
  private totalSeconds: number = 0;
  private intervalId: any;

  startTimer() {
    // const time = '00:00:10';
    const time = this.allotedTimeLimit;

    if (!time) return;

    const [hours, minutes, seconds] = time.split(':').map(Number);
    this.totalSeconds = hours * 3600 + minutes * 60 + seconds;

    this.updateRunningTime();

    this.intervalId = setInterval(() => {
      if (this.totalSeconds > 0) {
        this.totalSeconds--;
        this.updateRunningTime();
      } else {
        clearInterval(this.intervalId);
        this.submitQuizAnswers();
      }
    }, 1000);
  }

  updateRunningTime() {
    const hours = Math.floor(this.totalSeconds / 3600);
    const minutes = Math.floor((this.totalSeconds % 3600) / 60);
    const seconds = this.totalSeconds % 60;

    this.runningTime = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  submitQuizAnswers() {
    this.submitQuizData.questions = this.answerData;
    const nowUtc = new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    );
    this.submitQuizData.endedAt = nowUtc.toISOString();
    console.log(this.submitQuizData);
    this.submitQuiz.emit(this.submitQuizData);
  }

  endTestpopup: boolean = false;
  popupMessage: string = '';
  questionsAttended: number = 0;

  popupData() {
    // this.answerData.forEach((ques) => {
    //   if (ques.selectedOptionIds.length > 0) this.questionsAttended++;
    // });
    this.popupMessage = `Hey!! You have attended only ${this.questionsAttended} questions. Do you want to end the test now?`;
  }

  endTest() {
    this.endTestpopup = true;
    this.popupData();
  }

  cancelEndTest() {
    this.endTestpopup = false;
  }

  get showEndTestButton(): boolean {
    return (
      this.questionsAttended > 0 &&
      this.questionsAttended < this.answerData.length
    );
  }

  confirmEndTest() {
    this.toastr.warning(
      `Test will be ended within 2 seconds, and your answers are saved automatically.`
    );
    this.endTestpopup = false;
    setTimeout(() => {
      this.submitQuizAnswers();
    }, 2000);
  }
}
