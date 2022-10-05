import { HttpService } from './../../_service/http.service';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ToastrService } from "ngx-toastr";
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-business-principal-identity',
  templateUrl: './business-principal-identity.component.html',
  styleUrls: ['./business-principal-identity.component.scss']
})
export class BusinessPrincipalIdentityComponent implements OnInit {
  f1: any = {};
  data: any = {};
  message: any = [];
  options: {} = {
    componentRestrictions: {
      country: ['US']
    }
  }
  checkdateStatus: boolean;
  dtArray: any = [];
  OsName: string;
  hidedigiterr:boolean=false
  hidedigiterr2:boolean=false
  hidePercent : boolean = true
  modalRef: BsModalRef;
  @ViewChild('messagebox', { read: TemplateRef }) messagebox: TemplateRef<any>;
  ownerAge: boolean;
  owner2check: any;

  constructor(private router: Router, private service: HttpService, private toastrService: ToastrService, private modalService: BsModalService) { }

  ngOnInit(): void {
    this.data.loanId = sessionStorage.getItem('loanId');
    this.OsName = this.service.getOsName();/// to get osname

    this.getAll(this.data.loanId)

      this.getLoanStatus()

  }

  getAll(id){
    this.service.get("business-principal-identity/" + id, 'sales')
      .pipe(first())
      .subscribe((res: any) => {
        if (res.statusCode == 200) {

          this.data.ownerFirstName = res.businessData.ownerFirstName;
          this.data.ownerLastName = res.businessData.ownerLastName;
          this.data.ownerEmail = res.businessData.ownerEmail;
          this.data.ownerDOB = res.businessData.ownerDOB;
          this.data.ownerSSN = res.businessData.ownerSSN;
          this.data.ownerPhone = res.businessData.ownerPhone;
          this.data.ownerAddress = res.businessData.ownerAddress;
          this.data.ownerCity = res.businessData.ownerCity;
          this.data.ownerState = res.businessData.ownerState;
          this.data.ownerZipCode = res.businessData.ownerZipCode;
          this.data.ownerProfessionalTitle = res.businessData.ownerProfessionalTitle;
          this.data.ownerAnnualIncome = res.businessData.ownerAnnualIncome;
          this.data.ownerPercentage = res.businessData.ownerPercentage;
          this.data.owner2 = res.businessData.owner2;
          this.owner2check=res.businessData.owner2;
          this.data.owner2FirstName = res.businessData.owner2FirstName;
          this.data.owner2LastName = res.businessData.owner2LastName;
          this.data.owner2Email = res.businessData.owner2Email;
          this.data.owner2DOB = res.businessData.owner2DOB;
          this.data.owner2SSN = res.businessData.owner2SSN;
          this.data.owner2Phone = res.businessData.owner2Phone;
          this.data.owner2Address = res.businessData.owner2Address;
          this.data.owner2City = res.businessData.owner2City;
          this.data.owner2State = res.businessData.owner2State;
          this.data.owner2ZipCode = res.businessData.owner2ZipCode;
          this.data.owner2ProfessionalTitle = res.businessData.owner2ProfessionalTitle;
          this.data.owner2AnnualIncome = res.businessData.owner2AnnualIncome;
          this.data.owner2Percentage = res.businessData.owner2Percentage;
          //owner 3
          this.data.owner3 = res.businessData.owner3;
          this.data.owner3FirstName = res.businessData.owner3FirstName;
          this.data.owner3LastName = res.businessData.owner3LastName;
          this.data.owner3Email = res.businessData.owner3Email;
          this.data.owner3DOB = res.businessData.owner3DOB;
          this.data.owner3SSN = res.businessData.owner3SSN;
          this.data.owner3Phone = res.businessData.owner3Phone;
          this.data.owner3Address = res.businessData.owner3Address;
          this.data.owner3City = res.businessData.owner3City;
          this.data.owner3State = res.businessData.owner3State;
          this.data.owner3ZipCode = res.businessData.owner3ZipCode;
          this.data.owner3ProfessionalTitle = res.businessData.owner3ProfessionalTitle;
          this.data.owner3AnnualIncome = res.businessData.owner3AnnualIncome;
          this.data.owner3Percentage = res.businessData.owner3Percentage;
         // this.checkPercent(this.data.owner2)
          //console.log('ress',this.data.owner2)
        }
        this.checkPercent(this.data.owner2)
      })
  }
  getLoanStatus() {
    console.log("called")
    this.service.get("loan/status/" + this.data.loanId, 'sales')
      .pipe(first())
      .subscribe((res: any) => {
        console.log({res})
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

  public handleAddressChange1(address: any) {
    this.data.ownerAddress = address.formatted_address;
    //console.log(address.address_components);

    for (const component of address.address_components) {
      const componentType = component.types[0];

      switch (componentType) {

        case "postal_code": {
          this.data.ownerZipCode = `${component.long_name}`;
          break;
        }

        // case "postal_code_suffix": {
        //   this.data.ownerZipCode = `${this.data.ownerZipCode}-${component.long_name}`;
        //   break;
        // }

        case "locality":
          this.data.ownerCity = component.long_name;
          break;

        case "administrative_area_level_1": {
          this.data.ownerState = component.long_name;
          break;
        }
      }
    }
  }

  public handleAddressChange2(address: any) {
    this.data.owner2Address = address.formatted_address;
    console.log(address.address_components);

    for (const component of address.address_components) {
      const componentType = component.types[0];

      switch (componentType) {

        case "postal_code": {
          this.data.owner2ZipCode = `${component.long_name}`;
          break;
        }

        case "postal_code_suffix": {
          this.data.owner2ZipCode = `${this.data.owner2ZipCode}-${component.long_name}`;
          break;
        }

        case "locality":
          this.data.owner2City = component.long_name;
          break;

        case "administrative_area_level_1": {
          this.data.owner2State = component.long_name;
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

  keyPressNumbersWithDecimal(event) {
    var charCode = (event.which) ? event.which : event.keyCode;
    if (charCode != 46 && charCode > 31
      && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  next() {
    this.message = [];

    if (this.data.ownerFirstName && this.data.ownerLastName && this.data.ownerDOB && this.data.ownerSSN && this.data.ownerPhone &&
      this.data.ownerAddress && this.data.ownerCity && this.data.ownerState && this.data.ownerZipCode && this.data.ownerProfessionalTitle && this.data.ownerAnnualIncome && this.data.owner2) {

      this.ownerAge = this.getOwnerAge(this.data.ownerDOB);
      this.ownerAge === false ? this.message.push(`You've indicated that you are not currently at least  18 years old. Is this correct?
      `) : null;


      console.log('check')
      if (this.data.owner2 == "Y" && (!this.data.ownerPercentage || !this.data.owner2FirstName || !this.data.owner2LastName || !this.data.owner2Email)) {
        this.service.errorMessage('Fill all the details!1233');
        return;
      }
      // if (this.data.owner2 == "Y" && (!this.data.ownerPercentage || !this.data.owner2FirstName || !this.data.owner2LastName || !this.data.owner2Email || !this.data.owner2AnnualIncome || !this.data.owner2Percentage)) {
      //   this.service.errorMessage('Fill all the details!1233');
      //   return;
      // }
      if (this.data.owner2 == "Y" && (Number(this.data.ownerPercentage) >= 51 || Number(this.data.owner2Percentage) >= 51)) {
        this.service.errorMessage('Percentage ownership should be less then 51');
        return;
      }
      if (this.ownerAge === false) {
        this.modalRef = this.modalService.show(this.messagebox);
        return
      }

      if (this.data.ownerPhone.length < 14) {
        this.toastrService.error('Please provide 10-digit number in BUSINESS OWNER PHONE');
        return;
      }

      if (this.data.owner2 == "Y" && this.data.owner2Phone.length < 14) {
        this.toastrService.error('Please provide 10-digit number in BUSINESS OWNER2 PHONE');
        return;
      }
      this.submitApi();

      // this.service.post("business-principal-identity", 'sales', this.data)
      //   .pipe(first())
      //   .subscribe((res: any) => {
      //     if (res.statusCode == 200) {
      //       this.router.navigate(['/sales/building-information'])
      //     } else {
      //       console.log("Else", res, this.data);
      //     }
      //   })
    } else {
      ///commit changes for Frontend Credit Application to Form: Validation and Toast Messages
      this.service.errorMessage('Fill all the details!')
    }
  }

  submitApi() {

    // console.log(this.data)
    // return
    if (this.ownerAge === false) {
      this.modalRef.hide();
    }
     console.log(this.data);

    this.service.post("business-principal-identity", 'sales', this.data)
      .pipe(first())
      .subscribe((res: any) => {
        if (res.statusCode == 200) {
          this.router.navigate(['/sales/building-information'])
        }
        else if (res['statusCode'] == 201) {
          let count = 0;
          res['message'].map((msg, indx) => {
            sessionStorage.setItem(`sorryMessage${indx}`, msg);
            count++;
          })
          sessionStorage.setItem('messageCount', String(count));
          this.router.navigate(['sales/sorry']);
        }
        else {
          console.log("Else", res, this.data);
        }
      })
  }

  checkPercent(id){
    let ownerPercent = this.data.ownerPercentage
    let owner2Percent = this.data.owner2Percentage


    console.log('11111767',id,+ownerPercent + +owner2Percent)


    // if((+ownerPercent + +owner2Percent > 50) ||  id == 'N') {

      console.log('hello', +ownerPercent + +owner2Percent);
      this.hidePercent = true
      this.data.owner3 = 'N'

    // }else{
    //   this.hidePercent = false
    //   this.data.owner3 = 'Y'
    //   console.log("hi", +ownerPercent + +owner2Percent, this.data.owner3);

    // }
  }

  checkDate(dateval: any) {
    //alert('hi')
    let currVal = dateval;
    console.log('---', currVal)
    if (currVal == '') {
      this.checkdateStatus = false
      // return false;
    } else {
      let rxDatePattern = /^(\d{1,2})(\/|-)(\d{1,2})(\/|-)(\d{4})$/;
      this.dtArray = currVal.match(rxDatePattern);

      if (this.dtArray == null) {
        this.checkdateStatus = false
      } else {
        let dtMonth = this.dtArray[1];
        let dtDay = this.dtArray[3];
        let dtYear = this.dtArray[5];

        if (dtMonth < 1 || dtMonth > 12) {
          this.checkdateStatus = false
        } else if (dtDay < 1 || dtDay > 31) {
          this.checkdateStatus = false
        } else if ((dtMonth == 4 || dtMonth == 6 || dtMonth == 9 || dtMonth == 11) && dtDay == 31) {
          this.checkdateStatus = false
        } else if (dtMonth == 2) {
          var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));
          if (dtDay > 29 || (dtDay == 29 && !isleap))
            this.checkdateStatus = false
        } else {
          this.checkdateStatus = true
        }

      }
    }
    console.log('checkdate', this.checkdateStatus)
  }

  close(): void {
    this.modalRef.hide();
  }

  getOwnerAge(ownerDOB) {
    const currDate = new Date();
    const ownerDateOfBirth = new Date(ownerDOB);
    const time_difference = currDate.getTime() - ownerDateOfBirth.getTime();
    const days_difference = Math.round(time_difference / (1000 * 60 * 60 * 24));
    return days_difference > 6570 ? true : false;
  }
  validateConfirmdigits(e,val){

    if(e==1){
      if(val.length < 14){
        this.hidedigiterr=true
      }else{
        this.hidedigiterr=false
      }
    }else{
      if(val.length < 14){
        this.hidedigiterr2=true
      }else{
        this.hidedigiterr2=false
      }
    }
  }
}
