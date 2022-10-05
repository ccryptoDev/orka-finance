import { Component, OnInit,TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from "@angular/router";
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  f1:any = {};
  modalRef: BsModalRef;
  message:any = [];
  constructor(private modalService: BsModalService, public router:Router, private service: HttpService) { }

  ngOnInit(): void {
    //location.reload()
  }

  onSubmit(template: TemplateRef<any>){
    this.service.post('users/signin','borrower',this.f1)
    .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){
          console.log(res)
          sessionStorage.setItem('borrower_token',res['jwtAccessToken'])
          sessionStorage.setItem('UserId',res['resuser']['id'])
          sessionStorage.setItem('LoanID',res['loanDetails'][0]['id'])
          sessionStorage.setItem('LoanRefNo',res['loanDetails'][0]['ref_no'])
          sessionStorage.setItem('InsID',res['loanDetails'][0]['ins_user_id'])
          // this.router.navigate(['client/overview']);
          this.router.navigate(['borrower/home']);
        }else{
          this.message = res['message']
          this.modalRef = this.modalService.show(template);
        }
        
      },err=>{
        console.log(err)
      })
  }

  close(): void {
    this.modalRef.hide();
  }

}
