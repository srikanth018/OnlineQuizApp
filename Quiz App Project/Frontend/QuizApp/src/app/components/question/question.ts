import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-question',
  imports: [ReactiveFormsModule, NgFor, NgIf],
  templateUrl: './question.html',
  styleUrl: './question.css',
  standalone: true,
})
export class Question {
  @Input() questionGroup!: FormGroup;
  @Input() questionIndex!: number;
  @Output() removeQuestion = new EventEmitter<number>();

  constructor(private fb: FormBuilder) {}

  get options(): FormArray {
    return this.questionGroup.get('options') as FormArray;
  }

  addOption(): void {
    this.options.push(
      this.fb.group({
        optionText: ['', Validators.required],
        isCorrect: [false],
      })
    );
  }

  removeOption(index: number): void {
    this.options.removeAt(index);
  }
}
