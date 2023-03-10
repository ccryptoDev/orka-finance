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
  selector: 'app-permission-to-operate',
  templateUrl: './permission-to-operate.component.html',
  styleUrls: ['./permission-to-operate.component.scss']
})
export class PermissionToOperateComponent implements OnInit {

  modalRef: BsModalRef;
  message:any = [];
  data:any ={};
  filenameservice: string;
  dtOptions: { scrollX: boolean; };

  constructor(private service: HttpService,private toastrService: ToastrService,
  private modalService: BsModalService,
  public router:Router,
  private route: ActivatedRoute,
  private formBuilder: FormBuilder) { 
  }

  ngOnInit(): void {

    this.dtOptions = {
      scrollX: true
    };
    this.getallfiles();
  }
  // getallfiles(){
  //   this.service.authget('milestone','admin')
  //   .pipe(first())
  //   .subscribe(res=>{
  //     if(res['statusCode']==200){
  //       this.data= res['data'];
  //       console.log(this.data);
  //     }
  //   },err=>{
  //     console.log(err)
  //   })
  // }

  getallfiles(){
    this.service.authget('milestone/permissiontooperate','admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.data= res['data'];
        console.log(this.data);
      }
    },err=>{
      console.log(err)
    })
  }

  view(filename:any){
    filename = filename.split('/')
    filename = filename[filename.length-1]

    this.service
      .authgetfile(`files/download/${filename}`, 'admin')
      .pipe(first())
      .subscribe(async (res) => {
        window.open(URL.createObjectURL(new Blob([res], { type: 'application/pdf' })), "_blank");
      });
  }
}
