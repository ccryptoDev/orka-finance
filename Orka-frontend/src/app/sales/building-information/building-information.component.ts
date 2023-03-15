import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { HttpService } from './../../_service/http.service';
import { DecisionService } from '../../_service/decision.service';

@Component({
  selector: 'app-building-information',
  templateUrl: './building-information.component.html',
  styleUrls: ['./building-information.component.scss']
})
export class BuildingInformationComponent implements OnInit {
  @ViewChild('messagebox', { read: TemplateRef }) messagebox: TemplateRef<any>;
  data: any = {};
  message: any;
  OsName: string;
  initialKnockOutMessage: any;
  modalRef: BsModalRef;
  options: {} = {
    componentRestrictions: {
      country: ['US']
    }
  };
  ownerShipType: boolean;

  constructor(
    private router: Router,
    private service: HttpService,
    private toastrService: ToastrService,
    private modalService: BsModalService,
    private decisionService: DecisionService
  ) {}

  ngOnInit(): void {
    this.data.loanId = sessionStorage.getItem('loanId');
    this.OsName = this.service.getOsName();/// to get osname
    console.log('check OS', this.OsName)
    this.service.get("building-information/" + this.data.loanId, 'sales')
      .pipe(first())
      .subscribe((res: any) => {
        if (res.statusCode == 200) {
          this.data.businessInstallAddress = res.businessData.businessInstallAddress;
          this.data.businessInstallCity = res.businessData.businessInstallAddress;
          this.data.businessInstallState = res.businessData.businessInstallState;
          this.data.businessInstallZipCode = res.businessData.businessInstallZipCode;
          this.data.estimatedPropertyValue = res.businessData.estimatedPropertyValue;
          this.data.yearsPropertyOwned = res.businessData.yearsPropertyOwned;
          this.data.ownershipType = res.businessData.ownershipType;
          this.data.mortageStartDate = res.businessData.mortageStartDate;
          this.data.mortageTerm = res.businessData.mortageTerm;
          this.data.monthlyMortagePayment = res.businessData.monthlyMortagePayment;
          this.data.businessAddressFlag = "N";
        }
      })

    this.getLoanStatus()
  }

  getLoanStatus() {
    console.log("called")
    this.service.get("loan/status/" + this.data.loanId, 'sales')
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

  public handleAddressChange(address: any) {
    this.data.businessInstallAddress = address.formatted_address;
    console.log("gadd", address.geometry.location.lat(), address.geometry.location.lng());
    this.data.lat = address.geometry.location.lat().toString();
    this.data.lng = address.geometry.location.lng().toString();
    for (const component of address.address_components) {
      const componentType = component.types[0];

      switch (componentType) {

        case "postal_code": {
          this.data.businessInstallZipCode = `${component.long_name}`;
          break;
        }

        case "locality":
          this.data.businessInstallCity = component.long_name;
          break;

        case "administrative_area_level_1": {
          this.data.businessInstallState = component.long_name;
          break;
        }
      }
    }
  }

  namedata(data) {
    return data.target.value;
  }

  keyPressNumbers(event) {
    var charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  next() {
    this.message = [];

    if (this.data.businessAddressFlag && this.data.businessInstallAddress && this.data.businessInstallCity && this.data.businessInstallState && this.data.businessInstallZipCode && this.data.estimatedPropertyValue && this.data.yearsPropertyOwned && this.data.ownershipType) {

      this.ownerShipType = this.getOwnershipType(this.data.ownershipType);
      this.ownerShipType === false ? this.message.push(`You've indicated that your business is currently leasing
       the property where the solar project will be installed . Is this correct?`) : null;

      if (this.data.ownershipType == 'Mortgaged' && (!this.data.mortageStartDate || !this.data.mortageTerm || !this.data.monthlyMortagePayment)) {
        this.toastrService.error('Fill all the details !');
        return;
      }
      if (!this.data.authorize) {
        this.toastrService.error('Kindly Agree to Credit Report Authorization');
        return;
      }
      if (this.ownerShipType === false) {
        this.modalRef = this.modalService.show(this.messagebox);
        return;
      }

      this.submitApi();
    }
    else {
      this.toastrService.error('Fill all the details!')
    }
  }

  async submitApi() {
    if (this.ownerShipType === false) {
      this.modalRef.hide();
    }

    try {
      await this.service.post('building-information', 'sales', this.data).toPromise();

      const decision: any = await this.service.post(`loan/${this.data.loanId}/decision`, 'admin', null).toPromise();

      this.decisionService.setDecision(decision.situation);

      this.router.navigate(['sales/thankyou']);
    } catch (err) {
      const errorMessage = err.status === 500 ? 'Something went wrong. Please try again later' : err.error.message;

      this.toastrService.error(errorMessage);
    }
  }

  close(): void {
    this.modalRef.hide();

  }

  getOwnershipType(ownershipType) {
    return ownershipType == 'Leased' ? false : true;
  }
}
