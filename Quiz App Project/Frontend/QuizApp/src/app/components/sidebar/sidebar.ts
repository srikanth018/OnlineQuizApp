import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/AuthService';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}
  userRole: string | null = '';

  ngOnInit() {
    this.userRole = this.getRole();
  }

  logout() {
    localStorage.removeItem('access_token');
    this.toastr.success('Logged out successfully', 'Success', {
      timeOut: 3000,
      positionClass: 'toast-top-right',
    });

    this.router.navigate(['']);
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  getRole() {
    const token = localStorage.getItem('access_token');
    if (token) {
      const user = this.authService?.decodeToken(token);
      return user?.role;
    }
    return null;
  }
}
