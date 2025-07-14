import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Main } from './main';
import { StudentService } from '../../services/StudentService';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TeacherService } from '../../services/TeacherService';
import { QuizService } from '../../services/QuizService';
import { CompletedQuizService } from '../../services/CompletedQuizService';
import { AuthService } from '../../services/AuthService';
import { ActivatedRoute } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';

describe('Main', () => {
  let component: Main;
  let fixture: ComponentFixture<Main>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Main, ToastrModule.forRoot()],
      providers: [
        StudentService,
        TeacherService,
        QuizService,
        CompletedQuizService,
        {
          provide: AuthService,
          useValue: {
            decodeToken: () => ({ nameid: 'test@gmail.com' })
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => {
                  if (key === 'id') {
                    return '123';
                  }
                  return null;
                }
              }
            }
          }
        },
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Main);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
