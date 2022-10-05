import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { ConfirmPasswordValidator } from 'src/app/_service/custom.validator';
import { HttpService } from 'src/app/_service/http.service';
import { ToastrService } from "ngx-toastr";
import { HttpUrlEncodingCodec } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  id='';

  resetpwForm: FormGroup;
  fSubmitted = false;  

  modalRef: BsModalRef;
  message:any = [];
  data_res:any={};
  confirmValidate: boolean = false;
  IsDisabled: boolean = false;
  patternCheck: boolean = false;
  validPasswordPattern = environment.validPasswordPattern;

  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;
  email: any;

  constructor(
    private modalService: BsModalService, 
    public router:Router, 
    private service: HttpService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log(params);

      console.log(params.token,'-----------------',params.email);
      let resetemail = params.email.replace(' ','+');
      console.log('resetemail',resetemail)
      if(params.token && params.email){  
        this.email=params.email;      
        this.checkToken(params.token, resetemail)
      }else{
        this.router.navigate(['partner/404']);
      }      
    })

    this.resetpwForm = this.formBuilder.group({      
      newpw: ['', Validators.required],
      cnewpw: ['', Validators.required]      
    }, {validator: ConfirmPasswordValidator});
  }

  get f(): { [key: string]: AbstractControl } {
    return this.resetpwForm.controls;
  }

  checkToken(token, email){  
    let resetDetails = {}
    resetDetails['token'] = token;
    resetDetails['email'] = email;

    this.service.post('users/checkToken','partner',resetDetails)
    .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){     
          console.log(res);             
        }else{
          this.toastrService.error(res['message']);
          this.router.navigate(['partner/login']);           
        }        
      },err=>{
        if(err['error']['message'].isArray){
          this.message = err['error']['message']
        }else{
          this.message = [err['error']['message']]
        }
        this.toastrService.success(this.message);
        this.router.navigate(['partner/login']);  
      })
  }

  onSubmit(){
    this.fSubmitted = true;
    if (this.resetpwForm.invalid) {
      return;
    }

    this.data_res.newpw= this.resetpwForm.value.newpw;
    let resetemail = this.email.replace(' ','+');
    this.data_res.email= resetemail;

//console.log('121212212',this.data_res.email)
    this.service.post('users/passwordReset','partner',this.data_res)
    .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){     
          console.log(res);     
          this.toastrService.success(res['message']);
          this.fSubmitted = false;
          this.resetpwForm.reset();
          this.router.navigate(['partner/login']);          
        }else{
          this.toastrService.error(res['message']);
          this.router.navigate(['partner/login']);  
        }        
      },err=>{
        if(err['error']['message'].isArray){
          this.message = err['error']['message']
        }else{
          this.message = [err['error']['message']]
        }
        this.toastrService.error(this.message);
        this.router.navigate(['partner/login']);  
      })
  }

  close(): void {
    this.modalRef.hide();
  } 
  validateConfirm(e) {
    if (this.resetpwForm.value.newpw === this.resetpwForm.value.cnewpw) {
      this.confirmValidate = false;
      this.IsDisabled = false
    }
    else {
      this.confirmValidate = true;
      this.IsDisabled = true
    }
  }
  validatePattern(e) {
    if (!this.resetpwForm.value.newpw.match(this.validPasswordPattern)) {
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

}
