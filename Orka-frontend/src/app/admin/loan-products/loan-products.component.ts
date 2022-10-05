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
  selector: 'app-loan-products',
  templateUrl: './loan-products.component.html',
  styleUrls: ['./loan-products.component.scss']
})
export class LoanProductsComponent implements OnInit {

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
    this.getLoanProducts();
    }


  ngOnInit(): void {
//this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.getLoanProducts();
  }

  getLoanProducts(){
    this.service.authget('loanproducts/','admin')
    .pipe(first())
    .subscribe(res=>{

      if(res['statusCode']==200){
        //console.log('ssss****',res['data']);//
        this.data.loanproducts=res['data'];
      }
    },err=>{
      console.log(err)
    })
  }
  updateLoanProducts(pid:any,pstatus){

    this.data_change_status.productId=pid
    this.data_change_status.status=(pstatus.target.checked==true)?'ACTIVE':'INACTIVE'

  
    this.service.authpost('loanproducts/products','admin',this.data_change_status) .pipe(first())
    .subscribe(res=>{
      //console.log('data_change_status',res)
      this.getLoanProducts();
      //this.getLoanproduct_logs(this.data[0].user_id)
        //console.log('updated successfully---')
       // this.toastrService.success("Updated Successfully!");
    },err=>{
      //console.log('error',this.data_res)
      if(err['status']!=200)
      {
       
      }
    })
  }


}
