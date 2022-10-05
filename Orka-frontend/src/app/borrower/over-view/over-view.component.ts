import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/_service/http.service';
import { first } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-over-view',
  templateUrl: './over-view.component.html',
  styleUrls: ['./over-view.component.scss']
})
export class OverViewComponent implements OnInit {
  data:any={
    user_details:[],
    payment_details:[],
    next_schedule:null
  }
  monthDue=0;
  remainingBalance=0;
  nextDuedate=null;

  constructor(
    private service: HttpService, 
    public datePipe: DatePipe,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.getOverView()
  }

  getOverView(){
    //let userId = 'a31c9aed-8933-4825-b71f-c44be24b014d';
    let userId = sessionStorage.getItem('UserId');

    this.service.authget("overview/"+userId,"client")
    .pipe(first())
    .subscribe(res=>{
      
      if(res['statusCode']==200){    
        console.log('res', res)  
        this.addlog("view overview page",res['data']['user_details'][0].loan_id)  
        this.data= res['data'];    
        sessionStorage.setItem('LoanId', this.data['user_details'][0].loan_id);      
          
        if(this.data.next_schedule != null){
          //to get monthDue
          this.monthDue = this.data.next_schedule.amount;
          //to get unpaidPrincipal
          this.remainingBalance = this.data.next_schedule.unpaidPrincipal;
          //to get nextDuedate
          this.nextDuedate = this.data.next_schedule.scheduleDate;
        }    
        
      }
    },err=>{
      console.log(err)
    })
  }

  addlog(module,id){
    this.service.addlog(module,id,"client").subscribe(res=>{},err=>{})
  }
}
