import {Student} from "./student.model";
import {Instructor} from "./instructor.model";

export class LoggedUser {
  constructor(public username: string,
              public roles: string[],
              private _token: string,
              public _expiration: Date,
              public student: Student | undefined,
              public instructor: Instructor | undefined) {
  }

  get token() {
    if (!this._expiration || new Date() > this._expiration) {
      return null;
    }
    return this._token;
  }
}
