import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FileSystemDirectoryEntry, FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { DatePipe } from '@angular/common';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  selector: 'app-complete-counter-signature',
  templateUrl: './complete-counter-signature.component.html',
  styleUrls: ['./complete-counter-signature.component.scss']
})
export class CompleteCounterSignatureComponent implements OnInit {

  data:any =[]
  resuser:any =[]
  result:any=[]
  dtOptions: DataTables.Settings = {};
  message: any;
  reviewedby: string;
  
constructor(
  public datePipe: DatePipe,
  private route: ActivatedRoute,private toastrService: ToastrService,
  private service: HttpService,
  public router: Router,
  private modalService: BsModalService,
  private formBuilder: FormBuilder,
  private sanitizer: DomSanitizer,
  private shared:SharedService,
  
) { }

  ngOnInit(): void {

    this.dtOptions = {
      ordering: false
    };
    this.getSalesContractList();

    this.resuser = sessionStorage.getItem('resuser');
   //console.log('1111',this.resuser)

    this.reviewedby = JSON.parse(sessionStorage.getItem('resuser')).firstName +''+JSON.parse(sessionStorage.getItem('resuser')).lastName;
  }

  getSalesContractList(){
     
    this.service.authget('counter-signature/completed', 'admin')
    .pipe(first())
    .subscribe(res => {

      this.result=res['data'];
      console.log(res['data'])
     
    }, err => {
      if (err['error']['message'].isArray) {
        this.message = err['error']['message']
      } else {
        this.message = [err['error']['message']]
      }
      this.toastrService.error(this.message)

    })



  }

}
