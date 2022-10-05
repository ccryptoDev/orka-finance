import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import {
  FileSystemDirectoryEntry,
  FileSystemFileEntry,
  NgxFileDropEntry,
} from 'ngx-file-drop';
import { ToastrService } from 'ngx-toastr';
import { BorrowerSidebarComponent } from "../../borrower-sidebar/borrower-sidebar.component";
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-loan-documents',
  templateUrl: './loan-documents.component.html',
  styleUrls: ['./loan-documents.component.scss']
})
export class LoanDocumentsComponent implements OnInit {
  loanId = sessionStorage.getItem('LoanID');
  modalRef: BsModalRef;
  message:any = [];
  data:any =[];
  data_res :any ={};
  result:any=[];
  guarantySignerEmail1: any;
  guarantySignerEmail2: any;
  guarantySignerName1: any;
  guarantySignerName2: any;
  totalAdditionalGuarantor: any;
  envelopeId: any;
  redirectUrl: any;
  urlSafe: any;

  constructor(
    private service: HttpService,
    private toastrService: ToastrService,
    private modalService: BsModalService,
    public router: Router,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private borrower :BorrowerSidebarComponent,
  ) { }

  ngOnInit() {
    this.createLoanAgreement();
  }

  createLoanAgreement(){
    this.service
      .authpost(`loan-agreement/${this.loanId}`, 'borrower', null)
      .pipe(first())
      .subscribe(
        (res) => {
          this.envelopeId = res['results'].envelopeId;
          this.redirectUrl = res['results'].redirectUrl;
          this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.redirectUrl);
        },
        (err) => {
          const errorMessage = err.status === 500 ? 'Something went wrong. Please try again later' : err.error.message;

          this.toastrService.error(errorMessage);
        }
      );
  }

  loadbankComponent(){
    this.borrower.issignShow =false;
    this.borrower.isSidebarShow =false;
    this.borrower.isdocumentShow=false;
    this.borrower.isbankShow =true;
    this.borrower.isloanShow=false;
  }

  loadloanComponent(){
    this.borrower.issignShow =false;
    this.borrower.isSidebarShow =false;
    this.borrower.isdocumentShow=false;
    this.borrower.isbankShow =false;
    this.borrower.isloanShow=true;
    
  }

  loadsignComponent(){
    this.borrower.issignShow =false;
    this.borrower.isSidebarShow =false;
    this.borrower.isdocumentShow=false;
    this.borrower.isbankShow =false;
    this.borrower.isloanShow=true;
  }

  onload(event) {
    let iframe = document.getElementById("docusign") as HTMLIFrameElement;

    if (
      iframe.contentWindow.location.href.indexOf("?event=signing_complete") > 0
    ) {
      console.log(iframe.contentWindow.location.href);
      iframe.parentNode.removeChild(iframe);
      let reqData = {
        envelopeId: this.envelopeId,
      };
      //this.loader = true;
      // this.dataService
      //   .pathReqest(
      //     `/api/v1/termSheetNotif/local/dealId/${this.termSheetDetails.dealId}`,
      //     reqData
      //   )
      //   .pipe(first())
      //   .subscribe(
      //     (response: any) => {
      //       if (Object.keys(response).length > 0) {
      //         if (response.status == "success") {
      //           this.authenticationService.showSuccess(response.msg);
      //         }
      //       }
      //       this.loader = false;
      //     },
      //     (errors) => {
      //       this.loader = false;
      //       this.authenticationService.showError(errors.error.msg);
      //     }
      //   );
      // this.router.navigateByUrl("borrower/home");
      window.location.href= '/borrower/home'
    } else if (
      iframe.contentWindow.location.href.indexOf("?event=viewing_complete") > 0
    ) {
      iframe.parentNode.removeChild(iframe);
      //this.router.navigateByUrl("borrower/home");

      window.location.href= '/borrower/home'
    } else if (
      iframe.contentWindow.location.href.indexOf("?event=cancel") > 0
    ) {
      iframe.parentNode.removeChild(iframe);
      window.location.href= '/borrower/home'
    } else if (
      iframe.contentWindow.location.href.indexOf("?event=decline") > 0
    ) {
      let reqData = {
        envelopeId: this.envelopeId,
      };
      // this.loader = true;
      // this.dataService
      //   .pathReqest(
      //     `/api/v1/termSheetNotif/local/dealId/${this.termSheetDetails.dealId}`,
      //     reqData
      //   )
      //   .pipe(first())
      //   .subscribe(
      //     (response: any) => {
      //       if (Object.keys(response).length > 0) {
      //         if (response.status == "success") {
      //           this.authenticationService.showSuccess(response.msg);
      //         }
      //       }
      //       this.loader = false;
      //     },
      //     (errors) => {
      //       this.loader = false;
      //       this.authenticationService.showError(errors.error.msg);
      //     }
      //   );
      //API call
      iframe.parentNode.removeChild(iframe);
      window.location.href= '/borrower/home'
      //this.router.navigateByUrl("borrower/home");
    }
  }
}
