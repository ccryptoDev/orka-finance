import { Component, ElementRef, OnInit,TemplateRef,ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { Router } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { environment } from '../../../environments/environment';
import { DatePipe } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountNumberValidator } from 'src/app/_service/custom.validator';
import { FileSystemDirectoryEntry, FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { ToastrService } from "ngx-toastr";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FinanceInatance,EquifaxInstance } from '../../_service/common.service';
import { TabsetComponent } from 'ngx-bootstrap/tabs';



@Component({
  selector: 'app-approveddetails',
  templateUrl: './approveddetails.component.html',
  styleUrls: ['./approveddetails.component.scss']
})
export class ApproveddetailsComponent implements OnInit {
  @ViewChild('staticTabs', { static: true }) staticTab: TabsetComponent;
  @ViewChild('messagebox', { read: TemplateRef }) messagebox: TemplateRef<any>;
  objectKeys = Object.keys;
  loanId = this.route.snapshot.paramMap.get('id');
  data: any={
    answers:[],
    CoApplicant:[],
    files:[],
    from_details:[],
    paymentScheduleDetails:[],
    paymentTransaction:[],
    remainingPayments:[],
    fundedTransactions:[],
    fundedPercentage: [],
    userConsentDoc:[],
    attributes:[],
    filter_att:[],
    model_filter:[]
  };
  modalRef: BsModalRef;
  message: any = [];
  payment: any = [];
  manualBankAddFields = {};
  cm = {};
  rawconsumer_data: any;
  rawcommercial_data: any;
  res_comments: any = [];
  screenlogs: any = [];
  PSPS4129 = EquifaxInstance.PSPS4129;
  commonEquifaxRules = EquifaxInstance.commonEquifaxRules;
  OFACCommercialResponse: string;
  editNameFields = {};
  editStreetFields = {};
  editCityFields = {};
  editZipCodeFields = {};
  bankAddForm: FormGroup;
  fSubmitted = false;
  tabs: any = {
    "Loan Ops Review":false,
    "User Information":false,
    "Credit Report":false,
    "Payment Schedule":false,
    "Bank Accounts":false,
    "Document Center":false,
    "Comments":false,
    "Log":false
  };
  financingTabamnt: any;
  changeamnt: any;
  bankaccounts: any = [];
  bankhistoricalbalance: any = [];
  files: NgxFileDropEntry[] = [];
  listfiles: any = [];
  fileitems: any = [];
  data_sales_contract: any = {
    files: [],
  };
  filetype_salesitems_val: string;
  filetype_salesitems_val_res: string;
  creditDataRes: any = null;
  creditData: any = null;
  paynetReport: any = null;
  equifaxConsumerReport: any;
  equifaxCommercialReport: any;
  filetr_attributes: any = [
    {
    "identifier": "6036",
    "value": "000003553"
    },
    {
    "identifier": "6037",
    "value": "000003553"
    },
    {
    "identifier": "6038",
    "value": "000008792"
    },
    {
    "identifier": "6039",
    "value": "000003433"
    },
  ];
  minbalance: any;
  showFiles: string;
  checkType: any;
  urlSafe: any;
  f1: any = {};
  f2: any= {};
  taxarray: any = [];
  setReport_one: any = null;
  financingTab: any = [];
  financialquestion: any = [];
  loanProducts: any = [];
  RuleStatus: string;
  data_replace_res: any = {};
  data_tax_res: any = {};
  data_tax_res1: any = {};
  complyadvantageAdverseMedia: any = false;
  amlTypes: any = false;
  ofacSdnList: any = false;
  complyUrl: any;
  middeskData: any = [];
  complyAdvantageReport: any;
  urlSafeComplyAdvantage: any;
  statedIncome: any = [];
  updateincomeVerifiedv: string;
  rulestatus: string;
  data_change_status: any = {};
  sales_items: any = [];
  service_name: string
  taxrulestatus: string;
  loanstatuschanged: any = [];
  data_res: any = {}
  fileNames: any = [];
  checkarr: boolean = false;
  middeskPullTried = false;
  incomeVerificationPassed = false;
  kycEquifaxPassed = false;
  kycComplyAdvandagePassed = false;
  kybEquifaxPassed = false;
  middeskReportPassed = true;
  requestForInformationData = {
    'Tax documents needed' : { text: 'Please provide the last two years of tax returns for your business' , status: false },
    'Confirm property ownership' : { text: 'Please provide proof that you own your property (e.g., most recent mortgage statement or other proof of ownership)' , status: false },
    'Business financials needed' : { text: 'Please provide the last two years, including YTD if available, of financials for your business	' , status: false },
    'Income verification' : { text: 'Please provide your W2 or paystub for the last 2 months' , status: false },
    'Other 1' : { text: '' , status: false },
    'Other 2' : { text: '' , status: false },
    'Other 3' : { text: '' , status: false }
  };

