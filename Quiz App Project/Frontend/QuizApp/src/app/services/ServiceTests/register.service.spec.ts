import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RegisterService } from '../RegisterService';
import { RegisterStudentModel } from '../../models/RegisterStudentModel';
import { RegisterTeacherModel } from '../../models/RegisterTeacherModel';

describe('RegisterService', () => {
  let service: RegisterService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RegisterService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(RegisterService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should register a student', () => {
    const studentData:any = {
      name: 'Arun Kumar',
      email: 'arun@gmail.com.com',
      phone: '7394562375',
      qualification: 'B.Tech',
      dob: '2000-01-01',
      password: 'arun@123'
    };


    service.registerStudent(studentData).subscribe((res) => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne('http://localhost:5038/api/v1/students');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(studentData);
    req.flush({ success: true });
  });

  it('should register a teacher', () => {
    const teacherData:any = {
      name: 'Hari Prasad',
      email: 'hari@gmail.com',
      phone: '9876543210',
      password: 'hari@123'
    };


    service.registerTeacher(teacherData).subscribe((res) => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne('http://localhost:5038/api/v1/teachers');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(teacherData);
    req.flush({ success: true });
  });
});
