import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {LoginRequest, LoginResponse} from "../model/login.model";
import {BehaviorSubject, Observable} from "rxjs";
import {environment} from "../../environments/environment";
import {JwtHelperService} from "@auth0/angular-jwt";
import {LoggedUser} from "../model/logged-user.model";
import {Router} from "@angular/router";
import {InstructorsService} from "./instructors.service";
import {StudentsService} from "./students.service";
import {Student} from "../model/student.model";
import {Instructor} from "../model/instructor.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  jwtHelperService = new JwtHelperService();

  // This is the user state that will be used by other components to know if the user is logged in or not and to get the user data if logged in
  user = new BehaviorSubject<LoggedUser | null>(null);
  tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router, private instructorService: InstructorsService, private studentService: StudentsService) {
  }

  // This method handles the login request to retiree the token
  public login(user: LoginRequest): Observable<LoginResponse> {
    const formData = new FormData();
    formData.append('username', user.username);
    formData.append('password', user.password);
    return this.http.post<LoginResponse>(environment.backendHost + "/login", formData)
  }

  // This method is used to decode the token
  // Set logged user data into localstorage
  saveToken(jwtTokens: LoginResponse) {
    const decodedAccessToken = this.jwtHelperService.decodeToken(jwtTokens.accessToken);
    const loggedUser = new LoggedUser(decodedAccessToken.sub, decodedAccessToken.roles, jwtTokens.accessToken, this.getExpirationDate(decodedAccessToken.exp), undefined, undefined);
    this.user.next(loggedUser)

// Auto log out the user when the token expires
    this.autoLogout(this.getExpirationDate(decodedAccessToken.exp).valueOf() - new Date().valueOf())
    localStorage.setItem('userData', JSON.stringify(loggedUser));
    this.redirectLoggedInUser(decodedAccessToken, jwtTokens.accessToken)
  }


  // This method is used to redirect the user to the correct page based on his role
  // Admin -> Courses page
  // Instructor -> Instructor courses page
  // Student -> Student courses page
  // and save the user data in local storage
  redirectLoggedInUser(decodedToken: any, accessToken: string) {
    if (decodedToken.roles.includes("Admin")) this.router.navigateByUrl("/courses").then(r => console.log(r));
    else if (decodedToken.roles.includes("Instructor"))
      this.instructorService.loadInstructorByEmail(decodedToken.sub).subscribe(instructor => {
        const loggedUser = new LoggedUser(decodedToken.sub, decodedToken.roles, accessToken, this.getExpirationDate(decodedToken.exp), undefined, instructor);
        this.user.next(loggedUser);
        localStorage.setItem('userData', JSON.stringify(loggedUser));
        this.router.navigateByUrl("/instructor-courses/" + instructor.instructorId).then(r => console.log(r));
      })
    else if (decodedToken.roles.includes("Student"))
      this.studentService.loadStudentByEmail(decodedToken.sub).subscribe(student => {
        const loggedUser = new LoggedUser(decodedToken.sub, decodedToken.roles, accessToken, this.getExpirationDate(decodedToken.exp), student, undefined);
        this.user.next(loggedUser);
        localStorage.setItem('userData', JSON.stringify(loggedUser));
        this.router.navigateByUrl("/student-courses/" + student.studentId).then(r => console.log(r));
      })
  }


  // This method is used to log in the user automatically by accessing the user info in local storage
  // if the token is still valid on reload or if the user didn't log out
  autoLogin() {
    const userData: {
      username: string,
      roles: string[],
      _token: string,
      _expiration: Date,
      student: Student | undefined,
      instructor: Instructor | undefined
    } = JSON.parse(localStorage.getItem('userData')!);
    if (!userData) return;
    const loadedUser = new LoggedUser(userData.username, userData.roles, userData._token, new Date(userData._expiration), userData.student, userData.instructor)
    if (loadedUser.token) {
      this.user.next(loadedUser);
      this.autoLogout(loadedUser._expiration.valueOf() - new Date().valueOf());
    }
  }

  // This method is used to Sign out the user by clearing the local storage and the user state
  logout() {
    localStorage.clear();
    this.user.next(null);
    this.router.navigate(['/']).then(r => console.log(r));
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  // This method is used to get the expiration date from the token and set it in a Date object
  getExpirationDate(exp: number) {
    const date = new Date(0);
    date.setUTCSeconds(exp);
    return date;
  }

  // This method is used to auto Sign out the user when the token expires
  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration)
  }
}
