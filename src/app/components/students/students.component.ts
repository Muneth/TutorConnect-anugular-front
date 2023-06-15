import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {catchError, Observable, throwError} from "rxjs";
import {PageResponse} from "../../model/page.response.model";
import {Student} from "../../model/student.model";
import {StudentsService} from "../../services/students.service";
import {UserService} from "../../services/user.service";
import {EmailExistsValidator} from "../../validators/emailexists.validator";

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})

export class StudentsComponent implements OnInit {
  searchFormGroup!: FormGroup;
  studentFormGroup!: FormGroup;
  pageStudents!: Observable<PageResponse<Student>>;
  errorMessage!: string;
  currentPage: number = 0;
  pageSize: number = 5;
  submitted: boolean = false;

  constructor(private modalService: NgbModal, private studentService: StudentsService, private fb: FormBuilder, private userService: UserService) {
  }

  ngOnInit(): void {
    this.searchFormGroup = this.fb.group({
      keyword: this.fb.control('')
    });
    this.studentFormGroup = this.fb.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      level: ["", Validators.required],
      user: this.fb.group({
        email: ["", [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")], [EmailExistsValidator.validate(this.userService)]],
        password: ["", Validators.required],
      })
    })
    this.handleSearchStudents();
  }


  // This method is used to open the modal
  getModal(content: any) {
    this.modalService.open(content, {size: 'xl'})
    this.submitted = false
  }


  // This method is used to search students
  handleSearchStudents() {
    let keyword = this.searchFormGroup.value.keyword;
    this.pageStudents = this.studentService.searchStudents(keyword, this.currentPage, this.pageSize).pipe(
      catchError(err => {
        this.errorMessage = err.message;
        return throwError(() => {
          return err;
        })
      })
    )
  }


  // This method is used to delete a student
  handleDeleteStudent(student: Student) {
    let conf = confirm("Are you sure?");
    if (!conf) return;
    this.studentService.deleteStudent(student.studentId).subscribe({
      next: () => {
        this.handleSearchStudents()
      },
      error: (err: { message: any; }) => {
        alert(err.message);
      }
    })
  }


  // This method is used to go to the next page
  gotoPage(page: number) {
    this.currentPage = page;
    this.handleSearchStudents();
  }


  // This method is used to save a student
  onSaveStudent(modal: any) {
    this.submitted = true;
    if (this.studentFormGroup.invalid) return;
    this.studentService.saveStudent(this.studentFormGroup.value).subscribe({
      next: () => {
        alert("success Saving Student");
        this.handleSearchStudents();
        this.studentFormGroup.reset();
        this.submitted = false;
        modal.close();
      },
      error: (err: { message: any; }) => {
        alert(err.message);
      }
    })
  }


  // This method is used to close a modal
  onCloseModal(modal: any) {
    modal.close();
    this.studentFormGroup.reset();
  }
}
