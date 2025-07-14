import { Component, inject, OnInit } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { DashboardChart } from '../../components/dashboard-chart/dashboard-chart';
import { QuizService } from '../../services/QuizService';
import { CompletedQuizService } from '../../services/CompletedQuizService';
import { AuthService } from '../../services/AuthService';
import { CompletedQuiz } from '../../models/CompletedQuiz';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { QuizSignalRService } from '../../services/quiz-signalr.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-student-dashboard',
  imports: [NgFor, DashboardChart, FormsModule, NgClass, NgIf],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.css',
})
export class StudentDashboard implements OnInit {
  private quizSignalR = inject(QuizSignalRService);
  quizzes: { category: string; title: string }[] = [];

  constructor(
    private quizService: QuizService,
    private completedQuizService: CompletedQuizService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}
  ngOnInit(): void {
    this.quizSignalR.startConnection().then(() => {
      console.log('SignalR Connection Established');
    });
    this.quizSignalR.onReceiveNewQuiz((category, title) => {
      console.log('New Quiz Received:', category, title);
      this.toastr.info(`New Quiz have added to our nest => Title - ${title}, Category - ${category}`);
      this.quizzes.unshift({ category, title });
    });
    this.loadCompletedQuizzes();
  }

  completedQuizzes: CompletedQuiz[] = [];

  loadCompletedQuizzes() {
    const token = localStorage.getItem('access_token');
    const studentEmail = this.authService.decodeToken(token || '')?.nameid;
    if (studentEmail) {
      this.completedQuizService
        .getCompletedQuizByStudentEmail(studentEmail)
        .subscribe({
          next: async (data) => {
            this.completedQuizzes = data && data.$values ? data.$values : [];
            await this.getQuizData();
            await this.categoryChart();
            this.getTotalCreditPoints();
            // this.daysMap(6, new Date().getFullYear());
          },
          error: (error) => {
            console.error('Error fetching completed quizzes:', error);
          },
        });
    }
  }

  totalCreditPoints: number = 0;

  getTotalCreditPoints(){
    this.totalCreditPoints = this.completedQuizzes.reduce(
      (total, quiz) => total + (quiz.creditPoints || 0),
      0
    );
    console.log('Total Credit Points:', this.totalCreditPoints);
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

    // Now all data is loaded
    this.getBestScore();
    this.getConsistencyStreakDays();
    this.getImprovementRate();
    this.categoryChart();
    this.onMonthYearChange();
    this.getRecentQuizzes();
  }

  bestScore: number = 0;
  bestScorePercentage: string = '';
  bestScoreOutOf: number = 0;
  bestScoreQuizId: string = '';
  getBestScore() {
    if (this.completedQuizzes.length === 0) {
      return;
    }
    this.bestScore = Math.max(
      ...this.completedQuizzes.map((quiz) => quiz.totalScore || 0)
    );

    this.completedQuizzes.forEach((quiz) => {
      if (quiz.totalScore === this.bestScore) {
        this.bestScoreOutOf = quiz.quizData?.totalMarks || 0;
        this.bestScoreQuizId = quiz.id;

        this.bestScorePercentage = (
          (this.bestScore / this.bestScoreOutOf) *
          100
        ).toFixed(0);
      }
    });
  }
  viewCompletedQuizHistory() {
    this.router.navigate([`/main/quiz-history/`]);
  }
  viewBestScoreQuiz() {
    if (this.bestScoreQuizId) {
      this.router.navigate([`/main/quiz-history/${this.bestScoreQuizId}`]);
    } else {
      console.warn('No best score quiz available to view.');
    }
  }

  highestConsecutiveStreak: number = 0;
  currentStreak: number = 0;

  getConsistencyStreakDays() {
    if (!this.completedQuizzes || this.completedQuizzes.length === 0) {
      this.highestConsecutiveStreak = 0;
      this.currentStreak = 0;
      return;
    }

    const quizDates = new Set(
      this.completedQuizzes.map(
        (q) => new Date(q.createdAt).toISOString().split('T')[0]
      )
    );

    const sortedDates = Array.from(quizDates)
      .map((dateStr) => new Date(dateStr))
      .sort((a, b) => a.getTime() - b.getTime());

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prev = sortedDates[i - 1];
      const curr = sortedDates[i];

      const diffDays = Math.floor(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        currentStreak = 1;
      }

      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    }

