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

  public searchCourses(keyword: string, currentPage: number, pageSize: number): Observable<PageResponse<Course>> {
    return this.http.get<PageResponse<Course>>(environment.backendHost + "/courses?keyword=" + keyword + "&page=" + currentPage + "&size=" + pageSize);
  }
}
