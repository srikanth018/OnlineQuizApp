import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class createQuizFormValidators {
  static titleValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const title = control.value;
      if (!title || title.length < 5) {
        return { titleError: 'Title must be at least 5 characters long.' };
      }
      return null;
    };
  }

  static descriptionValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const description = control.value;
      if (!description || description.length < 10) {
        return { descriptionError: 'Description must be at least 10 characters long.' };
      }
      return null;
    };
  }

  static totalMarksValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const totalMarks = control.value;
      if (totalMarks === null || totalMarks < 1) {
        return { totalMarksError: 'Total marks must be a positive number.' };
      }
      return null;
    };
  }
}