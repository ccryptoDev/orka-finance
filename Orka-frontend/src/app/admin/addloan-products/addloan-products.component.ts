import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { first } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

import { HttpService } from '../../_service/http.service';

@Component({
  selector: 'app-addloan-products',
  templateUrl: './addloan-products.component.html',
  styleUrls: ['./addloan-products.component.scss']
})
export class AddloanProductsComponent implements OnInit {
  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;
  f1: any = {};
  res: any = [];
  maxDate: Date;
  data_add: any = {};
  listfiles: any = [];
  fileitems: any = [];
  shrtname = 1; // set default select for shortname
  modalRef: BsModalRef;
  message: any = [];
  businessName: string;
  businessEmail: string;
  error_achcal: boolean;
  calValid: boolean;

  constructor(
    private service: HttpService,
    public router:Router,private toastrService: ToastrService,
  ) {}

  ngOnInit(): void {}

  namedata(data){
    return data.target.value;
  }

  addloanProductSubmit() {
    this.data_add.name = this.f1.productName;
    this.data_add.type = this.f1.type;
    this.data_add.tenorMonths = this.f1.tenorMonths;
    this.data_add.tenorYears = this.f1.tenorYears;
    this.data_add.interestBaseRate = this.f1.interestBaseRate;
    this.data_add.achDiscount = this.f1.achDiscount;
    this.data_add.achDiscountInterestRate = this.f1.achDiscountInterestRate;
    this.data_add.dealerFee = this.f1.dealerFee;
    this.data_add.originationFee = this.f1.originationFee;
    this.data_add.prepayment_flag='Y';
    this.data_add.prepayment = this.f1.prepayment;
    this.data_add.prepaymentMonth = this.f1.prepaymentMonth;
    this.data_add.downpayment = this.f1.downpayment;
    this.data_add.mpfAchWItcPrepay = this.f1.mpfAchWItcPrepay;
    this.data_add.mpfAchWOPrepay = this.f1.mpfAchWOPrepay;
    this.data_add.mpfCheckWItcPrepay = this.f1.mpfCheckWItcPrepay;
    this.data_add.mpfCheckWOPrepay = this.f1.mpfCheckWOPrepay;
    this.data_add.flexReamPrepayAmount = this.f1.flexReamPrepayAmount;
    this.data_add.flexReamPrepayPercentofPrincipal = this.f1.flexReamPrepayPercentofPrincipal;
    this.data_add.flexReamMaxAnnualFrequency = this.f1.flexReamMaxAnnualFrequency;
    this.data_add.phase = (this.f1.phase!=null) ? this.f1.phase : '';
    this.data_add.startDate = (this.f1.startDate!=null) ? this.f1.startDate : '';
    this.data_add.endDate = (this.f1.endDate!=null) ? this.f1.endDate : '';

    let baserate = this.f1.interestBaseRate;
    let acdiscount = this.f1.achDiscount;
    let acdiscount_rate = this.f1.achDiscountInterestRate;
    let result = (baserate - acdiscount_rate).toFixed(2); //to check the float value with 2 digits

    if (Number(baserate) < Number(acdiscount)) {
      this.toastrService.error('ACH Discount Must be Less than Interest Base Rate');
      //this.f1.achDiscount = 0
      this.calValid = true;

      return false
    }

    if (acdiscount == 0) {
      this.error_achcal = false;
      this.data_add.achDiscountInterestRate = (this.f1.interestBaseRate + acdiscount);
    } else if (Number(result) != Number(acdiscount) || Number(acdiscount_rate) > Number(baserate)) {
      this.error_achcal=true;
      this.toastrService.error('There appears to be a problem with the ACH Discount or Interest Rate values. Please update');
    } else {
      this.error_achcal=false;
    }

    if (this.error_achcal == false) {
      this.service
        .authpost('loanproducts/add','admin',this.data_add)
        .pipe(first())
        .subscribe(
          (res) => {
            if (res['statusCode'] == 200) {
              this.toastrService.success("Loan Product added successfully");
              this.router.navigate(['admin/loan-products']);
            } else {
              this.message = res['message'];
              this.toastrService.error(res['message']);
            }
          },
          (err) => {
            if (err['error']['message'].isArray) {
              this.message = err['error']['message'];
            } else {
              this.message = [err['error']['message']];
            }

            this.toastrService.error(this.message);
          }
        );
    }
  }
  
  close(): void {
    this.modalRef.hide(); 
  }

  keyPressNumbers(evt) {
    const charCode = (evt.which) ? evt.which : evt.keyCode;

    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    
    return true;
  }

  keyPressNumbers_math() {
    let baserate = this.f1.interestBaseRate;
    let acdiscount = this.f1.achDiscount;

    if (Number(baserate) < Number(acdiscount)) {
      this.toastrService.error('ACH Discount Must be Less than Interest Base Rate');
      this.calValid = true;
    } else {
      this.calValid = false;
    }

    let result = (baserate - acdiscount).toFixed(2); //to check the float value with 2 digits

    this.f1.achDiscountInterestRate = (isNaN(Number(result))) ? 0 : result;
  }
}
