import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {Gtag} from 'angular-gtag';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  installersidebar = false;
  borrowerSidebar = false;
  adminsidebar = false;
  sidenavtoggled:any = false
  constructor(private router: Router, gtag: Gtag ) {

  }
  changeOfRoutes(){
    let router = this.router.url.split('/')[1]
    if(router=='admin' || router=='borrower' || router=='partner'){
      let ro = this.router.url.split('/')[2].split('?')[0]
      if(ro=='login' || ro=='verify' || ro=='forgot-password' || ro=='passwordReset' || ro=='plaid'){
        router=ro;
      }
    }
    switch (router){
      case 'partner':
        this.installersidebar = true;
      break;
      case 'borrower':
        this.borrowerSidebar = true;
      break;
      case 'admin':
        this.adminsidebar = true;
      break;
      default:
        this.installersidebar = false;
        this.borrowerSidebar = false;
        this.adminsidebar = false;
      break;
    }
  }
}
