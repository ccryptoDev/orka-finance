import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/_service/http.service';
import { ToastrService } from "ngx-toastr";
import {
  PlaidConfig,
  NgxPlaidLinkService,
  PlaidLinkHandler
} from "ngx-plaid-link";

import {environment } from '../../../environments/environment';
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-plaid',
  templateUrl: './plaid.component.html',
  styleUrls: ['./plaid.component.scss']
})
export class PlaidComponent implements OnInit {

  loanId = sessionStorage.getItem('loanId');
  OsName:string;
  apForm: FormGroup;
  data: any = {};
  data_res:any ={}
  message: any;

  constructor(private plaidLinkService: NgxPlaidLinkService,
    private formBuilder: FormBuilder,private router: Router, private service: HttpService,private toastrService: ToastrService) { }


  get apiFormvalidation() {
    return this.apForm.controls;
  }

  private plaidLinkHandler: PlaidLinkHandler
  private config: PlaidConfig = {
    apiVersion: environment.plaidApiVersion,
    env:  environment.plaidEnv,
    token: '',
    webhook: "",
    product: ['auth','assets','transactions'],
    countryCodes: ['US'],
    key: "",
    onSuccess: (token, metadata) => this.onSuccess(token, metadata),
    onExit: (error, metadata) => this.onExit(error, metadata),
    onEvent: (eventName, metadata) => this.onEvent(eventName, metadata)
  };

  ngOnInit(): void {

    this.apForm = this.formBuilder.group({
    });

    this.data.lifeCycleStage =null
    this.data.expectedRevGrowth =null
    this.data.profitabilityGrowth =null



    this.OsName=this.service.getOsName();/// to get osname
    this.getLoanStatus();
    this.getReviewquestions()
  }
  getReviewquestions(){

    this.service.get("questions/" + this.loanId, 'sales')
    .pipe(first())
    .subscribe((res: any) => {
      console.log('---',res)
      if (res.statusCode == 200) {
        //console.log('---',res.businessData)
        this.data.lifeCycleStage = res.businessData.lifeCycleStage;
        this.data.expectedRevGrowth = res.businessData.expectedRevGrowth;
        this.data.growthDrivers = res.businessData.growthDrivers;
        this.data.profitabilityGrowth = res.businessData.profitabilityGrowth;
        this.data.liabilities = res.businessData.liabilities;
        this.data.challenges = res.businessData.challenges;
        this.data.profitabilityGrowthreason =res.businessData.otherReason;    
      }
    })

  }

  getLoanStatus() {
    console.log("called")
    this.service.get("loan/status/" + this.loanId, 'sales')
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

  plaidLogin(){

  
    if(this.data.expectedRevGrowth!=null && this.data.lifeCycleStage!=null && 
      this.data.profitabilityGrowth!=null && this.data.growthDrivers!='' && this.data.liabilities!=''){
        this.data_res.loanId =this.loanId;
        this.data_res.lifeCycleStage=this.data.lifeCycleStage,
        this.data_res.expectedRevGrowth=this.data.expectedRevGrowth,
        this.data_res.growthDrivers=this.data.growthDrivers,
        this.data_res.profitabilityGrowth=this.data.profitabilityGrowth,
        this.data_res.liabilities=this.data.liabilities,
        this.data_res.challenges=this.data.challenges,
        this.data_res.otherReason =(this.data.profitabilityGrowth=='Other')?this.data.profitabilityGrowthreason:'',

      this.service.authpost('questions/update/', 'sales',this.data_res)
      .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){
          this.toastrService.success('Financial Review Questions are Updated Successfully!')
          this.plaidloginapi()

        }else{
          this.toastrService.error(res['message'])
        }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.toastrService.error(this.message)
    })


      
    }else{
      this.toastrService.error('Please fill all Required fields!')
    }

  }

  plaidloginapi(){

    this.service.get("plaid/linktoken/"+this.loanId,"admin").subscribe(res=>{
      console.log(res)
      this.config.token = res['token']
      this.plaidLinkService
        .createPlaid( Object.assign({}, this.config, {
          onSuccess: (token, metadata) => this.onSuccess(token, metadata),
          onExit: (error, metadata) => this.onExit(error, metadata),
          onEvent: (eventName, metadata) => this.onEvent(eventName, metadata)
        })
      ).then((handler: PlaidLinkHandler) => {
        this.plaidLinkHandler = handler;
        this.open();
      });

    })

  }

  open() {
    this.plaidLinkHandler.open();
  }

  onSuccess(token, metadata) {
    console.log("test")
    console.log('Check Token Public',token)
    var sendData:any = { public_token:token,reconnect:false };
    this.service.post("plaid/savetoken/" + this.loanId, "admin",sendData).subscribe(res => {
      if (res['statusCode']==200) {
        this.service.get("plaid/get-auth/"+this.loanId,"admin").subscribe(res=>{
          if(res['statusCode']==200)
          {
            this.router.navigate(['sales/plaid-success'])
            this.service.successMessage("Bank connected.");
          }
          else
          {
            this.service.errorMessage("Something problem try later.");
            console.log(res)
          }
        })
      } else {
        let msg;
        try {
          msg = res['message'][0];
        } catch(e) {
          msg = "Something problem try later.";
        }
      }
    }, err => {
      this.service.errorMessage("Something problem try later.");
      console.log(err)
    })
  }

  onExit(error, metadata) {
    // console.log("Plaid Exit",error,metadata)
  }

  onEvent(eventName, metadata) {
    // console.log("plaid event",eventName,metadata)
    }

  next() {
    this.router.navigate(['sales/plaid-opt-out'])
  }
 namedata(data) {
    //   data.target.value = data.target.value.replace(/[^A-Za-z.]/g, '');
    //  return data.target.value ? data.target.value.charAt(0).toUpperCase() +data.target.value.substr(1).toLowerCase() : '';
    return data.target.value;
  }
  
 
}
