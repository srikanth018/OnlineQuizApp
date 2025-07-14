import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Navbar } from './navbar';
import { AuthService } from '../../services/AuthService';
import { StudentService } from '../../services/StudentService';
import { TeacherService } from '../../services/TeacherService';
import { of, throwError } from 'rxjs';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  const mockAuthService = {
    decodeToken: (token: string) => ({
      nameid: 'student@gmail.com',
      role: 'Student',
    }),
  };

  const mockStudentService = {
    getStudentByEmail: jasmine
      .createSpy('getStudentByEmail')
      .and.returnValue(of({ name: 'Test Student' })),
  };

  const mockTeacherService = {
    getTeacherByEmail: jasmine
      .createSpy('getTeacherByEmail')
      .and.returnValue(of({ name: 'Test Teacher' })),
  };

  beforeEach(async () => {
    localStorage.setItem(
      'access_token',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJuYW1laWQiOiJzdHVkZW50QGV4YW1wbGUuY29tIiwicm9sZSI6IlN0dWRlbnQifQ.' +
        'signature'
    );

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: StudentService, useValue: mockStudentService },
        { provide: TeacherService, useValue: mockTeacherService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should decode token and fetch student name if role is Student', () => {
    expect(mockStudentService.getStudentByEmail).toHaveBeenCalledWith(
      'student@gmail.com'
    );
    expect(component.username).toBe('Test Student');
  });

  it('should fetch teacher data if role is Teacher', () => {
    mockAuthService.decodeToken = () => ({
      nameid: 'teacher@gmail.com',
      role: 'Teacher',
    });

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockTeacherService.getTeacherByEmail).toHaveBeenCalledWith(
      'teacher@gmail.com'
    );
    expect(component.username).toBe('Test Teacher');
  });

  it('should handle student fetch error gracefully', () => {
    mockAuthService.decodeToken = () => ({
      nameid: 'student@gmail.com',
      role: 'Student',
    });

    mockStudentService.getStudentByEmail.and.returnValue(
      throwError(() => new Error('Simulated fetch error'))
    );

    spyOn(console, 'error');

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockStudentService.getStudentByEmail).toHaveBeenCalledWith(
      'student@gmail.com'
    );
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching student data:',
      jasmine.any(Error)
    );
    expect(component.username).toBe('');
  });
});
