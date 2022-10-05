import { Component, OnInit, Pipe } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';

import { HttpService } from './../../_service/http.service';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss'],
})
export class CalculatorComponent implements OnInit {
  data: any;
  paymentMethodStatus: any = false;
  firstMonthlyPayment: any;
  reAmortizetMonthlyPayment: any;
  totalPayment: any;ac
  financingAmount: number = 0;
  index: number;
  monthEighteenPrepayment: number;
  originationFeePercentage: number = 0;
  originationFeeAmount: number = 0;
  totalAmountFinanced: number = 0;
  calcSymbol: any = 'percentage';
  flag: number = 0;
  totalOriginationFee: number = 0;
  paymentFlag: number = 0;
  monthEighteenPrepaymentDisplay: any;

  constructor(private router: Router, private service: HttpService, private toastrService: ToastrService) {}

  ngOnInit(): void {
    const MainInstallerId = sessionStorage.getItem('MainInstallerId');
    const InstallerUserId = sessionStorage.getItem('InstallerUserId');

    if (MainInstallerId !== 'null') {
      this.getLoanProducts(MainInstallerId);
    } else {
      this.getLoanProducts(InstallerUserId);
    }
  }

  getLoanProducts(id: string) {
    this.service
      .authget("loan-calculator/" + id, 'partner')
      .pipe(first())
      .subscribe((res: any) => {
        if (res.statusCode == 200) {
          this.data = res.loanProducts;
          this.checkLoanProducts(this.data);
        }
      });
  }

  checkLoanProducts(data: any) {
    data.forEach((element) => {
      this.totalOriginationFee += Number(element.originationFee)
    });
  }

  financeAmount(data) {
    this.financingAmount = Number(data.target.value);

    if (this.financingAmount && this.index !== undefined) {
      this.originationFeePercentage = Number(this.data[this.index].originationFee);
      this.originationFeeAmount = this.financingAmount * (this.originationFeePercentage / 100);
      this.totalAmountFinanced = this.financingAmount + this.originationFeeAmount;

      if (this.monthEighteenPrepayment) { // When month 18 prepayment is present
        if (this.paymentMethodStatus) { // When payment method is check
          this.checkPrePayment();
        } else { // When payment method is ach
          this.achPrePayment();
        }
      } else { // When month 18 prepayment is absent
        if (this.paymentMethodStatus) {
          this.checkWOPrePayment(); // When payment method is check
        } else { // when payment method is ach
          this.achWOPrePayment();
        }
      }
    } else {
      this.firstMonthlyPayment = 0;
      this.reAmortizetMonthlyPayment = 0;
      this.totalPayment = 0;
    }
  }

  prepayMonthEighteen(data) {
    this.monthEighteenPrepayment = Number(data.target.value);

    if (this.financingAmount && this.index !== undefined) {
      if (this.monthEighteenPrepayment) { // When month 18 prepayment is present
        if (this.paymentMethodStatus) { // When payment method is check
          this.checkPrePayment();
        } else { // When payment method is ach
          this.achPrePayment();
        }
      } else { // When month 18 prepayment is absent
        if (this.paymentMethodStatus) {
          this.checkWOPrePayment(); // When payment method is check
        } else { // when payment method is ach
          this.achWOPrePayment();
        }
      }
    } else {
      this.firstMonthlyPayment = 0;
      this.reAmortizetMonthlyPayment = 0;
      this.totalPayment = 0;
    }
  }

  keyPressNumbers(event) {
    const charCode = (event.which) ? event.which : event.keyCode;

    if ((charCode < 48 || charCode > 57)) {
      event.preventDefault();

      return false;
    } else {
      return true;
    }
  }

  getValue(data) {
    this.index = Number(data);

    if (this.financingAmount) {
      this.originationFeePercentage = Number(this.data[this.index].originationFee);
      this.originationFeeAmount = this.financingAmount * (this.originationFeePercentage / 100);
      this.totalAmountFinanced = this.financingAmount + this.originationFeeAmount;

      if (this.monthEighteenPrepayment) { // When month 18 prepayment is present
        if (this.paymentMethodStatus) { // When payment method is check
          this.checkPrePayment();
        } else { // When payment method is ach
          this.achPrePayment();
        }
      } else { // When month 18 prepayment is absent
        if (this.paymentMethodStatus) {
          this.checkWOPrePayment(); // When payment method is check
        } else { // when payment method is ach
          this.achWOPrePayment();
        }
      }
    } else {
      this.firstMonthlyPayment = 0;
      this.reAmortizetMonthlyPayment = 0;
      this.totalPayment = 0;
    }
  }