  constructor(
    public datePipe: DatePipe,
    private route: ActivatedRoute,
    private service: HttpService,
    public router:Router,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private toastrService: ToastrService,
    private sanitizer: DomSanitizer,
  ) {}

  get f(): { [key: string]: AbstractControl } {
    return this.bankAddForm.controls;
  }

  ngOnInit(): void {
    let pages = sessionStorage.getItem('pages');
    let tabs = sessionStorage.getItem('tabs');

    if (pages) {
      pages = JSON.parse(pages);

      for (let i = 0; i < pages.length; i++) {
        if (pages[i]['name'] == 'Approved Application') {
          if (tabs) {
            tabs = JSON.parse(tabs);

            for (let j = 0; j < tabs[pages[i]['id']].length; j++) {
              this.tabs[tabs[pages[i]['id']][j]['name']] = true;
            }

            i = pages.length + 1;
          }
        }
      }
    }

    this.bankAddForm = this.formBuilder.group({
      bankName: ['', Validators.required],
      holderName: ['', Validators.required],
      routingNumber: ['', [Validators.required, Validators.min(10000)]],
      accountNumber: ['', [Validators.required, Validators.min(1000000000)]],
      confmAccountNumber: ['', Validators.required]
    }, {validator: AccountNumberValidator});

    this.get(this.route.snapshot.paramMap.get('id'))
    this.getlogs()
    this.getbankaccounts(this.route.snapshot.paramMap.get('id'))
    this.gethistoricalbalance(this.route.snapshot.paramMap.get('id'))
    this.getallfiles();
    this.getComplyAdvantage(this.route.snapshot.paramMap.get('id'))
    this.getMiddesk(this.route.snapshot.paramMap.get('id'))
    this.getLoanopsReview(this.route.snapshot.paramMap.get('id'))
  }

  selectTab(tabId: number) {
    //console.log("newck--->",tabId,  this.staticTab)
    this.staticTab.tabs[tabId].active = true;
  }

  manualBankAddModel(manualBankAddTemp:TemplateRef<any>){
    this.modalRef = this.modalService.show(manualBankAddTemp)
  }

