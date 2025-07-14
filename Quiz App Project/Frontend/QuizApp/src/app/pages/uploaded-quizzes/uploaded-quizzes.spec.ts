import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { UploadedQuizzes } from './uploaded-quizzes';
import { QuizService } from '../../services/QuizService';
import { AuthService } from '../../services/AuthService';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { provideLottieOptions } from 'ngx-lottie';

describe('UploadedQuizzes', () => {
  let component: UploadedQuizzes;
  let fixture: ComponentFixture<UploadedQuizzes>;
  let mockQuizService: jasmine.SpyObj<QuizService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockQuizService = jasmine.createSpyObj('QuizService', [
      'getUploadedQuizzes',
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', ['decodeToken']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Simulate token in localStorage
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return key === 'access_token' ? 'mocked-token' : null;
    });

    // Simulate decoded token response
    mockAuthService.decodeToken.and.returnValue({
      nameid: 'teacher@gmail.com',
    });

    // Simulate quizzes returned by API
    mockQuizService.getUploadedQuizzes.and.returnValue(
      of({
        $values: [
          { id: '1', title: 'Angular Basics', category: 'Web' },
          { id: '2', title: 'RxJS Quiz', category: 'Web' },
          { id: '3', title: 'Database Quiz', category: 'DB' },
        ],
      })
    );

    await TestBed.configureTestingModule({
      imports: [UploadedQuizzes],
      providers: [
        { provide: QuizService, useValue: mockQuizService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        provideLottieOptions({
          player: () => import('lottie-web'),
        }),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadedQuizzes);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load uploaded quizzes after timeout', fakeAsync(() => {
    fixture.detectChanges(); // triggers ngOnInit with setTimeout
    expect(component.isLoading).toBeTrue();

    tick(2000); // simulate time passing for setTimeout
    expect(mockAuthService.decodeToken).toHaveBeenCalledWith('mocked-token');
    expect(mockQuizService.getUploadedQuizzes).toHaveBeenCalledWith(
      'teacher@gmail.com'
    );
    expect(component.quizzes.length).toBe(3);
    expect(component.filteredQuizzes.length).toBeGreaterThan(0);
    expect(component.categoryList.length).toBeGreaterThan(1);
    expect(component.isLoading).toBeFalse();
  }));

  it('should paginate quizzes correctly', () => {
    component.quizzes = new Array(12).fill(null).map((_, i) => ({
      id: `${i + 1}`,
      title: `Quiz ${i + 1}`,
      category: 'General',
    }));
    component.currentPage = 1;
    component.paginateQuizzes();
    expect(component.filteredQuizzes.length).toBe(5);
    expect(component.totalPages).toBe(3);
  });

  it('should navigate to quiz detail page', () => {
    component.viewQuizById('quiz123');
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      'main',
      'uploaded-quizzes',
      'quiz123',
    ]);
  });

  it('should filter quizzes by search and category', () => {
    component.quizzes = [
      { title: 'Angular Basics', category: 'Web' },
      { title: 'Python Quiz', category: 'Programming' },
      { title: 'Java Quiz', category: 'Programming' },
    ];

    component.filterSearchQuizzes('python', 'Programming');
    expect(component.filteredQuizzes.length).toBe(1);
    expect(component.filteredQuizzes[0].title).toContain('Python');
  });
});
