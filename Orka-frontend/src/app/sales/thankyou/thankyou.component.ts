import { HttpService } from './../../_service/http.service';
import { Router } from '@angular/router';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-thankyou',
  templateUrl: './thankyou.component.html',
  styleUrls: ['./thankyou.component.scss']
})
export class ThankyouComponent implements OnInit {

  constructor(private router: Router, private service: HttpService, private toastrService: ToastrService, private modalService: BsModalService,) { }
  data: any = {};
  deResult = null;
  ngOnInit(): void {
    this.data.loanId = sessionStorage.getItem('loanId');
    // this.sendMailSuccess()
    // this.getReports();
  }
  // sendMailSuccess(){
    
  // }

  // async getReports(){

  //   try {
  //     const equifaxRes = await this.service.get('loan/reportresult/' + this.data.loanId, 'admin').toPromise();
  //     if(equifaxRes && equifaxRes['equifax-consumer'] == "PASS" && equifaxRes['equifax-comercial-set2'] == "PASS") {
  //         this.deResult = "PASS"
  //     } else {
  //       this.deResult = "BYPASS"
  //     }
      
  //   } catch(ex) {
  //     this.deResult = "ERROR"
  //     console.log(ex);
  //   }
    
  
  // }

}
