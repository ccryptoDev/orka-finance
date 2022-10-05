import { Component  } from '@angular/core';
import {environment} from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../../_service/http.service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-plaid',
  templateUrl: './plaid.component.html',
  styleUrls: ['./plaid.component.scss']
})
export class PlaidComponent  {
public_key=environment.plaid_public_key

  constructor(private route: ActivatedRoute,private service: HttpService,public router:Router) { 
  
  }

  
 
  


  onPlaidEvent(event){
    //console.log(event)
  }

  onPlaidSuccess(event){
    this.service.post("plaid/savetoken/"+this.route.snapshot.paramMap.get('id'),"client",{public_token:event.token}).subscribe(res=>{
      if(res['statusCode']==200){
        this.router.navigate(['client']);
      }      
    },err=>{
     console.log(err) 
    })
  }

  onPlaidExit(event){
    //console.log(event)
  }
  
}