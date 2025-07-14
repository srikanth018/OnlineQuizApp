import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { QuizService } from '../../services/QuizService';
import { QuizResponseMapper } from '../../misc/QuizResponseMapper';
import { NgIf } from '@angular/common';
import { CompletedQuizService } from '../../services/CompletedQuizService';
import { AuthService } from '../../services/AuthService';

@Component({
  selector: 'app-view-quiz-student',
  imports: [NgIf, RouterOutlet],
  templateUrl: './view-quiz-student.html',
  styleUrl: './view-quiz-student.css',
})
export class ViewQuizStudent implements OnInit {
  constructor(
    private router: ActivatedRoute,
    private quizService: QuizService,
    private route: Router,
    private completedQuizService: CompletedQuizService,
    private authService: AuthService
  ) {}

  quizId: string = '';
  quiz: any;
  ngOnInit(): void {
    this.quizId = this.router.snapshot.paramMap.get('id') || '';
    this.getQuizData();
  }

  getQuizData() {
    this.quizService.getQuizById(this.quizId).subscribe({
      next: (data) => {
        this.quiz = QuizResponseMapper.mapResponseToQuiz(data);
        this.quiz.timeLimit = this.timespanToMinutes(this.quiz.timeLimit);
        console.log(this.quiz);
        this.getEmail();
        
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  email: string = '';

  getEmail(){
    const token = localStorage.getItem('access_token');
    if (token) {
      const decodedToken = this.authService.decodeToken(token);
      this.email = decodedToken.nameid || '';
    }
    this.checkIfQuizIsAttempted();
  }

  attempQuiz() {
    this.route.navigate(['attempt-quiz', this.quizId]);
  }
  timespanToMinutes(timeSpan: string): number {
    const [hours, minutes, seconds] = timeSpan.split(':').map(Number);
    return hours * 60 + minutes + Math.floor(seconds / 60);
  }

  isAttempted: boolean = false;
  completedQuizId: string = '';
  checkIfQuizIsAttempted(): boolean {
    this.completedQuizService.getCompletedQuizByStudentEmail(this.email).subscribe({
      next: (data) => {
        console.log('Completed quizzes:', data);
        if (data.$values.length > 0) {
          const attemptedQuiz = data.$values.find((quiz: any) => quiz.quizId === this.quizId);
          this.completedQuizId = attemptedQuiz?.id || '';
          console.log('attemptedQuiz', attemptedQuiz);

          this.isAttempted = !!attemptedQuiz;
        }
      }
    });
    return this.isAttempted;
  }

  viewResults(){
    this.route.navigateByUrl(`main/quiz-history/${this.completedQuizId}`);
  }

}
