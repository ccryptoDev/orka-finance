import { Component, OnInit,TemplateRef,ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from "rxjs";
import { first } from 'rxjs/operators';
import { FileSystemDirectoryEntry, FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { ToastrService } from "ngx-toastr";

import { HttpService } from '../../_service/http.service';
import { environment } from '../../../environments/environment';
import { EquifaxInstance } from '../../_service/common.service';

@Component({
  selector: 'app-viewinstaller',
  templateUrl: './viewinstaller.component.html',
  styleUrls: ['./viewinstaller.component.scss']
})
export class ViewinstallerComponent implements OnInit {
  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;
  data_res_val: any = {};
  data: any = [];
  data_sht_name: any = [];
  modalRef: BsModalRef;
  message: any = [];
  f1: any = {};
  dtOptions: any = {};
  noOrder: any = {};
  data_add_shtname: any = {};
  data_change_status: any= {};
  data_add: any = {};
  res: any = [];
  loanproducts = EquifaxInstance.loanProducts;
  admin_res: any = [];
  status_res: string;
  form: FormGroup;
  onOff = true;
  files: NgxFileDropEntry[] = [];
  listfiles: any = [];
  fileitems:any = [];
  dtTrigger: Subject<any> = new Subject<any>();
  options: {} = {
    componentRestrictions: {
      country: ['US']
    }
  };
  data_res: any = {
    files:[]
  };
  tabs: any = {
    "Document Center":false,
    "Installer Information":false,
  };

  constructor(
    private service: HttpService,
    private toastrService: ToastrService,
    private modalService: BsModalService,
    public router:Router,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    const installerdetails = sessionStorage.getItem("installerdetails");
    const adminID = sessionStorage.getItem("resuser");

    this.admin_res = [JSON.parse(adminID)];
    this.dtOptions = { scrollX: true };
    this.noOrder = { order: [] };
    this.form = this.formBuilder.group({
      user_id: [],
      businessName: [],
      businessShortName: [],
      businessEmail:[],
      businessPhone:[],
      firstName:[],
      lastName:[],
      businessAddress: [],
      contractorLicense: [],
      contractorLicenseState: [],
      state: [],
      city: [],
      zipCode:[],
      lat:[],
      lng:[],
      disbursement:[]
    });

    if (!installerdetails) {
      this.router.navigate(['admin/partner']);
    } else {
      this.data = [JSON.parse(installerdetails)];
      
      if (this.data[0]['active_flag']=='Y') {
        this.status_res = 'Active';
      } else {
        this.status_res = 'Inactive';
      }
    }

    this.getallfiles();
    this.getDetails(this.data[0].user_id);
    this.getPartnerUserList(this.data[0].user_id);
    this.getLoanProducts(this.data[0].user_id);
    this.getLoanProductsPartner(this.data[0].user_id);
    this.getall_shortname();
    this.getLoanproduct_logs(this.data[0].user_id);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  getLoanproduct_logs(logid: any) {
    //console.log('**',logid)
    this.service.authget('loanproducts/logs/' + logid,'admin')
    .pipe(first())
    .subscribe(res=>{

      if(res['statusCode']==200){
        // this.data_sht_name= res['data']
        // console.log('shortname',this.data_sht_name)
        //console.log('//////*******///////',res['data'])
        this.data.loanproducts_logs=res['data'];
        //console.log('loanproducts_logs',this.data.loanproducts_logs)
      }
    },err=>{
      console.log(err)
    })

  }

  getLoanProducts(loanid: any) {

    this.service.authget('loanproducts/' + loanid,'admin')
    .pipe(first())
    .subscribe(res=>{
      //console.log('ressss',res)
      if(res['statusCode']==200){
        // this.data_sht_name= res['data']
        // console.log('shortname',this.data_sht_name)

        this.data.loanproducts=res['data'];
        //console.log('loanproducts',this.data.loanproducts)
      }
    },err=>{
      //console.log(err)
    })
  }

  getLoanProductsPartner(lid: any) {
    // this.service.authget('installer/specific-installer-users/' + lid,'admin')
    // .pipe(first())
    // .subscribe(res=>{
    //   //console.log('ressss',res)
    //   if(res['statusCode']==200){
    //     this.data_sht_name= res['data']
    //     console.log('shortname',this.data_sht_name)
    //   }
    // },err=>{
    //   console.log(err)
    // })
  }

  getPartnerUserList(sid: any) {
//console.log('---',sid)
    this.service.authget('installer/specific-installer-users/' + sid,'admin')
    .pipe(first())
    .subscribe(res=>{
      //console.log('ressss',res)
      if(res['statusCode']==200){
        this.data_sht_name= res['data']
        //console.log('shortname',this.data_sht_name)
      }
    },err=>{
      //console.log(err)
    })
  }

  view_user(data) {
    sessionStorage.setItem("installerdetails",JSON.stringify(data))
    this.router.navigate(['admin/partner/view']);
  }

  add_existing_user(template: TemplateRef<any>) {
    // this.f1 = {}
    // this.f1['role'] = 'admin'
    this.modalRef = this.modalService.show(template);

  }

  getall_shortname() {
    this.service.authget('roles/shortname','admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        //console.log("res",res)
       this.res= res['data']
       this.res.businessShortName=null

       // console.log("check",this.res)
      }
    },err=>{
      console.log(err)
    })
  }

  onChangeShortName(shortname) {

    this.data_add.shortlistval=this.res.filter(xx => xx.businessShortName == shortname);
    // console.log('shortname is',this.data_add.shortlistval[0].businessEmail);
    this.res.businessName=this.data_add.shortlistval[0].businessName;
    this.res.businessEmail=this.data_add.shortlistval[0].businessEmail;
  }

  adduserSubmit(){

    this.data_add_shtname.businessShortName=this.res.businessShortName
    this.data_add_shtname.userEmail=this.res.userEmail
    this.data_add_shtname.firstName=this.res.firstName
    this.data_add_shtname.lastName=this.res.lastName
    //console.log("addd",this.data_add_shtname)
    this.service.authpost('installer/add-existing','admin',this.data_add_shtname)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.toastrService.success("User for Existing Partner added successfully!")
        this.modalRef.hide();
      }else{
        this.message = res['message']
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

  updateinstall_info(updateid: any) {
    //console.log('-----',updateid)

    this.data_res_val.user_id=updateid;
    this.data_res_val.businessName=this.form.value['businessName'];
    this.data_res_val.businessShortName=this.form.value['businessShortName'];
    this.data_res_val.businessEmail=this.form.value['businessEmail'];
    this.data_res_val.businessPhone=this.form.value['businessPhone'];
    this.data_res_val.firstName=this.form.value['firstName'];
    this.data_res_val.lastName=this.form.value['lastName'];
    this.data_res_val.businessAddress=this.form.value['businessAddress'];
    this.data_res_val.city=this.form.value['city'];
    this.data_res_val.zipCode=Number(this.form.value['zipCode']);
    this.data_res_val.state=this.form.value['state'];
    this.data_res_val.contractorLicense=this.form.value['contractorLicense'];
    this.data_res_val.contractorLicenseState=this.form.value['contractorLicenseState'];
    this.data_res_val.disbursement =this.form.value['disbursement'];

    //console.log('****',this.form.value)
    console.log('----',this.data_res_val)

    this.service.authput('installer/edit/','admin',this.data_res_val) .pipe(first())
    .subscribe(res=>{
        //console.log('updated successfully---',this.data_res,res)
        this.toastrService.success("Updated Successfully!");
    },err=>{
      //console.log('error',this.data_res)
      if(err['status']!=200)
      {
        this.toastrService.error("Error Updating!");
        // setTimeout(() => {
        //   this.router.navigate(['admin/partner/']);
        // }, 5000);  //5s
      }
    })

  }

  getDetails(id) {
    this.service.authget('installer/'+id,'admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
       console.log("res view",res)
       this.f1= res['data'][0];
       this.f1['disbursement']=res['data'][0].disbursementSequenceId
      this.data.disbursement = res['disbursement']
       console.log("this.f1",this.data.disbursement)
       if(this.f1['active_flag']=='Y'){
        this.status_res='Active'
      }else{
        this.status_res='Inactive'
      }
        //console.log("check",this.f1)
      }
    },err=>{
      console.log(err)
    })
  }

  getallfiles() {
    let getlistfiles=this.service.get('files/allFiles/'+this.data[0]['user_id'], 'partner')
    getlistfiles.pipe(first()).subscribe(res=>{

    //console.log('listFiles',res['fileData'],this.data[0]['user_id'])
    this.data_res['files']=res['fileData']
    },err=>{
      console.log(err)
    })
  }

  active() {
  //add comment

    this.service.authget('users/active/'+this.data[0]['user_id'],'admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.data[0]['active_flag'] = 'Y'
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
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

  deactive() {

    this.service.authget('users/deactive/'+this.data[0]['user_id'],'admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
      this.data[0]['active_flag'] = 'N'
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
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

  delete() {

    this.service.authget('users/delete/'+this.data[0]['user_id'],'admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.router.navigate(['admin/partner']);
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
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

  view(filename: any) {
    filename = filename.split('/')
    filename = filename[filename.length-1]
    
    this.service
      .authgetfile(`files/download/${filename}`, 'admin')
      .pipe(first())
      .subscribe(async (res) => {
        window.open(URL.createObjectURL(new Blob([res], { type: 'application/pdf' })), "_blank");
      });
  }

  addlogs(module, id) {
    this.service.addlog(module,id,'partner').subscribe(res=>{},err=>{})
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
      let validFile = this.isFileAllowed(droppedFile.fileEntry.name)
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
        if(!validFile){
          this.toastrService.error("File format not supported! Please drop .pdf, .jpg, .jpeg, .png, .docx files")
        }
      }
    }
    //console.log(this.listfiles)
  }

  fileOver(event) {
   // console.log(event);
  }

  fileLeave(event) {
   // console.log(event);
  }

  selectDocType(i, event) {
    if(event.target.value!='Other'){
      $(event.target).next('input').attr('hidden', 'hidden')
      this.fileitems[i]['documentType']=event.target.value;
    }else{
      this.fileitems[i]['documentType']='';
      $(event.target).next('input').removeAttr('hidden')
    }
  }

  docTypeComment(i, value) {
    this.fileitems[i]['documentType']=value;
  }

  upoadDocuments() {
    if(this.fileitems.length>0){
      const formData = new FormData();
      formData.append('link_id',this.data[0]['user_id'])
      for (var i = 0; i < this.fileitems.length; i++) {
        if(!this.fileitems[i]['documentType'] || this.fileitems[i]['documentType']==''){
          this.message = ['Please select the document type for all documents'];
          this.modalRef = this.modalService.show(this.messagebox);
          return false;
        }
        formData.append("documentTypes[]", this.fileitems[i].documentType);
        formData.append("files[]", this.fileitems[i]);
        formData.append("services", "admin/uploadDocuments");

      }

      this.service.authfiles("files/uploads","partner",formData)
        .pipe(first())
        .subscribe(res=>{

          if(res['statusCode']==200){
            //console.log('filesres',res['data']['files']);
            this.toastrService.success("File Uploaded Successfully!")
            this.data_res['files'] = res['data']['files'];
            this.files = []
            this.listfiles = []
            this.fileitems = []
          }
        },err=>{
          if(err['error']['message'].isArray){
            this.message = err['error']['message']
          }else{
            this.message = [err['error']['message']]
          }
          this.modalRef = this.modalService.show(this.messagebox);
        })
    }else{
      this.message = ['Select Any Documents']
      this.modalRef = this.modalService.show(this.messagebox);
    }
  }

  updateLoanProducts(pid:any,pstatus) {
    //console.log('ProductID',pid,'Status',pstatus.target.checked)
    this.data_change_status.productId=pid
    this.data_change_status.installerId=this.data[0]['user_id']
    this.data_change_status.userId=this.admin_res[0]['id']
    this.data_change_status.status=(pstatus.target.checked==true)?'Y':'N'
//console.log('USER ID',this.data_change_status)
    //console.log('----',this.data_change_status)
   this.service.authpost('loanproducts','admin',this.data_change_status) .pipe(first())
    .subscribe(res=>{
      this.getLoanproduct_logs(this.data[0].user_id)
        //console.log('updated successfully---')
       // this.toastrService.success("Updated Successfully!");
    },err=>{
      //console.log('error',this.data_res)
      if(err['status']!=200)
      {

      }
    })

  }

  deleteFileSelected(file) {
    this.fileitems.splice(this.fileitems.findIndex(f=>f.name==file.name), 1);
  }

  keyPressNumbers(event) {
    var charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode < 48 || charCode > 57)) {
    event.preventDefault();
    return false;
    } else {
    return true;
    }
  }

  handleAddressChange(address: any) {
    this.f1.businessAddress = address.formatted_address;
    console.log("gadd",address.geometry.location.lat(),address.geometry.location.lng());
    this.data.lat = address.geometry.location.lat().toString();
    this.data.lng = address.geometry.location.lng().toString();

    console.log(this.data.lat,'/////*****////',this.data.lng)
    for (const component of address.address_components) {
      const componentType = component.types[0];

      switch (componentType) {

        case "postal_code": {
          this.f1.zipCode = `${component.long_name}`;
          break;
        }

        // case "postal_code_suffix": {
        //   this.data.businessInstallZipCode = `${this.data.ownerZipCode}-${component.long_name}`;
        //   break;
        // }

        case "locality":
          this.f1.city = component.long_name;
          break;

        case "administrative_area_level_1": {
          this.f1.state = component.long_name;
          break;
        }
      }
    }
  }
}
