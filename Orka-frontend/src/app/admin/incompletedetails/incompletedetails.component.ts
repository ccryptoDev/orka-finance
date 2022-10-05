import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { first } from 'rxjs/operators';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FileSystemDirectoryEntry, FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { ToastrService } from 'ngx-toastr';
import { TabsetComponent } from 'ngx-bootstrap/tabs';

import { HttpService } from '../../_service/http.service';
import { environment } from '../../../environments/environment';
import { FinanceInatance, EquifaxInstance } from '../../_service/common.service';

@Component({
  selector: 'app-incompletedetails',
  templateUrl: './incompletedetails.component.html',
  styleUrls: ['./incompletedetails.component.scss']
})
export class IncompletedetailsComponent implements OnInit {
  @ViewChild('staticTabs', { static: false }) staticTabs: TabsetComponent;
  @ViewChild('messagebox', { read: TemplateRef }) messagebox: TemplateRef<any>;
  equifaxReport: any = [];
  financingTabamnt: any;
  changeamnt: any;
  statedIncome: any = [];
  updateincomeVerifiedv: string;
  rulestatus: string;
  data_change_status: any = {};
  sales_items: any = [];
  service_name: string;
  taxrulestatus: string;
  financingTab: any = [];
  financialquestion: any = [];
  loanProducts: any = [];
  RuleStatus: string;
  data_replace_res: any = {};
  data_tax_res: any = {};
  data_tax_res1: any = {};
  f1: any = {};
  f2: any = {};
  taxarray: any = [];
  loanstatuschanged: any = [];
  data: any = {
    answers: [],
    CoApplicant: [],
    files: [],
    from_details: [],
    paymentScheduleDetails: [],
    userConsentDoc: []
  }
  durationMonths = FinanceInatance.durationMonths;
  modalRef: BsModalRef;
  message: any = [];
  payment: any = [];
  cm = {}
  manualBankAddFields = {}
  res_comments: any = [];
  screenlogs: any = [];
  commonEquifaxRules = EquifaxInstance.commonEquifaxRules;
  tabs: any = {
    "Underwriting Process": false,
    "User Information": false,
    "Credit Report": false,
    "Payment Schedule": false,
    "Bank Accounts": false,
    "Document Center": false,
    "Comments": false,
    "Log": false
  };
  bankaccounts: any = [];
  bankhistoricalbalance: any = [];
  files: NgxFileDropEntry[] = [];
  listfiles: any = [];
  fileitems: any = [];
  creditDataRes: any = null;
  creditData: any = null;
  complyadvantageAdverseMedia: any;
  amlTypes: any;
  ofacSdnList: any;
  showFiles: string;
  checkType: any;
  urlSafe: any;
  complyUrl: any;
  middeskData: any = [];
  urlSafeComplyAdvantage: any;
  loanId = this.route.snapshot.paramMap.get('id');

