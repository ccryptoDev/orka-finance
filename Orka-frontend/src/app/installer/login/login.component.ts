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
  }

  onSubmit(template: TemplateRef<any>){
    this.service.post('users/signin','partner',this.f1)
    .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){
          //console.log(res)
          sessionStorage.setItem('installer_token',res['jwtAccessToken'])
          sessionStorage.setItem('InstallerUserId',res['resuser']['id'])
          sessionStorage.setItem('MainInstallerId',res['resuser']['mainInstallerId'])
          sessionStorage.setItem('pages',JSON.stringify(res['pages']))
          sessionStorage.setItem('tabs',JSON.stringify(res['tabs']))
          sessionStorage.setItem('installer_firstName',res['resuser']['firstName'])
          sessionStorage.setItem('businessName',res['businessName'])
          this.router.navigate(['partner/opportunity']);
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

  gopage(list){
    switch(list.name){
      case 'Main':
        this.router.navigate(['partner/opportunity']);
      break;
      case 'Customers':
        this.router.navigate(['partner/customers']);
      break;
      case 'Profile':
        this.router.navigate(['partner/profile']);
      break;
      default:
        sessionStorage.clear()
      break;
    }
  }

}
