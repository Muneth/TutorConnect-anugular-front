import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {PageResponse} from "../model/page.response.model";
import {Course} from "../model/course.model";

@Injectable({
  providedIn: 'root'
})
export class CoursesService {

  constructor(private http: HttpClient) { }

// The searchCourses() method is of type Observable<PageResponse<Course>> and takes three parameters as input: keyword, currentPage, and pageSize for the API call and Return as type Observable<PageResponse<Course>>.'
  public searchCourses(keyword: string, currentPage: number, pageSize: number): Observable<PageResponse<Course>> {
    return this.http.get<PageResponse<Course>>(environment.backendHost + "/courses?keyword=" + keyword + "&page=" + currentPage + "&size=" + pageSize);
  }
  
 public deleteCourse(courseId: number) {
    return this.http.delete(environment.backendHost + "/courses/" + courseId);
  }

  public saveCourse(course: Course): Observable<Course> {
    return this.http.post<Course>(environment.backendHost + "/courses/", course)
  }

  public updateCourse(course: Course, courseId: number): Observable<Course> {
    return this.http.put<Course>(environment.backendHost + "/courses/" + courseId, course)
  }

  public getCoursesByInstructor(instructorId: number, currentPage: number, pageSize: number): Observable<PageResponse<Course>> {
    return this.http.get<PageResponse<Course>>(environment.backendHost + "/instructors/" + instructorId + "/courses?page=" + currentPage + "&size=" + pageSize);
  }

  public getCoursesByStudent(studentId: number, currentPage: number, pageSize: number): Observable<PageResponse<Course>> {
    return this.http.get<PageResponse<Course>>(environment.backendHost + "/students/" + studentId + "/courses?page=" + currentPage + "&size=" + pageSize);
  }

  public getNonEnrolledInCoursesByStudent(studentId: number, currentPage: number, pageSize: number): Observable<PageResponse<Course>> {
    return this.http.get<PageResponse<Course>>(environment.backendHost + "/students/" + studentId + "/other-courses?page=" + currentPage + "&size=" + pageSize);
  }

  public enrollStudentInCourse(courseId: number, studentId: number) {
    return this.http.post(environment.backendHost + "/courses/" + courseId + "/enroll/students/" + studentId, null);
  }
}
