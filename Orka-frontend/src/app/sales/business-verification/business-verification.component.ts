import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { HttpService } from 'src/app/_service/http.service';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { ToastrService } from "ngx-toastr";
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
@Component({
  selector: 'app-business-verification',
  templateUrl: './business-verification.component.html',
  styleUrls: ['./business-verification.component.scss']
})
export class BusinessVerificationComponent implements OnInit {

  public files: NgxFileDropEntry[] = [];
  public listfiles: any = [];
  fileitems: any = [];
  preFilesItems: any = [];
  TaxPreFilesItems: any = [];

  taxReturnsFileitems : any = [];
  pretaxReturnsFileitems : any = [];
  data: any = {};
  today: any = new Date();
  apForm: FormGroup;
  message: any = []; businessDuration: boolean;
  restrictedIndustry: boolean;
  ziphide: boolean = false;
  hidedigiterr: boolean = false;
  certifyuseofloan: any;
  ;
  options: {} = {
    componentRestrictions: {
      country: ['US']
    }
  }
  OsName: string;
  modalRef: BsModalRef;

  @ViewChild('messagebox', { read: TemplateRef }) messagebox: TemplateRef<any>;

  constructor(private router: Router, private formBuilder: FormBuilder, private service: HttpService, private toastrService: ToastrService, private modalService: BsModalService) { }

  get apiFormvalidation() {
    return this.apForm.controls;
  }

