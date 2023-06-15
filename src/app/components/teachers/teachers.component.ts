import {Component, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {InstructorsService} from "../../services/instructors.service";
import {catchError, Observable, throwError} from "rxjs";
import {PageResponse} from "../../model/page.response.model";
import {Instructor} from "../../model/instructor.model";
import {EmailExistsValidator} from "../../validators/emailexists.validator";
import {UserService} from "../../services/user.service";
import {CoursesService} from "../../services/courses.service";
import {Course} from "../../model/course.model";

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.css']
})


export class TeachersComponent implements OnInit {
  searchFormGroup!: FormGroup;
  instructorFormGroup!: FormGroup;
  pageInstructors!: Observable<PageResponse<Instructor>>;
  pageCourses$!: Observable<PageResponse<Course>>;

  modalInstructor!: Instructor;

  errorMessage!: string;
  coursesErrorMessage!: string;

  currentPage: number = 0;
  pageSize: number = 5;
  coursesCurrentPage: number = 0;
  coursesPageSize: number = 5;
  submitted: boolean = false;

  constructor(private modalService: NgbModal, private fb: FormBuilder, private instructorService: InstructorsService, private userService: UserService,  private courseService: CoursesService) {
  }

  ngOnInit(): void {
    this.searchFormGroup = this.fb.group({
      keyword: this.fb.control('')
    })
    this.instructorFormGroup = this.fb.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      summary: ["", Validators.required],
      user: this.fb.group({
        email: ["", [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")],
          [EmailExistsValidator.validate(this.userService)]],
        password: ["", Validators.required]
      })
    })
    this.handleSearchInstructors();
  }

// This method is used to open the modal
  getModal(content: any) {
    this.submitted = false;
    this.modalService.open(content, {size: 'xl'})
  }

// This method is used to search instructors
  handleSearchInstructors() {
    let keyword = this.searchFormGroup.value.keyword
    this.pageInstructors = this.instructorService.searchInstructors(keyword, this.currentPage, this.pageSize).pipe(
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
    this.handleSearchInstructors();
  }


// This method is used to delete an instructor and refresh the list
  handleDeleteInstructor(i: Instructor) {
    let conf = confirm("Are you sure?");
    if (!conf) return;
    this.instructorService.deleteInstructor(i.instructorId).subscribe({
      next: () => {
        this.handleSearchInstructors();
      },
       error : (err: { message: any; }) => {
        alert(err.message);
      }
    })
  }

  // This method is used to close the modal
  onCloseModal(modal: any) {
    modal.close();
    this.instructorFormGroup.reset();
  }


  // This method is used to save an instructor and refresh the list
  onSaveInstructor(modal: any) {
    console.log(this.instructorFormGroup);
    this.submitted = true;
    if (this.instructorFormGroup.invalid) return;
    this.instructorService.saveInstructor(this.instructorFormGroup.value).subscribe({
      next: () => {
        alert("success Saving Instructor");
        this.handleSearchInstructors();
        this.instructorFormGroup.reset();
        this.submitted = false;
        modal.close();
      }, error: (err: { message: any; }) => {
        alert(err.message);
      }
    })
  }

  // This method is used to open the modal for courses of an instructor and set current page to 0, then search courses
  getCoursesModal(i: Instructor, coursesContent: any) {
    this.coursesCurrentPage = 0;
    this.modalInstructor = i;
    this.handleSearchCourses(i);
    this.modalService.open(coursesContent, {size: 'xl'});
  }

  // This method is used to search courses of an instructor
  handleSearchCourses(i: Instructor) {
    this.pageCourses$ = this.courseService.getCoursesByInstructor(i.instructorId, this.coursesCurrentPage, this.coursesPageSize).pipe(
      catchError(err => {
        this.coursesErrorMessage = err.message;
        return throwError(() => {
          return err;
        })
      })
    )
  }

  gotoCoursesPage(page: number) {
    this.coursesCurrentPage = page;
    this.handleSearchCourses(this.modalInstructor);
  }
}

