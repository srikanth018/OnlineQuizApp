import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentDashboard } from './student-dashboard';
import { QuizService } from '../../services/QuizService';
import { AuthService } from '../../services/AuthService';
import { CompletedQuizService } from '../../services/CompletedQuizService';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';

describe('StudentDashboard', () => {
  let component: StudentDashboard;
  let fixture: ComponentFixture<StudentDashboard>;

  const mockJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    'eyJlbWFpbCI6InN0dWRlbnRAZXhhbXBsZS5jb20iLCJyb2xlIjoiU3R1ZGVudCJ9.' +
    'signature';

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'access_token') {
        return mockJwt;
      }
      return null;
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDashboard, ToastrModule.forRoot()],
      providers: [
        QuizService,
        AuthService,
        CompletedQuizService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