  toggle(data) {
    if (data.target.name == 'paymentMethod') {
      this.paymentMethodStatus = data.target.checked;

      if (this.index !== undefined) {
        this.getValue(this.index);
      }
    } else if (data.target.name == 'calcSymbol') {
      let changePrePayment = 0;

      this.calcSymbol = data.target.checked == true ? 'dollar' : 'percentage';
      this.flag++;

      if (this.monthEighteenPrepayment && this.totalAmountFinanced) {
        if (this.calcSymbol == 'dollar' && this.flag >= 1) {
          changePrePayment = (this.monthEighteenPrepayment / 100) * this.totalAmountFinanced;
        } else if (this.calcSymbol == 'percentage' && this.flag > 0) {
          changePrePayment = (this.monthEighteenPrepayment * 100) / this.totalAmountFinanced;
        }

        this.monthEighteenPrepayment = this.monthEighteenPrepayment - this.monthEighteenPrepayment + changePrePayment;
        this.monthEighteenPrepaymentDisplay = this.monthEighteenPrepayment.toFixed(2);
      }
    }
  }

  achPrePayment() {
    const principal = this.calcSymbol === 'percentage' ? this.totalAmountFinanced * (this.monthEighteenPrepayment / 100) : this.monthEighteenPrepayment;
    const product = this.data[this.index];
    const monthlyInterestRate = (Number(product.achDiscountInterestRate) / 100) / 12;
    const periods = Number(product.tenorMonths) - 18;
    const amortizedMonthlyPayment = (
      (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, periods)) / 
      (Math.pow(1 + monthlyInterestRate, periods) - 1)
    );

    this.firstMonthlyPayment = (this.totalAmountFinanced * (Number(product.mpfAchWItcPrepay) / 100)).toFixed(2);
    this.reAmortizetMonthlyPayment = ((this.totalAmountFinanced * (Number(product.mpfAchWOPrepay) / 100)) - amortizedMonthlyPayment).toFixed(2);
    this.totalPayment = (this.firstMonthlyPayment * 18) + (this.reAmortizetMonthlyPayment * ((Number(product.tenorMonths)) - 18)).toFixed(2);
  }

  checkPrePayment() {
    const principal = this.calcSymbol === 'percentage' ? this.totalAmountFinanced * (this.monthEighteenPrepayment / 100) : this.monthEighteenPrepayment;
    const product = this.data[this.index];
    const monthlyInterestRate = (Number(product.interestBaseRate) / 100) / 12;
    const periods = Number(product.tenorMonths) - 18;
    const amortizedMonthlyPayment = (
      (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, periods)) / 
      (Math.pow(1 + monthlyInterestRate, periods) - 1)
    );

    this.firstMonthlyPayment = (this.totalAmountFinanced * Number((product.mpfCheckWItcPrepay) / 100)).toFixed(2);
    this.reAmortizetMonthlyPayment = ((this.totalAmountFinanced * Number(product.mpfCheckWOPrepay) / 100) - amortizedMonthlyPayment).toFixed(2);
    this.totalPayment = (this.firstMonthlyPayment * 18) + (this.reAmortizetMonthlyPayment * ((Number(product.tenorMonths)) - 18)).toFixed(2);
  }

  checkWOPrePayment() {
    const product = this.data[this.index];

    this.firstMonthlyPayment = (this.totalAmountFinanced * (Number(product.mpfCheckWItcPrepay) / 100)).toFixed(2);
    this.reAmortizetMonthlyPayment = (this.totalAmountFinanced * (Number(product.mpfCheckWOPrepay) / 100)).toFixed(2);
    this.totalPayment = (this.firstMonthlyPayment * 18) + (this.reAmortizetMonthlyPayment * ((Number(product.tenorMonths)) - 18)).toFixed(2);
  }

  achWOPrePayment() {
    const product = this.data[this.index];

    this.firstMonthlyPayment = (this.totalAmountFinanced * (Number(product.mpfAchWItcPrepay) / 100)).toFixed(2);
    this.reAmortizetMonthlyPayment = (this.totalAmountFinanced * (Number(product.mpfAchWOPrepay) / 100)).toFixed(2)
    this.totalPayment = ((this.firstMonthlyPayment * 18) + (this.reAmortizetMonthlyPayment * ((Number(product.tenorMonths)) - 18))).toFixed(2);
  }

  changeAmtVal(value){
    let c = value.split('.')
    let res= c[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return res + '.' + c[1];
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
}
