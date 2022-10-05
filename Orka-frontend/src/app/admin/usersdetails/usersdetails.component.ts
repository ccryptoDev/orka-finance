import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from "ngx-toastr";

import { HttpService } from '../../_service/http.service';

@Component({
  selector: 'app-usersdetails',
  templateUrl: './usersdetails.component.html',
  styleUrls: ['./usersdetails.component.scss']
})
export class UsersdetailsComponent implements OnInit {
  @ViewChild('messagebox', { read: TemplateRef }) messagebox: TemplateRef<any>;
  modalRef: BsModalRef;
  form: FormGroup;
  update_val: any = {};
  id : any;
  businessName: string | boolean;
  legalName: string | boolean;
  data: any = [];
  message: any = [];

  constructor(
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private formBuilder: FormBuilder,
    private service: HttpService,
    private modalService: BsModalService,
    public router:Router
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      user_id:[],
      firstName: [],
      lastName: ['', Validators.required],
      email: [],
      businessName:[],
      legalName:[],
    });
    this.id = this.route.snapshot.paramMap.get('id');

    this.get(this.id);
  }

  get(id){
    this.service
      .authget('users/' + id, 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.data = res['data'];
            this.legalName = (this.data[0].legalName!=null)? this.data[0].legalName: '----';
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);

            this.router.navigate(['admin/users']);
          }
        },
        (err) => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }

          this.modalRef = this.modalService.show(this.messagebox);
          
          this.router.navigate(['admin/users']);
        }
      );
  }

  updateUser_info(){

    this.update_val.user_id=this.id;
    this.update_val.email=this.form.value['email'];
    this.update_val.firstName=this.form.value['firstName'];
    this.update_val.lastName=this.form.value['lastName'];
    this.update_val.businessName=this.form.value['businessName'];
    this.update_val.legalName=this.form.value['legalName'];

    //console.log('****',this.update_val)

    this.service.authput('users/edit','admin',this.update_val) .pipe(first())
    .subscribe(res=>{
        //console.log('updated successfully---',this.data_res,res)
        this.toastrService.success("Updated Successfully!");
    },err=>{
      if(err['status']!=200)
      {
        console.log("err" , err);

        this.toastrService.error("Error Updating!");
      }
    })

  }

  active(){
    let id = this.route.snapshot.paramMap.get('id')
    this.service.authget('users/active/'+id,'admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.get(id)
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

  deactive(){
    let id = this.route.snapshot.paramMap.get('id')
    this.service.authget('users/deactive/'+id,'admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.get(id)
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

  delete(){
    let id = this.route.snapshot.paramMap.get('id')
    this.service.authget('users/delete/'+id,'admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.router.navigate(['admin/users']);
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

  close() {
    this.modalRef.hide();

  }
}
