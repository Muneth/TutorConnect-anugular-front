import {UserService} from "../services/user.service";
import {AbstractControl, AsyncValidatorFn, ValidationErrors, Validators} from "@angular/forms";
import {map, Observable} from "rxjs";


// This class is used to validate if the email already exists by using the UserService and the checkIfEmailExist method from the UserService class and the EmailExistsValidator class is used in the instructorFormGroup in the teachers.component.ts file to validate the email field in the form group.
export class EmailExistsValidator {
  static validate(userService: UserService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return userService.checkIfEmailExist(control.value).pipe(
        map((result: boolean) => result ? {emailAlreadyExists: true} : null)
      )
    }
  }
}
