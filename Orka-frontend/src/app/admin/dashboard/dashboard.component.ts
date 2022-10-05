import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { Router } from "@angular/router";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
data:any = {
  approved_application: 0,
  canceled_application: 0,
  incomplete_application: 0,
  waiting_application: 0,
}
tabs:any = {
  "Approved Application":false,
"Pending Application":false,
"Incomplete Application":false,
"Denied Application":false,
"Admin Users":false,
"Credit Reports":false
}
  constructor(private service: HttpService,public router:Router) { }

  ngOnInit(): void {
    let pages = sessionStorage.getItem('pages')
    let tabs = sessionStorage.getItem('tabs')
    if(pages){
      pages = JSON.parse(pages)
      for (let i = 0; i < pages.length; i++) {
        if(pages[i]['name']=='Dashboard'){
          if(tabs){
            tabs = JSON.parse(tabs)
            for (let j = 0; j < tabs[pages[i]['id']].length; j++) {
              this.tabs[tabs[pages[i]['id']][j]['name']]=true;
            }
            i = pages.length+1
          }
        }
      }
    }
    this.getlist()
  }

  getlist(){
    this.service.authget('dashboard','admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.data= res['data']
      }
    },err=>{
      console.log(err)
    })
  }

  goPendings(){
    this.router.navigate(['admin/pendings']);
  }

  goincomplete(){
    this.router.navigate(['admin/incomplete']);
  }
  goapproved(){
    this.router.navigate(['admin/approved']);
  }
  godenied(){
    this.router.navigate(['admin/denied']);
  }
}
