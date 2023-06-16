import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {catchError, Observable, throwError} from "rxjs";
import {PageResponse} from "../../model/page.response.model";
import {Course} from "../../model/course.model";
import {CoursesService} from "../../services/courses.service";

@Component({
  selector: 'app-courses-student',
  templateUrl: './courses-student.component.html',
  styleUrls: ['./courses-student.component.css']
})
export class CoursesStudentComponent implements OnInit {

  studentId!: number;
  pageCourses!: Observable<PageResponse<Course>>;
  pageForNotEnrolledCourses!: Observable<PageResponse<Course>>;
  currentPage: number = 0;
  notEnrolledCoursesCurrentPage: number = 0;
  pageSize: number = 5;
  notEnrolledCoursesPageSize: number = 5;
  errorMessage!: string;
  notEnrolledCoursesErrorMessage!: string;

  // Activate Route is used to get the parameter from the URL
  constructor(private route: ActivatedRoute, private courseService: CoursesService) {
  }

  ngOnInit(): void {
    // Get the current id from the URL for the student and fill the current student
    this.studentId = this.route.snapshot.params['id'];
    this.handleSearchStudentCourses();
    this.handleSearchNonEnrolledInCourses();
  }

  handleSearchStudentCourses() {
    this.pageCourses = this.courseService.getCoursesByStudent(this.studentId, this.currentPage, this.pageSize).pipe(
      catchError(err => {
        this.errorMessage = err.message;
         return throwError(() => {
          return err;
        })
      })
    )
  }

  gotoPage(page: number) {
    this.currentPage = page;
    this.handleSearchStudentCourses();
  }

  handleSearchNonEnrolledInCourses() {
    this.pageForNotEnrolledCourses = this.courseService.getNonEnrolledInCoursesByStudent(this.studentId, this.notEnrolledCoursesCurrentPage, this.notEnrolledCoursesPageSize).pipe(
      catchError(err => {
        this.notEnrolledCoursesErrorMessage = err.message;
         return throwError(() => {
          return err;
        })
      })
    )
  }

  gotoPageForOtherCourses(page: number) {
    this.notEnrolledCoursesCurrentPage = page;
    this.handleSearchNonEnrolledInCourses();
  }

  enrollIn(c: Course) {
    this.courseService.enrollStudentInCourse(c.courseId, this.studentId).subscribe({
        next: () => {
          this.handleSearchStudentCourses();
          this.handleSearchNonEnrolledInCourses();
        },  error : (err: { message: any; }) => {
        alert(err.message);
      }
      }
    )
  }
}
