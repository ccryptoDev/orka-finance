import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { HttpService } from '../../_service/http.service';
import { BorrowerSidebarComponent } from "../../borrower-sidebar/borrower-sidebar.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  islogout: boolean;
  installer_id = sessionStorage.getItem('InsID');
  loanRef = sessionStorage.getItem('LoanRefNo');
  loanId = sessionStorage.getItem('LoanID');
  data: any;
  ref_no: any;
  status_flag: any;
  interestRate: any;
  email: any;
  batteryManufacturer: any;
  panelManufacturer: any;
  inverterManufacturer: any;
  batteryCapacity: any;
  showtool: boolean = false;
  showtool1: boolean = false;
  hideReviewSign: boolean = false;
  loanInfo: any = null;
  installerInfo: any = null;
  customerFinanceDetails: any = null;
  estimatedMonthlyPayment: string;
  expectedPrepayment: string;
  
  constructor(
    private service: HttpService,
    public router: Router,
    private borrower: BorrowerSidebarComponent,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.getborrowerList();
  }

  getborrowerList(){
    this.service
      .get('borrower-home/' + this.loanId, 'borrower')
      .pipe(first())
      .subscribe(
        (res) => {
          this.data = { borrower: res['customerFinanceDetails'], loan: res['loaninfo'] };
          this.loanInfo = res['loaninfo'].length ? res['loaninfo'][0] : null;
          this.ref_no = res['loaninfo'][0]['ref_no'] || '--';
          this.status_flag = res['loaninfo'][0]['status_flag'] || '--';
          this.interestRate = res['loaninfo'][0]['interestRate'] || '--';
          this.email = res['loaninfo'][0]['email  '] || '--';
          this.batteryManufacturer = res['loaninfo'][0]['batteryManufacturer'] || '--';
          this.panelManufacturer = res['loaninfo'][0]['panelManufacturer'] || '--';
          this.inverterManufacturer = res['loaninfo'][0]['inverterManufacturer'] || '--';
          this.batteryCapacity = res['loaninfo'][0]['batteryCapacity'] || '--';
          this.installerInfo = res['installerInfo']?.length ? res['installerInfo'][0] : null;
          this.customerFinanceDetails = res['customerFinanceDetails'].length ? res['customerFinanceDetails'][0] : null;

          if (res['docusign'].length && res['docusign'][0].envelopeStatus === 'MAIN_CUSTOMER_PG_1_SIGNED') {
            this.hideReviewSign = true;
          }

          this.calculateEstimatedPayments();
        },
        (err) => {
          const errorMessage = err.status === 500 ? 'Something went wrong' : err.error.message;

          this.toastrService.error(errorMessage);
        }
      );
  }

  privacy() {
      window.open(
      'privacy-policy',
      '_blank' // <- This is what makes it open in a new window.
    );
  }

  termscondition() {
    window.open(
      'terms-and-conditions',
      '_blank' // <- This is what makes it open in a new window.
    );
    //this.router.navigate(['terms-and-conditions']);
  }
  
  securitypolicy() {
    window.open(
      'security-policy',
      '_blank' // <- This is what makes it open in a new window.
    );
    //this.router.navigate(['security-policy']);
  }

  loadSignComponent(){
    this.borrower.issignShow = true;
    this.borrower.isSidebarShow = false;
    this.borrower.isdocumentShow = false;
  }

  loadloanComponent(){
    this.borrower.issignShow = false;
    this.borrower.isSidebarShow = false;
    this.borrower.isdocumentShow = false;
    this.borrower.isbankShow = false;
    this.borrower.isloanShow = true;
  }

  amountDecimal(val){
    return val.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  private calculateEstimatedPayments(): void {
    const financingRequested = Number(this.loanInfo.financingRequested);
    const paymentFactor = Number(this.loanInfo.selected_bank_account_id ? this.loanInfo.mpfAchWItcPrepay : this.loanInfo.mpfCheckWItcPrepay);
    const prepayment = Number(this.loanInfo.prepayment);

    this.estimatedMonthlyPayment = ((financingRequested * paymentFactor) / 100).toFixed(2);
    this.expectedPrepayment = ((financingRequested * prepayment) / 100).toFixed(2);
  }
}
