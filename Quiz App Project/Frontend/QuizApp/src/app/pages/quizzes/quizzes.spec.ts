import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Quizzes } from './quizzes';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { QuizService } from '../../services/QuizService';
import { provideLottieOptions } from 'ngx-lottie';

describe('Quizzes', () => {
  let component: Quizzes;
  let fixture: ComponentFixture<Quizzes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Quizzes],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        QuizService,
        provideLottieOptions({
          player: () => import('lottie-web'),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Quizzes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
