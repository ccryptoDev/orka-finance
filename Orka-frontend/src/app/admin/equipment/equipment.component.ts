import { Component, OnInit,TemplateRef,ViewChild } from '@angular/core';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { Router } from "@angular/router";
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from "ngx-toastr";
import { FormBuilder, FormGroup } from '@angular/forms';
import { EquifaxInstance } from '../../_service/common.service';
import { Subject } from "rxjs";
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.component.html',
  styleUrls: ['./equipment.component.scss']
})
export class EquipmentComponent implements OnInit {

  modalRef: BsModalRef;
  message:any = [];
  data:any =[];
  data_res:any=[]
  filenameservice: string;
  dtOptions: { scrollX: boolean; };
  approve_construction_status: any;
  //const formatYmd = date => date.toISOString().slice(0, 10);

  constructor(private service: HttpService,private toastrService: ToastrService,
  private modalService: BsModalService,
  public router:Router,
  private route: ActivatedRoute,
  private shared:SharedService,
  private formBuilder: FormBuilder) { 
  }

  ngOnInit(): void {

    this.dtOptions = {
      scrollX: true
    };
    this.getallfiles();
  }
  getallfiles(){
    this.service.authget('milestone/equipment','admin')
    .pipe(first())
    .subscribe(res=>{
      this.data= res['allLoandeatils'];

      this.data_res = res['allLoandeatils'].filter(
        (xx) => xx.milestone == 'Equipment'
      );

      console.log('888888888888',this.data_res)
    },err=>{
      console.log(err)
    })
  }

    
  view(filename:any){
    filename = filename.split('/')
    filename = filename[filename.length-1]
    window.open(environment.installerapiurl+"files/download/"+filename, "_blank");
  }
  getMDataPdf(d:any){
    this.shared.setMData(d);
  }

}
