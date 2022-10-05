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
    this.service.post('users/signin','admin',this.f1)
    .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){
          sessionStorage.setItem('admin_token',res['jwtAccessToken'])
          sessionStorage.setItem('resuser',JSON.stringify(res['resuser']))
          sessionStorage.setItem('pages',JSON.stringify(res['pages']))
          sessionStorage.setItem('tabs',JSON.stringify(res['tabs']))
          this.gopage(res['pages'][0],res['tabs'])
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

  gopage(list,tabs){
    switch(list.name){
      case 'Dashboard':
        this.router.navigate(['admin/dashboard']);
      break;
      case 'Approved Application':
        this.router.navigate(['admin/approved']);
      break;
      case 'Pending Application':
        this.router.navigate(['admin/pendings']);
      break;
      case 'Incomplete Application':
        this.router.navigate(['admin/incomplete']);
      break;
      case 'Denied Application':
        this.router.navigate(['admin/dashboard']);
      break;
      case 'Funded Contracts':
        this.router.navigate(['admin/funded-contracts']);
      break;
      case 'Settings':
        this.gosetting(tabs[list.id])
      break;
      case 'Partner Management':
        this.router.navigate(['admin/partner']);
      break;
      case 'Users':
        this.router.navigate(['admin/users']);
      break;
      default:
        sessionStorage.clear()
      break;
    }
  }

  gosetting(list){
    switch(list.name){
      case 'Audit Log':
        this.router.navigate(['admin/settings/auditlog']);
      break;
      case 'Questions':
        this.router.navigate(['admin/settings/questions']);
      break;
      case 'Change Password':
        this.router.navigate(['admin/settings/changepw']);
      break;
      case 'Roles':
        this.router.navigate(['admin/settings/roles']);
      break;
      default:
        sessionStorage.clear()
      break;
  }
}

}
