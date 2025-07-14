import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class StudentService {
    private baseUrl = 'http://localhost:5038/api/v1/';
    constructor(private http: HttpClient) {}

    getStudentByEmail(email: string): Observable<any> {
        const token = localStorage.getItem('access_token');
        const headers = {
            Authorization: `Bearer ${token}`,
        };
        return this.http.get(`${this.baseUrl}students/byEmail?email=${email}`, { headers });
    }
}