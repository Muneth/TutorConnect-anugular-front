import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.css']
})


export class TeachersComponent implements OnInit {

  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {
  }

  getModal(content: any){
    this.modalService.open(content, { size: 'xl' })
  }
}

