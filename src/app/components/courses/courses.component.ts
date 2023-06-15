import {Component, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CoursesService} from "../../services/courses.service";
import {catchError, Observable, throwError} from "rxjs";
import {PageResponse} from "../../model/page.response.model";
import {Course} from "../../model/course.model";
import {InstructorsService} from "../../services/instructors.service";
import {Instructor} from "../../model/instructor.model";

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})

export class CoursesComponent implements OnInit {

  searchFormGroup!: FormGroup;
  courseFormGroup!: FormGroup;
  updateCourseFormGroup!: FormGroup;
  pageCourses$!: Observable<PageResponse<Course>>;
  instructors$!: Observable<Array<Instructor>>
  currentPage: number = 0;
  pageSize: number = 5;
  errorMessage!: string;
  errorInstructorsMessage!: string;
  submitted: boolean = false;
  defaultInstructor!: Instructor;

  constructor(private modalService: NgbModal, private fb: FormBuilder, private courseService: CoursesService, private instructorService: InstructorsService) {
  }

  ngOnInit(): void {
    this.searchFormGroup = this.fb.group({
      keyword: this.fb.control('')
    })

// The courseFormGroup is initialized with the FormBuilder and the courseName, courseDuration, courseDescription, and instructor fields are initialized with the required validator.
    this.courseFormGroup = this.fb.group({
      courseName: ["", Validators.required],
      courseDuration: ["", Validators.required],
      courseDescription: ["", Validators.required],
      instructor: [null, Validators.required]
    })
    this.handleSearchCourses()
  }

  // The getModal() method is used to open the modal window. The modalService.open() method is used to open the modal window. The size of the modal window is set to xl. The fetchInstructors() method is called to fetch all the instructors, The submitted variable is set to false to hide the error messages while opening the modal window.
  getModal(content: any) {
    this.submitted = false;
    this.fetchInstructors();
    this.modalService.open(content, {size: 'xl'})
  }

// This method is used to fetch the courses from the database and assign them to the pageCourses$ observable. The error message is assigned to the errorMessage variable if there is any error while fetching the courses.
  handleSearchCourses() {
    let keyword = this.searchFormGroup.value.keyword;
    this.pageCourses$ = this.courseService.searchCourses(keyword, this.currentPage, this.pageSize).pipe(
      catchError(err => {
        this.errorMessage = err.message;
        return throwError(() => {
          return err;
        })
      })
    )
  }

  // The gotoPage() method takes the page number as input and calls the handleSearchCourses() method to fetch the courses for the given page number.
  gotoPage(page: number) {
    this.currentPage = page;
    this.handleSearchCourses();
  }

  // This method first confirm the delete operation by calling the confirm() method of the window object. If the user confirms the delete operation, then the deleteCourse() method of the CourseService is called to delete the course and then the handleSearchCourses() method is called to fetch the courses again.
  handleDeleteCourse(c: Course) {
    let conf = confirm("Are you sure?")
    if (!conf) return;
    this.courseService.deleteCourse(c.courseId).subscribe({
      next: () => {
        this.handleSearchCourses();
      },
      error : (err: { message: any; }) => {
        alert(err.message);
      }
    })
  }

// The fetchInstructors() method is used to fetch all the instructors from the database and assign them to the instructors$ observable. The errorInstructorsMessage is used to display the error message if there is any error while fetching the instructors.
  fetchInstructors() {
    this.instructors$ = this.instructorService.findAllInstructors().pipe(
      catchError(err => {
        this.errorInstructorsMessage = err.message;
        return throwError(() => {
          return err;
        })
      })
    )
  }

  // The onCloseModal() method is used to close the modal window. The close() method of the NgbModal service is called to close the modal window. The courseFormGroup is reset.
  onCloseModal(modal: any) {
    modal.close();
    this.courseFormGroup.reset();
  }

  // The onSaveCourse() method is used to save the course. The submitted variable is set to true to display the error messages if there is any error while saving the course. The courseFormGroup is validated and if the form is invalid, then the method returns. If the form is valid, then the saveCourse() method of the CourseService is called to save the course. The handleSearchCourses() method is called to fetch the courses again. The courseFormGroup is reset and the submitted variable is set to false.
  onSaveCourse(modal: any) {
    this.submitted = true;
    console.log(this.courseFormGroup)
    if (this.courseFormGroup.invalid) return;
    this.courseService.saveCourse(this.courseFormGroup.value).subscribe({
      next: () => {
        alert("success Saving Course");
        this.handleSearchCourses();
        this.courseFormGroup.reset();
        this.submitted = false;
        modal.close()
      }, error: (err: { message: any; }) => {
        alert(err.message);
      }
    })
  }

  // The getUpdateModel() method is used to open the modal window for updating the course. The modalService.open() method is used to open the modal window. The default values and default instructor of the course are set to the updateCourseFormGroup. The fetchInstructors() method is called to fetch all the instructors.
  getUpdateModel(c: Course, updateContent: any) {
    this.fetchInstructors();
    this.updateCourseFormGroup = this.fb.group({
      courseId: [c.courseId, Validators.required],
      courseName: [c.courseName, Validators.required],
      courseDuration: [c.courseDuration, Validators.required],
      courseDescription: [c.courseDescription, Validators.required],
      instructor: [c.instructor, Validators.required],
    })
    this.defaultInstructor = this.updateCourseFormGroup.controls['instructor'].value;
    this.modalService.open(updateContent, {size: 'xl'})
  }

  // The onUpdateCourse() method is used to update the course.
  onUpdateCourse(updateModal: any) {
    this.submitted = true;
    if (this.updateCourseFormGroup.invalid) return;
    this.courseService.updateCourse(this.updateCourseFormGroup.value, this.updateCourseFormGroup.value.courseId).subscribe({
      next: () => {
        alert("success updating course");
        this.handleSearchCourses();
        this.submitted = false;
        updateModal.close();
      }, error: (err: { message: any; }) => {
        alert(err.message)
      }
    })
  }
}
