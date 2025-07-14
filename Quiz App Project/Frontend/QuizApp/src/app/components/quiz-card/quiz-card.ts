import { Component, Input, OnInit } from '@angular/core';
import { Quiz } from '../../models/QuizModel';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-quiz-card',
  standalone: true,
  imports: [NgIf],
  templateUrl: './quiz-card.html',
  styleUrl: './quiz-card.css',
})
export class QuizCard implements OnInit {
  @Input() quiz!: Quiz;
  @Input() type: string = 'list';

  showFullDescription: boolean = false;

  ngOnInit(): void {
    if (typeof this.quiz?.timeLimit === 'string') {
      this.quiz.timeLimit = this.timespanToMinutes(this.quiz.timeLimit);
    }
  }
  timespanToMinutes(timeSpan: string): any {

    const [hours, minutes, seconds] = timeSpan?.split(':').map(Number);
    return hours * 60 + minutes + Math.floor(seconds / 60);
  }
}