    let streak = 0;
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const date = sortedDates[i];
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - streak);
      if (
        date.toISOString().split('T')[0] ===
        expectedDate.toISOString().split('T')[0]
      ) {
        streak++;
      } else {
        break;
      }
    }

    this.highestConsecutiveStreak = maxStreak;
    this.currentStreak = streak;
  }

  currentImprovementRate: number = 0;
  previousImprovementRate: number = 0;

  getImprovementRate() {
    const sorted = this.completedQuizzes
      .filter((q) => q.totalScore != null && q.quizData?.totalMarks != null)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    if (sorted.length < 2) {
      this.currentImprovementRate = 0;
      this.previousImprovementRate = 0;
      return;
    }

    const getPercentage = (quiz: CompletedQuiz) =>
      (quiz.totalScore / quiz.quizData.totalMarks) * 100;

    const prev1 = getPercentage(sorted[sorted.length - 2]);
    const latest = getPercentage(sorted[sorted.length - 1]);

    this.currentImprovementRate = +(latest - prev1).toFixed(2);
  }

  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: string = new Date().getFullYear().toString();
  calenderMap: { [month: number]: { [day: number]: number } } = {};

  numArray = Array.from({ length: 31 }, (_, i) => i + 1); // Days 1-31

  daysMap(month: number, year: string) {
    const monthIndex = month - 1;
    console.log('yeeee', typeof year, monthIndex);
    const yearNum = parseInt(year, 10);
    console.log('yeeee', typeof yearNum, monthIndex);

    this.completedQuizzes.forEach((quiz) => {
      const quizDate = new Date(quiz.createdAt);

      if (
        quizDate.getMonth() === monthIndex &&
        quizDate.getFullYear() === yearNum
      ) {
        console.log(quizDate.getFullYear());

        const day = quizDate.getDate();
        this.calenderMap[monthIndex] = this.calenderMap[monthIndex] || {};
        this.calenderMap[monthIndex][day] =
          (this.calenderMap[monthIndex][day] || 0) + 1;
      }
    });
  }
  onMonthYearChange() {
    this.calenderMap = {};
    this.daysMap(this.selectedMonth, this.selectedYear);
  }

  categoryChartData: any = {};
  categoryChartOptions: any = {};
  categoryChart() {
    const categoryLabels = Array.from(
      new Set(
        this.completedQuizzes.map((quiz) => {
          return quiz.quizData?.category;
        })
      )
    );

    const categoryCounts = categoryLabels.map(
      (label) =>
        this.completedQuizzes.filter(
          (quiz) => quiz.quizData?.category === label
        ).length
    );

    this.categoryChartData = {
      labels: categoryLabels,
      datasets: [
        {
          label: 'Quizzes by Category',
          data: categoryCounts,
          backgroundColor: [
            'rgba(96, 165, 250, 0.2)',
            'rgba(167, 139, 250, 0.2)',
            'rgba(74, 222, 128, 0.2)',
            'rgba(248, 113, 113, 0.2)',
            'rgba(251, 146, 60, 0.2)',

            'rgba(245, 158, 11, 0.2)',
            'rgba(16, 185, 129, 0.2)',
            'rgba(139, 92, 246, 0.2)',
            'rgba(244, 114, 182, 0.2)',
            'rgba(20, 184, 166, 0.2)',
          ],
          borderColor: [
            'rgba(96, 165, 250, 1)',
            'rgba(167, 139, 250, 1)',
            'rgba(74, 222, 128, 1)',
            'rgba(248, 113, 113, 1)',
            'rgba(251, 146, 60, 1)',

            'rgba(245, 158, 11, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(244, 114, 182, 1)',
            'rgba(20, 184, 166, 1)',
          ],

          borderWidth: 1,
        },
      ],
    };

    this.categoryChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#374151',
            font: {
              size: 14,
              family: "'Inter', sans-serif",
            },
            padding: 16,
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          titleColor: '#111827',
          bodyColor: '#374151',
          bodyFont: {
            size: 14,
          },
          titleFont: {
            size: 16,
            weight: '600',
          },
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          borderColor: '#e5e7eb',
          borderWidth: 1,
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce(
                (a: number, b: number) => a + b,
                0
              );
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} quizzes (${percentage}%)`;
            },
          },
        },
      },
    };
  }

  recentCompletedQuizzes: CompletedQuiz[] = [];
  getRecentQuizzes() {
    this.recentCompletedQuizzes = this.completedQuizzes.slice(0, 5);
  }

  viewCompletedQuiz(completedQuizId: string) {
    this.router.navigate([`/main/quiz-history/${completedQuizId}`]);
  }
}
