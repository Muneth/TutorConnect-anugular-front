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


  constructor(private modalService: NgbModal, private fb: FormBuilder, private courseService: CoursesService) {
  }

  ngOnInit(): void {
    this.searchFormGroup = this.fb.group({
      keyword: this.fb.control('')
    })
  }

  getModal(content: any) {
    this.modalService.open(content, {size: 'xl'})
  }
  
  handleSearchCourses() {
    let keyword = this.searchFormGroup.value.keyword;
    this.pageCourses$ = this.courseService.searchCourses(keyword, this.currentPage, this.pageSize).pipe(
      catchError(err => {
        this.errorMessage = err;
        return throwError(err);
      })
    )
  }

}
