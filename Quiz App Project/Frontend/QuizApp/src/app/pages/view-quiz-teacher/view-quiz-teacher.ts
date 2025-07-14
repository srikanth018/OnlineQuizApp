import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/AuthService';
import { QuizService } from '../../services/QuizService';
import { QuizResponseMapper } from '../../misc/QuizResponseMapper';
import { CompletedQuizService } from '../../services/CompletedQuizService';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { QuestionEditPopup } from '../../components/question-edit-popup/question-edit-popup';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-view-quiz-teacher',
  imports: [NgIf, NgFor, QuestionEditPopup],
  templateUrl: './view-quiz-teacher.html',
  styleUrl: './view-quiz-teacher.css',
  standalone: true,
})
export class ViewQuizTeacher implements OnInit {
  isloading: boolean = false;
  isEditing: boolean = false;
  quizId: string = '';
  quiz: any = [];
  completedQuizzes: any = [];
  averageTimePercentage: string = '';
  averageScorePercentage: string = '';
  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService,
    private completedQuizService: CompletedQuizService,
    private toastr: ToastrService
  ) {}
  ngOnInit(): void {
    this.quizId = this.route.snapshot.params['id'];
    this.getQuizData();
  }

  getQuizData() {
    this.isloading = true;
    this.quizService.getQuizById(this.quizId).subscribe({
      next: (data) => {
        this.quiz = QuizResponseMapper.mapResponseToQuiz(data);
        this.quiz.timeLimit = this.timespanToMinutes(this.quiz.timeLimit);
        this.isloading = false;
        console.log(this.quiz);
        this.getCompletedQuizzes();
      },
      error: (err) => {
        console.log(err);
        this.isloading = false;
      },
    });
  }

  getCompletedQuizzes() {
    this.completedQuizService.getCompletedQuizByQuizId(this.quizId).subscribe({
      next: (data: any) => {
        this.completedQuizzes = data.$values;
        console.log('Completed Quizzes:', this.completedQuizzes);
        console.log('Quiz Data:', this.quiz);

        this.averageTimePercentage = this.getAverageTimePercentage(
          this.completedQuizzes,
          this.quiz.timeLimit
        );
        this.averageScorePercentage = this.getAveragePercentage(
          this.completedQuizzes,
          this.quiz.totalMarks
        );

        console.log(data.$values);
      },
      error: (err) => {
        console.log(err);
        return 0;
      },
    });
  }

  getAverageTimePercentage(
    completedQuizzes: any[],
    quizTimeLimitMinutes: number
  ): string {
    console.log(
      `Calculating average time percentage for ${completedQuizzes.length} quizzes with a time limit of ${quizTimeLimitMinutes} minutes`
    );

    if (!completedQuizzes.length || !quizTimeLimitMinutes) return '0%';

    const totalDurationMs = completedQuizzes.reduce((acc, quiz) => {
      const start = new Date(quiz.startedAt).getTime();
      const end = new Date(quiz.endedAt).getTime();
      const duration = end - start;
      return acc + duration;
    }, 0);

    const avgMs = totalDurationMs / completedQuizzes.length;
    const avgMinutes = avgMs / 60000;

    const percentage = (avgMinutes / quizTimeLimitMinutes) * 100;
    console.log(`Average Time Percentage: ${percentage.toFixed(1)}%`);

    return `${avgMinutes.toFixed(0)}m`;
  }

  getAverageScore(completedQuizzes: any[]): number {
    if (!completedQuizzes.length) return 0;

    const totalScore = completedQuizzes.reduce(
      (acc, quiz) => acc + Number(quiz.totalScore || 0),
      0
    );
    return +(totalScore / completedQuizzes.length).toFixed(2); // return average rounded to 2 decimal places
  }
  getAveragePercentage(completedQuizzes: any[], totalMarks: number): string {
    const avg = this.getAverageScore(completedQuizzes);
    return totalMarks ? `${((avg / totalMarks) * 100).toFixed(1)}%` : '0%';
  }

  formatTime(ms: any): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    return `${minutes}m`;
  }

  editQuestionForm!: FormGroup;
  currentQuestionId: string = '';
  currentQuestionIndex: number = -1;

  editQuestion(quizId: string, questionId: string, questionIndex: number) {
    this.currentQuestionId = questionId;
    this.currentQuestionIndex = questionIndex;
    this.isEditing = true;
    console.log('Editing question', questionId, 'at index', questionIndex);

    this.editQuestionForm = new FormGroup({
      questionText: new FormControl(
        this.quiz.questions[questionIndex].questionText,
        [Validators.required, Validators.minLength(10)]
      ),
      mark: new FormControl(this.quiz.questions[questionIndex].mark, [
        Validators.required,
        Validators.min(1),
      ]),
      options: new FormArray(
        this.quiz.questions[questionIndex].options.map((option: any) => {
          return new FormGroup({
            optionText: new FormControl(option.optionText, Validators.required),
            isCorrect: new FormControl(option.isCorrect),
          });
        })
      ),
    });
  }

  onSaveEdit() {
    console.log('Saving edited question', this.editQuestionForm.value);
    
    if (this.editQuestionForm.valid) {
        const payload = this.editQuestionForm.value;

        // Attach Option Ids from quiz data (since form doesn’t hold Ids)
        const questionOptions =
          this.quiz.questions[this.currentQuestionIndex].options;
        payload.options = payload.options.map((opt: any, i: number) => ({
          ...opt,
          id: questionOptions[i].id,
        }));
        
        this.quizService
          .updateQuestion(this.quiz.id, this.currentQuestionId, payload)
          .subscribe({
            next: (res) => {
              this.getQuizData();
              this.isEditing = false;
              this.toastr.success(`Question ${this.currentQuestionIndex+1} updated successfully!`);
            },
            error: (err) => {
              console.error('Update failed', err);
              this.toastr.error(`Failed to update question ${this.currentQuestionIndex + 1}.`);
            },
          });
      } else {
        this.editQuestionForm.markAllAsTouched();
      }
  }

  timespanToMinutes(timeSpan: string): number {
    const [hours, minutes, seconds] = timeSpan.split(':').map(Number);
    return hours * 60 + minutes + Math.floor(seconds / 60);
  }
}
