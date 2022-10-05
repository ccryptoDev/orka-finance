import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { HttpService } from 'src/app/_service/http.service';

@Component({
  selector: 'app-plaid-success',
  templateUrl: './plaid-success.component.html',
  styleUrls: ['./plaid-success.component.scss']
})
export class PlaidSuccessComponent implements OnInit {
  OsName: string
  loanId: string;
  constructor(private router: Router, private service: HttpService) { }

  ngOnInit(): void {
    this.loanId = sessionStorage.getItem('loanId');
    this.OsName = this.service.getOsName();/// to get osname
    this.getLoanStatus()
  }

  getLoanStatus() {
    console.log("called")
    this.service.get("loan/status/" + this.loanId, 'sales')
      .pipe(first())
      .subscribe((res: any) => {
        console.log({ res })
        if (res.statusCode == 200 && res.message == "canceled") {
          let count = 0;
          res['sorryMessage'].map((msg, indx) => {
            sessionStorage.setItem(`sorryMessage${indx}`, msg);
            count++;
          })
          sessionStorage.setItem('messageCount', String(count));
          this.router.navigate(['sales/sorry'])
        }
        return
      })
  }

  next() {
    this.router.navigate(['sales/business-owner-information'])
  }

  previous() {
    this.router.navigate(['sales/plaid'])
  }

}
