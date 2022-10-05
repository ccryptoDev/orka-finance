import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { HttpService } from 'src/app/_service/http.service';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-plaid-opt-out',
  templateUrl: './plaid-opt-out.component.html',
  styleUrls: ['./plaid-opt-out.component.scss']
})
export class PlaidOptOutComponent implements OnInit {

  public files: NgxFileDropEntry[] = [];
  public listfiles: any = [];
  fileitems: any = [];
  fileNames: any = [];
  preFilesItems: any = [];
  fileChecksum: any = [];
  data: any = {};
  OsName: string
  constructor(private router: Router, private service: HttpService, private toastrService: ToastrService) { }

  ngOnInit(): void {

    this.data.loanId = sessionStorage.getItem('loanId');
    this.OsName = this.service.getOsName();/// to get osname
    this.service.get("plaid-optout/" + this.data.loanId, 'sales')
      .pipe(first())
      .subscribe((res: any) => {
        if (res.statusCode == 200) {
          this.preFilesItems = res.data;
        }
      })
    this.getLoanStatus()
  }

  getLoanStatus() {
    console.log("called")
    this.service.get("loan/status/" + this.data.loanId, 'sales')
      .pipe(first())
      .subscribe((res: any) => {
        console.log({ res })
        if (res.statusCode == 200 && res.message == "canceled") {
          let count = 0;
          res['sorryMessage'].map((msg, indx) => {
            sessionStorage.setItem(`sorryMessage${indx}`, msg);
            count++;
          })
          sessionStorage.setItem('messageCount', String(count));
          this.router.navigate(['sales/sorry'])
        }
        return
      })
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {

      let validFile = this.isFileAllowed(droppedFile.fileEntry.name)
      if (droppedFile.fileEntry.isFile && validFile) {
        this.listfiles.push(this.files)
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          this.fileitems.push(file)
          this.fileNames.push(droppedFile.relativePath)
          console.log(this.fileitems)
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        if (!validFile) {
          this.toastrService.error("File format not supported! Please drop .pdf, .jpg, .jpeg, .png, .docx, .xlsx, .doc files")
        }
      }
    }
  }

  isFileAllowed(fileName: string) {
    let isFileAllowed = false;
    const allowedFiles = ['.pdf', '.jpg', '.jpeg', '.png', '.docx', '.xlsx', '.doc', '.JPEG', '.PNG', '.JPG'];
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

  public fileOver(event) {
    // console.log(event);
  }

  public fileLeave(event) {
    // console.log(event);
  }

  selectDocType(i, event) {
    if (event.target.value != 'Other') {
      $(event.target).next('input').attr('hidden', 'hidden')
      this.fileitems[i]['documentType'] = event.target.value;
    } else {
      this.fileitems[i]['documentType'] = '';
      $(event.target).next('input').removeAttr('hidden')
    }
  }

  docTypeComment(i, value) {
    this.fileitems[i]['documentType'] = value;
  }

  deleteFileSelected(file) {
    this.fileitems.splice(this.fileitems.findIndex(f => f.name == file.name), 1);
  }

  deletePreFileSelected(file) {
    let charr = file.filename.split("/");
    this.preFilesItems.splice(this.preFilesItems.indexOf(file), 1);
    this.service.post("plaid-optout/" + charr[charr.length - 1], 'sales', file)
      .pipe(first())
      .subscribe((res: any) => {
        if (res.statusCode == 200) {
          return
        }
      })
  }

  next() {
    const formData = new FormData();
    for (let i = 0; i < this.fileitems.length; i++) {
      formData.append("documentTypes[]", this.fileitems[i].documentType);
      formData.append("files[]", this.fileitems[i]);
    }
    formData.append('loanId', this.data.loanId)
    console.log("len", this.fileitems.length);
    if (this.fileitems.length > 0 || this.preFilesItems.length > 0) {
      this.service.files("plaid-optout", 'sales', formData)
        .pipe(first())
        .subscribe(res => {
          if (res['statusCode'] == 200) {
            this.router.navigate(['sales/plaid-success']);
          }
          else {
            console.log("Failure")
          }
        }, err => {
          console.log(err)
        })
    } else {
      this.toastrService.error('Kindly Upload Bank Statements');
      return;
    }
    // this.router.navigate(['sales/plaid-success'])
  }

  previous() {
    this.router.navigate(['sales/plaid'])
  }

}
