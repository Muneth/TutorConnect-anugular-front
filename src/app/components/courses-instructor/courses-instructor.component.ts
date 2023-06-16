import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Instructor} from "../../model/instructor.model";
import {catchError, Observable, throwError} from "rxjs";
import {PageResponse} from "../../model/page.response.model";
import {Course} from "../../model/course.model";
import {CoursesService} from "../../services/courses.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-courses-instructor',
  templateUrl: './courses-instructor.component.html',
  styleUrls: ['./courses-instructor.component.css']
})

export class CoursesInstructorComponent implements OnInit {
  instructorId!: number;
  currentInstructor!: Instructor;
  pageCourses!: Observable<PageResponse<Course>>;
  currentPage: number = 0;
  pageSize: number = 5;
  errorMessage!: string;
  submitted: boolean = false;
  courseFormGroup!: FormGroup;
  updateCourseFormGroup!: FormGroup;

  // Activate Route is used to get the parameter from the URL
  constructor(private route: ActivatedRoute, private courseService: CoursesService, private fb: FormBuilder, private modalService: NgbModal) {
  }

  ngOnInit(): void {
    // Get the current id from the URL for the instructor and fill the current instructor
    this.instructorId = this.route.snapshot.params['id'];
    this.fillCurrentInstructor();
    this.handleSearchInstructorCourses();
  }

  private fillCurrentInstructor() {
    this.currentInstructor = {
      instructorId: this.instructorId,
      firstName: "",
      lastName: "",
      summary: "",
      user: {email: "", password: ""}
    }
  }

  private handleSearchInstructorCourses() {
    this.pageCourses = this.courseService.getCoursesByInstructor(this.instructorId, this.currentPage, this.pageSize).pipe(
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
    this.handleSearchInstructorCourses();
  }

  getModal(content: any) {
    this.submitted = false;
    this.courseFormGroup = this.fb.group({
      courseName: ["", Validators.required],
      courseDuration: ["", Validators.required],
      courseDescription: ["", Validators.required],
      instructor: [this.currentInstructor, Validators.required]
    })
    this.modalService.open(content, {size: 'xl'});
  }

  onCloseModal(modal: any) {
    modal.close();
    this.courseFormGroup.reset();
  }

  onSaveCourse(modal: any) {
    this.submitted = true;
    if (this.courseFormGroup.invalid) return;
    this.courseService.saveCourse(this.courseFormGroup.value).subscribe({
      next: () => {
        alert("Success Saving Course");
        this.handleSearchInstructorCourses();
        this.courseFormGroup.reset();
        this.submitted = false;
        modal.close();
      },
      error: (err: { message: any; }) => {
        alert(err.message);
      }
    })
  }

  getUpdateModal(c: Course, updateContent: any) {
    this.updateCourseFormGroup = this.fb.group({
      courseId: [c.courseId, Validators.required],
      courseName: [c.courseName, Validators.required],
      courseDuration: [c.courseDuration, Validators.required],
      courseDescription: [c.courseDescription, Validators.required],
      instructor: [c.instructor, Validators.required],
    })
    this.modalService.open(updateContent, {size: 'xl'});
  }

  onCloseUpdateModal(updateModal: any) {
    updateModal.close();
    this.updateCourseFormGroup.reset();
  }

  onUpdateCourse(updateModal: any) {
    this.submitted = true;
    if (this.updateCourseFormGroup.invalid) return;
    this.courseService.updateCourse(this.updateCourseFormGroup.value, this.updateCourseFormGroup.value.courseId).subscribe({
      next: () => {
        alert("Success Updating Course");
        this.handleSearchInstructorCourses();
        this.submitted = false;
        updateModal.close();
      },
      error: (err: { message: any; }) => {
        alert(err.message);
      }
    })
  }
}