  ngOnInit(): void {
    this.apForm = this.formBuilder.group({
    });
    this.data.loanId = sessionStorage.getItem('loanId');


    this.data.businessStructure =null
    this.data.businessIndustry =null
    this.data.businessBipocowned = null
    this.data.empContractCount =null

    this.getVerificationDetails()
    this.verificationFiles()

    // let  Name = "Not known";
    // const isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent)
    // alert(isIEOrEdge)
    //this.getBrowserName()

    this.OsName = this.service.getOsName();/// to get osname
    // this.getLoanStatus();
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

  verificationFiles() {
    this.service.get("business-verification/files/" + this.data.loanId, 'sales')
      .pipe(first())
      .subscribe((res: any) => {
        if (res.statusCode == 200) {
          this.preFilesItems = res.data.filter(
            (xx) => xx.services == 'businessVerification/upload'
          );
          this.TaxPreFilesItems = res.data.filter(
            (xx) => xx.services == 'businessVerification/taxreturn/upload'
          );
          console.log("check",res,this.preFilesItems)
          //console.log('1',this.fileitems,'2',this.taxReturnsFileitems)
        }
      })
  }

  getVerificationDetails() {

    this.service.get("business-verification/" + this.data.loanId, 'sales')
      .pipe(first())
      .subscribe((res: any) => {
        console.log('---',res)
        if (res.statusCode == 200) {
          console.log('---',res.businessData)
          this.data.taxId = res.businessData.taxId;
          this.data.businessIndustry = res.businessData.businessIndustry;
          this.data.startDate = res.businessData.startDate;
          this.data.empContractCount = res.businessData.empContractCount;
          this.data.businessPhone = res.businessData.businessPhone;
          this.data.businessAddress = res.businessData.businessAddress;
          this.data.city = res.businessData.city;
          this.data.state = res.businessData.state;
          this.data.zipCode = res.businessData.zipCode;
          this.data.businessStructure = res.businessData.businessStructure;
          this.data.businessIndustry = res.businessData.businessIndustry;
          this.data.businessBipocowned = (res.businessData.businessBipocowned=='null')?null:res.businessData.businessBipocowned;
          this.data.lastYearRevenue = res.businessData.lastYearRevenue;
          this.data.taxExempt = res.businessData.taxExempt;
          this.data.taxExemptNumber = res.businessData.taxExemptNumber;
          this.data.certifyuseofloan =(res.certifyuseofloan[0]['certifyUseofLoan']=='Yes')? true:false;
          this.data.legalName =res.businessData.legalName
        }
      })
  }

  //google maps API
  public handleAddressChange(address: any) {
    
    this.data.businessAddress = address.formatted_address;
    for (const component of address.address_components) {
      const componentType = component.types[0];

      switch (componentType) {

        case "postal_code": {
          this.data.zipCode = `${component.long_name}`;
          break;
        }

        // case "postal_code_suffix": {
        //   this.data.zipCode = `${this.data.zipCode}-${component.long_name}`;
        //   break;
        // }

        case "locality":
          this.data.city = component.long_name;
          break;

        case "administrative_area_level_1": {
          this.data.state = component.long_name;
          break;
        }
      }

    }

   // console.log('=====',this.data.zipCode)
    if(this.data.zipCode==undefined){
      this.ziphide = true
    }

  }

  isFileAllowed(fileName: string) {
    let isFileAllowed = false;
    const allowedFiles = ['.pdf', '.jpg', '.jpeg', '.png', '.docx'];
    const regex = /(?:\.([^.]+))?$/;
    const extension = regex.exec(fileName);
    if (undefined !== extension && null !== extension) {
      for (const ext of allowedFiles) {
        if (ext === extension[0]) {
          isFileAllowed = true;
        }
      }
    }
    return isFileAllowed;
  }
  namedata(data) {
    //   data.target.value = data.target.value.replace(/[^A-Za-z.]/g, '');
    //  return data.target.value ? data.target.value.charAt(0).toUpperCase() +data.target.value.substr(1).toLowerCase() : '';
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
  validateConfirmdigits(e,val){
    if(val.length < 14){
      this.hidedigiterr=true
    }else{
      this.hidedigiterr=false
    }
  }

  completed() {
    this.message = [];
    //console.log(this.data.certifyuseofloan)

    if (this.data.taxId && this.data.businessIndustry && this.data.businessBipocowned && 
      this.data.startDate && this.data.empContractCount && this.data.businessPhone &&
       this.data.lastYearRevenue && this.data.businessAddress && this.data.city &&
        this.data.state && this.data.zipCode && this.data.taxExempt && this.data.certifyuseofloan) {

      this.businessDuration = this.getBusinessStartDuration(this.data.startDate);
      this.businessDuration === false ? this.message.push(`You've indicated that your business was started in the last 3 years. Is this correct?
      `) : null;

      this.restrictedIndustry = this.getRestrictedIndustry(this.data.businessIndustry);
      this.restrictedIndustry === false ? this.message.push(`You've indicated that ${this.data.legalName}’s industry is ${this.data.businessIndustry}. Is this correct?
      `) : null;

      // const formData = new FormData();

      // for (var i = 0; i < this.fileitems.length; i++) {
      // if(!this.fileitems[i]['documentType'] || this.fileitems[i]['documentType']==''){
      //   this.message = ['Please select the document type for all documents'];
      //   return false;
      // }
      //   formData.append("documentTypes[]", this.fileitems[i].documentType);
      //   formData.append("files[]", this.fileitems[i]);
      // }
      // formData.append('loanId', this.data.loanId)
      // formData.append('taxId', this.data.taxId)
      // formData.append('naicsCode', this.data.naicsCode,)
      // formData.append('startDate', this.data.startDate,)
      // formData.append('empContractCount', this.data.empContractCount)
      // formData.append('businessPhone', this.data.businessPhone)
      // formData.append('businessAddress', this.data.businessAddress)
      // formData.append('city', this.data.city)
      // formData.append('state', this.data.state)
      // formData.append('zipCode', this.data.zipCode,)
      // formData.append('businessStructure', this.data.businessStructure)
      // formData.append('businessIndustry', this.data.businessIndustry)
      // formData.append('lastYearRevenue', this.data.lastYearRevenue)
      // formData.append('taxExempt', this.data.taxExempt)
      // formData.append('taxExemptNumber', this.data.taxExemptNumber)
      
      if ((this.data.taxId).length != 10) {
        this.toastrService.error('Please provide 9-digit number in BUSINESS TAX ID (EIN)');
        return;
      }

      if ((this.data.businessPhone).length < 14) {
        this.toastrService.error('Please provide 10-digit number in BUSINESS PHONE');
        return;
      }
      if (this.data.taxExempt == 'Y' && (this.fileitems.length == 0 && this.preFilesItems.length == 0)) {
        this.toastrService.error('Kindly Upload Tax Exempt Certificate');
        return;
      }
      if (this.businessDuration === false || this.restrictedIndustry === false) {
        this.modalRef = this.modalService.show(this.messagebox);
        return;
      }

      this.submitApi();

      // this.service.files("business-verification", 'sales', formData)
      //   .pipe(first())
      //   .subscribe(res => {
      //     if (res['statusCode'] == 200) {
      //       this.router.navigate(['sales/plaid']);
      //     }
      //     else {
      //       console.log("Failure")
      //     }
      //   }, err => {
      //     console.log(err)
      //   })

    } else {
      // console.log("check")
      //commit changes for Frontend Credit Application Form: Validation and Toast Messages
     this.toastrService.error('Fill all the details!')
    }
  }

  submitApi() {
    if (this.businessDuration === false || this.restrictedIndustry === false) {
      this.modalRef.hide();
    }
    const formData = new FormData();

    for (var i = 0; i < this.fileitems.length; i++) {
      formData.append("documentTypes[]", this.fileitems[i].documentType);
      formData.append("files[]", this.fileitems[i]);
      formData.append('services',this.fileitems[i].services)
      //console.log('-1--',this.fileitems[i])
    }

    for (var i = 0; i < this.taxReturnsFileitems.length; i++) {
      formData.append("documentTypes[]", this.taxReturnsFileitems[i].documentType);
      formData.append("files[]", this.taxReturnsFileitems[i]);
      formData.append('services',this.taxReturnsFileitems[i].services);
     // console.log('-2--',this.taxReturnsFileitems[i])//
    }
    this.certifyuseofloan = (this.data.certifyuseofloan==true)?'Yes':'No'

    formData.append('loanId', this.data.loanId)
    formData.append('taxId', this.data.taxId)
    formData.append('naicsCode', this.data.naicsCode,)
    formData.append('startDate', this.data.startDate,)
    formData.append('empContractCount', this.data.empContractCount)
    formData.append('businessPhone', this.data.businessPhone)
    formData.append('businessAddress', this.data.businessAddress)
    formData.append('city', this.data.city)
    formData.append('state', this.data.state)
    formData.append('zipCode', this.data.zipCode,)
    formData.append('businessStructure', this.data.businessStructure)
    formData.append('businessIndustry', this.data.businessIndustry)
    formData.append('businessBipocowned', this.data.businessBipocowned)
    formData.append('lastYearRevenue', this.data.lastYearRevenue)
    formData.append('taxExempt', this.data.taxExempt)
    formData.append('taxExemptNumber', this.data.taxExemptNumber)
    formData.append('certifyuseofloan',this.certifyuseofloan)


    //console.log('FORM---DATA',formData.append)
    this.service.files("business-verification", 'sales', formData)
      .pipe(first())
      .subscribe(res => {
        // console.log("pass", res)
        if (res['statusCode'] == 200) {
          this.router.navigate(['sales/plaid']);
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
          console.log("Failure")
        }
      }, err => {
        console.log(err)
      })
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {

      // Is it a file?
      let validFile = this.isFileAllowed(droppedFile.fileEntry.name)
      if (droppedFile.fileEntry.isFile && validFile) {
        this.listfiles.push(this.files)
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Here you can access the real file
          //console.log(droppedFile.relativePath, file);
          file["services"] = "businessVerification/upload"
          this.fileitems.push(file)
          let msg = file.name+" is Added Successfully!";
          this.toastrService.success(msg)

          /**
          // You could upload it like this:
          const formData = new FormData()
          formData.append('logo', file, relativePath)

          // Headers
          const headers = new HttpHeaders({
            'security-token': 'mytoken'
          })

          this.http.post('https://mybackend.com/api/upload/sanitize-and-save-logo', formData, { headers: headers, responseType: 'blob' })
          .subscribe(data => {
            // Sanitized logo returned from backend
          })
          **/

        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        //console.log(droppedFile.relativePath, fileEntry);
        if (!validFile) {
          this.toastrService.error("File format not supported! Please drop .pdf, .jpg, .jpeg, .png, .docx files")
        }
      }
    }
    //console.log(this.listfiles)
  }

  public twoyeartax(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {

      // Is it a file?
      let validFile = this.isFileAllowed(droppedFile.fileEntry.name)
      if (droppedFile.fileEntry.isFile && validFile) {
        this.listfiles.push(this.files)
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Here you can access the real file
          //console.log(droppedFile.relativePath, file);
          file["services"] = "businessVerification/taxreturn/upload"
          this.taxReturnsFileitems.push(file)  
          let msg = file.name+" is Added Successfully!";
          this.toastrService.success(msg)
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        //console.log(droppedFile.relativePath, fileEntry);
        if (!validFile) {
          this.toastrService.error("File format not supported! Please drop .pdf, .jpg, .jpeg, .png, .docx files")
        }
      }
    }
    //console.log(this.listfiles)//
  }

  public fileOver(event) {
    // console.log(event);
  }

  public fileLeave(event) {
    // console.log(event);
  }

  selectDocType(i, event) {
    if (event.target.value != 'Other') {
      $(event.target).next('input').attr('hidden', 'hidden')
      this.fileitems[i]['documentType'] = event.target.value;
    } else {
      this.fileitems[i]['documentType'] = '';
      $(event.target).next('input').removeAttr('hidden')
    }
  }

  docTypeComment(i, value) {
    this.fileitems[i]['documentType'] = value;
  }

  deleteFileSelected(file) {
    console.log("file", file);
    this.fileitems.splice(this.fileitems.findIndex(f => f.name == file.name), 1);
  }

  deleteFileSelectedTax(file) {
    console.log("file", file);
    this.taxReturnsFileitems.splice(this.taxReturnsFileitems.findIndex(f => f.name == file.name), 1);
  }

  deletePreFileSelected(file) {
    let charr = file.filename.split("/");
    this.preFilesItems.splice(this.preFilesItems.indexOf(file), 1);
    this.service.post("business-verification/files/" + charr[charr.length - 1], 'sales', file)
      .pipe(first())
      .subscribe((res: any) => {
        if (res.statusCode == 200) {
          return
        }
      })
  }

  deleteTaxPreFileSelected(file) {
    let charr = file.filename.split("/");
    this.taxReturnsFileitems.splice(this.taxReturnsFileitems.indexOf(file), 1);
    this.service.post("business-verification/files/" + charr[charr.length - 1], 'sales', file)
      .pipe(first())
      .subscribe((res: any) => {
        if (res.statusCode == 200) {
          return
        }
      })
  }

  close(): void {
    this.modalRef.hide();
  }

  getBusinessStartDuration(startDate) {
    const currDate = new Date();
    const businessStartDate = new Date(startDate);
    const time_difference = currDate.getTime() - businessStartDate.getTime();
    const days_difference = Math.round(time_difference / (1000 * 60 * 60 * 24));
    return days_difference > 1095 ? true : false;
  }

  getRestrictedIndustry(businessIndustry) {
    const restrictedIndustryArray = [
      'Adult Entertainment / Materials',
      'Cannabis',
      'Casino / Lottery / Raffles',
      'Firearms',
      'Farming & Agriculture',
      'Horoscope / Fortune Telling',
      'Money Services Business (MSB)',
      'Rooming & Boarding House',
    ];

    const industryResult = restrictedIndustryArray.includes(businessIndustry);
    return industryResult ? false : true;
  }

}
