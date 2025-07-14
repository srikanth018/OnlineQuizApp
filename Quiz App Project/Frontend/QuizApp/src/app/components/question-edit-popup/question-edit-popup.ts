import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-question-edit-popup',
  imports: [ReactiveFormsModule, NgFor],
  templateUrl: './question-edit-popup.html',
  styleUrl: './question-edit-popup.css'
})
export class QuestionEditPopup {
  @Input() questionform!: FormGroup;
@Output() save = new EventEmitter<void>();
@Output() cancel = new EventEmitter<void>();

  constructor(private toastr: ToastrService) {}

  onSubmitUpdate() {
    if (this.questionform.valid) {
      this.toastr.info('Update is in progress...');
      this.save.emit();
      
    }
  }

  onCancel() {
    this.toastr.warning('Update cancelled.');
  this.cancel.emit();
}

// Uncomment if you need options functionality
get options() {
  return this.questionform.get('options') as FormArray;
}

}
