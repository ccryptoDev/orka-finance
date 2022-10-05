import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import {
  FileSystemDirectoryEntry,
  FileSystemFileEntry,
  NgxFileDropEntry,
} from 'ngx-file-drop';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-document-center',
  templateUrl: './document-center.component.html',
  styleUrls: ['./document-center.component.scss'],
})
export class DocumentCenterComponent implements OnInit {
  data: any = [];
  modalRef: BsModalRef;
  message: any = [];
  @ViewChild('messagebox', { read: TemplateRef }) messagebox: TemplateRef<any>;

  data_res: any = {
    files: [],
  };

  public files: NgxFileDropEntry[] = [];
  public listfiles: any = [];
  fileitems: any = [];

  constructor(
    private service: HttpService,
    private toastrService: ToastrService,
    private modalService: BsModalService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    let id = sessionStorage.getItem('InstallerUserId');
    this.getallfiles();
  }
  getallfiles() {
    let id = sessionStorage.getItem('InstallerUserId');

    let getlistfiles = this.service.get('files/allFiles/' + id, 'partner');
    getlistfiles.pipe(first()).subscribe(
      (res) => {
        //console.log('listFiles',res['fileData'],id)
        this.data_res['files'] = res['fileData'];
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
      environment.installerapiurl + 'files/download/' + filename,
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
    for (const droppedFile of files) {
      let validFile = this.isFileAllowed(droppedFile.fileEntry.name);
      // Is it a file?
      if (
        droppedFile.fileEntry.isFile &&
        this.isFileAllowed(droppedFile.fileEntry.name)
      ) {
        this.listfiles.push(this.files);
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Here you can access the real file
          console.log(droppedFile.relativePath, file);
          this.fileitems.push(file);
        });
      } else {
        // It was a directory(empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        if (!validFile) {
          this.toastrService.error(
            'File format not supported! Please drop .pdf, .jpg, .jpeg, .png, .docx files'
          );
        }
      }
    }
    console.log(this.listfiles);
  }

  public fileOver(event) {
    // console.log(event);
  }

  public fileLeave(event) {
    // console.log(event);
  }

  selectDocType(i, event) {
    if (event.target.value != 'Other') {
      $(event.target).next('input').attr('hidden', 'hidden');
      this.fileitems[i]['documentType'] = event.target.value;
    } else {
      this.fileitems[i]['documentType'] = '';
      $(event.target).next('input').removeAttr('hidden');
    }
  }

  docTypeComment(i, value) {
    this.fileitems[i]['documentType'] = value;
  }

  upoadDocuments() {
    //
    let id = sessionStorage.getItem('InstallerUserId');
    if (this.fileitems.length > 0) {
      const formData = new FormData();
      formData.append('link_id', id);
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
        formData.append('services', 'partner/uploadDocuments');
      }

      this.service
        .files('files/uploads', 'partner', formData)
        .pipe(first())
        .subscribe(
          (res) => {
            //this.addlogs("Uploaded documents",this.data[0]['user_id'])
            if (res['statusCode'] == 200) {
              //console.log('filesres',res['data']['files']);
              this.toastrService.success('File Uploaded Successfully!');
              this.data_res['files'] = res['data']['files'];
              this.files = [];
              this.listfiles = [];
              this.fileitems = [];
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
      this.modalRef = this.modalService.show(this.messagebox);
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
}
