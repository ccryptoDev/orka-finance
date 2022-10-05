import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import {
  FileSystemDirectoryEntry,
  FileSystemFileEntry,
  NgxFileDropEntry,
} from 'ngx-file-drop';
import { ToastrService } from 'ngx-toastr';
import { BorrowerSidebarComponent } from "../../borrower-sidebar/borrower-sidebar.component";

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {

  constructor(
    private service: HttpService,
    private toastrService: ToastrService,
    private modalService: BsModalService,
    public router: Router,
    private route: ActivatedRoute,
    private borrower :BorrowerSidebarComponent,
  ) { }

  ngOnInit(): void {
  }

  loadbankComponent(){
    //alert(s)
    this.borrower.issignShow =false;
    this.borrower.isSidebarShow =false;
    this.borrower.isdocumentShow=false;
    this.borrower.isbankShow =true;
    this.borrower.isloanShow=false;

  }
  loadloanComponent(){

    this.borrower.issignShow =false;
    this.borrower.isSidebarShow =false;
    this.borrower.isdocumentShow=false;
    this.borrower.isbankShow =false;
    this.borrower.isloanShow=true;
    
  }
  loadsignComponent(){
    this.borrower.issignShow =true;
    this.borrower.isSidebarShow =false;
    this.borrower.isdocumentShow=false;
    this.borrower.isbankShow =false;
    this.borrower.isloanShow=true;

  }
}
