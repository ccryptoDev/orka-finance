import { Component, OnInit,ElementRef,TemplateRef,ViewChild } from '@angular/core';
import { HttpService} from '../_service/http.service';
import { BsModalRef, BsModalService,ModalOptions } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import { ToastrService } from "ngx-toastr"
import { first } from 'rxjs/operators';
import { Gtag } from 'angular-gtag';

@Component({
  selector: 'app-installersidebar',
  templateUrl: './installersidebar.component.html',
  styleUrls: ['./installersidebar.component.scss'],
  host: {
    '(document:click)': 'onClickdropdown($event)',
  },
})
export class InstallersidebarComponent implements OnInit {

  modalRef: BsModalRef;
  islogout:boolean;
  f1:any ={};
  data:any={};
  message:any = [];
  componentName : string
  installer_loginName=sessionStorage.getItem('installer_firstName');
  businessName = sessionStorage.getItem('businessName')
  hidden: boolean;
  hiddensales:boolean;
  hiddenstate:boolean;


  // ngbModalOptions: ModalOptions = {
  //   backdrop: 'static',
  //   keyboard: false,////
  //   animated: true,
  //   ignoreBackdropClick: true,
  // }
  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;
  @ViewChild('createOpportunityform', { read: TemplateRef }) createOpportunityform:TemplateRef<any>;
  constructor(
    private service:HttpService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    public router: Router,
    private _eref: ElementRef,
    private gtag: Gtag
  ) { }
  pages:any = {
    "Main":false,
    "Customers":false,
    "Profile":false
   }

  ngOnInit(): void {
    let pages = sessionStorage.getItem('pages')
    var href = this.router.url;
    var s = href.split('/');
    this.componentName=s[2];//
    console.log('1111',this.componentName)

    if(pages){
      pages = JSON.parse(pages)
      for (let i = 0; i < pages.length; i++) {
        this.pages[pages[i]['name']]=true;
      }
    }
  }

  onClickdropdown(event) {
    if (!this._eref.nativeElement.contains(event.target)){
        this.islogout=false;
        this.hiddenstate=false;
        this.hiddensales=false;
        this.hidden=false
    } // or some similar check

   }

  popupform(){
    this.modalRef = this.modalService.show(this.createOpportunityform);
  }
  namedata(data){
    //   data.target.value = data.target.value.replace(/[^A-Za-z.]/g, '');
    //  return data.target.value ? data.target.value.charAt(0).toUpperCase() +data.target.value.substr(1).toLowerCase() : '';
    return data.target.value;
    }
  createOpportunitySubmit(){
    this.f1.businessLegalName = this.data.businessLegalName;
    this.f1.applicantFirstName = this.data.applicantFirstName;
    this.f1.applicantLastName = this.data.applicantLastName;
    this.f1.businessEmail = this.data.businessEmail;
    this.f1.installerId=sessionStorage.getItem("InstallerUserId");
    console.log(this.f1)
    this.service.post('create-opportunity','sales',this.f1)
    .pipe(first())
    .subscribe(res=>{
      if(res['id']){
        this.gtag.event('click', {
          event_category: 'Partner Portal',
          event_label: 'New Opportunity Created'
        });
        console.log(res['id'])
        this.modalRef.hide();
        this.service.successMessage('Client Opportunity Successfully Created!')
        setTimeout(()=>{
            this.router.navigate(['partner/opportunity/'+res['loanId']])
            .then(() => {
            window.location.reload();
            });
        },3000)

      }else{
        this.modalRef.hide();
        this.service.errorMessage(res['message'])
        //this.message = res['message']
        //this.modalRef = this.modalService.show(this.messagebox);
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(this.messagebox);
    })
  }
  close(): void {
    this.modalRef.hide();
  }

  logout(){
    this.service.logout()
  }
  navigatedocument(){
    this.router.navigate(['partner/document-center'])

  }



}
