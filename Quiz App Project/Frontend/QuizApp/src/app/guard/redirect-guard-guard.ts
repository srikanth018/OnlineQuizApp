import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { AuthService } from "../services/AuthService";

@Injectable()

export class RedirectGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(): Observable<boolean> {
  const token = localStorage.getItem("access_token");

  if (!token) return of(true); 

  try {
    const user = this.authService.decodeToken(token);

    if (user?.role === 'Teacher') {
      this.router.navigate(['main', 'teacher-dashboard']);
      return of(false);
    } else if (user?.role === 'Student') {
      this.router.navigate(['main', 'student-dashboard']);
      return of(false);
    }

  } catch (error) {
    console.error("Token decode error:", error);
    return of(true); 
  }

  return of(true);
}

}