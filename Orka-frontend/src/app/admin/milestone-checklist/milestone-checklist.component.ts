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
import { EquipmentComponent } from '../equipment/equipment.component';
import { SharedService } from 'src/app/shared/shared.service';
import { environment } from 'src/environments/environment';
import { FormControl, FormGroup } from '@angular/forms'

@Component({
  selector: 'app-milestone-checklist',
  templateUrl: './milestone-checklist.component.html',
  styleUrls: ['./milestone-checklist.component.scss']
})
export class MilestoneChecklistComponent implements OnInit {

  cm = {}
  appID :string;
  @ViewChild('requestinformation', { read: TemplateRef }) requestinformation: TemplateRef<any>;
  @Input() url1: string;
  @Input() appId: string;

  dtOptions: DataTables.Settings = {};
  sendData:any={};
  sendMaildata:any={};
  selectedItemsList = [];
  checkedIDs = [];
  
  reviewAddForm: FormGroup;
  data_res:any=[]
  data_permit:any=[]
  data_c:any=[];
  data_pto:any=[]
  data_sales :any ={}
  getPdfData :any=[]
  reviewlog :any
  modalRef: any;
  urlSafe: any;
  allChecked:boolean =false
  requesthide :boolean =true
  ishowiframe:boolean =false
  i:any;
    
  categoryList: { id: number; value: string; isSelected: boolean; }[];
  message: any;
  senddata: string;
  milestoneVal: any;
  loadurl: string;
  checkcount: any;
  checkarray: any=[];
  constructor(
    public datePipe: DatePipe,
    private route: ActivatedRoute,private toastrService: ToastrService,
    private service: HttpService,
    public router: Router,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private equipment :EquipmentComponent,
    private shared:SharedService,
    
  ) { }
 

  ngOnInit(): void {

    this.dtOptions = {
      scrollX: true
    };

   // this.createForm();
    this.reviewAddForm = this.formBuilder.group({
      originalname: ['', Validators.required],
    })

    this.appID = this.appId

    this.getPdfData = this.shared.getMData();
    console.log('datares1233---',this.shared.getMData());
    
    //this.appId

    this.milestoneVal = (this.getPdfData.milestone=='Equipment/Permit')?'Equipment':this.getPdfData.milestone

    this.getReviewData(this.getPdfData.loanid,this.milestoneVal)
  }

  getReviewData(id,milestone){

    this.senddata = id+'$'+milestone
    this.service.authget('milestone/equipment/'+ this.senddata,'admin')
    .pipe(first())
    .subscribe(res=>{

      //console.log('result---log',res)
      this.reviewlog =res['reviewLogData'];

      this.checkcount = res['data'].length;

      this.sendMaildata = res['getSendemail'];

      if(this.milestoneVal=='Equipment'){
        this.data_res = res['data'].filter(
          (xx) => xx.services == 'Equipment'
        );

        this.data_permit = res['data'].filter(
          (xx) => xx.services == 'Equipment/Permit'
        );
      }else if(this.milestoneVal=="Construction"){
     

      this.data_c = res['data'].filter(
        (xx) => xx.services == 'Construction'
      );
//console.log(this.data_c)
      }else{
      this.data_pto = res['data'].filter(
        (xx) => xx.services == 'Commercial Operation'
      );
      }

      if(this.milestoneVal=='Equipment'){
        
        this.createChecklist(this.data_res,this.data_permit)
      }else  if(this.milestoneVal=='Construction'){
        this.createChecklist(this.data_c,[])
      }else{
        this.createChecklist(this.data_pto,[])
      }
     

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
    this.data_sales.id = this.getPdfData.milestoneid;
    this.data_sales.comments = this.cm['comments'];
    this.data_sales.sendemail = this.sendMaildata[0].email;
    this.data_sales.sendname = this.sendMaildata[0].firstName;

    this.data_sales.milestone = this.getPdfData.milestone;
    this.data_sales.businessname = this.getPdfData.borrower;


    //console.log('thissendData',this.sendMaildata)
    console.log(this.data_sales)
    
    this.service.authpost('milestone/comments/' + this.getPdfData.loanid, 'admin',this.data_sales)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        //console.log('data', res['data']);
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
    // let filename = this.getPdfData.filepath.split('/')
    // filename = filename[filename.length-1]

    if(this.loadurl){
    window.open(this.loadurl);
    }else{
      this.toastrService.error('Please Click the File Name to Open')
    }
  }
  approveSubmit(){

    this.data_sales.id = this.getPdfData.milestoneid;
    this.data_sales.loanid = this.getPdfData.loanid;
    this.data_sales.status = 'Approved';

    //onsole.log('reviewAddForm.value', this.data_sales); 

    this.service.authpost('milestone/update/' + this.getPdfData.loanid, 'admin',this.data_sales)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        //console.log('data', res['data']);
        this.toastrService.success(res['message'])
        if(this.requesthide==false){
          this.router.navigate(['admin/complete-milestone-reviews']);
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
  createChecklist(res,d){

    res = res.concat(d)

    //this.checkarray = res;
    this.checkarray = res.map(function(el) {
      var o = Object.assign({}, el);
      o.ischecked = false;
      return o;
    })

console.log(res,'---',this.checkarray)
  }

  check(e,value,i) {
   // console.log(e.target.checked)
    // if(this.reviewAddForm.value.businessborrower==true && this.reviewAddForm.value.businessowner==true &&
    //   this.reviewAddForm.value.projectsiteaddress==true && this.reviewAddForm.value.loanamount==true && 
    //   this.reviewAddForm.value.modulemanufacturer==true && this.reviewAddForm.value.invertermanufacturer==true &&
    //   this.reviewAddForm.value.signaturecheck==true && this.reviewAddForm.value.batterymanufacturer==true
    //   ){

    //   this.requesthide = false;
    // }else{
    //   this.requesthide = true;
    // }
    let a: number = 0;let c: number =0
    this.checkarray.forEach(r => {
      //console.log(r.originalname,'---',e.target.name)
      if(r.originalname == e.target.name){

        this.checkarray[a].ischecked =e.target.checked
       // this.checkarray.splice(a, 1);
      }
      a++;
      c++;
   });

   let count:any=[] = this.checkarray.filter(
    (xx) => xx.ischecked == true
  );
   
   if(count.length==this.checkarray.length){
    this.requesthide = false;
   }else{
    this.requesthide = true;
   }

    //console.log(value.split('/')[2])
    // this.loadurl  = environment.installerapiurl+"files/download/"+i.split('/')[2];

    // this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.loadurl);
  
    // this.ishowiframe = e.target.checked

  }

  clickfileview(i){
    const filename = i.split('/')[2];

    this.service
      .authgetfile(`files/download/${filename}`, 'admin')
      .pipe(first())
      .subscribe(async (res) => {
        this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(new Blob([res], { type: 'application/pdf' })));
      });
    this.ishowiframe = true
  }
  close(): void {
    this.cm['comments']=''
    this.modalRef.hide();
  }
  
  checktype(e){
    
    let res = e.split('.');
   // console.log(res[1])
    return res[1];
   
  }

 

}
