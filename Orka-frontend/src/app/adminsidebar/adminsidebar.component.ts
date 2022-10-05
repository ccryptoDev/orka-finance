import { Component, OnInit } from '@angular/core';
import {AppComponent} from '../app.component';
import { HttpService} from '../_service/http.service';

@Component({
  selector: 'app-adminsidebar',
  templateUrl: './adminsidebar.component.html',
  styleUrls: ['./adminsidebar.component.scss']
})
export class AdminsidebarComponent implements OnInit {
  
  Messages:any = false
  Alert:any = false
  Settings:any = false;
  Creditapp:any =false;
  docsReview:any =false;
  milestione:any =false;
  counterSignature:any =false;
  notification:any = []
 pages:any = {
  "Dashboard":false,
  "Approved Application":false,
  "Pending Application":false,
  "Incomplete Application":false,
  "Denied Application":false,
  "Funded Contracts":false,
  "Archived Open Applications":false,
  "Settings":false,
  "Installer Management":false,
  "Users":false,
  "Loan Products":false,
 }
 tabs:any = {
  "Audit Log":false,
  "Questions":false,
  "Change Password":false,
  "Roles":false,
  "Loan Products":false,
 }
  constructor(private app:AppComponent,private service:HttpService) { }

  ngOnInit(): void {
    let pages = sessionStorage.getItem('pages')
    let tabs = sessionStorage.getItem('tabs')
    if(pages){
      pages = JSON.parse(pages)
      for (let i = 0; i < pages.length; i++) {
        this.pages[pages[i]['name']]=true;
        if(pages[i]['name']=='Settings'){
          if(tabs){
            tabs = JSON.parse(tabs)
            for (let j = 0; j < tabs[pages[i]['id']].length; j++) {
              this.tabs[tabs[pages[i]['id']][j]['name']]=true;
            }
          }
        }
      }
    }
    this.gettop()
  }


logout(){
  this.service.logout()
}
  switchsidenavtoggled(){
    this.app.sidenavtoggled = !this.app.sidenavtoggled
  }

  switchmessages(){
    this.Alert = false
    this.Messages = !this.Messages
  }

  switchalert(){
    this.Messages = false
    this.Alert = !this.Alert
  }

  switchSettings(){
    this.Settings = !this.Settings
  }
  creditAppSettings(){
    this.Creditapp = !this.Creditapp
  }
  docsReviewSettings(){
    this.docsReview =!this.docsReview
  }
  milestioneSettings(){
    this.milestione =!this.milestione
  }
  counterSignatureSettings(){
    this.counterSignature =!this.counterSignature
  }

  gettop(){
    this.service.authget('notification/gettop','admin').subscribe(res=>{
      if(res['statusCode']==200){ 
        this.notification=res['data']
      }
    },err=>{

    })
  }

}
