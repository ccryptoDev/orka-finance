import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FileSystemDirectoryEntry, FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { DatePipe } from '@angular/common';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder, Validators } from '@angular/forms';
import { PendingSalesContractComponent } from '../pending-sales-contract/pending-sales-contract.component';
import { SharedService } from 'src/app/shared/shared.service';
import { environment } from 'src/environments/environment';
import { FormControl, FormGroup } from '@angular/forms'
@Component({
  selector: 'app-review-checklist',
  templateUrl: './review-checklist.component.html',
  styleUrls: ['./review-checklist.component.scss']
})


export class ReviewChecklistComponent implements OnInit {
  
  cm = {}
  appID :string;
  @ViewChild('requestinformation', { read: TemplateRef }) requestinformation: TemplateRef<any>;
  @Input() url1: string;
  @Input() appId: string;

  dtOptions: DataTables.Settings = {};
  sendData:any={};
  selectedItemsList = [];
  checkedIDs = [];
  reviewAddForm: FormGroup;
  data_res:any=[]
  data_sales :any ={}
  getPdfData :any=[]
  reviewlog :any
  modalRef: any;
  urlSafe: any;
  allChecked:boolean =false
  requesthide :boolean =true
    
  categoryList: { id: number; value: string; isSelected: boolean; }[];
  message: any;
  constructor(
    public datePipe: DatePipe,
    private route: ActivatedRoute,private toastrService: ToastrService,
    private service: HttpService,
    public router: Router,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private pendingsales :PendingSalesContractComponent,
    private shared:SharedService,
    
  ) { }
 

  ngOnInit(): void {

    this.dtOptions = {
      scrollX: true
    };

    this.reviewAddForm = this.formBuilder.group({
      businessborrower: ['', Validators.required],
      businessowner: ['', Validators.required],
      projectsiteaddress: ['', Validators.required],
      loanamount: ['', Validators.required],
      modulemanufacturer: ['', Validators.required],
      invertermanufacturer: ['', Validators.required],
      batterymanufacturer: ['', Validators.required],
      signaturecheck: ['', Validators.required]
    })

  

    this.appID = this.appId

    this.getPdfData = this.shared.getData();
    console.log('datares1233---',this.shared.getData());
    
    this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.getPdfData.fileloadurl);
    //this.appId

    this.getReviewData(this.getPdfData.loanid)
  }

  getReviewData(id){
   
    this.service.authget('sales-contractreview/review/'+ this.getPdfData.loanid,'admin')
    .pipe(first())
    .subscribe(res=>{

      console.log('result---log',res)

      this.reviewAddForm.get('businessborrower').setValue((res['data'].length > 0 && res['data'][0].businessborrower=='Y')? true :false);
      this.reviewAddForm.get('businessowner').setValue((res['data'].length > 0 && res['data'][0].businessowner=='Y')? true :false);
      this.reviewAddForm.get('projectsiteaddress').setValue((res['data'].length > 0 && res['data'][0].projectsiteaddress=='Y')? true :false);
      this.reviewAddForm.get('loanamount').setValue((res['data'].length > 0 && res['data'][0].loanamount=='Y')? true :false);
      this.reviewAddForm.get('modulemanufacturer').setValue((res['data'].length > 0 && res['data'][0].modulemanufacturer=='Y')? true :false);
      this.reviewAddForm.get('invertermanufacturer').setValue((res['data'].length > 0 && res['data'][0].invertermanufacturer=='Y')? true :false);
      this.reviewAddForm.get('batterymanufacturer').setValue((res['data'].length > 0 && res['data'][0].batterymanufacturer=='Y')? true :false);
      this.reviewAddForm.get('signaturecheck').setValue((res['data'].length > 0 && res['data'][0].signaturecheck=='Y')? true :false);

      this.reviewlog =res['reviewLogData'];
      //console.log('1233',this.reviewlog.length);

      this.sendData = res['getSendemail'][0];
     //console.log('1288888888--------33',this.sendData);
    }
    ,err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.toastrService.error(this.message)
    })


  }



  popupform(){
   //this.islogout =false;
    this.modalRef = this.modalService.show(this.requestinformation);
  }
  requestinfoSubmit(){

    this.data_sales.loanid = this.getPdfData.loanid;
    this.data_sales.comments = this.cm['comments'];
    this.data_sales.sendemail = this.sendData.email;
    this.data_sales.sendname = this.sendData.firstName;
    
    this.service.authpost('sales-contractreview/comments/' + this.getPdfData.loanid, 'admin',this.data_sales)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        //console.log('data', res['data']);
        // this.toastrService.success(res['message'])
        this.toastrService.success('Information Requested Successfully!')
       // this.getReviewData(this.getPdfData.loanid);
       this.cm['comments']=''
        this.modalRef.hide();

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
    
  }
  view(){
    let filename = this.getPdfData.filepath.split('/')
    filename = filename[filename.length-1]
    window.open(environment.installerapiurl+"files/download/"+filename, "_blank");
  }
  approveSubmit(){

    this.data_sales.loanid = this.getPdfData.loanid;
    this.data_sales.businessborrower = (this.reviewAddForm.value.businessborrower==true) ? 'Y':'N';
    this.data_sales.businessowner = (this.reviewAddForm.value.businessowner==true) ? 'Y':'N';
    this.data_sales.projectsiteaddress = (this.reviewAddForm.value.projectsiteaddress==true) ? 'Y':'N';
    this.data_sales.loanamount = (this.reviewAddForm.value.loanamount==true) ? 'Y':'N';
    this.data_sales.modulemanufacturer = (this.reviewAddForm.value.modulemanufacturer==true) ? 'Y':'N';
    this.data_sales.invertermanufacturer = (this.reviewAddForm.value.invertermanufacturer==true) ? 'Y':'N';
    this.data_sales.batterymanufacturer = (this.reviewAddForm.value.batterymanufacturer==true) ? 'Y':'N';
    this.data_sales.signaturecheck = (this.reviewAddForm.value.signaturecheck==true) ? 'Y':'N';


    if(this.reviewAddForm.value.businessborrower==true && this.reviewAddForm.value.businessowner==true &&
      this.reviewAddForm.value.projectsiteaddress==true && this.reviewAddForm.value.loanamount==true && 
      this.reviewAddForm.value.modulemanufacturer==true && this.reviewAddForm.value.invertermanufacturer==true &&
      this.reviewAddForm.value.signaturecheck==true && this.reviewAddForm.value.batterymanufacturer==true
      ){

      this.data_sales.status ='approved';
    }else{
      this.data_sales.status ='Y';
    }

    //onsole.log('reviewAddForm.value', this.data_sales); 

    this.service.authput('sales-contractreview/update/' + this.getPdfData.loanid, 'admin',this.data_sales)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        //console.log('data', res['data']);
        this.toastrService.success(res['message'])
        if(this.requesthide==false){
          this.router.navigate(['admin/completed-sales-contracts']);
        }
        //this.getReviewData(this.getPdfData.loanid);

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


  }
  check(e,value) {
    if(this.reviewAddForm.value.businessborrower==true && this.reviewAddForm.value.businessowner==true &&
      this.reviewAddForm.value.projectsiteaddress==true && this.reviewAddForm.value.loanamount==true && 
      this.reviewAddForm.value.modulemanufacturer==true && this.reviewAddForm.value.invertermanufacturer==true &&
      this.reviewAddForm.value.signaturecheck==true && this.reviewAddForm.value.batterymanufacturer==true
      ){

      this.requesthide = false;
    }else{
      this.requesthide = true;
    }


  }
  close(): void {
    this.cm['comments']=''
    this.modalRef.hide();
  }
}