  manualBankAdd(){
    this.fSubmitted = true;
    if (this.bankAddForm.invalid) {
      return;
    }

    this.bankAddForm.value.user_id=this.data.from_details[0].user_id;
    //console.log('bankAddForm.value', this.bankAddForm.value);

    this.service.authpost('pending/manualbankadd','admin',this.bankAddForm.value)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        //console.log('data', res['data']);
        this.bankAddFormClose();
        this.addlogs('Bank account added', this.loanId)
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(this.messagebox);
    })
  }

  bankAddFormClose(){
    this.modalRef.hide();
    this.fSubmitted = false;
    this.bankAddForm.reset()
  }

  pay(){

    let date = new Date(this.data['from_details'][0]?.['createdAt'])
    this.payment.push({
      createdAt:this.dt(date),
      loan_advance:this.data['from_details'][0]['loanAmount'],
      payOffAmount:this.data['from_details'][0]['loanAmount'],
      apr:this.data['from_details'][0]['apr'],
      loantermcount:this.data['from_details'][0]['loanTerm'],
      maturityDate:this.dt(new Date(new Date(this.data['from_details'][0]['createdAt']).setMonth(new Date(this.data['from_details'][0]['createdAt']).getMonth()+12))),
      nextPaymentSchedule:this.dt(new Date(new Date(this.data['from_details'][0]['createdAt']).setMonth(new Date(this.data['from_details'][0]['createdAt']).getMonth()+1))),
    })
  }

  round(x) {
    return Math.round(x*100)/100;
  }

  dt(today){
    var dd:any = today.getDate();

    var mm:any = today.getMonth()+1;
    var yyyy = today.getFullYear();
    if(dd<10)
    {
      dd='0'+dd;
    }

    if(mm<10)
    {
      mm='0'+mm;
    }
    return mm+'-'+dd+'-'+yyyy;
  }

  isobject(val){
    //alert('1233')

    return typeof val === 'object';


  }

  get(id){
    this.service.authget('approved/'+id,'admin')
    .pipe(first())
    .subscribe(res=>{
      //this.addlogs("view load",id)
      if(res['statusCode']==200){
        this.data = res['data'];

        const consumerCreditReport = this.data.equifaxReport.find(xx => xx.reportType == 'equifax-consumer');
        const commercialCreditReport = this.data.equifaxReport.find(xx => xx.reportType == 'equifax-comercial-set2');

        this.equifaxConsumerReport = consumerCreditReport ? JSON.parse(consumerCreditReport.report) : consumerCreditReport;
        this.equifaxCommercialReport = commercialCreditReport ? JSON.parse(commercialCreditReport.report) : commercialCreditReport;

        if (this.equifaxConsumerReport) {
          this.kycEquifaxPassed = this.equifaxConsumerReport.Rules.every((rule) => rule.RuleStatus === 'PASS' || rule.RuleStatus === 'BYPASS');
          this.data.filter_att = this.filetr_attributes;

          if (this.equifaxConsumerReport.equaifax.consumers.equifaxUSConsumerCreditReport[0].models) {
            this.data.model_filter = this.equifaxConsumerReport.equaifax.consumers.equifaxUSConsumerCreditReport[0].models.filter(xx => xx.modelNumber == '05453');
            this.data.model_filter2 = this.equifaxConsumerReport.equaifax.consumers.equifaxUSConsumerCreditReport[0].models.filter(xx => xx.modelNumber == '04129');
            this.data.model_filter_array = this.data.model_filter.concat(this.data.model_filter2);
          } else {
            this.data.model_filter_array = [];
          }
        }

        if(this.equifaxCommercialReport) {
          this.kybEquifaxPassed = this.equifaxCommercialReport.Rules.every((rule) => rule.RuleStatus === 'PASS' || rule.RuleStatus === 'BYPASS');

          if (this.equifaxCommercialReport.equaifax.EfxTransmit.OFACCommercialResponse) {
            this.OFACCommercialResponse = this.equifaxCommercialReport.equaifax.EfxTransmit.OFACCommercialResponse.split("\n");
          }

          if (this.equifaxCommercialReport.equaifax.EfxTransmit.CommercialCreditReport && !this.equifaxCommercialReport.equaifax.EfxTransmit.CommercialCreditReport[0]) {
            this.equifaxCommercialReport.equaifax.EfxTransmit.CommercialCreditReport = [this.equifaxCommercialReport.equaifax.EfxTransmit.CommercialCreditReport];
          }
        }

        this.data.attributes = this.PSPS4129;

        this.pay();
        this.getcomments();

        this.editNameFields['firstName'] = this.data.from_details[0]["firstname"];
        this.editNameFields['lastName'] = this.data.from_details[0]["lastname"];
        this.editStreetFields['streetAddress'] = this.data.from_details[0]["streetAddress"];
        this.editCityFields['city'] = this.data.from_details[0]["city"];
        this.editZipCodeFields['zipCode'] = this.data.from_details[0]["zipCode"];
      }else{
        console.log(res['error'])
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
        this.router.navigate(['admin/approved']);
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(this.messagebox);
      this.router.navigate(['admin/approved']);
    })
  }

  Pending(){
    let id = this.route.snapshot.paramMap.get('id')
    this.service.authget('denied/pending/'+id,'admin')
    .pipe(first())
    .subscribe(res=>{
      this.addlogs("Move to pendings",id)
      if(res['statusCode']==200){
        this.router.navigate(['admin/pendings/'+id]);
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(this.messagebox);
    })
  }

  view(showFile: TemplateRef<any>,filename){
    filename = filename.split('/')
    filename = filename[filename.length-1]
    
    this.showFiles = environment.adminapiurl + "files/download/" + filename;
    this.service
      .authgetfile(`files/download/${filename}`, 'admin')
      .pipe(first())
      .subscribe(async (res) => {
        console.log(res);

        this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(new Blob([res], { type: 'application/pdf' })));
        this.checkType = filename.split('.')[1];
        this.modalRef = this.modalService.show(showFile)
      });
  }

  close(): void {
    this.modalRef.hide();
  }

  getcomments(){
    let id = this.route.snapshot.paramMap.get('id')
      this.service.authget('pending/getcomments/'+id,'admin')
      .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){
          this.res_comments = res['data']

        }else{
          this.message = res['message']
          this.modalRef = this.modalService.show(this.messagebox);
        }
      },err=>{
        if(err['error']['message'].isArray){
          this.message = err['error']['message']
        }else{
          this.message = [err['error']['message']]
        }
        this.modalRef = this.modalService.show(this.messagebox);
      })
  }

  addcomments(msgbox:TemplateRef<any>){
    this.cm['loan_id'] = this.route.snapshot.paramMap.get('id')
    this.cm['user_id'] = JSON.parse(sessionStorage.getItem('resuser'))['id']
    this.service.authpost('pending/addcomments','admin',this.cm)
    .pipe(first())
    .subscribe(res=>{
      this.addlogs("Add Some comments",this.cm['loan_id'])
      if(res['statusCode']==200){
        this.message = ['Comments Added']
        this.modalRef = this.modalService.show(msgbox);
        this.getcomments()
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(msgbox);
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(this.messagebox);
    })
  }

  getlogs(){
    let id = this.route.snapshot.paramMap.get('id')
    this.service.authget('approved/getlogs/'+id,'admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.screenlogs = res['data']
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(this.messagebox);
    })
  }

  addlogs(module,id){
    this.service.addlog(module,id,'admin').subscribe(res=>{},err=>{})
  }

  editUserName(firstName, lastName){
    this.editNameFields["firstName"]=firstName
    this.editNameFields["lastName"]=lastName
    this.service.authput('customer/editusername/'+this.data.from_details[0].id, 'admin', this.editNameFields)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.data.from_details[0]["firstName"] = this.editNameFields["firstName"]
        this.data.from_details[0]["lastName"] = this.editNameFields["lastName"]
        this.close();
        this.addlogs("User Name Edited",this.loanId);
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(this.messagebox);
    })
  }

  editUserStreetAddress(streetAddress){
    this.editStreetFields["streetAddress"]=streetAddress
    this.service.authput('customer/editstreetaddress/'+this.data.from_details[0].user_id, 'admin', this.editStreetFields)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.data.from_details[0]["streetAddress"] = this.editStreetFields["streetAddress"]
        this.close();
        this.addlogs("Street Address Edited",this.loanId);
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(this.messagebox);
    })
  }

  editUserCity(city){
    this.editCityFields["city"]=city
    this.service.authput('customer/editusercity/'+this.data.from_details[0].user_id, 'admin', this.editCityFields)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.data.from_details[0]["city"] = this.editCityFields["city"]
        this.close();
        this.addlogs("City Edited",this.loanId);
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(this.messagebox);
    })
  }

  editUserZipCode(zipCode){
    this.editZipCodeFields["zipCode"]=zipCode
    this.service.authput('customer/edituserzipcode/'+this.data.from_details[0].user_id, 'admin', this.editZipCodeFields)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.data.from_details[0]["zipCode"] = this.editZipCodeFields["zipCode"]
        this.close();
        this.addlogs("Zip Code Edited",this.loanId);
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(this.messagebox);
    })
  }

  showUserNameEditModel(userNameEditTemp:TemplateRef<any>){
    this.modalRef = this.modalService.show(userNameEditTemp)
  }

  showStreetAddressEditModel(streetAddressEditTemp:TemplateRef<any>){
    this.modalRef = this.modalService.show(streetAddressEditTemp)
  }

  showCityEditModel(cityEditTemp:TemplateRef<any>){
    this.modalRef = this.modalService.show(cityEditTemp)
  }

  showZipCodeEditModel(zipCodeEditTemp:TemplateRef<any>){
    this.modalRef = this.modalService.show(zipCodeEditTemp)
  }

  getbankaccounts(id) {
    this.service.authget('plaid/accounts/' + id, 'admin').subscribe(res => {
     // console.log('result',res['data'],res)
      if (res['statusCode'] == 200) {
        this.bankaccounts = res['data']

        //console.log('bankaccounts---',this.bankaccounts)
      }else{
        this.bankaccounts.length=0
      }
    }, err => {
      console.log(err)
    })
  }

  gethistoricalbalance(id) {
    this.service.authget('plaid/get-assets-display/' + id, 'admin').subscribe(res => {
      if (res['statusCode'] == 200) {
        this.bankhistoricalbalance = res['data'];
        this.minbalance=res['minBalance'];
       // console.log('bankaccountshistorical---',res['minBalance'])
      }
    }, err => {
      console.log(err)
    })
  }

  sendbanklogin(){
    let id = this.route.snapshot.paramMap.get('id')
    this.service.authget('plaid/requestBank/'+id, 'admin').subscribe(res=>{
      if(res['statusCode']==200){
        this.message = ['Mail Successfully Sent']
        this.modalRef = this.modalService.show(this.messagebox);
      }
    },err=>{
      console.log(err)
    })
  }

  isFileAllowed(fileName: string) {
    let isFileAllowed = false;
    const allowedFiles = ['.pdf', '.jpg', '.jpeg', '.png'];
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

  dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {

      // Is it a file?
      if (droppedFile.fileEntry.isFile && this.isFileAllowed(droppedFile.fileEntry.name)) {
        this.listfiles.push(this.files)
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Here you can access the real file
         // console.log(droppedFile.relativePath, file);
          this.fileitems.push(file)

        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        //console.log(droppedFile.relativePath, fileEntry);
      }
    }
    console.log(this.listfiles)
  }

  fileOver(event){
   // console.log(event);
  }

  fileLeave(event){
   // console.log(event);
  }

  selectDocType(i, event){
    if(event.target.value!='Other'){
      $(event.target).next('input').attr('hidden', 'hidden')
      this.fileitems[i]['documentType']=event.target.value;
    }else{
      this.fileitems[i]['documentType']='';
      $(event.target).next('input').removeAttr('hidden')
    }
  }

  docTypeComment(i, value){
    this.fileitems[i]['documentType']=value;
  }

  upoadDocuments(){
    const formData = new FormData();
    formData.append('loan_id',this.route.snapshot.paramMap.get('id'))
    for (var i = 0; i < this.fileitems.length; i++) {
      if(!this.fileitems[i]['documentType'] || this.fileitems[i]['documentType']==''){
        this.message = ['Please select the document type for all documents'];
        this.modalRef = this.modalService.show(this.messagebox);
        return false;
      }
      formData.append("documentTypes[]", this.fileitems[i].documentType);
      formData.append("files[]", this.fileitems[i]);
    }

    this.service.authfiles("uploads","admin",formData)
      .pipe(first())
      .subscribe(res=>{
        this.addlogs("Uploaded documents",this.route.snapshot.paramMap.get('id'))
        if(res['statusCode']==200){
         // console.log(res['data']['files']);

          this.data['files'] = res['data']['files'];
          this.files = []
          this.listfiles = []
          this.fileitems = []
        }
      },err=>{
        console.log(err)
      })
  }

  upoadDocumentsOwnertype() {
    console.log(this.data_replace_res.length)

    this.service_name='admin/ownertypeDocuments';
      const formData = new FormData();
      formData.append('loan_id', this.loanId);
  
      for (var i = 0; i < this.sales_items.length; i++) {
        formData.append('files[]', this.sales_items[i]);
        formData.append('services', this.service_name);
        formData.append("documentTypes[]", '');
      }
  
      if (this.data_replace_res.length == 0) {
        this.service
          .authfiles('uploads', 'admin', formData)
          .pipe(first())
          .subscribe(
            (res) => {
              if (res['statusCode'] == 200) {
                this.toastrService.success('File Uploaded Successfully!');
                //this.getallfiles();
                this.files = [];
                this.listfiles = [];
                this.fileitems = [];
              } else {
                this.toastrService.error('File Uploading Error!');
              }
            },
            (err) => {
              this.toastrService.error('File Uploading Error!');
              if (err['error']['message'].isArray) {
                this.message = err['error']['message'];
              } else {
                this.message = [err['error']['message']];
              }
              this.modalRef = this.modalService.show(this.messagebox);
            }
          );
      } else {
        let fname_replace = this.data_replace_res[0].filename.split('/')[2];
        this.service
          .authfiles('uploads/replace/' + fname_replace, 'admin', formData)
          .pipe(first())
          .subscribe(
            (res) => {
              if (res['statusCode'] == 200) {
                this.toastrService.success('File Replaced Successfully!');
                //console.log('********',res)
               // this.getallfiles();
                this.files = [];
                this.listfiles = [];
                this.fileitems = [];
                
              }
            },
            (err) => {
              if (err['error']['message'].isArray) {
                this.message = err['error']['message'];
              } else {
                this.message = [err['error']['message']];
              }
              this.modalRef = this.modalService.show(this.messagebox);
            }
          );
      }
  }

  deleteFileSelected(file){
    this.fileitems.splice(this.fileitems.findIndex(f=>f.name==file.name), 1);
  }

  rePullBankAccounts(){
    let id = this.route.snapshot.paramMap.get('id')
    this.service.authget('plaid/accountsRepull/'+id, 'admin').subscribe(res=>{
      if(res['statusCode']==200){
        this.bankaccounts = res['data']
      }
    },err=>{
      console.log(err)
    })
  }

  getattvalcode(a:any,data:any){
    for(let i= 0 ; i<data.length; i++) {
      if(a==data[i].code) {
        return data[i].value;
      }

    }
  }

  getattFiltervalcode(a:any,data:any){
    //let b='--'
    for(let i= 0 ; i<data.length; i++) {
      if(a==data[i].code) {
        return data[i].value;
      }

    }
  }

  isObjectEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  changeAmtVal(value){


    if(value) {
      let c= value.split('.')
      //console.log(c)
  
      let res= c[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      let resVal =(c[1]==undefined)?'':'.'+c[1]
      //console.log(resVal)
      return res+resVal
    } else {
      return ""
    }
    
  }

  salesitems(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const salesitemsFile of files) {
      let validFile = this.isFileAllowed(salesitemsFile.fileEntry.name);
      if (salesitemsFile.fileEntry.isFile && validFile) {
        this.listfiles.push(this.files);
        const fileEntry_sales = salesitemsFile.fileEntry as FileSystemFileEntry;
        fileEntry_sales.file((file: File) => {
          file["services"] = "admin/ownerVerifiedDocuments";
          this.sales_items.push(file);
          //console.log(this.eqipment_items)
          this.data_sales_contract.files.length = 0;
          this.filetype_salesitems_val = this.sales_items[0].name.split('.');
          this.filetype_salesitems_val_res = this.filetype_salesitems_val[1];
          //console.log(this.filetype_salesitems_val_res,'458888')
          this.fileNames.push(salesitemsFile.relativePath);
          let msg = file.name + " File added successfully";
          this.toastrService.success(msg)
        });
      } else {
        const fileEntry_equip = salesitemsFile.fileEntry as FileSystemDirectoryEntry;
        if (!validFile) {
          this.toastrService.error(
            'File format not supported! Please drop .pdf, .jpg, .jpeg, .png, .docx files'
          );
        }
      }
    }
  }

  getallfiles() {
    let getlistfiles = this.service.authget(
      'uploads/allFiles/' + this.loanId,
      'admin'
    );
    getlistfiles.pipe(first()).subscribe(
      (res) => {
        //console.log('listFiles',res,this.loanId)
        this.data_replace_res = res['fileData'].filter(
          (xx) => xx.services == 'admin/ownertypeDocuments'
        );
        

        this.data_tax_res = res['fileData'].filter(
          (xx) => xx.services == 'businessVerification/taxreturn/upload'
        );

        this.data_tax_res1 = res['fileData'].filter(
          (xx) => xx.services == 'businessVerification/upload'
        );

        this.taxarray = this.data_tax_res.concat(this.data_tax_res1)
      },
      (err) => {
        console.log(err);
      }
    );
  }

  namedata(data){
    //   data.target.value = data.target.value.replace(/[^A-Za-z.]/g, '');
    //  return data.target.value ? data.target.value.charAt(0).toUpperCase() +data.target.value.substr(1).toLowerCase() : '';
    return data.target.value;
  }

  keyPressNumbers(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode != 46 && charCode > 31 
    && (charCode < 48 || charCode > 57)){
      return false;
    }
    return true;
  }

  checkHeaderVariables() {
    this.incomeVerificationPassed = (
      this.statedIncome[0].requiredToVerifyStatedIncome === '0' ||
      this.loanstatuschanged[0].incomeVerified === 'Yes'
    );
  }

  getLoanopsReview(id){
    this.service
      .authget(`decision-service/loanops/${id}`, 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.financingTab = res['financingTab'];
            this.f1.updateincomeVerifiedvs = this.financingTab[0].incomeVerifiedAmount;
            this.financialquestion = res['financialQuestions'];
            this.loanProducts = res['productsLending'];
            this.loanstatuschanged = res['installer_id'];
            this.f1.ownershipType = res['financingTab'][0].ownershipConfirmed;
            
            if (res['financingTab'][0].ownershipConfirmed==this.financialquestion[0].ownershipType) {
              this.rulestatus='Pass';
            } else {
              this.rulestatus='Fail';
            }

            if (this.financingTab[0].requestedInformations) {
              this.requestForInformationData = JSON.parse(this.financingTab[0].requestedInformations);
            }

            if (this.loanProducts.length > 0) {
              this.statedIncome = this.loanProducts.filter((xx) => xx.productName == this.financingTab[0].productName);
            }

            if (this.loanstatuschanged[0].taxDocumentsVerified=='Yes') {
              this.taxrulestatus = 'Pass';
            } else if (this.loanstatuschanged[0].taxDocumentsVerified == null) {
              this.taxrulestatus = '';
            } else {
              this.taxrulestatus = 'Fail';
            }
            
            this.financingTabamnt = this.financingTab[0].financingRequested?.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            this.changeamnt = this.financingTab[0].originationFee?.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

            this.checkHeaderVariables();
          }
        },
        (err) => {
        if (err['error']['message'].isArray) {
          this.message = err['error']['message'];
        } else {
          this.message = [err['error']['message']];
        }

        this.modalRef = this.modalService.show(this.messagebox);
      });
  }

  removeString(c){
    let v= c.split(':')
    return v[1]
  }

  // to check if the key word in present in comply advantage or not
  keyExists(obj, key) {
    if (!obj || (typeof obj !== "object" && !Array.isArray(obj))) {
      return false;
    }
    else if (obj.hasOwnProperty(key)) {
      return true;
    }
    else if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const result = this.keyExists(obj[i], key);
        if (result) {
          return result;
        }
      }
    }
    else {
      for (const k in obj) {
        const result = this.keyExists(obj[k], key);
        if (result) {
          return result;
        }
      }
    }
    return false;
  };

  getMiddesk(loanId: string) {
    this.service
      .authget(`loans/${loanId}/middesk`, 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          const middesk: any = res;
          const middeskReport = JSON.parse(middesk.report).middesk;
          const tasksRuleKeysMap = new Map([
            ['Business legal name matches what was listed in credit app', ['name']],
            ['Business address matches what was listed in credit app', ['address_verification']],
            ['Certificate of Good Standing is present', ['sos_match', 'sos_active', 'sos_domestic']],
            ['Business is a US-based/owned business ', ['address_deliverability']],
            // ['NAICS Code is among those on ORKA\'s High Risk NAICS Codes list', ['']],
            ['Personal guarantors\' names match what was stated in credit app', ['person_verification']],
            ['OFAC check returns a hit', ['watchlist']],
            ['TIN is verified for the business', ['tin']]
          ]);

          for (const [rule, keys] of tasksRuleKeysMap) {
            const correspondingTasks = middeskReport.review.tasks.filter((task) => keys.includes(task.key));
            const taskMessages = [];
            const taskStatuses = [];
            const taskSubLabels = [];

            correspondingTasks.forEach((task) => {
              taskMessages.push(task.message);
              taskStatuses.push(task.status);
              taskSubLabels.push(task.sub_label);
            });

            this.middeskData.push({
              label: rule,
              message: taskMessages.join('; '),
              status: taskStatuses.every((status) => status === 'success') ? 'success' : 'failure',
              sub_label: taskSubLabels.join('; ')
            });

            if (this.middeskData[this.middeskData.length - 1].status !== 'success') {
              this.middeskReportPassed = false;
            }
          }
        },
        (err) => {
          const errorMessage = err.status === 500 ? 'Something went wrong' : err.error.message;

          this.toastrService.error(errorMessage);
        }
      )
  }

  updateloanIdstatus(id, val, m){
    if (this.f1.updateincomeVerifiedvs == null && this.f1.updateincomeVerifiedvs == undefined) {
      this.toastrService.error('Please enter Stated Income');

      return;
    }

    this.data_change_status.loanID = id;
    this.data_change_status.moduleName = m;
    this.data_change_status.status = val.target.checked == true ? 'Yes' : 'No';

    if (m == 'incomeverify') {
      this.data_change_status.incomeVerifiedAmount = this.f1.updateincomeVerifiedvs;
    }

   this.service
    .authpost('decision-service/loanops/setstatus', 'admin', this.data_change_status)
    .pipe(first())
    .subscribe(() => {
      this.getLoanopsReview(this.route.snapshot.paramMap.get('id'));
    });
  }

  getComplyAdvantage(loanId: string) {
    this.service.authget(`loans/${loanId}/comply-advantage`, 'admin')
      .pipe(first())
      .subscribe(
        (res: any) => {
          console.log(res);

          this.complyAdvantageReport = JSON.parse(res.report);

          console.log(this.complyAdvantageReport);

          this.urlSafeComplyAdvantage = this.sanitizer.bypassSecurityTrustResourceUrl(this.complyAdvantageReport.complyAdvantage.content.data.share_url);
          this.kycComplyAdvandagePassed = this.complyAdvantageReport.Rules.every((rule) => rule.RuleStatus === 'PASS');
      },
      (err) => {
        const errorMessage = err.status === 500 ? 'Something went wrong' : err.error.message;

        this.toastrService.error(errorMessage);
      });
  }

  changetaxDocumentsVerified(id,val,m){
    //console.log('111',c)
   if(val.target.checked==true){
      this.taxrulestatus='Pass';
    }else{
      this.taxrulestatus='Fail';
    }

    this.data_change_status.loanID=id
    this.data_change_status.moduleName=m
    this.data_change_status.status=(val.target.checked==true)?'Yes':'No'
    //this.data_change_status.incomeVerifiedAmount = this.f1.updateincomeVerifiedvs

   this.service.authpost('decision-service/loanops/setstatus','admin',this.data_change_status) .pipe(first())
    .subscribe(res=>{

      //console.log(res)
     // this.getLoanproduct_logs(this.data[0].user_id)

    },err=>{
      if(err['status']!=200)
      {

      }
    })
  }

  changeownerType(c){
    //console.log('111',c)
    if(c==this.financialquestion[0].ownershipType){
      this.rulestatus='Pass'
    }else{
      this.rulestatus='Fail'
    }

    this.data_change_status.loanID=this.loanId
    this.data_change_status.moduleName='ownershipConfirmed'
    this.data_change_status.status=c
    //this.data_change_status.incomeVerifiedAmount = this.f1.updateincomeVerifiedvs

   this.service.authpost('decision-service/loanops/setstatus','admin',this.data_change_status) .pipe(first())
    .subscribe(res=>{

      //console.log(res)
     // this.getLoanproduct_logs(this.data[0].user_id)

    },err=>{
      if(err['status']!=200)
      {

      }
    })
  }

  sendemailtext(id,val,m){

  }

  updateRequestInformationText(key, text){
      this.requestForInformationData[key]['text'] = text;
  }

  updateRequestInformationFlag(key, event){
    this.requestForInformationData[key]['status'] = event.target.checked;

    if(!event.target.checked && key.includes('Other')) {
      this.requestForInformationData[key]['text'] = "";
    }
  }

  submitSendEmail(){

    const newStatus = {
      loanID: this.loanId,
      status: JSON.stringify(this.requestForInformationData),
      moduleName: "requestedInformations"
    }
    this.service.authpost('decision-service/loanops/setstatus','admin',newStatus) .pipe(first()).subscribe(res=>{

      if(res['statusCode'] == 200){
        this.toastrService.success('Successfully updated');
        

        this.service.authpost('decision-service/loanops/sendRequestInfomationEmail/'+this.loanId,'admin',{}) .pipe(first()).subscribe(res=>{

          if(res['statusCode'] == 200){
            this.toastrService.success('Mail sent');
          }
    
        },err=>{
          if(err['status']!=200)
          {
            this.toastrService.error(err['message'])
          }
        })

      }

    },err=>{
      if(err['status']!=200)
      {
        this.toastrService.error(err['message'])
      }
    })
  }
}
