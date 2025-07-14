import { Component } from '@angular/core';
import { QuizService } from '../../services/QuizService';
import { AuthService } from '../../services/AuthService';
import { QuizCard } from '../../components/quiz-card/quiz-card';
import { NgFor, NgIf } from '@angular/common';
import { Loading } from '../../components/loading/loading';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-uploaded-quizzes',
  standalone: true,
  imports: [QuizCard, NgFor, NgIf, Loading, FormsModule,RouterOutlet],
  templateUrl: './uploaded-quizzes.html',
  styleUrl: './uploaded-quizzes.css',
})
export class UploadedQuizzes {
  quizzes: any[] = [];
  filteredQuizzes: any[] = [];
  isLoading = false;
  selectedCategory: string = 'all';
  constructor(
    private quizService: QuizService,
    private authService: AuthService,
    private router:Router
  ) {}

  ngOnInit() {
    this.isLoading = true;
    setTimeout(() => {
      this.loadUploadedQuizzes();
    }, 2000);
  }

  private getTeacherMail(): string | null {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decodedToken = this.authService.decodeToken(token);
      return decodedToken?.nameid || null;
    }
    return null;
  }

  loadUploadedQuizzes(): void {
    const teacherEmail = this.getTeacherMail();
    if (teacherEmail) {
      this.quizService.getUploadedQuizzes(teacherEmail).subscribe({
        next: (quizzes: any) => {
          this.quizzes = quizzes?.$values.sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ) || [];
          console.log(quizzes);
          console.log(this.quizzes);
          this.currentPage = 1;
          this.paginateQuizzes();
          this.getcategoryList();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching uploaded quizzes:', error);
          this.isLoading = false;
        },
      });
    } else {
      this.isLoading = false;
    }
  }

  pageSize: number = 5;
  currentPage: number = 1;

  start: number = 0;
  end: number = 5;
  total: number = 0;

  paginateQuizzes() {
    this.total = this.quizzes.length;
    this.start = (this.currentPage - 1) * this.pageSize;
    this.end = this.start + this.pageSize;
    this.filteredQuizzes = this.quizzes.slice(this.start, this.end);
  }

  nextPage(): void {
    if (this.currentPage * this.pageSize < this.total) {
      this.currentPage++;
      this.paginateQuizzes();
    }
  }
  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateQuizzes();
    }
  }

  categoryList: any[] = [{ value: 'all', label: 'All Categories' }];
  getcategoryList() {
    for (let quiz of this.quizzes) {
      if (!this.categoryList.some((item) => item.value === quiz.category)) {
        this.categoryList.push({ value: quiz.category, label: quiz.category });
      }
    }
  }

  filterSearchQuizzes(search: string = '', category: string = 'all') {
    let filtered = this.quizzes;

    if (search.trim()) {
      filtered = filtered.filter((quiz) =>
        quiz.title.toLowerCase().includes(search.trim().toLowerCase())
      );
    }

    if (category !== 'all') {
      filtered = filtered.filter((quiz) => quiz.category === category);
    }

    this.filteredQuizzes = filtered;
  }

  viewQuizById(quizId: string) {
    console.log(quizId);
    
    if (quizId) {
      this.router.navigate(['main', 'uploaded-quizzes', quizId]);
    }
  }
}
