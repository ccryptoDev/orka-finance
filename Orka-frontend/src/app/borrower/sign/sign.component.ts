import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgxPlaidLinkService, PlaidLinkHandler } from 'ngx-plaid-link';

import { HttpService } from '../../_service/http.service';
import { BorrowerSidebarComponent } from "../../borrower-sidebar/borrower-sidebar.component";
import { environment } from '../../../environments/environment';

interface BankAccount {
  id: string;
  accountNumber: string;
}

@Component({
  selector: 'app-sign',
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.scss']
})
export class SignComponent implements OnInit {
  installer_id = sessionStorage.getItem('InsID');
  loanRef = sessionStorage.getItem('LoanRefNo');
  loanId = sessionStorage.getItem('LoanID');
  bankAccounts: BankAccount[] = [];
  data: any = [];
  filterData:any = [];
  showcontentSH: boolean = false;
  plaidHandler: PlaidLinkHandler;
  objectKeys = Object.keys;

  constructor(
    private service: HttpService,
    private toastrService: ToastrService,
    public router: Router,
    private borrower: BorrowerSidebarComponent,
    private plaidLinkService: NgxPlaidLinkService
  ) {}

  public ngOnInit(): void {
    this.getLoanBankAccounts()
  }

  public selectBankAccount(selectedBankAccountId: string) {
    this.service
      .authpatch(`loans/${this.loanId}`, 'borrower', { selectedBankAccountId })
      .pipe(first())
      .subscribe(
        () => {
          this.loadLoanComponent();
        },
        (err) => {
          const errorMessage = err.status === 500 ? 'Something went wrong. Please try again later' : err.error.message;

          this.toastrService.error(errorMessage);
        }
      )
  }

  public connectToPlaid() {
    this.service
      .get(`plaid/linktoken/${this.loanId}`, 'admin')
      .subscribe(async (res) => {
        const linkToken: string = res['token'];

        this.plaidHandler = await this.plaidLinkService.createPlaid({
          apiVersion: environment.plaidApiVersion,
          env:  environment.plaidEnv,
          token: linkToken,
          product: ['auth','assets','transactions'],
          countryCodes: ['US'],
          onSuccess: (token) => this.handlePlaidSuccess(token),
          onExit: (error) => this.handlePlaidExit(error)
        });

        this.plaidHandler.open();
      });
  }

  public loadbankComponent(){
    this.borrower.issignShow = false;
    this.borrower.isSidebarShow = false;
    this.borrower.isdocumentShow = false;
    this.borrower.isbankShow = true;
    this.borrower.isloanShow = false;
  }

  public loadLoanComponent() {
    this.borrower.issignShow = false;
    this.borrower.isSidebarShow = false;
    this.borrower.isdocumentShow = false;
    this.borrower.isbankShow = false;
    this.borrower.isloanShow = true;
  }
 
  private getLoanBankAccounts(){
    this.service
      .authget(`loans/${this.loanId}/bank-accounts`, 'borrower')
      .pipe(first())
      .subscribe(
        (res) => {
          const plaidAccounts = res['plaid'];
          const manuallyInputedAccounts = res['manuallyInputed'];

          this.bankAccounts = [...plaidAccounts, ...manuallyInputedAccounts].map((account) => ({
            id: account.id,
            accountNumber: account.accountNumber
          }));
        },
        () => {
          this.toastrService.error('Something went wrong, please try again later');
        }
      );
  }

  private async handlePlaidSuccess(token: string) {
    try {
      // Refactor the endpoint later to throw an exception and return the proper status code in the request, not in the request body
      const saveTokenResponse = await this.service
        .post(`plaid/savetoken/${this.loanId}`, 'admin', {
          public_token: token,
          reconnect: false
        })
        .toPromise();

      if (saveTokenResponse['statusCode'] === 200) {
        // Refactor the endpoint later to throw an exception and return the proper status code in the request, not in the request body
        const getAuthResponse = await this.service
          .get(`plaid/get-auth/${this.loanId}`, 'admin')
          .toPromise();

        if (getAuthResponse['statusCode'] === 200) {
          this.getLoanBankAccounts();
          this.plaidHandler.exit();
        } else {
          this.toastrService.error('Something went wrong. Please try again later');
        }
      } else {
        this.toastrService.error('Something went wrong. Please try again later');
      }
    } catch (error) {
      this.toastrService.error('Something went wrong. Please try again later');
    }
  }

  private handlePlaidExit(error) {
    if (error) {
      this.toastrService.error(error);
    }
    
    this.plaidHandler.exit();
  }
}
