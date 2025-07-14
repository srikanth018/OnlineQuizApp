import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/AuthService';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../ngrx/authStore/auth.action';
import { selectIsAuthenticated, selectUser } from '../../ngrx/authStore/auth.selector';
import { map } from 'rxjs';
import { Loading } from "../loading/loading";
import { Navbar } from "../navbar/navbar";
import { Sidebar } from "../sidebar/sidebar";
import { UploadedQuizzes } from '../../pages/uploaded-quizzes/uploaded-quizzes';
@Component({
  selector: 'app-sample',
  standalone: true,
  imports: [Loading, Navbar, Sidebar, UploadedQuizzes],
  templateUrl: './sample.html',
  styleUrl: './sample.css',
})
export class Sample implements OnInit {
  constructor(private authService: AuthService) {
    
  }

  private store = inject(Store);
    

  email: string = 'arun@gmail.com';
  password: string = 'arun123';
  loggedInUserData: any;
  ngOnInit() {
  const token = localStorage.getItem('access_token');
  if (token) {
    const user = this.authService.decodeToken(token);
    this.store.dispatch(AuthActions.loginSuccess({ token, user }));
  }
    this.store.select(selectUser).subscribe((user) => {
      this.loggedInUserData = user;
    });
}

  async login(){
    this.store.dispatch(AuthActions.login({ email: this.email, password: this.password }));
      this.store.select(selectUser).subscribe((user) => {
      this.loggedInUserData = user;
        this.store.select(selectIsAuthenticated).subscribe((isAuthenticated) => {
        });
    });
  }

  
}
