import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { SubmitQuiz } from '../models/SubmitQuiz';

@Injectable()
export class QuizService {
  constructor(private http: HttpClient) {}

  private baseUrl = 'http://localhost:5038/api/v1/';

  createQuiz(quizData: any): Observable<string> {
    const token = localStorage.getItem('access_token');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http
      .post(`${this.baseUrl}quizzes/quiz`, quizData, {
        observe: 'response',
        headers,
      })
      .pipe(
        map((response) =>
          response.status >= 200 && response.status < 300
            ? 'Quiz created successfully'
            : 'Failed to create quiz'
        ),
        catchError((error) => {
          console.error('Error creating quiz:', error);
          return 'Error creating quiz';
        })
      );
  }

  downloadQuizTemplate(
    questionCount: number = 5,
    optionCount: number = 4
  ): Observable<Blob> {
    const token = localStorage.getItem('access_token');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.get('http://localhost:5038/api/v1/quizzes/template', {
      params: new HttpParams()
        .set('questionCount', questionCount)
        .set('optionCount', optionCount),
      headers,
      responseType: 'blob',
    });
  }

  bulkUploadQuiz(filedata: any): Observable<any> {
  const formData = new FormData();
  formData.append('Title', filedata.title);
  formData.append('Description', filedata.description);
  formData.append('Category', filedata.category);
  formData.append('UploadedBy', filedata.uploadedBy);
  formData.append('TotalMarks', filedata?.totalMarks.toString());
  formData.append('TimeLimit', filedata?.timeLimit);
  formData.append('File', filedata?.file);
  console.log('File data:', filedata);

  const token = localStorage.getItem('access_token');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return this.http.post(
    'http://localhost:5038/api/v1/quizzes/bulk-upload',
    formData,
    { headers }
  );
}


  getUploadedQuizzes(teacherEmail: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http
      .get(`${this.baseUrl}quizzes/getbyteacher?email=${teacherEmail}`, { headers })
      .pipe(
        map((response) => response),
        catchError((error) => {
          console.error('Error fetching uploaded quizzes:', error);
          throw error;
        })
      );
  }

  getQuizById(quizId: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http
      .get(`${this.baseUrl}quizzes/${quizId}`, { headers })
      .pipe(
        map((response) => response),
        catchError((error) => {
          console.error('Error fetching quiz:', error);
          throw error;
        })
      );
  }

  getAllQuizzes(): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http
      .get(`${this.baseUrl}quizzes`, { headers })
      .pipe(
        map((response) => response),
        catchError((error) => {
          console.error('Error fetching all quizzes:', error);
          throw error;
        })
      );
  }

  attemptQuiz(quizId:string): Observable<any>{
     const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http
      .get(`${this.baseUrl}attempt-quiz/${quizId}`, { headers })
      .pipe(
        map((response) => response),
        catchError((error) => {
          console.error('Error fetching all quizzes:', error);
          throw error;
        })
      );
  }

  searchQuizzes(searchTerm:string, limit:number = 10, skip:number = 0, category:string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    let params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('limit', limit.toString())
      .set('skip', skip.toString())
      .set('category', category);

    return this.http
      .get(`${this.baseUrl}quizzes/search`, { headers, params })
      .pipe(
        map((response) => response),
        catchError((error) => {
          console.error('Error searching quizzes:', error);
          throw error;
        })
      );

  }

  submitQuiz(submitData:SubmitQuiz){
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.baseUrl}attempt-quiz/submit`, submitData, { headers })
      .pipe(
        map((response) => response),
        catchError((error) => {
          console.error('Error submitting quiz:', error);
          throw error;
        })
      );
  }

  updateQuestion(quizId: string, questionId: string, data: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.put(`${this.baseUrl}quizzes/question/${questionId}`, data, { headers });
  }
}
