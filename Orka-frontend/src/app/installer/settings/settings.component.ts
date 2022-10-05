import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {  CurrencyPipe, DatePipe} from '@angular/common';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { HttpService } from 'src/app/_service/http.service';
import { first } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from '../../../environments/environment';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmPasswordValidator } from 'src/app/_service/custom.validator';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  installer_id = sessionStorage.getItem('InstallerUserId');
  main_installer_id = sessionStorage.getItem('MainInstallerId');

  profileImgUrl='';

  changepwForm: FormGroup;
  fSubmitted = false;

  f1:any ={};
  f2:any ={};
  maxDate: Date;
  public files: NgxFileDropEntry[] = [];
  public listfiles: any = [];
  fileitems:any = [];

  modalRef: BsModalRef;
  message:any = [];

  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;

  constructor(
    private currencyPipe : CurrencyPipe,
    private service: HttpService,
    private modalService: BsModalService,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.changepwForm = this.formBuilder.group({
      currentpw: ['', Validators.required],
      newpw: ['', Validators.required],
      cnewpw: ['', Validators.required]      
    }, {validator: ConfirmPasswordValidator});

    if(this.main_installer_id=='null'){
      this.getProfileSettings()
    }else{
      this.getSubInstallerProfile()
    }
  }

  get cpf(): { [key: string]: AbstractControl } {
    return this.changepwForm.controls;
  }

  getProfileSettings(){
    this.service.authget('profile/settings/'+this.installer_id,'installer')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log(res['data']);
        if(res['data']?.profileSettings){
          this.f1.firstName = res['data'].profileSettings.firstName;
          this.f1.lastName = res['data'].profileSettings.lastName;
          // this.f1.birthday = this.datePipe.transform(res['data'].profileSettings.birthday);
          this.f1.email = res['data'].profileSettings.email;
          this.f1.phone = res['data'].profileSettings.phone;
          this.f1.streetAddress = res['data'].profileSettings.streetAddress;
          this.f1.unit = res['data'].profileSettings.unit;
          this.f1.city = res['data'].profileSettings.city;
          this.f1.state = res['data'].profileSettings.state;
          this.f1.zipCode = res['data'].profileSettings.zipCode;
        }  
        if(res['data'].profileImage){
          let imageUrl = res['data'].profileImage.filename.substring(res['data'].profileImage.filename.lastIndexOf('/')+1);
          // this.profileImgUrl = environment.installerapiurl+"profile/profileimage/"+imageUrl;
          this.viewProfileImage(imageUrl)
        }           
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

  getSubInstallerProfile(){
    this.service.authget('profile/subInstallerProfile/'+this.installer_id,'installer')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log(res['data']);
        if(res['data']?.profileSettings){
          this.f2.firstName = res['data'].profileSettings.firstName;
          this.f2.lastName = res['data'].profileSettings.lastName;
        }  
        if(res['data'].profileImage){
          let imageUrl = res['data'].profileImage.filename.substring(res['data'].profileImage.filename.lastIndexOf('/')+1);
          this.viewProfileImage(imageUrl)
        }           
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

  changePassword(){   
    this.fSubmitted = true;
    if (this.changepwForm.invalid) {
      return;
    }

    this.service.authput('users/changepassword/'+this.installer_id, 'installer', this.changepwForm.value)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log(res);
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
        this.fSubmitted = false;
        this.changepwForm.reset();        
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

  namedata(data){
    data.target.value = data.target.value.replace(/[^A-Za-z.]/g, '');
   return data.target.value ? data.target.value.charAt(0).toUpperCase() + data.target.value.substr(1).toLowerCase() : '';
  }

  number(data){
    return data.target.value = data.target.value.replace(/[^0-9.]/g,'')
  }

  uploadImage(){
    const formData = new FormData();
    for (var i = 0; i < this.fileitems.length; i++) { 
      formData.append("files[]", this.fileitems[i]);
    }

    this.service.authfiles("profile/saveprofileimage/"+this.installer_id,"installer",formData)
      .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){
          // console.log(res);
          let imageUrl = res['data'].substring(res['data'].lastIndexOf('/')+1);
          this.viewProfileImage(imageUrl)
          // this.profileImgUrl = environment.installerapiurl+"profile/profileimage/"+imageUrl;
          this.fileitems = [];
        }
      },err=>{
        console.log(err)
      })
  }

  viewProfileImage(imageUrl){
    this.service.authget("profile/profileimage/"+imageUrl,"installer")
      .pipe(first())
      .subscribe(res=>{
        console.log(res);
        this.profileImgUrl = res['url'];
      },err=>{
        console.log(err)
      })
  }

  removeProfileImage(){
    this.service.authdelete("profile/removeprofileimage/"+this.installer_id,"installer")
      .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){
          console.log(res);          
          this.profileImgUrl = '';
        }
      },err=>{
        console.log(err)
      })
  }

  installerEditSubmit() {    
    this.f1['user_id'] = this.installer_id;
    this.f1.socialSecurityNumber = Number(this.f1.socialSecurityNumber);
    this.f1.zipCode = Number(this.f1.zipCode);
    this.f1.annualIncome = Number(this.f1.annualIncome);

    console.log('f1', this.f1);
    this.service.authpost('profile/editprofile','installer',this.f1)
    .pipe(first())
    .subscribe(res=>{
      this.message = res['message']
      this.modalRef = this.modalService.show(this.messagebox);
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(this.messagebox);
    })    
  }

  subInstallerEditSubmit() {    
    this.f2['user_id'] = this.installer_id;
    console.log('f2', this.f2);

    this.service.authpost('profile/editSubInstaller','installer',this.f2)
    .pipe(first())
    .subscribe(res=>{
      this.message = res['message']
      this.modalRef = this.modalService.show(this.messagebox);
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(this.messagebox);
    })    
  }

  transformAmount(data){   
    let v = data.target.value.split('.')
    console.log('transformAmount', v);
    if(v.length>2){
      return "";
    }
    return this.currencyPipe.transform(data.target.value, '$');
  }

  getamount(data){
    return Number(data.replace(",","").replace("$",""))
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {
      // Is it a file?
      if (droppedFile.fileEntry.isFile && this.isFileAllowed(droppedFile.fileEntry.name)) {
        this.listfiles.push(this.files)
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Here you can access the real file
          console.log(droppedFile.relativePath, file);
          this.fileitems.push(file)
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
    console.log(this.listfiles)
    setTimeout(() => {
      this.uploadImage();
    }, 50);    
  }

  isFileAllowed(fileName: string) {
    let isFileAllowed = false;
    const allowedFiles = ['.jpg', '.jpeg', '.png'];
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

  close(): void {
    this.modalRef.hide();
  } 

}
