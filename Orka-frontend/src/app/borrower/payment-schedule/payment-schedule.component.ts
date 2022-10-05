import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/_service/http.service';
import { first } from 'rxjs/operators';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-payment-schedule',
  templateUrl: './payment-schedule.component.html',
  styleUrls: ['./payment-schedule.component.scss']
})
export class PaymentScheduleComponent implements OnInit {
  data:any={
    payment_details:[],
    paymentScheduleDetails:[],
    next_schedule:null,
    user_details:null,
  }
  monthDue=0;
  remainingBalance=0;
  nextDuedate=null;

  constructor(private service: HttpService, public datePipe: DatePipe) { }

  ngOnInit(): void {
    this.getPaymentDetails()
  }

  getPaymentDetails(){
    let loanId = sessionStorage.getItem('LoanId');
    this.service.authget("payment-details/"+loanId,"client")
    .pipe(first())
    .subscribe(res=>{
      this.addlog("View Payment schedule page",loanId)
      if(res['statusCode']==200){
        console.log('res',res);
        
        this.data= res['data'];
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
