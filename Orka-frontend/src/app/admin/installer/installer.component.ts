import { Component, OnInit,TemplateRef } from '@angular/core';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from "@angular/router";

@Component({
  selector: 'app-installer',
  templateUrl: './installer.component.html',
  styleUrls: ['./installer.component.scss']
})
export class InstallerComponent implements OnInit {
  data:any=[]
  modalRef: BsModalRef;
  message:any = [];
  constructor(private service: HttpService,private modalService: BsModalService,public router:Router) { }


  ngOnInit(): void {
    this.get()
  }

  get(){
    this.service.authget('installer','admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.data= res['data']
        console.log(this.data)
      }
    },err=>{
      console.log(err)
    })
  }

  view(data){
    sessionStorage.setItem("installerdetails",JSON.stringify(data))
    this.router.navigate(['admin/partner/view']);
  }
  

}
