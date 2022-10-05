import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { HttpService } from '../../../_service/http.service'
import { first } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";


@Component({
  selector: 'app-create-client-opportunity',
  templateUrl: './create-client-opportunity.component.html',
  styleUrls: ['./create-client-opportunity.component.scss']
})
export class CreateClientOpportunityComponent implements OnInit {
  f1:any ={};
  maxDate: Date;
  public listfiles: any = [];
  fileitems:any = [];

  modalRef: BsModalRef;
  message:any = [];
  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;
  constructor(private service: HttpService,
    private modalService: BsModalService,
    private toastrService: ToastrService,
    public router:Router) { }

  ngOnInit(): void {
  }
  namedata(data){
  //   data.target.value = data.target.value.replace(/[^A-Za-z.]/g, '');
  //  return data.target.value ? data.target.value.charAt(0).toUpperCase() +data.target.value.substr(1).toLowerCase() : '';
  return data.target.value;
  }

  number(data){
   return data.target.value = data.target.value.replace(/[^0-9.]/g,'')
  }

  clientOpportunitySubmit() {  
    this.f1.businessLegalName = this.f1.businessLegalName;
    this.f1.businessEmail = this.f1.businessEmail;
    this.f1.businessPhone = this.f1.businessPhone;
    this.f1.businessCity = this.f1.businessCity;
    this.f1.businessState = this.f1.businessState;
    this.f1.businessZip = this.f1.businessZip;
    this.f1.installerId=sessionStorage.getItem("InstallerUserId");
    

    this.service.post('create-opportunity','sales',this.f1)
    .pipe(first())
    .subscribe(res=>{
      if(res){
        
        this.service.successMessage('Client Opportunity Mail Sent!')
        
        setTimeout(()=>{
          this.router.navigate(['/partner/home']);
        },5000)
        
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(this.messagebox);
    })    
  }

  close(): void {
    this.modalRef.hide();
    
  }

  
  
}
