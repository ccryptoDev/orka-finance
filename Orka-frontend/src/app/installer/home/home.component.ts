import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  TemplateRef,
} from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { first } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from 'src/app/_service/http.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  host: {
    '(document:click)': 'onClickdropdowns($event)',
  },
})
export class HomeComponent implements OnInit {
  result: any = [];
  stateres = {};
  salesrepres = {};
  data = {};
  f1: any = {};
  noOrder:any={};
  message: any = [];
  fieldTextType1: boolean = false;
  fieldTextType2: boolean = false;
  confirmValidate: boolean = false;
  patternCheck: boolean = false;
  IsDisabled: boolean = false;
  validPasswordPattern = environment.validPasswordPattern;
  currentDate = new Date(); ///
  modalRef: BsModalRef;
  tablehide: any = false;
  phasearr = [
    { name: 'New' },
    { name: 'Underwriting' },
    { name: 'Project Setup' },
    { name: 'Contracting' },
    { name: 'Construction' },
    { name: 'Archived' },
  ];

  ngbModalOptions: ModalOptions = {
    backdrop: 'static',
    keyboard: false,
    animated: true,
    ignoreBackdropClick: true,
  };
  @ViewChild('createOpportunityform', { read: TemplateRef })
  createOpportunityform: TemplateRef<any>;
  @ViewChild('resetPassword', { read: TemplateRef }) resetPassword: TemplateRef<
    any
  >;
  @ViewChild('messagebox', { read: TemplateRef }) messagebox: TemplateRef<any>;

  phaseType: string = 'Phase';
  stateType: string = 'State';
  salesrepType: string = 'Sales Rep';

  installerId = sessionStorage.getItem('InstallerUserId');
  installer_loginName = sessionStorage.getItem('installer_firstName');

  hidden: boolean;
  hiddensales: boolean;
  hiddenstate: boolean;
  islogout: boolean;

  constructor(
    public router: Router,
    private service: HttpService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private _eref: ElementRef
  ) {}

  ngOnInit(): void {
    //console.log(this.phasearr);
    this.noOrder={
      order:[]
    }
    this.getDatatable();
    let installer_loginName = sessionStorage.getItem('installer_firstName');
    let id = sessionStorage.getItem('InstallerUserId');

    if (id) {
      this.service
        .get('users/setPassword/' + id, 'partner')
        .pipe(first())
        .subscribe((res: any) => {
          console.log('res', res);
          if (res.statusCode == 200 && res.permission == 'Y') {
            //console.log("You can set the password");
            sessionStorage.setItem('userId', res.userId);
            // trigger the model for password reset
            this.modalRef = this.modalService.show(
              this.resetPassword,
              this.ngbModalOptions
            );
          } else {
            sessionStorage.setItem('userId', res.userId);
          }
        });
    }
  }

  onClickdropdowns(event) {
    if (!this._eref.nativeElement.contains(event.target)) {
      this.islogout = false;
      this.hiddenstate = false;
      this.hiddensales = false;
      this.hidden = false;
    } // or some similar check
  }

  getDatatable() {
    this.tablehide = false;
    this.phaseType = 'Phase';
    this.stateType = 'State';
    this.salesrepType = 'Sales Rep';
    let id = sessionStorage.getItem('InstallerUserId');
    let mainId = sessionStorage.getItem('MainInstallerId');
    let businessId = mainId!="null"?mainId:id;
    console.log('Business Id',businessId)
    let getlist = this.service.authget('home/' + businessId, 'partner');
    getlist.pipe(first()).subscribe(
      (res) => {
        console.log(res['data']);
        // console.log(res['uniqueStates'])
        if (res['data'] != null) {
          this.result = res['data'];
        } else {
          this.result = [];
        }
        this.tablehide = true;
        this.stateres = res['uniqueStates'];
        this.salesrepres = res['uniqueSalesRep'];
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getDatatablefilter(filterval: any, filtername: any) {
    //this.result=[]
    this.tablehide = false;
    let id = sessionStorage.getItem('InstallerUserId');
    let mainId = sessionStorage.getItem('MainInstallerId');
    let businessId = mainId!="null"?mainId:id;

    if (filtername == 'state') {
      this.hiddenstate = true;
      this.stateType = filterval;
    } else if (filtername == 'phase') {
      this.hidden = true;
      this.phaseType = filterval;
    } else {
      this.salesrepType = filterval;
      this.hiddensales = true;
    }

    let reqData = {
      phase: this.phaseType != 'Phase' ? this.phaseType : '',
      state: this.stateType != 'State' ? this.stateType : '',
      salesRep: this.salesrepType != 'Sales Rep' ? this.salesrepType : '',
    };
    //console.log('---',id)
    //this.service.authpost('pending/addcomments','admin',this.cm)
    this.service
      .authpost('home/fliter/' + businessId, 'partner', reqData)
      .pipe(first())
      .subscribe(
        (res) => {
          console.log('ssss', res);
          this.result = res['data'];
          this.tablehide = true;
        },
        (err) => {
          console.log(err);
        }
      );
  }

  navigate(id) {
    this.router.navigate(['/partner/opportunity/' + id]);
  }

  namedata(data) {
    return data.target.value;
  }

  validatePattern(e) {
    if (!this.f1.password.match(this.validPasswordPattern)) {
      this.patternCheck = true;
      this.IsDisabled = true;
    } else {
      this.patternCheck = false;
      this.IsDisabled = false;
    }
  }

  validateConfirm(e) {
    if (this.f1.password === this.f1.confirm_password) {
      this.confirmValidate = false;
      this.IsDisabled = false;
    } else {
      this.confirmValidate = true;
      this.IsDisabled = true;
    }
  }

  resetPasswordSubmit() {
    if (!this.f1.password.match(this.validPasswordPattern)) {
      this.patternCheck = true;
      this.IsDisabled = true;
    } else {
      this.patternCheck = false;
      this.IsDisabled = false;
    }
    if (this.f1.password === this.f1.confirm_password) {
      this.confirmValidate = false;
      //console.log("Submitted",this.fieldTextType1,this.fieldTextType2)
      this.f1.id = sessionStorage.getItem('userId');
      this.f1.password = this.f1.password;
      this.f1.confirm_password = this.f1.confirm_password;
      console.log('f1', this.f1);
      this.service
        .post('users/setPassword', 'partner', this.f1)
        .pipe(first())
        .subscribe(
          (res) => {
            if (res) {
              this.modalRef.hide();
              this.service.successMessage(
                'Set New Password is Successfully Created!'
              );
              setTimeout(() => {
                // this.route.navigate(['/welcome?id=']);
              }, 5000);
            } else {
              this.message = res['message'];
              this.modalRef = this.modalService.show(this.messagebox);
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
      // If Password is mismatch
      this.confirmValidate = true;
    }
  }

  close(): void {
    this.modalRef.hide();
  }

  toggleFieldTextType1() {
    this.fieldTextType1 = !this.fieldTextType1;
  }

  toggleFieldTextType2() {
    this.fieldTextType2 = !this.fieldTextType2;
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
