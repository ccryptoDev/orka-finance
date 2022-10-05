import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-document-center',
  templateUrl: './document-center.component.html',
  styleUrls: ['./document-center.component.scss']
})
export class DocumentCenterComponent implements OnInit {


  installer_id = sessionStorage.getItem('InsID');
  loanRef = sessionStorage.getItem('LoanRefNo');
  loanId = sessionStorage.getItem('LoanID');
  data: any = [];
  modalRef: BsModalRef;
  message: any = [];
  docusignData:any =[]
  hiddenloandoc: boolean;
  hidden_otherdoc: boolean;
  isShowtablevalues:boolean=false;
  noOrder:any={};
  preFilesItems: any = [];
  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;
  @ViewChild('uploadDocumentForm', { read: TemplateRef }) uploadDocumentForm:TemplateRef<any>;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  data_res: any = {
    files: [],
  };
  
 

  public files: NgxFileDropEntry[] = [];
  public listfiles: any = [];
  fileitems: any = [];
  doctype: any;
  downloadUrl: string;
  documentType: string;

  constructor(
    private service: HttpService,
    private toastrService: ToastrService,
    private modalService: BsModalService,
    public router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
  ) {

    
  }

  ngOnInit(): void {
    this.noOrder={
      order:[]
    }
    // let id = sessionStorage.getItem('InstallerUserId');
    this.downloadUrl =environment.borrowerapiurl + 'uploads/download/';
    this.doctype =null
    this.data = [];
    this.getallfiles();
    this.getdocusigndocument()
  }
  getdocusigndocument(){  
    console.log('res12344567');


    this.service.authget('loan-agreement/docusigndate/' + this.loanId, 'borrower')
  .pipe(first()).subscribe(
    (res) =>{
     console.log('docusigndate',res['data'])


      this.docusignData=(res['data'].length > 0)? res['data'][0]:[];

      if(this.docusignData.length > 0){
      this.docusignData.reviewdby='ORKA Finance'
      }
      this.isShowtablevalues = true
    
     // console.log('deai',this.docusignData)
    },
      (err) => {
        console.log(err);
      }
  );

  console.log('isShowtablevalues',this.isShowtablevalues)
    /*********************************FINANCING CONTRACT PDF*******************************/
if(this.isShowtablevalues==false){
    this.service
    .authgetfile('loan-agreement/financing-contract/doc/' + this.loanId, 'borrower')
    .pipe(first())
    .subscribe(
      (res) => {


        console.log('---213',res)
    var file = new Blob([res], { type: 'application/pdf' })
    var fileURL = URL.createObjectURL(file);
    this.documentType ='Loan Agreement'

    this.data.fileURL=fileURL
    this.data.documentType=this.documentType
    console.log(fileURL,'---1----');
// if you want to open PDF in new tab
          // window.open(fileURL); 
          // var a         = document.createElement('a');
          // a.href        = fileURL; 
          // a.target      = '_blank';
          // a.download    = 'bill.pdf';
          // document.body.appendChild(a);
          // a.click();
        
      },
      (err) => {
        console.log(err);
      }
    );
  /*********************************FINANCING CONTRACT PDF*******************************/


    /*********************************ACH AUTH PDF*******************************/
  this.service
    .authgetfile('loan-agreement/ach-auth-form/doc/' + this.loanId, 'borrower')
    .pipe(first())
    .subscribe(
      (res) => {


        //console.log('---213',res)

    var file = new Blob([res], { type: 'application/pdf' })
    var fileURL = URL.createObjectURL(file);
    this.documentType ='Personal Guaranty Form'     

    this.data.fileURL1=fileURL
    this.data.documentType1=this.documentType
   console.log(fileURL,'----2---');
      },
      (err) => {
        console.log(err);
      }
    );
  /*********************************ACH AUTH PDF*******************************/


  /*********************************BORROWER GURANTOR*******************************/
  this.service
    .authgetfile('loan-agreement/borrower-guarantor/doc/' + this.loanId, 'borrower')
    .pipe(first())
    .subscribe(
      (res) => {

    var file = new Blob([res], { type: 'application/pdf' })
    var fileURL = URL.createObjectURL(file);
    this.documentType ='ACH Authorization'
    this.data.fileURL2=fileURL
    this.data.documentType2=this.documentType
    console.log(fileURL,'----3---');

    //console.log('DATARES',this.data)
      },
      (err) => {
        console.log(err);
      }
    );
  /*********************************FINANCING CONTRACT PDF*******************************/  
    }
  }
  getallfiles() {
    let id = sessionStorage.getItem('LoanID');

    let getlistfiles = this.service.authget('uploads/allFiles/' + id, 'borrower');
    getlistfiles.pipe(first()).subscribe(
      (res) => {
        //console.log('listFiles',res['fileData'],id)
        this.data_res['files'] = res['fileData'];
        // this.data = res['fileData'].filter(
        //   (xx) => xx.services == 'borrower/documentCenter/otherDocuments'
        // );
        this.data = res['fileData']

        if(this.data!=null && this.data.length > 0){
this.hidden_otherdoc=true
        }

        console.log(this.data)
      },
      (err) => {
        console.log(err);
      }
    );
  }

