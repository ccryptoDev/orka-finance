import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FileSystemDirectoryEntry, FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { DatePipe } from '@angular/common';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  selector: 'app-pending-sales-contract',
  templateUrl: './pending-sales-contract.component.html',
  styleUrls: ['./pending-sales-contract.component.scss']
})

export class PendingSalesContractComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
expandContent = true;
message: any;
data:any=[];
result:any;
complete:any=[];
i:number;
fileURL =environment.installerapiurl+"files/download/";
  newarr: any=[];

constructor(
  public datePipe: DatePipe,
  private route: ActivatedRoute,private toastrService: ToastrService,
  private service: HttpService,
  public router: Router,
  private modalService: BsModalService,
  private formBuilder: FormBuilder,
  private _sanitizer: DomSanitizer,
  private shared:SharedService
  ) { }

ngOnInit() {
   
  this.dtOptions = {
    scrollX: true
  };
  this.getSalesContractList();

}


  getSalesContractList(){
    
    this.service.authget('sales-contractreview/loan', 'admin')
    .pipe(first())
    .subscribe(res => {
      console.log('resss--',res['allLoandeatils'])
     this.data =  res['allLoandeatils'];

     this.complete = res['completeallLoandeatils']

     for(var i =0; i< this.data.length; i++) { 
      this.data[i].show='No';
        for(var j = 0; j< this.complete.length; j++) 
        { 
          //console.log('1111111111',j,this.complete[j].loanid)
          if(this.data[i].loanid==this.complete[j].loanid){
            this.data[i].show='Yes';
            break;
          }
        }
    }

     let results = this.data.map(function(el) {
      var o = Object.assign({}, el);
      o.expanded = false;
      o.ischecked = false;
      o.fileloadurl =environment.installerapiurl+"files/download/"+o.filepath.split('/')[2];
      return o;
    })

    this.result =results;
   
    }, err => {
      if (err['error']['message'].isArray) {
        this.message = err['error']['message']
      } else {
        this.message = [err['error']['message']]
      }
      this.toastrService.error(this.message)
     // this.router.navigate(['admin/pendings']);
    })

  }
  getDataPdf(d:any){
    this.shared.setData(d);
  }
   
}
