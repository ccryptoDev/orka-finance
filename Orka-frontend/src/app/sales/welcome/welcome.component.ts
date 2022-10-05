import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { HttpService } from 'src/app/_service/http.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from "../../../environments/environment";
import { ToastrService } from "ngx-toastr";




@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  //declaration of variables
  //id:string="";
  businessLegalName: string = "";
  businessEmail: string = "";
  modalRef: BsModalRef;
  f1: any = {};
  data: any = {};
  message: any = [];
  fieldTextType1: boolean = false;
  fieldTextType2: boolean = false;
  confirmValidate: boolean = false;
  patternCheck: boolean = false;
  IsDisabled: boolean = false;
  validPasswordPattern = environment.validPasswordPattern;


  ngbModalOptions: ModalOptions = {
    backdrop: 'static',
    keyboard: false,
    animated: true,
    ignoreBackdropClick: true,
  }

  @ViewChild('messagebox', { read: TemplateRef }) messagebox: TemplateRef<any>;
  @ViewChild('resetPassword', { read: TemplateRef }) resetPassword: TemplateRef<any>;
  OsName: any;
  constructor(public route: Router,
    private service: HttpService, private modalService: BsModalService, private fb: FormBuilder, private toastrService: ToastrService
  ) { }

  //to check the id and page to be landed

  ngOnInit(): void {
    //fetching the id from params
    this.OsName = this.service.getOsName();/// to get osname
    this.route.routerState.root.queryParams.subscribe(params => {
      //console.log('params.id------',params.id)
      //if id exist
      if (params.id) {
        this.data.loanId = params.id
        sessionStorage.setItem('loanId', params.id)
        //check if he is eligible for password reset to be implemented
        this.service.get("users/setPassword/" + params.id, 'borrower')
          .pipe(first())
          .subscribe((res: any) => {
            console.log('res------',res)
            if (res.statusCode == 200 && res.permission == "Y") {
              //console.log("You can set the password");
              sessionStorage.setItem('userId', res.userId)
              // trigger the model for password reset
              this.modalRef = this.modalService.show(this.resetPassword, this.ngbModalOptions);

            }
            else {
              sessionStorage.setItem('userId', res.userId);
              this.getLoanStatus()
            }
          })
        //to get the legalName and email address echoed from client opportunity partner portal
        this.service.get("create-opportunity/" + params.id, 'sales')
          .pipe(first())
          .subscribe((res: any) => {

            if (res.statusCode == 200) {
              this.data.businessLegalName = res.businessData.legalName;
              this.data.businessEmail = res.businessData.email
              sessionStorage.setItem('loanId', res.businessData.loanId)
              let key: number = res.businessData.pgno
              // switch(key){
              //   case 1 : this.route.navigate(['sales/business-verification'])
              //           break;
              //   case 2: this.route.navigate(['sales/business-owner-information'])
              //           break;
              //   case 3: this.route.navigate(['sales/building-information'])
              //           break;
              //   case 4: this.route.navigate(['sales/certificate-of-good-standing'])
              //           break;
              //   case 5: this.route.navigate(['client/login'])
              //           break; 
              // }
            }
            else {
              //should be displayed in modal testy
              //console.log("Fill all the details")
              //commit changes for Frontend Credit Application Form: Validation and Toast Messages
              this.service.errorMessage('Link Invalid!')

            }

          })


      }
      //if id not exist
      else {
        //navigate to 404
        let id = sessionStorage.getItem('userId');
        //to handle error while loading to next page
        if (!id)
          this.route.navigate(['sales/404']);
      }
    })
    // this.getLoanStatus()
  }

  getLoanStatus() {
    console.log("called")
    this.service.get("loan/status/" + this.data.loanId, 'sales')
      .pipe(first())
      .subscribe((res: any) => {
        console.log({res})
        if (res.statusCode == 200 && res.message == "canceled") {
          let count = 0;
          res['sorryMessage'].map((msg, indx) => {
            sessionStorage.setItem(`sorryMessage${indx}`, msg);
            count++;
          })
          sessionStorage.setItem('messageCount', String(count));
          this.route.navigate(['sales/sorry'])
        }
        return
      })
  }

  namedata(data) {
    //   data.target.value = data.target.value.replace(/[^A-Za-z.]/g, '');
    //  return data.target.value ? data.target.value.charAt(0).toUpperCase() +data.target.value.substr(1).toLowerCase() : '';
    return data.target.value;
  }

  //validate the pattern
  validatePattern(e) {
    if (!this.f1.password.match(this.validPasswordPattern)) {
      this.patternCheck = true;
      this.IsDisabled = true
    } else {
      this.patternCheck = false;
      this.IsDisabled = false

    }
    // const control = new FormControl('1', Validators.pattern(this.validPasswordPattern));
    //  console.log(control.errors);
    //  if(Validators.pattern()){
    //     this.patternCheck=false;
    //     }else{
    //       this.patternCheck=true;
    //     }

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


      //console.log("Submitted",this.fieldTextType1,this.fieldTextType2)
      this.f1.id = sessionStorage.getItem("userId");
      this.f1.password = this.f1.password;
      this.f1.confirm_password = this.f1.confirm_password;
      this.service.post('users/setPassword', 'borrower', this.f1)
        .pipe(first())
        .subscribe(res => {
          if (res) {
            this.modalRef.hide();
            this.service.successMessage('Password set successfully!')

            setTimeout(() => {

              // this.route.navigate(['/welcome?id=']);
            }, 5000)

          } else {
            this.message = res['message']
            this.modalRef = this.modalService.show(this.messagebox);
          }
        }, err => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message']
          } else {
            this.message = [err['error']['message']]
          }
          this.modalRef = this.modalService.show(this.messagebox);
        })
    } else {// If Password is mismatch
      this.confirmValidate = true;
    }
  }

  close(): void {
    this.modalRef.hide();

  }

  toggleFieldTextType1() {
    this.fieldTextType1 = !this.fieldTextType1;
  }

  toggleFieldTextType2() {
    this.fieldTextType2 = !this.fieldTextType2;
  }
  next() {
    //put request for forms
    if (this.data.loanId && this.data.businessEmail && this.data.businessLegalName) {


      // let data :{} = {
      //   id:this.id,
      //   businessEmail:this.email,
      //   businessLegalName:this.legalName
      // }
      this.service.put("create-opportunity", 'sales', this.data)
        .pipe(first())
        .subscribe((res: any) => {
          if (res.statusCode == 200) {
            this.route.navigate(['sales/business-verification'])
          }
          else {
            console.log(res)
          }
        })

    }
    else {
      //to implement toast in future
      this.service.errorMessage('Link Invalid!')

    }
  }
}