  close(): void {
    this.modalRef.hide();
  }

  view(filename: any) {
    filename = filename.split('/');
    filename = filename[filename.length - 1];
    
    window.open(
      environment.borrowerapiurl + 'uploads/download/' + filename,
      '_blank'
    );
  }

  addlogs(module, id) {
    this.service.addlog(module, id, 'partner').subscribe(
      (res) => {},
      (err) => {}
    );
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
    console.log('here',this.files)
    for (const droppedFile of files) {
      // Is it a file?
      let validFile = this.isFileAllowed(droppedFile.fileEntry.name)
      if (droppedFile.fileEntry.isFile && validFile) {
        this.listfiles.push(this.files)
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Here you can access the real file
          file["services"] = "documentCenter/otherDocuments";
          file['documentType']=this.doctype
          this.fileitems.push(file)
          let msg = file.name+" is Added Successfully!";
          this.toastrService.success(msg)
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        if (!validFile) {
          this.toastrService.error("File format not supported! Please drop .pdf, .jpg, .jpeg, .png, .docx files")
        }
      }
    }
}

  public fileOver(event) {
    console.log(event);
  }

  public fileLeave(event) {
    console.log(event);
  }

  selectDocType(event) {
    if(this.fileitems.length > 0){
      if (event.target.value != 'Other') {
        $(event.target).next('input').attr('hidden', 'hidden');
        this.fileitems[0]['documentType'] = event.target.value;
      } else {
        this.fileitems[0]['documentType'] = '';
        $(event.target).next('input').removeAttr('hidden');
      }
    }
  }

  docTypeComment(value) {
    if(this.fileitems.length > 0){
    this.fileitems[0]['documentType'] = value;
    }
  }

  upoadDocuments() {
    //
    let id = sessionStorage.getItem('LoanID');
    console.log(this.doctype)
    if (this.fileitems.length > 0) {
      const formData = new FormData();
      formData.append('loan_id', id);
      formData.append('documentType', this.doctype);
      for (var i = 0; i < this.fileitems.length; i++) {
        if (
          !this.fileitems[i]['documentType'] ||
          this.fileitems[i]['documentType'] == ''
        ) {
          this.message = ['Please select the document type for all documents'];
          this.modalRef = this.modalService.show(this.messagebox);
          return false;
        }
        formData.append('documentTypes[]', this.fileitems[i].documentType);
        formData.append('files[]', this.fileitems[i]);
        formData.append('services', 'borrower/documentCenter/otherDocuments');
      }
//console.log('filetosave',this.fileitems)
      this.service
        .authfiles('uploads', 'borrower', formData)
        .pipe(first())
        .subscribe(
          (res) => {
            //this.addlogs("Uploaded documents",this.data[0]['user_id'])
            if (res['statusCode'] == 200) {
              //console.log('filesres',res['data']['files']);
              this.toastrService.success('File Uploaded Successfully!');
              this.modalRef.hide();
              this.fileitems=[];
              this.doctype=null;
             this.getallfiles();
            }
          },
          (err) => {
            if (err['error']['message'].isArray) {
              this.message = err['error']['message'];
            } else {
              this.message = [err['error']['message']];
            }
            this.modalRef = this.modalService.show(this.messagebox);
          }
        );
    } else {
      this.message = ['Select Any Documents'];
     // this.modalRef = this.modalService.show(this.messagebox);
      this.toastrService.error(this.message);
    }
  }

  deleteFileSelected(file) {
    this.fileitems.splice(
      this.fileitems.findIndex((f) => f.name == file.name),
      1
    );
  }
  privacy() {
      window.open(
      'privacy-policy',
      '_blank' // <- This is what makes it open in a new window.
    );
  }
  termscondition() {
    window.open(
      'terms-and-conditions',
      '_blank' // <- This is what makes it open in a new window.
    );
    //this.router.navigate(['terms-and-conditions']);
  }
  securitypolicy() {
    window.open(
      'security-policy',
      '_blank' // <- This is what makes it open in a new window.
    );
    //this.router.navigate(['security-policy']);
  }
  popupform(){
    this.modalRef = this.modalService.show(this.uploadDocumentForm);
  }
  deletePreFileSelected(id) {
    this.service.authget("uploads/deleteFiles/" + id, 'borrower')
      .pipe(first())
      .subscribe((res: any) => {
        if (res.statusCode == 200) {
          this.toastrService.success('File Deleted Successfully!');
          this.getallfiles();
        }
      })
  }

}
