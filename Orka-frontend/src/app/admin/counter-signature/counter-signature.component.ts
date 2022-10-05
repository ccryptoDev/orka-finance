import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from "@angular/router";
import { DomSanitizer } from '@angular/platform-browser';
import { first } from 'rxjs/operators';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from "ngx-toastr";

import { environment } from '../../../environments/environment';
import { HttpService } from '../../_service/http.service';
import { SharedService } from '../../shared/shared.service';

@Component({
  selector: 'app-counter-signature',
  templateUrl: './counter-signature.component.html',
  styleUrls: ['./counter-signature.component.scss']
})
export class CounterSignatureComponent implements OnInit {
  modalRef: BsModalRef;
  message: any = [];
  data: any = [];
  data_res: any = [];
  resuser: any = [];
  result: any;
  filenameservice: string;
  dtOptions: { scrollX: boolean; };
  approve_construction_status: any;
  showId: any;
  loanid = sessionStorage.getItem('LoanID');
  envelopeId: any;
  redirectUrl: any;
  urlSafe: any;

  constructor(
    public router:Router,
    private service: HttpService,
    private toastrService: ToastrService,
    private modalService: BsModalService,
    private shared:SharedService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.dtOptions = { scrollX: true };

    this.getallfiles();
  }

  getallfiles(){
    this.service.authget('counter-signature', 'admin')
    .pipe(first())
    .subscribe(res => {

      this.result=res['data'];
      console.log(res['data'])
     
    }, err => {
      if (err['error']['message'].isArray) {
        this.message = err['error']['message']
      } else {
        this.message = [err['error']['message']]
      }
      this.toastrService.error(this.message)

    })
  }
    
  view(filename:any){
    filename = filename.split('/')
    filename = filename[filename.length-1]
    window.open(environment.installerapiurl+"files/download/"+filename, "_blank");
  }

  getMDataPdf(d:any){
    this.shared.setMData(d);
  }

  showCountersign(showFile: TemplateRef<any>,id){
    this.service
      .authget(`loan-agreement/admin/${id}`, 'adminenvelope')
      .pipe(first())
      .subscribe(
        (res) => {
          this.result = res['data'];
          this.redirectUrl = res['results'].redirectUrl
          this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.redirectUrl);
          this.showId = id;
          this.modalRef = this.modalService.show(showFile);
        }, 
        (err) => {
          const errorMessage = err.status === 500 ? 'Something went wrong. Please try again later' : err.error.message;

          this.toastrService.error(errorMessage);
        }
      );
  }

  onload() {
    let iframe = document.getElementById("docusign") as HTMLIFrameElement;

    if (iframe.contentWindow.location.href.indexOf("?event=signing_complete") > 0) {
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
      // this.router.navigateByUrl("completed-counter-signature");
      this.modalRef.hide();
     this.router.navigate(['admin/completed-counter-signature']);
    } else if (
      iframe.contentWindow.location.href.indexOf("?event=viewing_complete") > 0
    ) {
      iframe.parentNode.removeChild(iframe);
      //this.router.navigateByUrl("completed-counter-signature");

      this.modalRef.hide();
     this.router.navigate(['admin/completed-counter-signature']);
    } else if (
      iframe.contentWindow.location.href.indexOf("?event=cancel") > 0
    ) {
      iframe.parentNode.removeChild(iframe);
      this.modalRef.hide();
     this.router.navigate(['admin/completed-counter-signature']);
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
      this.modalRef.hide();
     this.router.navigate(['admin/completed-counter-signature']);
      //this.router.navigateByUrl("completed-counter-signature");
    }else{
      console.log('elsepart')
      this.modalRef.hide();
     this.router.navigate(['admin/completed-counter-signature']);
    }
  }
}
