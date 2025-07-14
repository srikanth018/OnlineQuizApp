import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { jwtDecode } from "jwt-decode";

@Injectable()
export class AuthService {
    private http = inject(HttpClient);
    private baseUrl = 'http://localhost:5038/api/v1/';
    
    login(email:string, password:string): Observable<any>{        
        return this.http.post(`${this.baseUrl}auth/login`, { email, password });
    }

    decodeToken(token: string): any {
    return jwtDecode(token);
  }
}
