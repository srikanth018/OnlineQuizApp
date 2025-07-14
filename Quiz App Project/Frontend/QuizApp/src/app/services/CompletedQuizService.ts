import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class CompletedQuizService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5038/api/v1/';
    constructor() {}
  getCompletedQuizByQuizId(quizId: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.get(`${this.baseUrl}completed-quizzes/quizId/${quizId}`,{ headers });
  }

  getCompletedQuizByStudentEmail(studentEmail: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const HttpParams = { studentEmail: studentEmail };
    return this.http.get(`${this.baseUrl}completed-quizzes/student`, { headers, params: HttpParams });
  }

  getCompletedQuizById(completedQuizId: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.get(`${this.baseUrl}completed-quizzes/${completedQuizId}`, { headers });
  }

  getAllCompletedQuizzes(): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.get(`${this.baseUrl}completed-quizzes`, { headers });
  }
}
