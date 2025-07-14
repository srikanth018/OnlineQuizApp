import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class TeacherService {
    private baseUrl = 'http://localhost:5038/api/v1/';
    constructor(private http: HttpClient) {}

    getTeacherByEmail(email: string): Observable<any> {
        const token = localStorage.getItem('access_token');
        const headers = {
            Authorization: `Bearer ${token}`,
        };
        return this.http.get(`${this.baseUrl}teachers/byEmail?email=${email}`, { headers });
    }
}