import { Component, OnInit,TemplateRef,ViewChild } from '@angular/core';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { Router } from "@angular/router";
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FileSystemDirectoryEntry, FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { ToastrService } from "ngx-toastr";
import { FormBuilder, FormGroup } from '@angular/forms';
import { EquifaxInstance } from '../../_service/common.service';
import { Subject } from "rxjs";


@Component({
  selector: 'app-disbursement-sequence',
  templateUrl: './disbursement-sequence.component.html',
  styleUrls: ['./disbursement-sequence.component.scss']
})
export class DisbursementSequenceComponent implements OnInit {

  data:any = [];
  onOff = true;
  data_change_status:any={};
  dtOptions = {
    scrollX: true,
    order:[[0, 'desc']]
  };
  
  constructor(private service: HttpService,private toastrService: ToastrService,
    private modalService: BsModalService,public router:Router,private route: ActivatedRoute,private formBuilder: FormBuilder) { 
      this.router.routeReuseStrategy.shouldReuseRoute = function() {
        return false;
    };
    this.getDisbursementSequencelist();
    }
  ngOnInit(): void {
    this.getDisbursementSequencelist();
  }

  getDisbursementSequencelist(){
    this.service.authget('disbursement-sequence/','admin')
    .pipe(first())
    .subscribe(res=>{

      if(res['statusCode']==200){
        
        this.data.disbursementlist=res['data'];

        console.log('ssss1111', this.data.disbursementlist);//
      }
    },err=>{
      console.log(err)
    })
  }
  updateDisbursementSequence(pid:any,pstatus){

    this.data_change_status.id=pid
    this.data_change_status.status=(pstatus.target.checked==true)?'ACTIVE':'INACTIVE'
console.log(this.data_change_status)
  
    this.service.authpost('disbursement-sequence/setStatus','admin',this.data_change_status) .pipe(first())
    .subscribe(res=>{
      //console.log('data_change_status',res)
      this.getDisbursementSequencelist();
      //this.getLoanproduct_logs(this.data[0].user_id)
        //console.log('updated successfully---')
       this.toastrService.success("Status Updated Successfully!");
    },err=>{
      //console.log('error',this.data_res)
      if(err['status']!=200)
      {
       
      }
    })
  }

}
