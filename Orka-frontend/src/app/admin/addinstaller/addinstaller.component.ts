import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpService } from '../../_service/http.service'
import { first } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-addinstaller',
  templateUrl: './addinstaller.component.html',
  styleUrls: ['./addinstaller.component.scss']
})
export class AddinstallerComponent implements OnInit {
  f1:any ={};
  res:any=[];
  maxDate: Date;
  data_add:any={};
  data_add_shtname:any={};
  public listfiles: any = [];
  fileitems:any = [];
  shrtname=1//set default select for shortname
  modalRef: BsModalRef;
  message:any = [];

  businessName:string;
  firstName:string;
  lastName:string;
  businessEmail:string;
  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;

  constructor(

    private service: HttpService,
    private modalService: BsModalService,
    public router:Router,private toastrService: ToastrService,

  ) { }

  ngOnInit(): void {

    this.getall_shortname()
  }

  namedata(data){
    //   data.target.value = data.target.value.replace(/[^A-Za-z.]/g, '');
    //  return data.target.value ? data.target.value.charAt(0).toUpperCase() +data.target.value.substr(1).toLowerCase() : '';
    return data.target.value;
    }

    keyuplowercase(data){
      return data.target.value.toLowerCase()
    }

  number(data){
    return data.target.value = data.target.value.replace(/[^0-9.]/g,'')
  }

  getall_shortname(){
    this.service.authget('roles/shortname','admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log("res",res)
       this.res= res['data']
       this.res.businessShortName=null

        console.log("check",this.res)
      }
    },err=>{
      console.log(err)
    })
  }
    onChangeShortName(shortname) {

      this.data_add.shortlistval=this.res.filter(xx => xx.businessShortName == shortname);
      // console.log('shortname is',this.data_add.shortlistval[0].businessEmail);
      this.res.businessName=this.data_add.shortlistval[0].businessName;
      this.res.businessEmail=this.data_add.shortlistval[0].businessEmail;
    }

  installerEditSubmit() {


    // this.f1.unit = this.f1.unit;
    this.f1.zipCode = Number(this.f1.zipCode);
    this.service.authpost('installer/add','admin',this.f1)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.toastrService.success("Partner added successfully")
        // this.message = ["Partner added successfully"]
        // this.modalRef = this.modalService.show(this.messagebox);
        this.router.navigate(['admin/partner']);
      }else{
        // console.log("res1",res['message'])
        this.message = res['message']
        this.toastrService.error(res['message'])
      }
    },err=>{
      if(err['error']['message'].isArray){
        // console.log("res2",err['error']['message'])
        this.message = err['error']['message']
      }else{
        // console.log("res3",err['error']['message'])
        this.message = [err['error']['message']]
      }
      //this.modalRef = this.modalService.show(this.messagebox);
      this.toastrService.error(this.message)
    })
  }
  adduserSubmit(){

    this.data_add_shtname.businessShortName=this.res.businessShortName
    this.data_add_shtname.userEmail=this.res.userEmail
    this.data_add_shtname.firstName=this.res.firstName
    this.data_add_shtname.lastName=this.res.lastName
    //console.log("addd",this.data_add_shtname)
    this.service.authpost('installer/add-existing','admin',this.data_add_shtname)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.toastrService.success("User for Existing Partner added successfully!")
      }else{
        this.message = res['message']
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.toastrService.error(this.message)
    })

  }

  close(): void {
    this.modalRef.hide();

  }

}
