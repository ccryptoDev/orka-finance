import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { HttpService } from 'src/app/_service/http.service';
import { environment } from 'src/environments/environment';
import { FinanceInatance,EquifaxInstance } from '../../_service/common.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


@Component({
  selector: 'app-funded-contact-details',
  templateUrl: './funded-contact-details.component.html',
  styleUrls: ['./funded-contact-details.component.scss']
})

export class FundedContactDetailsComponent implements OnInit {
  @ViewChild('staticTabs', { static: false }) staticTabs: TabsetComponent;
  selectTab(tabId: number) {
    this.staticTabs.tabs[tabId].active = true;
  }
 
  loanId = this.route.snapshot.paramMap.get('id');
  data: any = {
    customerDetails: null,
    ownershipFiles: [],
    systemInfo: null,
    installingInfo: null,
    milestone1ReqFiles: [],
    milestone2ReqFiles: [],
    milestone3ReqFiles: [],
    attributes: [],
    filter_att: [],
    model_filter: [],
  }
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
  ]
  PSPS4129 = EquifaxInstance.PSPS4129;
  OFACCommercialResponse: string
  modalRef: BsModalRef;
  message: any = [];

  creditDataRes: any = null
  creditData: any = null
  setReport_one: any = null;
  paynetReport: any = null;
  equifaxReport: any = [];
  equifaxCommercialReport: any = [];
  tabs: any = {
    "Underwriting Process": false,
    "User Information": false,
    "Credit Report": false,
    "Payment Schedule": false,
    "Bank Accounts": false,
    "Document Center": false,
    "Comments": false,
    "Log": false
  }

  @ViewChild('messagebox', { read: TemplateRef }) messagebox: TemplateRef<any>;
  complyadvantageAdverseMedia: any;
  amlTypes: any;
  ofacSdnList: any;
  complyUrl: any;

  showFiles: string;
  checkType: any;
  urlSafe: any;
  middeskData: any = [];
  urlSafeComplyAdvantage: any;
  constructor(
    public datePipe: DatePipe,
    private route: ActivatedRoute,
    private service: HttpService,
    public router: Router,
    private modalService: BsModalService,
    private toastrService: ToastrService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.get()
    this.getComplyAdvantage()
    this.getMiddesk(this.route.snapshot.paramMap.get('id'))
  }

  get() {
    this.service.authget('funded-contracts/' + this.loanId, 'admin')
      .pipe(first())
      .subscribe(res => {
        if (res['statusCode'] == 200) {
          this.data = res['data']
          //console.log('DATA equifaxReport******',this.equifaxReport)
          this.equifaxReport = this.data.equifaxReport.filter(xx => xx.reportType == 'equifax-consumer');
          this.equifaxCommercialReport = this.data.equifaxReport.filter(xx => xx.reportType == 'equifax-comercial-set2');

          if (this.equifaxReport.length > 0) {

            this.data.filter_att = this.filetr_attributes

            if (this.equifaxReport[0].report.equaifax.consumers.equifaxUSConsumerCreditReport[0].models != null) {

              this.data.model_filter = this.equifaxReport[0].report.equaifax.consumers.equifaxUSConsumerCreditReport[0].models.filter(xx => xx.modelNumber == '05453');
              this.data.model_filter2 = this.equifaxReport[0].report.equaifax.consumers.equifaxUSConsumerCreditReport[0].models.filter(xx => xx.modelNumber == '04129');

              this.data.model_filter_array = this.data.model_filter.concat(this.data.model_filter2)
            } else {
              this.data.model_filter_array = [];
            }
          }
          if (this.equifaxCommercialReport.length > 0 && this.equifaxCommercialReport[0].report.EfxTransmit.OFACCommercialResponse != null) {

            this.OFACCommercialResponse = this.equifaxCommercialReport[0].report.EfxTransmit.OFACCommercialResponse.split("\n")
          }

          if (this.equifaxCommercialReport.length > 0 && this.equifaxCommercialReport[0].report.EfxTransmit.CommercialCreditReport && !this.equifaxCommercialReport[0].report.EfxTransmit.CommercialCreditReport[0]) {
            this.equifaxCommercialReport[0].report.EfxTransmit.CommercialCreditReport = [this.equifaxCommercialReport[0].report.EfxTransmit.CommercialCreditReport];
          }
          this.data.attributes = this.PSPS4129

        } else {
          this.message = res['message']
          this.modalRef = this.modalService.show(this.messagebox);
          this.router.navigate(['admin/funded-contracts']);
        }
      }, err => {
        if (err['error']['message'].isArray) {
          this.message = err['error']['message']
        } else {
          this.message = [err['error']['message']]
        }
        this.modalRef = this.modalService.show(this.messagebox);
        this.router.navigate(['admin/funded-contracts']);
      })
  }

  view(showFile: TemplateRef<any>,filename){
    filename = filename.split('/')
    filename = filename[filename.length-1]
    // window.open(environment.adminapiurl+"files/download/"+filename, "_blank");
    this.showFiles = environment.adminapiurl + "files/download/" + filename;
    this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.showFiles);
    let res =filename.split('.')
    this.checkType =res[1];
      this.modalRef = this.modalService.show(showFile)
  }
  isObjectEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  getComplyAdvantage() {
    // console.log("ideee--->", loanId)
    let result;
    this.service.post("loan/complyadvantagereport/" + this.loanId, 'admin', null)
      .pipe(first())
      .subscribe(res => {
        if (res['statusCode'] == 200) {
          // console.log("<----comply--->", res['data']);
          result = JSON.parse(res['data']);
          this.complyUrl = result['content']['data']['share_url'];
          this.urlSafeComplyAdvantage = this.sanitizer.bypassSecurityTrustResourceUrl(this.complyUrl);
          this.complyadvantageAdverseMedia = this.keyExists(result, "complyadvantage-adverse-media")
          this.amlTypes = this.keyExists(result, "aml_types")
          this.ofacSdnList = this.keyExists(result, "ofac-sdn-list")
          // console.log(result,this.complyadvantageAdverseMedia,this.amlTypes,this.ofacSdnList)
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
}
