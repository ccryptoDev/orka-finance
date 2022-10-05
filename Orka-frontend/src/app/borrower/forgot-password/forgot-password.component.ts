import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { HttpService } from 'src/app/_service/http.service';
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  f1:any = {};

  modalRef: BsModalRef;
  message:any = [];

  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;

  constructor(private modalService: BsModalService, public router:Router, private service: HttpService,private toastrService: ToastrService) { }

  ngOnInit(): void {
  }
///
  onSubmit(){
    this.service.post('users/forgot-password','borrower',this.f1)
    .pipe(first())
      .subscribe(res=>{ 
        if(res['statusCode']==200){     
          console.log(res);
          this.toastrService.success(res['message']);
          this.router.navigate(['borrower/login']);
        }else{
          this.toastrService.error(res['message']);
          this.router.navigate(['borrower/login']);
        }        
      },err=>{
        if(err['error']['message'].isArray){
          this.message = err['error']['message']
        }else{
          this.message = [err['error']['message']]
        }
        this.toastrService.error(this.message);
        this.router.navigate(['borrower/login']); 
      })
  }

  close(): void {
    this.modalRef.hide();
  } 

}
