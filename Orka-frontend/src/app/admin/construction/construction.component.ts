import { Component, OnInit,TemplateRef,ViewChild } from '@angular/core';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { Router } from "@angular/router";
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from "ngx-toastr";
import { FormBuilder, FormGroup } from '@angular/forms';
import { EquifaxInstance } from '../../_service/common.service';
import { Subject } from "rxjs";

@Component({
  selector: 'app-construction',
  templateUrl: './construction.component.html',
  styleUrls: ['./construction.component.scss']
})
export class ConstructionComponent implements OnInit {

  modalRef: BsModalRef;
  message:any = [];
  data:any =[];
  filenameservice: string;
  dtOptions: DataTables.Settings = {};
  reviewedby: string;
  resuser:any =[]

  constructor(private service: HttpService,private toastrService: ToastrService,
    private modalService: BsModalService,
    public router:Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder) { 
    }

    ngOnInit(): void {
      this.dtOptions = {
        //scrollX: true,
        ordering: false
      };
      
      this.getallfiles();

      this.resuser = sessionStorage.getItem('resuser');
   //console.log('1111',this.resuser)

    this.reviewedby = JSON.parse(sessionStorage.getItem('resuser')).firstName +''+JSON.parse(sessionStorage.getItem('resuser')).lastName;

    }
   
  
    getallfiles(){
      this.service.authget('milestone/complete','admin')
      .pipe(first())
      .subscribe(res=>{
        this.data= res['allLoandeatils'];
  
        console.log(this.data)
      },err=>{
        console.log(err)
      })
    }

    view(filename:any){
      filename = filename.split('/')
      filename = filename[filename.length-1]
      window.open(environment.installerapiurl+"files/download/"+filename, "_blank");
    }
    updateApprove(){
    
    }
    updateDisbrused(){
      
    }

}
