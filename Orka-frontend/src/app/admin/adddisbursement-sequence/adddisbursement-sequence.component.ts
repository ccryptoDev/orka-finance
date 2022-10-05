import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { HttpService } from 'src/app/_service/http.service';

@Component({
  selector: 'app-adddisbursement-sequence',
  templateUrl: './adddisbursement-sequence.component.html',
  styleUrls: ['./adddisbursement-sequence.component.scss']
})
export class AdddisbursementSequenceComponent implements OnInit {

  f1:any ={};
  res:any=[];
  maxDate: Date;
  data_add:any={};
  data:any={};
  public listfiles: any = [];
  fileitems:any = [];
  shrtname=1//set default select for shortname
  modalRef: BsModalRef;
  message:any = [];
  dstatusN:string='ACTIVE';
  dstatus:string='NOACTIVE'

  businessName:string;
  businessEmail:string;
  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;
  error_achcal: boolean;
  calValid: boolean;

  constructor(

    private service: HttpService,
    private modalService: BsModalService,
    public router:Router,private toastrService: ToastrService,
   
  ) { }

  ngOnInit(): void {

    this.f1.m1type=null;
    this.f1.m2type=null;
    this.f1.m3type=null;
    this.f1.m4type=null;
    this.f1.m5type=null;

    this.f1.m4percentage =null;
    this.f1.m5percentage =null;

  }

  namedata(data){
    //   data.target.value = data.target.value.replace(/[^A-Za-z.]/g, '');
    //  return data.target.value ? data.target.value.charAt(0).toUpperCase() +data.target.value.substr(1).toLowerCase() : '';
    return data.target.value;
  }
  
  adddisbursementSubmit() {    


    //console.log('-----',this.f1.m4percentage,this.f1.m5percentage)
//let type4 = this.f1.m4percentage
    let count  =  parseInt(this.f1.m1percentage)
    let count1 = parseInt(this.f1.m2percentage)
    let count2 = parseInt(this.f1.m3percentage)
    let count3 = ((this.f1.m4percentage)==null || (this.f1.m4percentage)=='')?0:parseInt(this.f1.m4percentage)
    let count4 = ((this.f1.m5percentage)==null || (this.f1.m5percentage)=='')?0:parseInt(this.f1.m5percentage)
    
    let total=0
    if(count3!=NaN && count4!=NaN){
     // console.log('11111',count4,count3)
      total = count + count1 + count2 + count3 + count4
      
    }else if(count3!=NaN && count4==NaN){
      total = count + count1 + count2 + count3
     // console.log('2',count4,count3)
    }else if(count3==NaN && count4!=NaN){
      total = count + count1 + count2 + count4
     // console.log('3',count4,count3)
    }else{
      total = count + count1 + count2
     // console.log('4')
    }

//console.log('count---',count4,count3)

    console.log('total',total)
    if(total > 100){
     this.toastrService.error('Percentage total must be less than 100%')
     return false
   }
    //return false;
    this.data_add.name = this.f1.disbursementName;
    this.data_add.total_disbs = this.f1.disbursementTotal;
    this.data_add.m1_percent = this.f1.m1percentage;
    this.data_add.m2_percent = this.f1.m2percentage;
    this.data_add.m3_percent = this.f1.m3percentage;
    this.data_add.m4_percent = ((this.f1.m4percentage)==null) ?count3 :this.f1.m4percentage;
    this.data_add.m5_percent = ((this.f1.m5percentage)==null) ?count4 :this.f1.m5percentage;

    this.data_add.m1_type = this.f1.m1type;
    this.data_add.m2_type = this.f1.m2type;
    this.data_add.m3_type = this.f1.m3type;
    this.data_add.m4_type = this.f1.m4type;
    this.data_add.m5_type = this.f1.m5type;
    
    //console.log(this.f1)
    
    this.service.authpost('disbursement-sequence/add','admin',this.data_add)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.toastrService.success("Disbursement Sequence added successfully");
        this.router.navigate(['admin/disbursement-sequence']);
      }else{
        this.message = res['message']
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

  updateLoanProducts(e){

  }
  close(): void {
    this.modalRef.hide();
    
  }
  keyPressNumbers(evt) {
      var charCode = (evt.which) ? evt.which : evt.keyCode;
      if (charCode != 46 && charCode > 31 
      && (charCode < 48 || charCode > 57)){
        return false;
      }
      return true;
  }

}