  constructor(
    public datePipe: DatePipe,
    private route: ActivatedRoute,
    private service: HttpService,
    public router: Router,
    private sanitizer: DomSanitizer,
    private modalService: BsModalService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    let pages = sessionStorage.getItem('pages');
    let tabs = sessionStorage.getItem('tabs');

    if (pages) {
      pages = JSON.parse(pages);

      for (let i = 0; i < pages.length; i++) {
        if (pages[i]['name'] == 'Incomplete Application') {
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

    this.get(this.route.snapshot.paramMap.get('id'));
    this.getlogs();
    this.getbankaccounts(this.route.snapshot.paramMap.get('id'));
    this.gethistoricalbalance(this.route.snapshot.paramMap.get('id'));
    this.getComplyAdvantage(this.route.snapshot.paramMap.get('id'));
    // this.getMiddesk(this.route.snapshot.paramMap.get('id'));
    this.getallfiles();
    this.getLoanopsReview(this.route.snapshot.paramMap.get('id'));
  }

  selectTab(tabId: number) {
    this.staticTabs.tabs[tabId].active = true;
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


       console.log(' this.data.taxarray ', this.data.taxarray)
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

  changeAmtVal(value){

    let c= value.split('.')
    //console.log(c)

    let res= c[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    let resVal =(c[1]==undefined)?'':'.'+c[1]
    //console.log(resVal)
    return res+resVal
  }

  removeString(c){
    let v= c.split(':')
    return v[1]
  }
  
  getLoanopsReview(id){
    //console.log('loanopsssss',this.statedIncome)
    this.service.authget('decision-service/loanops/' + id, 'admin')
      .pipe(first())
      .subscribe(res => {
        console.log('loanops123445',res)
        if (res['statusCode'] == 200) {
         //console.log('loanops',res)

        this.financingTab =res['financingTab']
        this.f1.updateincomeVerifiedvs=this.financingTab[0].incomeVerifiedAmount
        this.financialquestion =res['financialQuestions']
        this.loanProducts=res['productsLending']
        this.loanstatuschanged=res['installer_id']
        this.f1.ownershipType=res['financingTab'][0].ownershipType
         // console.log('this.f1.ownershipType',this.f1.ownershipType)
        if(res['financingTab'][0].ownershipType==this.financialquestion[0].ownershipType){
          this.rulestatus='Pass'
        }else{
          this.rulestatus='Fail'
        }
        if(this.loanstatuschanged[0].incomeVerified=='Yes'){
          this.updateincomeVerifiedv='Pass';
        }else if(this.loanstatuschanged[0].incomeVerified==null){
          this.updateincomeVerifiedv='';
        }else{
          this.updateincomeVerifiedv='Fail';
        }

        if(this.loanstatuschanged[0].taxDocumentsVerified=='Yes'){
          this.taxrulestatus='Pass';
        }else if(this.loanstatuschanged[0].taxDocumentsVerified==null){
          this.taxrulestatus='';
        }else{
          this.taxrulestatus='Fail';
        }

       // console.log('updateincomeVerifiedv',this.updateincomeVerifiedv)
        if(this.loanProducts.length > 0){
          this.statedIncome = this.loanProducts.filter(
            (xx) => xx.productName == this.financingTab[0].productName
          );
        }

        
         this.financingTabamnt = this.financingTab[0].financingRequested?.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
         this.changeamnt =this.financingTab[0].originationFee?.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

         console.log('12333',this.statedIncome)
        } else {
          // this.message = res['message']
          // this.modalRef = this.modalService.show(this.messagebox);
        }
      }, err => {
        if (err['error']['message'].isArray) {
          this.message = err['error']['message']
        } else {
          this.message = [err['error']['message']]
        }
        this.modalRef = this.modalService.show(this.messagebox);
      })

  }

  manualBankAddModel(manualBankAddTemp: TemplateRef<any>) {
    this.modalRef = this.modalService.show(manualBankAddTemp)
  }

  manualBankAdd() {
    this.manualBankAddFields['user_id'] = this.data.from_details[0].user_id;
    console.log('manualBankAddFields', this.manualBankAddFields);
    this.service.authpost('pending/manualbankadd', 'admin', this.manualBankAddFields)
      .pipe(first())
      .subscribe(res => {
        console.log('res', res);
        if (res['statusCode'] == 200) {
          console.log('data', res['data']);
          this.modalRef.hide();
        } else {
          this.message = res['message']
          this.modalRef = this.modalService.show(this.messagebox);
        }
      }, err => {
        if (err['error']['message'].isArray) {
          this.message = err['error']['message']
        } else {
          this.message = [err['error']['message']]
        }
        this.modalRef = this.modalService.show(this.messagebox);
      })
  }

  pay() {
    if(this.data['from_details'].length > 0) {
      let date = new Date(this.data['from_details'][0]['createdAt'])
      this.payment.push({
        createdAt: this.dt(date),
        loan_advance: this.data['from_details'][0]['loanAmount'],
        payOffAmount: this.data['from_details'][0]['loanAmount'],
        apr: this.data['from_details'][0]['apr'],
        loantermcount: this.data['from_details'][0]['loanTerm'],
        maturityDate: this.dt(new Date(new Date(this.data['from_details'][0]['createdAt']).setMonth(new Date(this.data['from_details'][0]['createdAt']).getMonth() + 12))),
        nextPaymentSchedule: this.dt(new Date(new Date(this.data['from_details'][0]['createdAt']).setMonth(new Date(this.data['from_details'][0]['createdAt']).getMonth() + 1))),
      })
    } 
    

    // var principal = Number(this.data['from_details'][0]['loanAmount']);
    // var interest = Number(this.data['from_details'][0]['apr']) / 100 / 12;
    // var payments = Number(this.data['from_details'][0]['loanTerm'])
    // var x = Math.pow(1 + interest, payments);
    // var monthly:any = (principal*x*interest)/(x-1);
    // this.payment.push([])
    // if (!isNaN(monthly) &&
    //     (monthly != Number.POSITIVE_INFINITY) &&
    //     (monthly != Number.NEGATIVE_INFINITY)) {
    //       monthly = this.round(monthly);
    //       for (let i = 0; i < payments; i++) {
    //         let inter = this.round((principal*Number(this.data['from_details'][0]['apr']))/1200)
    //         let pri = this.round(monthly - inter)
    //         this.payment[1].push({
    //           startPrincipal:principal,
    //           principal:pri,
    //           interest:inter,
    //           fees:0,
    //           amount:monthly,
    //           date:this.dt(new Date(new Date(this.data['from_details'][0]['createdAt']).setMonth(new Date(this.data['from_details'][0]['createdAt']).getMonth()+(i+1))))
    //         })
    //         principal = this.round(principal- pri);
    //       }

    //     }
  }

  round(x) {
    return Math.round(x * 100) / 100;
  }

  dt(today) {
    var dd: any = today.getDate();

    var mm: any = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }

    if (mm < 10) {
      mm = '0' + mm;
    }
    return mm + '-' + dd + '-' + yyyy;

  }

  get(id) {
    this.service.authget('incomplete/' + id, 'admin')
      .pipe(first())
      .subscribe(res => {
        //this.addlogs("view load",id)
        if (res['statusCode'] == 200) {
          this.data = res['data'];
          console.log('----', this.data)
          this.data.commonEquifaxRules = this.commonEquifaxRules;
          this.pay()
          this.getcomments()
        } else {
          this.message = res['message']
          this.modalRef = this.modalService.show(this.messagebox);
          this.router.navigate(['admin/incomplete']);
        }
      }, err => {
        if (err['error']['message'].isArray) {
          this.message = err['error']['message']
        } else {
          this.message = [err['error']['message']]
        }
        this.modalRef = this.modalService.show(this.messagebox);
        this.router.navigate(['admin/incomplete']);
      })
  }

  isObjectEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  close(): void {
    this.modalRef.hide();

  }

  delete() {
    let id = this.route.snapshot.paramMap.get('id')
    this.service.authget('denied/delete/' + id, 'admin')
      .pipe(first())
      .subscribe(res => {
        this.addlogs("Move to delete", id)
        if (res['statusCode'] == 200) {
          this.router.navigate(['admin/incomplete']);
        } else {
          this.message = res['message']
          this.modalRef = this.modalService.show(this.messagebox);
        }
      }, err => {
        if (err['error']['message'].isArray) {
          this.message = err['error']['message']
        } else {
          this.message = [err['error']['message']]
        }
        this.modalRef = this.modalService.show(this.messagebox);
      })
  }

  view(showFile: TemplateRef<any>, filename) {
    filename = filename.split('/')
    filename = filename[filename.length - 1]
    // window.open(environment.adminapiurl+"files/download/"+filename, "_blank");
    this.showFiles = environment.adminapiurl + "files/download/" + filename;
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.showFiles);
    let res = filename.split('.')
    this.checkType = res[1];
    this.modalRef = this.modalService.show(showFile)
  }

  getcomments() {
    let id = this.route.snapshot.paramMap.get('id')
    this.service.authget('pending/getcomments/' + id, 'admin')
      .pipe(first())
      .subscribe(res => {
        if (res['statusCode'] == 200) {
          this.res_comments = res['data']

        } else {
          this.message = res['message']
          this.modalRef = this.modalService.show(this.messagebox);
        }
      }, err => {
        if (err['error']['message'].isArray) {
          this.message = err['error']['message']
        } else {
          this.message = [err['error']['message']]
        }
        this.modalRef = this.modalService.show(this.messagebox);
      })
  }

  addcomments(msgbox: TemplateRef<any>) {
    this.cm['loan_id'] = this.route.snapshot.paramMap.get('id')
    this.cm['user_id'] = JSON.parse(sessionStorage.getItem('resuser'))['id']
    this.service.authpost('pending/addcomments', 'admin', this.cm)
      .pipe(first())
      .subscribe(res => {
        this.addlogs("Add Some comments", this.cm['loan_id'])
        if (res['statusCode'] == 200) {
          this.message = ['Comments Added']
          this.modalRef = this.modalService.show(msgbox);
          this.getcomments()
        } else {
          this.message = res['message']
          this.modalRef = this.modalService.show(msgbox);
        }
      }, err => {
        if (err['error']['message'].isArray) {
          this.message = err['error']['message']
        } else {
          this.message = [err['error']['message']]
        }
        this.modalRef = this.modalService.show(this.messagebox);
      })
  }

  getlogs() {
    let id = this.route.snapshot.paramMap.get('id')
    this.service.authget('approved/getlogs/' + id, 'admin')
      .pipe(first())
      .subscribe(res => {
        if (res['statusCode'] == 200) {
          this.screenlogs = res['data']
        } else {
          this.message = res['message']
          this.modalRef = this.modalService.show(this.messagebox);
        }
      }, err => {
        if (err['error']['message'].isArray) {
          this.message = err['error']['message']
        } else {
          this.message = [err['error']['message']]
        }
        this.modalRef = this.modalService.show(this.messagebox);
      })
  }

  addlogs(module, id) {
    this.service.addlog(module, id, 'admin').subscribe(res => { }, err => { })
  }

  getbankaccounts(id) {
    this.service
      .authget('plaid/accounts/' + id, 'admin')
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.bankaccounts = res['data'];
          }
        }
      );
  }

