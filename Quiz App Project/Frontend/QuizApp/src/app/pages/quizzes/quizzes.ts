import { Component, HostListener } from '@angular/core';
import { QuizService } from '../../services/QuizService';
import { Question } from '../../components/question/question';
import { QuizCard } from '../../components/quiz-card/quiz-card';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { Loading } from '../../components/loading/loading';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quizzes',
  imports: [NgFor, NgIf, QuizCard, RouterOutlet, Loading, FormsModule],
  templateUrl: './quizzes.html',
  styleUrl: './quizzes.css',
})
export class Quizzes {
  quizzes: any[] = [];
  filteredQuizzes: any[] = [];
  isLoading: boolean = false;
  currentSearchTerm: string = '';
  currentCategory: string = '';
  currentLimit: number = 10;
  currentSkip: number = 0;
  categoryList = [{ label: 'All Categories', value: '' }];
  hasMore: boolean = true;
  isInitialLoad: boolean = true;
  searchCategoryText: string = '';
  filteredCategoryList: { value: string; label: string }[] = [];
  showCategoryDropdown: boolean = false;

  constructor(private quizService: QuizService, private router: Router) {}

  ngOnInit() {
    this.loadQuizzes();
    this.setupSearchSubscription();
  }

  setupSearchSubscription() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(({ searchTerm, limit, skip, category }) => {
          return this.quizService.searchQuizzes(
            searchTerm,
            limit,
            skip,
            category
          );
        })
      )
      .subscribe({
        next: (data) => {
          const newQuizzes = data.$values;

          if (this.currentSkip === 0 || this.isInitialLoad) {
            this.filteredQuizzes = newQuizzes;
            this.isInitialLoad = false;
          } else {
            this.filteredQuizzes = [...this.filteredQuizzes, ...newQuizzes];
          }

          this.hasMore = newQuizzes.length === this.currentLimit;
          this.addCategories();
          console.log('Filtered quizzes:', this.filteredQuizzes);
        },
        error: (err) => {
          console.error('Error filtering quizzes:', err);
        },
      });
  }

  loadQuizzes() {
    this.isLoading = true;
    this.quizService.getAllQuizzes().subscribe({
      next: (data) => {
        this.quizzes = data.$values;
        this.filteredQuizzes = this.quizzes;
        this.filterQuizzes('', this.currentLimit, this.currentSkip, '');
        this.addCategories();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching quizzes:', err);
        this.isLoading = false;
      },
    });
  }

  filterQuizzes(
    searchTerm: string,
    limit: number = 10,
    skip: number = 0,
    category: string
  ) {
    const isNewSearch =
      searchTerm !== this.currentSearchTerm ||
      category !== this.currentCategory;

    if (isNewSearch) {
      this.filteredQuizzes = [];
      this.currentSkip = 0;
      skip = 0;
      this.hasMore = true;
    }

    this.currentSearchTerm = searchTerm;
    this.currentLimit = limit;
    this.currentCategory = category;
    this.currentSkip = skip;
    console.log('Fetching with:', {
      searchTerm: this.currentSearchTerm,
      limit: this.currentLimit,
      skip: this.currentSkip,
      category: this.currentCategory,
    });

    this.searchSubject.next({
      searchTerm: this.currentSearchTerm,
      limit: this.currentLimit,
      skip: this.currentSkip,
      category: this.currentCategory,
    });
  }
  isBottomLoading: boolean = false;
  scrollDebounce: boolean = false;

  async loadMoreQuizzes() {
    if (!this.hasMore || this.isBottomLoading) return;

    this.isBottomLoading = true;

    try {
      const newSkip = this.currentSkip + this.currentLimit;
      await this.filterQuizzes(
        this.currentSearchTerm,
        this.currentLimit,
        newSkip,
        this.currentCategory
      );
      // Smooth scroll to maintain position
      setTimeout(() => {
        const scrollPosition = window.scrollY;
        const newScrollHeight = document.documentElement.scrollHeight;
        const heightDiff = newScrollHeight - scrollPosition;

        if (heightDiff < window.innerHeight * 1.5) {
          // Only adjust scroll if we're near the bottom
          window.scrollTo({
            top: newScrollHeight - window.innerHeight,
            behavior: 'smooth',
          });
        }
      }, 100);
    } catch (error) {
      console.error('Error loading more quizzes:', error);
    } finally {
      this.isBottomLoading = false;
    }
  }

  viewQuiz(quizId: string) {
    console.log(quizId);
    if (quizId) {
      this.router.navigate(['main', 'available-quizzes', quizId]);
    }
  }

  searchSubject = new Subject<{
    searchTerm: string;
    limit: number;
    skip: number;
    category: string;
  }>();

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (this.scrollDebounce || this.isBottomLoading || !this.hasMore) return;

    const threshold = 50;
    const scrollTop = window.scrollY;
    const clientHeight = document.documentElement.clientHeight;
    const scrollHeight = document.documentElement.scrollHeight;

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      this.scrollDebounce = true;
      this.loadMoreQuizzes();

      // Debounce to prevent multiple rapid triggers
      setTimeout(() => {
        this.scrollDebounce = false;
      }, 1000);
    }
  }

  addCategories() {
    this.filteredQuizzes.forEach((quiz: any) => {
      if (
        quiz.category &&
        !this.categoryList.some((cat) => cat.value === quiz.category)
      ) {
        this.categoryList.push({ label: quiz.category, value: quiz.category });
      }
    });
    this.filteredCategoryList = [...this.categoryList];
  }
  filterCategoryList(text: string) {
    const search = text.toLowerCase();
    this.filteredCategoryList = this.categoryList.filter((category) =>
      category.label.toLowerCase().includes(search)
    );
  }

  selectCategory(category: { value: string; label: string }) {
    this.currentCategory = category.value;
    this.searchCategoryText = category.label;
    this.showCategoryDropdown = false;
    this.filterQuizzes(this.currentSearchTerm, 10, 0, this.currentCategory);
  }

  hideDropdownWithDelay() {
    setTimeout(() => {
      this.showCategoryDropdown = false;
    }, 200);
  }
}
