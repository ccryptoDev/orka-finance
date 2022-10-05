import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-documents-management',
  templateUrl: './documents-management.component.html',
  styleUrls: ['./documents-management.component.scss']
})
export class DocumentsManagementComponent implements OnInit {
  public files: NgxFileDropEntry[] = [];
  public listfiles: any = [];
  fileitems:any = [];
  today:any = new Date();

  modalRef: BsModalRef;
  message:any = [];
  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;

  constructor(
    public router:Router,
    private service: HttpService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
    this.addlog("View documents upload page",sessionStorage.getItem('LoanId'))
    window.top.postMessage(5,'*');
    var dd = this.today.getDate();

    var mm = this.today.getMonth()+1; 
    var yyyy = this.today.getFullYear();
    if(dd<10) 
    {
        dd='0'+dd;
    } 

    if(mm<10) 
    {
        mm='0'+mm;
    } 
    this.today = dd+'-'+mm+'-'+yyyy;
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

  completed(){    
    const formData = new FormData();
    formData.append('loan_id',sessionStorage.getItem("LoanId"))
    for (var i = 0; i < this.fileitems.length; i++) { 
      if(!this.fileitems[i]['documentType'] || this.fileitems[i]['documentType']==''){
        this.message = ['Please select the document type for all documents'];
        this.modalRef = this.modalService.show(this.messagebox);
        return false;
      }
      formData.append("documentTypes[]", this.fileitems[i].documentType);
      formData.append("files[]", this.fileitems[i]);
    }   
    
    this.service.authfiles("uploads","client",formData)
      .pipe(first())
      .subscribe(res=>{
        this.addlog("Upload some documents",sessionStorage.getItem('LoanId'))
        if(res['statusCode']==200){
          this.files = []
          this.listfiles = []
          this.fileitems = []
        }
      },err=>{
        console.log(err)
      })
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
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
    console.log(this.listfiles)
  }

  public fileOver(event){
   // console.log(event);
  }

  public fileLeave(event){
   // console.log(event);
  }

  addlog(module,id){
    this.service.addlog(module,id,"borrower").subscribe(res=>{},err=>{})
  }

  close(): void {
    this.modalRef.hide();
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

}
