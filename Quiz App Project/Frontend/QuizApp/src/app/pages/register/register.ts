import { Component, EventEmitter, inject, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { registerFormValidators } from '../../misc/registerFormValidators';
import { RegisterStudentModel } from '../../models/RegisterStudentModel';
import { RegisterTeacherModel } from '../../models/RegisterTeacherModel';
import { RegisterService } from '../../services/RegisterService';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  @Output() registrationSuccess = new EventEmitter<string>();
  registerForm: FormGroup;

  selectedRole: string = '';

  userData: any;


  constructor(  private registerService: RegisterService) {
    this.registerForm = new FormGroup(
      {
        name: new FormControl(null, [
          Validators.required,
          registerFormValidators.nameValidator(),
        ]),
        email: new FormControl(null, [Validators.required, Validators.email]),
        phoneNumber: new FormControl(null, [
          Validators.required,
          Validators.pattern(/^\d{10}$/),
        ]),
        highestQualification: new FormControl(null),
        dateOfBirth: new FormControl(null),
        password: new FormControl(null, [
          Validators.required,
          registerFormValidators.PasswordValidator(),
        ]),
        confirmPassword: new FormControl(null, [Validators.required]),
      },
      { validators: registerFormValidators.ConfirmPassword() }
    );

    this.registerForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.registerForm.updateValueAndValidity();
    });
  }

  onSubmit() {
    console.log('Form:', this.registerForm.value);
    
    if (this.registerForm.valid) {
      console.log('Form is valid');
      
      if (this.selectedRole === 'Student') {
        console.log('Selected role is Student');
        
        this.userData = RegisterStudentModel.mapStudentModel(
          this.registerForm.value
        );
        this.registerService.registerStudent(this.userData).subscribe({
          next: (response) => {
            const successMsg = 'Registration Successful !!!';
            this.registrationSuccess.emit(successMsg);
            console.log('Student registered successfully:', response);
          },
          error: (error) => {
            console.error('Error registering student:', error.error.message);
          },
        });
      }
      if (this.selectedRole === 'Teacher') {
        console.log('Selected role is Teacher');
        
        this.userData = RegisterTeacherModel.mapTeacherModel(
          this.registerForm.value
        );
        this.registerService.registerTeacher(this.userData).subscribe({
          next: (response) => {
            localStorage.setItem('reg', 'Registration Successfull !!!!');
            const successMsg = 'Registration Successful !!!';
            this.registrationSuccess.emit(successMsg);
            console.log('Teacher registered successfully:', response);
          },
          error: (error) => {
            console.error('Error registering teacher:', error.message);
          },
        });
      }
    } else {
      console.log('Form is invalid');
    }

    // const successMsg = 'Registration Successful !!!';
    // this.registrationSuccess.emit(successMsg);
  }
}
