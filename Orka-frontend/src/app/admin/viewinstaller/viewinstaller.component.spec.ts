import { Component, OnInit,TemplateRef,ViewChild } from '@angular/core';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { Router } from "@angular/router";
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FileSystemDirectoryEntry, FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { ToastrService } from "ngx-toastr";
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-viewinstaller',
  templateUrl: './viewinstaller.component.html',
  styleUrls: ['./viewinstaller.component.scss']
})
export class ViewinstallerComponent implements OnInit {
  data_res_val:any={}
  data:any = [];
  modalRef: BsModalRef;
  message:any = [];
  f1:any ={};
  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;

  data_res:any={
    files:[],
  }
  status_res:string;
  form: FormGroup;
  

  public files: NgxFileDropEntry[] = [];
  public listfiles: any = [];
  fileitems:any = [];

  tabs:any = {
  "Document Center":false,
  "Installer Information":false,
  }
  constructor(private service: HttpService,private toastrService: ToastrService,
    private modalService: BsModalService,public router:Router,private route: ActivatedRoute,private formBuilder: FormBuilder) { }


  ngOnInit(): void {
    

    this.form = this.formBuilder.group({
      user_id: [],
      businessName: [],
      businessShortName: [],
      businessEmail:[],
      businessPhone:[],
      businessAddress: [],
      contractorLicense: [],
      contractorLicenseState: [],
      state: [],
      city: [],
      zipCode:[],
    });

    let installerdetails = sessionStorage.getItem("installerdetails")
    if(!installerdetails){
      this.router.navigate(['admin/partner']);
    }else{
      this.data = [JSON.parse(installerdetails)]
      if(this.data[0]['active_flag']=='Y'){
        this.status_res='Active'
      }else{
        this.status_res='Inactive'
      }
    }
    this.getallfiles()
    this.getDetails(this.data[0].user_id)
  }

  updateinstall_info(updateid:any){
    //console.log('-----',updateid)

    this.data_res_val.user_id=updateid;
    this.data_res_val.businessName=this.form.value['businessName'];
    this.data_res_val.businessShortName=this.form.value['businessShortName'];
    this.data_res_val.businessEmail=this.form.value['businessEmail'];
    this.data_res_val.businessPhone=this.form.value['businessPhone'];
    this.data_res_val.businessAddress=this.form.value['businessAddress'];
    this.data_res_val.city=this.form.value['city'];
    this.data_res_val.zipCode=Number(this.form.value['zipCode']);
    this.data_res_val.state=this.form.value['state'];
    this.data_res_val.contractorLicense=this.form.value['contractorLicense'];
    this.data_res_val.contractorLicenseState=this.form.value['contractorLicenseState'];
    //console.log('----',this.data_res_val)

    this.service.authput('installer/edit/','admin',this.data_res_val) .pipe(first())
    .subscribe(res=>{
        //console.log('updated successfully---',this.data_res,res)
        this.toastrService.success("Updated Successfully!");
    },err=>{
      console.log('error',this.data_res)
      if(err['status']!=200)
      {
        this.toastrService.error("Error Updating!");
        // setTimeout(() => {
        //   this.router.navigate(['admin/partner/']);
        // }, 5000);  //5s
      }
    })

  }

  getDetails(id){
    this.service.authget('installer/'+id,'admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log("res",res)
       this.f1= res['data'][0]
       if(this.f1['active_flag']=='Y'){
        this.status_res='Active'
      }else{
        this.status_res='Inactive'
      }
        console.log("check",this.f1)
      }
    },err=>{
      console.log(err)
    })
  }

  getallfiles(){
    let getlistfiles=this.service.get('files/allFiles/'+this.data[0]['user_id'], 'partner')
    getlistfiles.pipe(first()).subscribe(res=>{

    //console.log('listFiles',res['fileData'],this.data[0]['user_id'])
    this.data_res['files']=res['fileData']
    },err=>{
      console.log(err)
    })
  }

  active(){
    
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

  deactive(){
    
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

  delete(){
    
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

  
  view(filename:any){
    filename = filename.split('/')
    filename = filename[filename.length-1]
    window.open(environment.installerapiurl+"files/download/"+filename, "_blank");
  }

  addlogs(module,id){
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

  public dropped(files: NgxFileDropEntry[]) {
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

  public fileOver(event){
   // console.log(event);
  }

  public fileLeave(event){
   // console.log(event);
  }

  selectDocType(i, event){  
    if(event.target.value!='Other'){
      $(event.target).next('input').attr('hidden', 'hidden')
      this.fileitems[i]['documentType']=event.target.value;
    }else{
      this.fileitems[i]['documentType']='';
      $(event.target).next('input').removeAttr('hidden')
    }
  }

  docTypeComment(i, value){
    this.fileitems[i]['documentType']=value;
  }

  upoadDocuments(){  //
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

      this.service.files("files/uploads","partner",formData)
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

  deleteFileSelected(file){
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
}
