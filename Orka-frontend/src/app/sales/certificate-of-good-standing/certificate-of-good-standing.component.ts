import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { HttpService } from './../../_service/http.service';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { environment } from '../../../environments/environment'
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-certificate-of-good-standing',
  templateUrl: './certificate-of-good-standing.component.html',
  styleUrls: ['./certificate-of-good-standing.component.scss']
})
export class CertificateOfGoodStandingComponent implements OnInit {
  [x: string]: any;

  id:string = sessionStorage.getItem("userId");
  loanId:string = sessionStorage.getItem("loanId");
  public files: NgxFileDropEntry[] = [];
  public listfiles: any = [];
  fileitems:any = [];
  fileNames:any=[];
  plaidKey :string = environment.plaid_public_key;


  constructor(private router:Router, private service:HttpService, private toastrService: ToastrService) { }

  ngOnInit(): void {
  }
  next()
  {
    let data:{} = {
      loanId:this.loanId
    }
    this.service.post("certificate-of-good-standing",'sales',data)
    .pipe(first())
    .subscribe((res:any)=>{
      if(res.statusCode==200)
      {
        this.router.navigate(["client/login"])
      }
      else{
        console.log(res);
        
      }
    })
  }

  isFileAllowed(fileName: string) {
    let isFileAllowed = false;
    const allowedFiles = ['.pdf', '.jpg', '.jpeg', '.png','.docx'];
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
  
  completed(){
    const formData = new FormData();
    formData.append('loanId',sessionStorage.getItem("loanId"))
    for (var i = 0; i < this.fileitems.length; i++) { 
      // if(!this.fileitems[i]['documentType'] || this.fileitems[i]['documentType']==''){
      //    console.log('Please select the document type for all documents');
      //   return false;
      // }
      formData.append("documentTypes[]", this.fileitems[i].documentType);
      formData.append("files[]", this.fileitems[i]);
    }
    //console.log(formData)
    this.service.files("certificate-of-good-standing","sales",formData)
      .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){
          this.router.navigate(['client/login']);
        }
        else{
          console.log("Failure")
          console.log(res);
          
        }
      },err=>{
        console.log(err)
      })
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {

      // Is it a file?
      let validFile = this.isFileAllowed(droppedFile.fileEntry.name)
      if (droppedFile.fileEntry.isFile && validFile) {
        this.listfiles.push(this.files)
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Here you can access the real file
          //console.log(droppedFile.relativePath, file);
          this.fileitems.push(file)
          this.fileNames.push(droppedFile.relativePath)

          /**
          // You could upload it like this:
          const formData = new FormData()
          formData.append('logo', file, relativePath)

          // Headers
          const headers = new HttpHeaders({
            'security-token': 'mytoken'
          })

          this.http.post('https://mybackend.com/api/upload/sanitize-and-save-logo', formData, { headers: headers, responseType: 'blob' })
          .subscribe(data => {
            // Sanitized logo returned from backend
          })
          **/

        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        //console.log(droppedFile.relativePath, fileEntry);
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

  deleteFileSelected(file){
    this.fileitems.splice(this.fileitems.findIndex(f=>f.name==file.name), 1);
  }

  onPlaidEvent(event){
    //console.log(event)
  }
  onPlaidSuccess(event:any, reconnect:boolean = false) {
    var sendData:any = { public_token:event.token };
    sendData.reconnect = reconnect;
    console.log(sendData);
    
    this.service.post("plaid/savetoken/" + this.loanId, "admin",sendData).subscribe(res=>{
      if (res['statusCode']==200) {
        

        if (reconnect) { // plaid relogin\

        } else { // first time plaid login

        }
      }      
    },err=>{
     console.log(err) 
    })
  }
  onPlaidExit(event){
    //console.log(event)
  }
  onPlaidClick(event){
    console.log(event)
  }

}
