import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../services/QuizService';
import { CompletedQuizService } from '../../services/CompletedQuizService';
import { AuthService } from '../../services/AuthService';
import { CompletedQuiz } from '../../models/CompletedQuiz';
import { StudentService } from '../../services/StudentService';
import { firstValueFrom } from 'rxjs';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-leader-board',
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './leader-board.html',
  styleUrl: './leader-board.css',
})
export class LeaderBoard implements OnInit {
  completedQuizzesByUser: CompletedQuiz[] = [];
  completedQuizzes: CompletedQuiz[] = [];
  constructor(
    private quizService: QuizService,
    private completedQuizService: CompletedQuizService,
    private authService: AuthService,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.loadCompletedQuizzesforLoggedInUser();
    this.loadAllCompletedQuizzes();
  }

  token:string|null ='';
  studentEmail: string = '';
  loadCompletedQuizzesforLoggedInUser() {
    this.token = localStorage.getItem('access_token');
    this.studentEmail = this.authService.decodeToken(this.token || '')?.nameid;
    if (this.studentEmail) {
      this.completedQuizService
        .getCompletedQuizByStudentEmail(this.studentEmail)
        .subscribe({
          next: async (data) => {
            this.completedQuizzesByUser =
              data && data.$values ? data.$values : [];
            this.completedQuizzesByUser.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
          },
          error: (error) => {
            console.error('Error fetching completed quizzes:', error);
          },
        });
    }
  }

  loadAllCompletedQuizzes() {
    this.completedQuizService.getAllCompletedQuizzes().subscribe({
      next: (data) => {
        this.completedQuizzes = data?.$values ?? [];
        this.completedQuizzes.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.loadLeaderBoardData();
        console.log('All Completed Quizzes:', this.completedQuizzes);
      },

      error: (error) => {
        console.error('Error fetching all completed quizzes:', error);
      },
    });
  }

  leaderBoardData: {
    username: string;
    totalQuizzes: number;
    totalCredits: number;
    email?: string;
  }[] = [];
  async loadLeaderBoardData() {
    for (const quiz of this.completedQuizzes) {
      const studentName = await this.getStudentName(quiz.studentEmail);
      if (this.leaderBoardData.some((item) => item.username === studentName)) {
        const existingEntry = this.leaderBoardData.find(
          (item) => item.username === studentName
        );
        if (existingEntry) {
          existingEntry.totalQuizzes += 1;
          existingEntry.totalCredits += quiz.creditPoints;
        }
      } else {
        this.leaderBoardData.push({
          username: studentName,
          totalQuizzes: 1,
          totalCredits: quiz.creditPoints,
          email: quiz.studentEmail,
        });
      }
    }
    this.leaderBoardData.sort((a, b) => b.totalCredits - a.totalCredits);
  }

  getCurrentRank(): number {
    return this.leaderBoardData.findIndex(entry => entry.email === this.studentEmail) + 1;
  }

  getCreditsNeededForNextRank(): number {
    const currentRank = this.getCurrentRank()-1;
    if (currentRank === 0 || currentRank >= this.leaderBoardData.length) {
      return 0; 
    }
    const currentCredits = this.leaderBoardData[currentRank]?.totalCredits;
    const nextRankCredits = this.leaderBoardData[currentRank - 1]?.totalCredits;
    return +(nextRankCredits - currentCredits);
  }

  async getStudentName(email: string): Promise<string> {
    const data = await firstValueFrom(
      this.studentService.getStudentByEmail(email)
    );

    return data.name;
  }


}
