import { Component, OnInit } from '@angular/core';
import { Toast } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { QuizService } from '../../services/QuizService';
import { AuthService } from '../../services/AuthService';
import { DashboardChart } from '../../components/dashboard-chart/dashboard-chart';
import { CompletedQuizService } from '../../services/CompletedQuizService';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-teacher-dashboard',
  imports: [ButtonModule, Toast, Ripple, DashboardChart, NgFor, NgIf],
  standalone: true,
  templateUrl: './teacher-dashboard.html',
  styleUrls: ['./teacher-dashboard.css'],
})
export class TeacherDashboard implements OnInit {
  quizData: any[] = [];
  completedQuizzes: any[] = [];
  uploadedQuizChartData: any = {};

  constructor(
    private quizService: QuizService,
    private authService: AuthService,
    private completedQuizService: CompletedQuizService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getTeacherEmail();
  }
  teacherEmail: string = '';
  async getTeacherEmail() {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decodedToken = await this.authService.decodeToken(token);
      this.teacherEmail = decodedToken?.nameid;
      await this.loadQuizData();
    }
  }

  loadQuizData() {
    this.quizService.getUploadedQuizzes(this.teacherEmail).subscribe({
      next: async (data: any) => {
        this.quizData = data.$values || [];
        await this.loadCompletedQuizzes();
        await this.categoryChart();
        await this.uploadedQuizChart(2025);
        await this.getRecentQuizzes();
      },
      error: (error) => {
        console.error('Error loading quizzes:', error);
      },
    });
  }

  loadCompletedQuizzes() {
    this.completedQuizService.getAllCompletedQuizzes().subscribe({
      next: async (data: any) => {
        this.completedQuizzes = data.$values || [];
        await this.getTotalStudents();
        await this.getTotalQuizzesTriedByStudents();
      },
      error: (error) => {
        console.error('Error loading completed quizzes:', error);
      },
    });
  }

  totalStudentCount: string[] = [];
  getTotalStudents() {
    this.quizData?.forEach((quiz) => {
      this.completedQuizzes.find((completedQuiz) => {
        if (completedQuiz.quizId === quiz.id) {
          if (!this.totalStudentCount.includes(completedQuiz.studentEmail)) {
            this.totalStudentCount.push(completedQuiz.studentEmail);
          }
        }
      });
    });
  }

  totalQuizzesTriedByStudents: string[] = [];
  getTotalQuizzesTriedByStudents() {
    this.completedQuizzes.forEach((completedQuiz) => {
      this.quizData.find((quiz) => {
        if (quiz.id === completedQuiz.quizId) {
          if (!this.totalQuizzesTriedByStudents.includes(quiz.id)) {
            this.totalQuizzesTriedByStudents.push(quiz.id);
          }
        }
      });
    });
  }

  uploadedQuizChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'No. of Quizzes',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
    },
  };

  uploadedQuizChart(selectedYear: number) {
    // Step 1: Initialize counts for 12 months
    const monthLabels = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const monthlyCount = new Array(12).fill(0);

    // Step 2: Process the quiz data
    this.quizData.forEach((quiz) => {
      const createdAt = new Date(quiz.createdAt);
      const year = createdAt.getFullYear();
      const month = createdAt.getMonth();

      if (year === selectedYear) {
        monthlyCount[month]++;
      }
    });

    // Step 3: Set chart data
    this.uploadedQuizChartData = {
      labels: monthLabels,
      datasets: [
        {
          label: `Quizzes Uploaded in ${selectedYear}`,
          data: monthlyCount,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  }

  categoryChartData: any = {};
  categoryChartOptions: any = {};

  categoryChart() {
    const categoryLabels = Array.from(
      new Set(this.quizData.map((quiz) => quiz.category))
    );
    const categoryCounts = categoryLabels.map(
      (label) => this.quizData.filter((quiz) => quiz.category === label).length
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
            'rgba(96, 165, 250, 0.4)',
            'rgba(167, 139, 250, 0.4)',
            'rgba(74, 222, 128, 0.4)',
            'rgba(248, 113, 113, 0.4)',
            'rgba(251, 146, 60, 0.4)',

            'rgba(245, 158, 11, 0.4)',
            'rgba(16, 185, 129, 0.4)',
            'rgba(139, 92, 246, 0.4)',
            'rgba(244, 114, 182, 0.4)',
            'rgba(20, 184, 166, 0.4)',
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
            color: '#374151', // gray-700
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
          titleColor: '#111827', // gray-900
          bodyColor: '#374151', // gray-700
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
          borderColor: '#e5e7eb', // gray-200
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

  RecentQuizzes: any[] = [];
  getRecentQuizzes() {
    this.RecentQuizzes = this.quizData.reverse().slice(0, 5);
  }

  viewQuiz(quizId: string) {
    this.router.navigateByUrl(`main/uploaded-quizzes/${quizId}`);
  }
}
