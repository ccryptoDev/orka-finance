import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';

import { HttpService} from '../_service/http.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-borrower-sidebar',
  templateUrl: './borrower-sidebar.component.html',
  styleUrls: ['./borrower-sidebar.component.scss']
})
export class BorrowerSidebarComponent implements OnInit {
  @ViewChild('messagebox', { read: TemplateRef }) messagebox: TemplateRef<any>;
  @ViewChild('resetPassword', { read: TemplateRef }) resetPassword: TemplateRef<any>;
  modalRef: BsModalRef;
  islogout: boolean;
  f1: any = {};
  data_res: any = {};
  data:any = {};
  message:any = [];
  componentName: string;
  hidden: boolean;
  hiddensales: boolean;
  hiddenstate: boolean;
  href: any = [];
  urlName: any;
  isSidebarShow: boolean = false;
  isdocumentShow: boolean = false;
  issignShow: boolean = false;
  isbankShow: boolean = false;
  isloanShow: boolean = false;
  isSuccess: boolean =false;
  fieldTextType1: boolean = false;
  fieldTextType2: boolean = false;
  fieldTextType3: boolean = false;
  confirmValidate: boolean = false;
  patternCheck: boolean = false;
  IsDisabled: boolean = false;
  validPasswordPattern = environment.validPasswordPattern;
  userRid :any;
  setpassword: boolean = false;

  constructor(
    private service: HttpService,
    private modalService: BsModalService,
    public router:Router
  ) {}

  ngOnInit(): void {
    this.href = this.router.url.split('/');
    this.urlName = this.href[2];
    this.userRid = sessionStorage.getItem("UserId");
    
    this.getPassword(this.userRid);
  }

  reloadCurrentRoute() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        this.router.navigate([currentUrl]);
    });
  }

  plaid(){
    this.router.navigate(['client/plaid/'+sessionStorage.getItem('LoanId')]);
  }

  popupform(){
    this.islogout =false;
    this.modalRef = this.modalService.show(this.resetPassword);
  }

  namedata(data){
    return data.target.value;
  }
  
  close(): void {
    this.modalRef.hide();
  }
  
  logout(){
    //console.log('122')
   //this.service.logout();
   //localStorage.clear()
    sessionStorage.clear()
    window.location.href= '/borrower/login'
    // this.router.navigate(['borrower/login'])
    //location.reload();
  }

  navigatedocument(){
    //this.router.navigate(['borrower/change-password'])
    window.location.href= '/borrower/change-password'

  }

  navigatehome(){
    this.router.navigate(['borrower/home'])

  }
  
  privacy() {
      window.open(
      'privacy-policy',
      '_blank' // <- This is what makes it open in a new window.
    );
  }

  termscondition() {
    
    window.open(
      'terms-and-conditions',
      '_blank' // <- This is what makes it open in a new window.
    );
  }

  securitypolicy() {
    window.open(
      'security-policy',
      '_blank' // <- This is what makes it open in a new window.
    );
    //this.router.navigate(['security-policy']);
  }

  redirectUrl(url){
    this.router.navigate([url]);

  }

  loadhome(){
    this.issignShow =true;
    this.isSidebarShow =false;
   this.isdocumentShow=false;

  }

  loaddocument(){
    this.issignShow =false;
    this.isSidebarShow =false;
   this.isdocumentShow=true;

  }

  success() {
    this.issignShow =false;
    this.isSidebarShow =false;
    this.isdocumentShow=false;
    this.isbankShow =false;
    this.isloanShow=false;
    this.isSuccess =true;
  }

  toggleFieldTextType1() {
    this.fieldTextType1 = !this.fieldTextType1;
  }

  toggleFieldTextType2() {
    this.fieldTextType2 = !this.fieldTextType2;
  }

  toggleFieldTextType3() {
    this.fieldTextType3 = !this.fieldTextType3;
  }

  validatePattern(e) {
    if (!this.f1.password.match(this.validPasswordPattern)) {
      console.log('right');
      this.patternCheck = true;
      this.IsDisabled = true
    } else {
      console.log('right123');
      this.patternCheck = false;
      this.IsDisabled = false

    }
  }

  validateConfirm(e) {
    if (this.f1.password === this.f1.confirm_password) {
      this.confirmValidate = false;
      this.IsDisabled = false
    }
    else {
      this.confirmValidate = true;
      this.IsDisabled = true
    }
  }

  resetPasswordSubmit() {
    if (!this.f1.password.match(this.validPasswordPattern)) {
      this.patternCheck = true;
      this.IsDisabled = true
    } else {
      this.patternCheck = false;
      this.IsDisabled = false

    }

    if (this.f1.password === this.f1.confirm_password) {
      this.confirmValidate = false;
      this.IsDisabled = false
    }
    else {
      this.confirmValidate = true;
      this.IsDisabled = true
    }

    if (this.f1.password === this.f1.confirm_password) {
      this.confirmValidate = false;

      this.data_res.id = sessionStorage.getItem("UserId");
      this.data_res.newpw = this.f1.password;
      this.data_res.cnewpw = this.f1.confirm_password;
      this.data_res.currentpw= this.f1.curpassword;


      this.service.authput('users/changepassword/'+this.data_res.id, 'borrower', this.data_res)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log(res);
        this.service.successMessage('Password Changed Successfully!');
        this.logout();
      }else{
        this.message = res['message']
        this.service.errorMessage(res['message']);
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.service.errorMessage(err['error']['message']);
    })

      
    } else {// If Password is mismatch
      this.confirmValidate = true;
    }
  }

  getPassword(id){
    this.service
      .get("users/setPassword/" + id, 'borrower')
      .pipe(first())
      .subscribe((res: any) => {
        if (res.statusCode !== 200) {
          this.service.errorMessage(res.message)
        }
      });
  }
}
