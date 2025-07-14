import { Injectable } from "@angular/core";
import { RegisterStudentModel } from "../models/RegisterStudentModel";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { RegisterTeacherModel } from "../models/RegisterTeacherModel";

@Injectable()
export class RegisterService {
    private baseUrl = 'http://localhost:5038/api/v1/';
    constructor(private http: HttpClient) {}

    registerStudent(userData:RegisterStudentModel): Observable<any> {
        return this.http.post(`${this.baseUrl}students`, userData);
    }

    registerTeacher(userData:RegisterTeacherModel): Observable<any> {
        return this.http.post(`${this.baseUrl}teachers`, userData);
    }
}