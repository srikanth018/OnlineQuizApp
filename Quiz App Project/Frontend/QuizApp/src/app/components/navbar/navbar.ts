import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/AuthService';
import { StudentService } from '../../services/StudentService';
import { TeacherService } from '../../services/TeacherService';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private authService = inject(AuthService);
  constructor(
    private studentService: StudentService,
    private teacherService: TeacherService
  ) {}
  userData: any;
  username: string = '';
  ngOnInit(): void {
    this.userData = this.authService.decodeToken(
      localStorage.getItem('access_token') || ''
    );

    if (this.userData.role === 'Student') {
      this.getStudentByEmail(this.userData.nameid);
    } else if (this.userData.role === 'Teacher') {
      this.getTeacherByEmail(this.userData.nameid);
    }
  }

  private getStudentByEmail(email: string): void {
    this.studentService.getStudentByEmail(email).subscribe({
      next: (data) => {
        this.username = data.name;
        console.log('Student data:', data);
      },
      error: (error) => {
        console.error('Error fetching student data:', error);
      }
    });
  }

  private getTeacherByEmail(email: string): void {
    this.teacherService.getTeacherByEmail(email).subscribe({
      next: (data) => {
        this.username = data.name;
        console.log('Teacher data:', data);
      },
      error: (error) => {
        console.error('Error fetching teacher data:', error);
      }
    });
  }
}
