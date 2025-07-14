import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherDashboard } from './teacher-dashboard';
import { QuizService } from '../../services/QuizService';
import { AuthService } from '../../services/AuthService';
import { CompletedQuizService } from '../../services/CompletedQuizService';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('TeacherDashboard', () => {
  let component: TeacherDashboard;
  let fixture: ComponentFixture<TeacherDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherDashboard],
      providers:[
            QuizService,
            AuthService,
            CompletedQuizService,
            provideHttpClient(),
            provideHttpClientTesting(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
