import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';

@Component({
  selector: 'app-success',
  imports: [CommonModule],
  templateUrl: './success.html',
  styleUrls: ['./success.css']
})
export class Success implements OnInit {
  @Input() message: string | null = '';

  showMessage: boolean = false;
  ngOnInit(): void {
    if (!this.message) {
      this.message = 'Operation completed successfully!';
    }
    setTimeout(() => {
      this.showMessage = true;
    }, 2000); 
  }
}
