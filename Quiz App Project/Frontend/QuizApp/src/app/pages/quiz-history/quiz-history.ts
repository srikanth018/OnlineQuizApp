import { Component } from '@angular/core';
import { CompletedQuiz } from '../../models/CompletedQuiz';
import { CompletedQuizService } from '../../services/CompletedQuizService';
import { AuthService } from '../../services/AuthService';
import { NgFor } from '@angular/common';
import { QuizService } from '../../services/QuizService';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-quiz-history',
  imports: [NgFor],
  templateUrl: './quiz-history.html',
  styleUrl: './quiz-history.css',
})
export class QuizHistory {
  completedQuizzes: CompletedQuiz[] = [];
  filteredQuizzes: CompletedQuiz[] = [];
  searchQuery: string = '';
  constructor(
    private completedQuizService: CompletedQuizService,
    private authService: AuthService,
    private quizService: QuizService,
    private router: Router
  ) {
    this.loadCompletedQuizzes();
  }

  loadCompletedQuizzes() {
    const token = localStorage.getItem('access_token');
    const studentEmail = this.authService.decodeToken(token || '')?.nameid;
    if (studentEmail) {
      this.completedQuizService
        .getCompletedQuizByStudentEmail(studentEmail)
        .subscribe({
          next: (data) => {
            this.completedQuizzes = data && data.$values ? data.$values : [];
            this.completedQuizzes.reverse(); // Reverse the order to show the latest quizzes first
            this.getQuizData();
            console.log(
              'Completed quizzes:',
              this.completedQuizzes as CompletedQuiz[]
            );
          },
          error: (error) => {
            console.error('Error fetching completed quizzes:', error);
          },
        });
    }
  }

  async getQuizData() {
    const fetches = this.completedQuizzes.map(async (quiz) => {
      try {
        const data = await firstValueFrom(
          this.quizService.getQuizById(quiz.quizId)
        );
        quiz.quizData = data;
      } catch (err) {
        console.error(`Error loading quiz with ID ${quiz.quizId}`, err);
      }
    });

    await Promise.all(fetches);
    this.filteredQuizzes = this.completedQuizzes;
    this.getcategoryList();
  }

  viewCompletedQuiz(completedQuizId: string) {
    this.router.navigate([`/main/quiz-history/${completedQuizId}`]);
  }

  categoryList: any[] = [{ value: 'all', label: 'All Categories' }];
  getcategoryList() {
    for (let quiz of this.completedQuizzes) {
      if (
        !this.categoryList.some(
          (item) => item.value === quiz.quizData?.category
        )
      ) {
        this.categoryList.push({
          value: quiz.quizData?.category,
          label: quiz.quizData?.category,
        });
      }
    }
  }

  searchValue: string = '';
  categoryValue: string = 'all';

  filterSearchQuizzes() {
    let filtered = this.completedQuizzes;

    if (!this.searchValue && this.categoryValue === 'all') {
      this.filteredQuizzes = filtered;

      return;
    }
    if (this.searchValue.trim()) {
      filtered = filtered.filter((quiz) =>
        quiz.quizData.title
          .toLowerCase()
          .includes(this.searchValue.trim().toLowerCase())
      );
    }

    if (this.categoryValue !== 'all') {
      filtered = filtered.filter(
        (quiz) => quiz.quizData.category === this.categoryValue
      );
    }

    this.filteredQuizzes = filtered;
  }
}