  gethistoricalbalance(id) {
    this.service
      .authget('plaid/get-assets-display/' + id, 'admin')
      .subscribe((res) => {
        if (res['statusCode'] == 200) {
          this.bankhistoricalbalance = res['data'];
        }
      });
  }

  sendbanklogin() {
    let id = this.route.snapshot.paramMap.get('id')
    this.service.authget('plaid/requestBank/' + id, 'admin').subscribe(res => {
      if (res['statusCode'] == 200) {
        this.message = ['Mail Successfully Sent']
        this.modalRef = this.modalService.show(this.messagebox);
      }
    }, err => {
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
          console.log(droppedFile.relativePath, file);
          this.fileitems.push(file)

        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
    console.log(this.listfiles)
  }

  fileOver(event) {
    // console.log(event);
  }

  fileLeave(event) {
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

  upoadDocuments() {
    const formData = new FormData();
    formData.append('loan_id', this.route.snapshot.paramMap.get('id'))
    for (var i = 0; i < this.fileitems.length; i++) {
      if (!this.fileitems[i]['documentType'] || this.fileitems[i]['documentType'] == '') {
        this.message = ['Please select the document type for all documents'];
        this.modalRef = this.modalService.show(this.messagebox);
        return false;
      }
      formData.append("documentTypes[]", this.fileitems[i].documentType);
      formData.append("files[]", this.fileitems[i]);
    }

    this.service.authfiles("uploads", "admin", formData)
      .pipe(first())
      .subscribe(res => {
        this.addlogs("Uploaded documents", this.route.snapshot.paramMap.get('id'))
        if (res['statusCode'] == 200) {
          console.log(res['data']['files']);

          this.data['files'] = res['data']['files'];
          this.files = []
          this.listfiles = []
          this.fileitems = []
        }
      }, err => {
        console.log(err)
      })
  }

  rePullBankAccounts() {
    let id = this.route.snapshot.paramMap.get('id')
    this.service.authget('plaid/accountsRepull/' + id, 'admin').subscribe(res => {
      if (res['statusCode'] == 200) {
        this.bankaccounts = res['data']
      }
    }, err => {
      console.log(err)
    })
  }

  getComplyAdvantage(loanId) {
    // console.log("ideee--->", loanId)
    let result;
    this.service.post("loan/complyadvantagereport/" + loanId, 'admin', null)
      .pipe(first())
      .subscribe(res => {
        if (res && res['statusCode'] == 200) {
          // console.log("<----comply--->", res['data']);
          result = JSON.parse(res['data']);
          this.complyUrl = result['content']['data']['share_url']
          this.urlSafeComplyAdvantage = this.sanitizer.bypassSecurityTrustResourceUrl(this.complyUrl);
          this.complyadvantageAdverseMedia = this.keyExists(result, "complyadvantage-adverse-media")
          this.amlTypes = this.keyExists(result, "aml_types")
          this.ofacSdnList = this.keyExists(result, "ofac-sdn-list")
          // console.log(result,this.complyadvantageAdverseMedia,this.amlTypes,this.ofacSdnList)
        } else {
          this.toastrService.error('Error')

          
        }
      }, err => {
        //console.log('sendForm', err);
        if (err['error']['message'].isArray) {
          this.message = err['error']['message']
        } else {
          this.message = [err['error']['message']]
        }
        this.modalRef = this.modalService.show(this.messagebox);
      });

    // console.log("res-->",result)
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
  }

  getMiddesk(loanId) {
    this.service.get('loan/middeskreport/' + loanId, 'admin')
      .subscribe(res => {
        if (res['statusCode'] == 200) {
          if(res['data'] == null){
            // console.log("midseknull__>", res['data'])
            this.generateMiddeskId(loanId)
          }
          else{
            const result = JSON.parse(res['data'])
            this.middeskData = result['review']['tasks']
            // console.log(result,"--<midd--->", res['data'])
          }
        }
      }, err => {
        console.log(err)
      })
  }

  generateMiddeskId(loanId){
    this.service.post("loan/middesk/" + loanId, 'admin', null)
      .pipe(first())
      .subscribe(res => {
        if (res['statusCode'] == 200) {
          // console.log("calles--mid--id--->")
          this.getMiddesk(loanId)
        }
      }, err => {
          console.log(err)
        })
  }

  updateloanIdstatus(id,val,m){
    //console.log(this.f1.updateincomeVerifiedvs)

    if(this.f1.updateincomeVerifiedvs==null && this.f1.updateincomeVerifiedvs==undefined){
      this.toastrService.error('Please enter Stated Income')
      return
    }
    let c = val.target.checked
    if(c==true && m=='incomeverify'){
      this.updateincomeVerifiedv='Pass';
    }else{
      this.updateincomeVerifiedv='Fail';
    }

    this.data_change_status.loanID=id
    this.data_change_status.moduleName=m
    this.data_change_status.status=(val.target.checked==true)?'Yes':'No'
    if(m=='incomeverify'){
    this.data_change_status.incomeVerifiedAmount = this.f1.updateincomeVerifiedvs
    }

   this.service.authpost('decision-service/loanops/setstatus','admin',this.data_change_status) .pipe(first())
    .subscribe(res=>{

     // console.log(res)
     // this.getLoanproduct_logs(this.data[0].user_id)

    },err=>{
      if(err['status']!=200)
      {

      }
    })
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
}
