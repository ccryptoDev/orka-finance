import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { Router } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { environment } from '../../../environments/environment';
import { AccountNumberValidator } from 'src/app/_service/custom.validator';
import { readyMade } from '../../../environments/environment';
import { DatePipe } from '@angular/common';
import { ToastrService } from "ngx-toastr";
import { FinanceInatance, EquifaxInstance } from '../../_service/common.service';
import { FileSystemDirectoryEntry, FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { DomSanitizer } from '@angular/platform-browser';
import { TabsetComponent } from 'ngx-bootstrap/tabs';

@Component({
  selector: 'app-denieddetails',
  templateUrl: './denieddetails.component.html',
  styleUrls: ['./denieddetails.component.scss']
})
export class DenieddetailsComponent implements OnInit {
  @ViewChild('staticTabs', { static: false }) staticTabs: TabsetComponent;
  @ViewChild('messagebox', { read: TemplateRef }) messagebox: TemplateRef<any>;
  objectKeys = Object.keys;
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
  loanId = this.route.snapshot.paramMap.get('id');
  data: any = {
    answers: [],
    CoApplicant: [],
    files: [],
    from_details: [],
    paymentScheduleDetails: [],
    attributes: [],
    filter_att: [],
    model_filter: []
  };
  OFACCommercialResponse: string;
  modalRef: BsModalRef;
  message: any = [];
  payment: any = [];
  cm = {};
  manualBankAddFields = {};
  res_comments: any = [];
  commonEquifaxRules = EquifaxInstance.commonEquifaxRules;
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
  screenlogs: any = [];
  tabs: any = {
    "Loan Ops Review":false,
    "Underwriting Process": false,
    "User Information": false,
    "Credit Report": false,
    "Payment Schedule": false,
    "Bank Accounts": false,
    "Document Center": false,
    "Comments": false,
    "Log": false
  };
  bankaccounts: any = []
  bankhistoricalbalance: any = []
  files: NgxFileDropEntry[] = [];
  listfiles: any = [];
  fileitems: any = [];
  creditDataRes: any = null;
  creditData: any = null;
  setReport_one: any = null;
  paynetReport: any = null;
  equifaxReport: any = [];
  equifaxCommercialReport: any = [];
  PSPS4129 = EquifaxInstance.PSPS4129;
  complyadvantageAdverseMedia: any;
  amlTypes: any;
  ofacSdnList: any;
  complyUrl: any;
  middeskData: any = [];
  urlSafeComplyAdvantage: any;
  rawconsumer_data: any;
  rawcommercial_data: any;
  editNameFields = {};
  editStreetFields = {};
  editCityFields = {};
  editZipCodeFields = {};
  fSubmitted = false;
  data_sales_contract: any = {
    files: [],
  };
  filetype_salesitems_val: string;
  filetype_salesitems_val_res: string;
  minbalance: any;
  showFiles: string;
  checkType: any;
  urlSafe: any;
  data_res: any = {};
  fileNames: any = [];
  checkarr: boolean = false;
  middeskPullTried = false;
  incomeVerificationPassed = false;
  kycEquifaxPassed = false;
  kycComplyAdvandagePassed = false;
  kybEquifaxPassed = false;
  middeskReportPassed = false;

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
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private service: HttpService,
    public router: Router,
    private modalService: BsModalService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    let pages = sessionStorage.getItem('pages')
    let tabs = sessionStorage.getItem('tabs')
    if (pages) {
      pages = JSON.parse(pages)
      for (let i = 0; i < pages.length; i++) {
        if (pages[i]['name'] == 'Denied Application') {
          if (tabs) {
            tabs = JSON.parse(tabs)
            //console.log(tabs[pages[i]['id']])
            for (let j = 0; j < tabs[pages[i]['id']].length; j++) {
              this.tabs[tabs[pages[i]['id']][j]['name']] = true;
            }
            i = pages.length + 1
          }
        }
      }
    }

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
    console.log("newck--->",tabId,  this.staticTabs)
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

  pullCreditReport(reportType: string): void {
    let loan_id = this.route.snapshot.paramMap.get('id');
    this.service.authget('loan/pull-equifax-credit-report/' + loan_id, 'admin')
      .pipe(first())
      .subscribe(res => {
        if (res['statusCode'] == 200) {
          //this.toastrService.success("Equifax Credit Report")

          setTimeout(() => {

            this.router.navigate(['admin/pendings/' + loan_id]);
          }, 1000);  //5s
          /* if (reportType == 'equifax') {
             this.equifaxReport = res['equifaxReport']
           } else if(reportType == 'paynet') {
             this.paynetReport = res['paynetReport'];
             if (this.paynetReport.payNetReport) {
               this.paynetReport.payNetReport = this._sanitizer.bypassSecurityTrustHtml(this.paynetReport.payNetReport);
             }
           }*/
        } else {
          this.message = res['message']
          //this.modalRef = this.modalService.show(this.messagebox);
          //console.log('------',currentUrl)
          //this.toastrService.error(this.message)
          this.toastrService.error(this.message)


        }
      }
        , err => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message']
          } else {
            this.message = [err['error']['message']]
          }
          this.modalRef = this.modalService.show(this.messagebox);
        })

  }

  creditreport(id) {
    this.service.authget('pending/creditreport/' + id, 'admin')
      .pipe(first())
      .subscribe(res => {
        if (res['statusCode'] == 200) {
          if (res['data'].length) {
            //console.log(JSON.parse(res['data'][0]['report']))
            this.creditDataRes = JSON.parse(res['data'][0]['report'])
            this.creditData = this.creditDataRes.transUnion;
          }

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
    this.service.authget('denied/' + id, 'admin')
      .pipe(first())
      .subscribe(res => {
        //this.addlogs("view load",id)
        if (res['statusCode'] == 200) {
          this.data = res['data']
          //this.equifaxReport = this.data.equifaxReport; //this.reportlist1;
          //console.log('DATA',this.data)
          this.equifaxReport = this.data.equifaxReport.filter(xx => xx.reportType == 'equifax-consumer');
          this.equifaxCommercialReport = this.data.equifaxReport.filter(xx => xx.reportType == 'equifax-comercial-set2');


          this.data.commonEquifaxRules = this.commonEquifaxRules;

          if(this.equifaxCommercialReport.length > 0) {
            const passedKyb = this.equifaxCommercialReport.length && this.equifaxCommercialReport[0].report.Rules.filter(it => it.RuleStatus.toLowerCase() === "pass" )
           
            this.kybEquifaxPassed = this.equifaxCommercialReport.length > 0 && passedKyb.length === this.equifaxCommercialReport[0].report.Rules.length;
          }

          console.log('****', this.equifaxReport)
          // console.log('****',this.equifaxCommercialReport)
          if (this.equifaxReport.length > 0) {

            this.data.filter_att = this.filetr_attributes

            if (this.equifaxReport[0].report.equaifax.consumers.equifaxUSConsumerCreditReport[0].models != null) {

              this.data.model_filter = this.equifaxReport[0].report.equaifax.consumers.equifaxUSConsumerCreditReport[0].models.filter(xx => xx.modelNumber == '05453');
              this.data.model_filter2 = this.equifaxReport[0].report.equaifax.consumers.equifaxUSConsumerCreditReport[0].models.filter(xx => xx.modelNumber == '04129');

              this.data.model_filter_array = this.data.model_filter.concat(this.data.model_filter2)
            } else {
              this.data.model_filter_array = [];
            }

            const passedKyc = this.equifaxReport.length > 0  && this.equifaxReport[0].report.Rules.filter(it => it.RuleStatus.toLowerCase() === "pass" )
          this.kycEquifaxPassed = this.equifaxReport.length > 0 && passedKyc.length === this.equifaxReport[0].report.Rules.length;
        

          }
          if (this.equifaxCommercialReport.length > 0 && this.equifaxCommercialReport[0].report.EfxTransmit.OFACCommercialResponse != null) {

            this.OFACCommercialResponse = this.equifaxCommercialReport[0].report.EfxTransmit.OFACCommercialResponse.split("\n")
          }

          if (this.equifaxCommercialReport.length > 0 && this.equifaxCommercialReport[0].report.EfxTransmit.CommercialCreditReport && !this.equifaxCommercialReport[0].report.EfxTransmit.CommercialCreditReport[0]) {
            this.equifaxCommercialReport[0].report.EfxTransmit.CommercialCreditReport = [this.equifaxCommercialReport[0].report.EfxTransmit.CommercialCreditReport];
          }
          this.data.attributes = this.PSPS4129


          this.pay()
          this.getcomments()
        } else {
          this.message = res['message']
          this.modalRef = this.modalService.show(this.messagebox);
          this.router.navigate(['admin/denied']);
        }
      }, err => {
        if (err['error']['message'].isArray) {
          this.message = err['error']['message']
        } else {
          this.message = [err['error']['message']]
        }
        this.modalRef = this.modalService.show(this.messagebox);
        this.router.navigate(['admin/denied']);
      })
  }

  close(): void {
    this.modalRef.hide();

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
        //console.log('res',res);
        if (res['statusCode'] == 200) {
          //console.log('data', res['data']);
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

  delete() {
    let id = this.route.snapshot.paramMap.get('id')
    this.service.authget('denied/delete/' + id, 'admin')
      .pipe(first())
      .subscribe(res => {
        if (res['statusCode'] == 200) {
          this.router.navigate(['admin/denied']);
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

  Pending() {
    let id = this.route.snapshot.paramMap.get('id')
    this.service.authget('denied/pending/' + id, 'admin')
      .pipe(first())
      .subscribe(res => {
        if (res['statusCode'] == 200) {
          this.router.navigate(['admin/pendings/' + id]);
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

  view(filename: any) {
    filename = filename.split('/')
    filename = filename[filename.length - 1]
    window.open(environment.adminapiurl + "files/download/" + filename, "_blank");
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
    this.service.authget('plaid/accounts/' + id, 'admin').subscribe(res => {
      if (res['statusCode'] == 200) {
        this.bankaccounts = res['data']

        //console.log('bankaccounts---',this.bankaccounts)
      } else {

        console.log('error')
      }
    }, err => {
      console.log(err)
    })
  }

  gethistoricalbalance(id) {
    this.service.authget('plaid/get-assets-display/' + id, 'admin').subscribe(res => {
      if (res['statusCode'] == 200) {
        this.bankhistoricalbalance = res['data']

        //console.log('bankaccounts12333---',this.bankhistoricalbalance)
      }
    }, err => {
      console.log(err)
    })
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
          //console.log(droppedFile.relativePath, file);
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
          //console.log(res['data']['files']);

          this.data['files'] = res['data']['files'];
          this.files = []
          this.listfiles = []
          this.fileitems = []
        }
      }, err => {
        console.log(err)
      })
  }

  deleteFileSelected(file) {
    this.fileitems.splice(this.fileitems.findIndex(f => f.name == file.name), 1);
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

  isobject(val) {
    //alert('1233')

    return typeof val === 'object';


  }

  isObjectEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  getattvalcode(a: any, data: any) {
    //let b='--'
    for (let i = 0; i < data.length; i++) {
      if (a == data[i].code) {
        return data[i].value;
      }

    }
  }

  getattFiltervalcode(a: any, data: any) {
    //let b='--'
    for (let i = 0; i < data.length; i++) {
      if (a == data[i].code) {
        return data[i].value;
      }

    }
  }

  getComplyAdvantage(loanId) {
    // console.log("ideee--->", loanId)
    let result;
    this.service.authpost("loan/complyadvantagereport/" + loanId, 'admin', null)
      .pipe(first())
      .subscribe(res => {
        if (res['statusCode'] == 200) {
          // console.log("<----comply--->", res['data']);
          result = JSON.parse(res['data']);
          this.complyUrl = result['content']['data']['share_url'];
          this.urlSafeComplyAdvantage = this.sanitizer.bypassSecurityTrustResourceUrl(this.complyUrl);

          console.log('urlSafeComplyAdvantage',this.urlSafeComplyAdvantage)
          this.complyadvantageAdverseMedia = this.keyExists(result, "complyadvantage-adverse-media")
          this.amlTypes = this.keyExists(result, "aml_types")
          this.ofacSdnList = this.keyExists(result, "ofac-sdn-list")
          // console.log(result,this.complyadvantageAdverseMedia,this.amlTypes,this.ofacSdnList)
          

          this.kycComplyAdvandagePassed = !this.complyadvantageAdverseMedia && !this.amlTypes && !this.ofacSdnList
        } else {
          this.toastrService.error(res['message'])
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
    this.service.authget('loan/middeskreport/' + loanId, 'admin')
      .subscribe(res => {
       // console.log('chekcmid',res['data'])
        if (res['statusCode'] == 200) {
          if(res['data'] == null){
            console.log("midseknull__>", res['data'])
            if(!this.middeskPullTried) {
              this.middeskPullTried = true;
              this.generateMiddeskId(loanId)
            }
          }
          else{
            const result = JSON.parse(res['data'])
           console.log('chekcmid',result)
            this.middeskData = result['review']['tasks']

            //this.middeskReportPassed
            const passedCount = this.middeskData.filter(it => it.status.toLowerCase() == 'success')
            this.middeskReportPassed = (passedCount.length === this.middeskData.length)
            // console.log(result,"--<midd--->", res['data'])
          }
        }
      }, err => {
        console.log(err)
      })
  }

  generateMiddeskId(loanId){
    this.service.authpost("loan/middesk/" + loanId, 'admin', null)
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