import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  TemplateRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { first, debounceTime } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';

import { HttpService } from '../../_service/http.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-opportunity',
  templateUrl: './opportunity.component.html',
  styleUrls: ['./opportunity.component.scss'],
})
export class OpportunityComponent implements OnInit {
  @ViewChild('messagebox', { read: TemplateRef }) messagebox: TemplateRef<any>;
  unsubscribe = new Subject<void>();
  clicked = false;
  modalRef: BsModalRef;
  message: any = [];
  radiobtn: any;
  isChecked_radiobtn: boolean = true;
  options: {} = {
    componentRestrictions: {
      country: ['US']
    }
  };
  form: FormGroup;
  site_form: FormGroup;
  projectSetUp_form: FormGroup;
  finance_form: FormGroup;
  loanId: string;
  result: any = [];
  data: any = [];
  data_res: any = {};
  data_milestone: any = {};
  data_replace_res: any = {};
  activity_res: any = {};
  salescontractreviewcomments: any = [];
  milestoneReviewComments: any = [];
  result_sitedetails: any = [];
  siteProjectDetails: any = [];
  phase_type: string;
  resend_check: boolean;
  hiddensite: boolean;
  hidden_underwriting: boolean;
  hidden_projectsetup: boolean;
  hidden_contract: boolean;
  hidden_construction: boolean;
  hidden_activity: boolean;
  isReadOnly: boolean = false;
  loading: boolean = false;
  isServer_error: boolean = true;
  isupload_sales: boolean = false;
  isSmsbtn: boolean = false;
  isShowEquip: boolean = false;
  isShowConstruct: boolean = false;
  isShowOperate: boolean = false;
  isApprovalDate: boolean = false;
  isApprovalDateC: boolean = false;
  isApprovalDateP: boolean = false;
  isDisbursedDate: boolean = false;
  isDisbursedDateC: boolean = false;
  isDisbursedDateP: boolean = false;
  sitevalid : boolean =false;
  phase: any = "";
  lat = null;
  lng = null;
  zoom: number = 15;
  currenlabel: any = { text: 'Current Location', color: 'white' };
  label = 'kjua';
  newfinance:any = '';
  batteryManufaturer: any = [];
  inverterManufacturer: any = [];
  mountType: any = [];
  panelManufacturer: any = [];
  data_sales_contract: any = { files: [] };
  project_construction: any = {
    equipment: [],
    construction: [],
    permissiontooperate: [],
    equipmentPermit: []
  };
  files: NgxFileDropEntry[] = [];
  listfiles: any = [];
  sales_items: any = [];
  fileitems: any = [];
  eqipment_items: any = [];
  eqipmentPermit_items: any = [];
  construct_items: any = [];
  fileNames: any = [];
  loanProductdata: any = [];
  filetype_val: string;
  filetype_val_res: string;
  filetype_equipment_val: string;
  filetype_equipment_val_res: string;
  filetype_construct_val: string;
  filetype_construct_val_res: string;
  filetype_salesitems_val: string;
  filetype_salesitems_val_res: string;
  filetype_equipmentP_val: string;
  filetype_equipmentP_val_res: string;
  construction_status: string = '';
  construction_status1: string = '';
  construction_status2: string = '';
  service_name: string = 'salescontract/uploadDocuments';
  service_name_type: string
  eqipment_status: string = this.construction_status;
  construct_status: string = this.construction_status2;
  permission_status: string = this.construction_status;
  underwriting_status: string;
  submit_date_equipment: string = '';
  submit_date_equipmentPermit: string = '';
  submit_date_need: string = '';
  submit_date_construct: string = '';
  installer_id = sessionStorage.getItem('InstallerUserId');
  installerBusinessName = sessionStorage.getItem('businessName');
  loanproductsmonths: any = [];
  upload_sales_date: any;
  loanProductID: any;
  refno: any;
  milestone: string;
  milestoneReviewCommentsComplete: any;
  showFinancingRequested: any;
  validationMessage: boolean = false;
  condition1:boolean = false;
  condition2:boolean = false;
  selectedProduct: any;
  showUnderwritingTool:boolean =false;
  approvalExpirationDate: Date;

  constructor(
    private service: HttpService,
    private formBuilder: FormBuilder,
    public router: Router,
    private toastrService: ToastrService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    const href = this.router.url;

    this.loanId = href.split('/')[3];
    this.installer_id =  sessionStorage.getItem('MainInstallerId') !== "null" ?
      sessionStorage.getItem('MainInstallerId') :
      sessionStorage.getItem('InstallerUserId');  // Change when fixing the relation installer-partner in the database

    this.getOpportunityList();

    this.form = this.formBuilder.group({
      business_name: [],
      business_owner_first_name: [],
      business_owner_last_name: [],
      business_email: [],
      business_phone: [],
      business_address: [],
      business_city: [],
      business_state: [],
      business_zipcode: [],
      lat: [],
      lng: [],
    });
    this.site_form = this.formBuilder.group({
      siteType: [],
      electricCompany: [],
      avgUtilPerMonth: [],
      avgConsumptionPerMonth: [],
      businessAddress: [],
      businessInstallAddress: ['', Validators.required],
      city: [],
      state: [],
      zipcode: [],
    });
    this.projectSetUp_form = this.formBuilder.group({
      arraySize: [],
      batteryCapacity: [],
      batteryManufacturer: [],
      estGeneration: [],
      estGenerationRate: [],
      inverterManufacturer: ['',Validators.required],
      inverterNamePlateCapacity: [],
      mountType: [],
      nonSolarEquipmentWork: [],
      nonSolarProjectCost: [],
      panelManufacturer: ['',Validators.required],
      totalProjectCost: ['',Validators.required],
    });
    this.finance_form = this.formBuilder.group({
      financingRequested: ['', Validators.required],
      financingTermRequested: ['', Validators.required],
    });

    this.form.valueChanges
      .pipe(debounceTime(2000))
      .subscribe(() => this.addbusiness_details(this.loanId));
    this.site_form.valueChanges
      .pipe(debounceTime(2000))
      .subscribe(() => this.addbusiness_details(this.loanId));
    this.projectSetUp_form.valueChanges
      .pipe(debounceTime(2000))
      .subscribe(() => this.addbusiness_details(this.loanId));
    this.finance_form.valueChanges
      .pipe(debounceTime(2000))
      .subscribe(() => this.addbusiness_details(this.loanId));
    this.getallfiles();
    this.getLoanproducts(this.installer_id);
    this.getLoanProductsMonths(this.installer_id);

    this.upload_sales_date = new Date();;

  }

  ngOnDestroy() {
    this.unsubscribe.next();
  }

  autosaveforms() {
    this.form.valueChanges
      .pipe(debounceTime(2000))
      .subscribe(() =>
        this.addbusiness_details(this.loanId)
      );
    this.site_form.valueChanges
      .pipe(debounceTime(2000))
      .subscribe(() => this.addbusiness_details(this.loanId));
    this.projectSetUp_form.valueChanges
      .pipe(debounceTime(2000))
      .subscribe(() => this.addbusiness_details(this.loanId));
    this.finance_form.valueChanges
      .pipe(debounceTime(2000))
      .subscribe(() => this.addbusiness_details(this.loanId));
  }

  getLoanproducts(id) {
    this.service
      .authget('opportunity/loanproducts/' + id, 'partner')
      .pipe(first())
      .subscribe(
        (res) => {
          this.loanProductdata = res
        }, (err) => {
          console.log(err);
        }
      );
  }

  getLoanProductsMonths(id: string) {
    this.service.authget("loan-calculator/" + id, 'partner')
      .pipe(first())
      .subscribe((res: any) => {
        if (res.statusCode == 200) {
          this.loanproductsmonths = res.loanProducts;
        }
      })
  }

  getallfiles() {
    let getlistfiles = this.service.get(
      'files/allFiles/' + this.loanId,
      'partner'
    );
    getlistfiles.pipe(first()).subscribe(
      (res) => {
        this.data_sales_contract['files'] = res['fileData'].filter(
          (xx) => xx.services == 'salescontract/uploadDocuments'
        );
        this.data_replace_res = res['fileData'].filter(
          (xx) => xx.services == 'salescontract/uploadDocuments'
        );

        this.project_construction['equipment'] = res['fileData'].filter(
          (xx) => xx.services == 'Equipment'
        );
        this.project_construction['equipmentPermit'] = res['fileData'].filter(
          (xx) => xx.services == 'Equipment/Permit'
        );

        this.project_construction['construction'] = res['fileData'].filter(
          (xx) => xx.services == 'Construction'
        );
        this.project_construction['permissiontooperate'] = res['fileData'].filter(
          (xx) => xx.services == 'Commercial Operation'
        );

        this.upload_sales_date = (this.data_sales_contract['files'].length == 0) ? '' : this.data_sales_contract['files'][0].updatedAt;

        this.submit_date_construct = (this.project_construction['construction'].length > 0) ? this.project_construction['construction'][0].updatedAt : '';
        this.submit_date_equipment = (this.project_construction['equipment'].length > 0) ? this.project_construction['equipment'][0].updatedAt : '';
        this.submit_date_need = (this.project_construction['permissiontooperate'].length > 0) ? this.project_construction['permissiontooperate'][0].updatedAt : '';
        this.submit_date_equipmentPermit = (this.project_construction['equipmentPermit'].length > 0) ? this.project_construction['equipmentPermit'][0].updatedAt : '';



        if ((this.submit_date_equipment != '' || this.submit_date_equipmentPermit != '') && this.isApprovalDate == true && this.isDisbursedDate == true) {
          this.eqipment_status = 'complete'
        } else if (this.submit_date_equipment != '' && this.isApprovalDate == true && this.isDisbursedDate == false) {
          this.eqipment_status = 'confirmed'
        } else if (this.submit_date_equipment != '' && this.isApprovalDate == false && this.isDisbursedDate == false) {
          this.eqipment_status = 'confirmed'
        } else if (this.submit_date_equipment == '' && this.isApprovalDate == false && this.isDisbursedDate == false) {
          this.eqipment_status = ''
        } else {
          this.eqipment_status = 'need_additional'
        }

        if (this.submit_date_construct != '' && this.isApprovalDateC == true && this.isDisbursedDateC == true) {
          this.construct_status = 'complete'
        } else if (this.submit_date_construct != '' && this.isApprovalDateC == true && this.isDisbursedDateC == false) {
          this.construct_status = 'confirmed'
        } else if (this.submit_date_construct != '' && this.isApprovalDateC == false && this.isDisbursedDateC == false) {
          this.construct_status = 'confirmed'
        } else if (this.submit_date_construct == '' && this.isApprovalDateC == false && this.isDisbursedDateC == false) {
          this.construct_status = ''
        } else {
          this.construct_status = 'need_additional'
        }

        if (this.submit_date_need != '' && this.isApprovalDateP == true && this.isDisbursedDateP == true) {
          this.permission_status = 'complete'
        } else if (this.submit_date_need != '' && this.isApprovalDateP == true && this.isDisbursedDateP == false) {
          this.permission_status = 'confirmed'
        } else if (this.submit_date_need != '' && this.isApprovalDateP == false && this.isDisbursedDateP == false) {
          this.permission_status = 'confirmed'
        } else if (this.submit_date_need == '' && this.isApprovalDateP == false && this.isDisbursedDateP == false) {
          this.permission_status = ''
        } else {
          this.permission_status = 'need_additional'
        }


      },
      (err) => {
        console.log(err);
      }
    );
  }

  isFileAllowed(fileName: string) {
    let isFileAllowed = false;
    const allowedFiles = ['.pdf', '.jpg', '.jpeg', '.png', '.docx'];
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

  dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {
      let validFile = this.isFileAllowed(droppedFile.fileEntry.name);
      if (droppedFile.fileEntry.isFile && validFile) {
        this.listfiles.push(this.files);
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          this.fileitems.push(file);//Commercial Operation
          this.filetype_val = this.fileitems[0].name.split('.');
          this.filetype_val_res = this.filetype_val[1];
          this.fileNames.push(droppedFile.relativePath);
        });
      } else {
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        if (!validFile) {
          this.toastrService.error(
            'File format not supported! Please drop .pdf, .jpg, .jpeg, .png, .docx files'
          );
        }
      }
    }
  }

  equipment(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const equipmentFile of files) {
      // Is it a file?
      let validFile = this.isFileAllowed(equipmentFile.fileEntry.name)
      if (equipmentFile.fileEntry.isFile && validFile) {
        this.listfiles.push(this.files)
        const fileEntry = equipmentFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Here you can access the real file
          file["services"] = "Equipment";
          this.eqipment_items.push(file);//Equipment
          this.filetype_equipment_val = this.eqipment_items[0].name.split('.');
          this.filetype_equipment_val_res = this.filetype_equipment_val[1];
          this.fileNames.push(equipmentFile.relativePath);
          let msg = file.name + " is Added Successfully!";
          this.milestone = 'Equipment';
          this.toastrService.success(msg)
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = equipmentFile.fileEntry as FileSystemDirectoryEntry;
        if (!validFile) {
          this.toastrService.error("File format not supported! Please drop .pdf, .jpg, .jpeg, .png, .docx files")
        }
      }
    }
  }

  equipmentPermit(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const equipmentPFile of files) {
      // Is it a file?
      let validFile = this.isFileAllowed(equipmentPFile.fileEntry.name)
      if (equipmentPFile.fileEntry.isFile && validFile) {
        this.listfiles.push(this.files)
        const fileEntry = equipmentPFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Here you can access the real file
          file["services"] = "Equipment/Permit";
          this.eqipmentPermit_items.push(file);//Equipment
          this.filetype_equipmentP_val = this.eqipmentPermit_items[0].name.split('.');
          this.filetype_equipmentP_val_res = this.filetype_equipmentP_val[1];
          this.fileNames.push(equipmentPFile.relativePath);
          let msg = file.name + " is Added Successfully";
          this.milestone = 'Equipment/Permit';
          this.toastrService.success(msg)
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = equipmentPFile.fileEntry as FileSystemDirectoryEntry;
        if (!validFile) {
          this.toastrService.error("File format not supported! Please drop .pdf, .jpg, .jpeg, .png, .docx files")
        }
      }
    }
  }

  salesitems(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const salesitemsFile of files) {
      let validFile = this.isFileAllowed(salesitemsFile.fileEntry.name);
      if (salesitemsFile.fileEntry.isFile && validFile) {
        this.listfiles.push(this.files);
        const fileEntry_sales = salesitemsFile.fileEntry as FileSystemFileEntry;
        fileEntry_sales.file((file: File) => {
          this.sales_items.push(file);
          this.data_sales_contract.files.length = 0;
          this.filetype_salesitems_val = this.sales_items[0].name.split('.');
          this.filetype_salesitems_val_res = this.filetype_salesitems_val[1];
          this.fileNames.push(salesitemsFile.relativePath);
          // let msg = file.name + " Sales Contract submitted successfully";
          // let msg = file.name + " Sales Contract submitted successfully";
          // this.toastrService.success(msg)
        });
      } else {
        const fileEntry_equip = salesitemsFile.fileEntry as FileSystemDirectoryEntry;
        if (!validFile) {
          this.toastrService.error(
            'File format not supported! Please drop .pdf, .jpg, .jpeg, .png, .docx files'
          );
        }
      }
    }
  }

  construction(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const constructionFile of files) {
      let validFile = this.isFileAllowed(constructionFile.fileEntry.name);
      if (constructionFile.fileEntry.isFile && validFile) {
        this.listfiles.push(this.files);
        const fileEntry_construct = constructionFile.fileEntry as FileSystemFileEntry;
        fileEntry_construct.file((file: File) => {
          this.construct_items.push(file);//Construction
          this.filetype_construct_val = this.construct_items[0].name.split('.');
          this.filetype_construct_val_res = this.filetype_construct_val[1];
          this.fileNames.push(constructionFile.relativePath);
          let msg = file.name + "is Added Successfully";
          this.toastrService.success(msg)
        });
      } else {
        const fileEntry_construct = constructionFile.fileEntry as FileSystemDirectoryEntry;
        if (!validFile) {
          this.toastrService.error(
            'File format not supported! Please drop .pdf, .jpg, .jpeg, .png, .docx files'
          );
        }
      }
    }
  }

  namedata(data) {
    return data.target.value;
  }

  fileOver(event) {}

  fileLeave(event) {}

  upoadDocumentsProject(type: any) {

    if (this.phase_type != 'Construction') {
      this.toastrService.error('Phase Type Construction only Allowed!');
      return false;
    }

    const formData = new FormData();
    formData.append('link_id', this.loanId);

    if (type == 'e') {


      if (this.eqipment_items.length == 0 && this.eqipmentPermit_items.length == 0) {
        this.toastrService.error('kindly select a file!');
        return
      }

      this.eqipment_items = this.eqipment_items.concat(this.eqipmentPermit_items);
      // this.service_name_type = 'Equipment';
      for (var i = 0; i < this.eqipment_items.length; i++) {
        formData.append('files[]', this.eqipment_items[i]);
        formData.append("services", this.eqipment_items[i].services);
        // formData.append('services', this.service_name_type);
      }
      // for (var i = 0; i < this.eqipmentPermit_items.length; i++) {
      //   formData.append('files[]', this.eqipmentPermit_items[i]);
      //   formData.append("services", this.eqipmentPermit_items[i].services);
      //   // formData.append('services', this.service_name_type);
      // }
    } else if (type == 'c') {
      this.milestone = 'Construction';
      if (this.construct_items.length == 0) {
        this.toastrService.error('kindly select a file!');
        return
      }
      this.service_name_type = 'Construction';
      for (var i = 0; i < this.construct_items.length; i++) {
        formData.append('files[]', this.construct_items[i]);
        formData.append('services', this.service_name_type);
      }
    } else {
      this.milestone = 'Commercial Operation';
      if (this.fileitems.length == 0) {
        this.toastrService.error('kindly select a file!');
        return
      }
      this.service_name_type = 'Commercial Operation';
      for (var i = 0; i < this.fileitems.length; i++) {
        formData.append('files[]', this.fileitems[i]);
        formData.append('services', this.service_name_type);
      }
    }

    this.service
      .authfiles('files/uploads', 'partner', formData)
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            if (type == 'e') {
              this.isShowEquip = true
            } else if (type == 'c') {
              this.isShowConstruct = true
            } else {
              this.isShowOperate = true
            }
            this.toastrService.success('File Uploaded Successfully!');
            this.getallfiles();
            this.files = [];
            this.listfiles = [];
            this.fileitems = [];
            this.construct_items = [];
            this.eqipment_items = [];
            this.eqipmentPermit_items = [];
          } else {
            this.toastrService.error('File Uploading Error!');
          }
        },
        (err) => {
          this.toastrService.error('File Uploading Error!');
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );


    this.data_milestone.loanid = this.loanId;
    this.data_milestone.ref_no = this.refno;
    this.data_milestone.milestone = (this.milestone == 'Equipment/Permit') ? 'Equipment' : this.milestone;
    this.service
      .authpost('opportunity/milestone/create/' + this.loanId, 'partner', this.data_milestone)
      .pipe(first())
      .subscribe(
        (res) => {
          this.loading = false;
        },
        (err) => {
          if (err['status'] != 200) {
            this.isServer_error = false;
            this.toastrService.error('Error!');
            // setTimeout(() => {
            //   this.router.navigate(['partner/opportunity']);
            // }, 5000); //5s
          }
        }
      );

  }

  upoadDocuments() {
    //

    const formData = new FormData();
    formData.append('link_id', this.loanId);

    for (var i = 0; i < this.sales_items.length; i++) {
      formData.append('files[]', this.sales_items[i]);
      formData.append('services', this.service_name);
    }



    if (this.data_replace_res.length == 0) {
      this.service
        .authfiles('files/uploads', 'partner', formData)
        .pipe(first())
        .subscribe(
          (res) => {
            //this.addlogs("Uploaded documents",this.data[0]['user_id'])
            // console.log('upload date---',res)
            if (res['statusCode'] == 200) {
              //console.log('filesres',res['data']['files']);
              this.toastrService.success('Sales Contract submitted successfully');
              this.getallfiles();
              //this.data_sales_contract['files'] = res['data']['files'].filter(xx => xx.services == 'salescontract/uploadDocuments');
              this.files = [];
              this.listfiles = [];
              this.fileitems = [];
              this.upload_sales_date = res['data']['files'][0].updatedAt;

              // console.log(this.files);

              // if(upload=='replace'){
              //   //update API
              // }
            } else {
              this.toastrService.error('File Uploading Error!');
            }
          },
          (err) => {
            this.toastrService.error('File Uploading Error!');
            if (err['error']['message'].isArray) {
              this.message = err['error']['message'];
            } else {
              this.message = [err['error']['message']];
            }
            this.modalRef = this.modalService.show(this.messagebox);
          }
        );
    } else {
      let fname_replace = this.data_replace_res[0].filename.split('/')[2];
      this.service
        .files('files/replace/' + fname_replace, 'partner', formData)
        .pipe(first())
        .subscribe(
          (res) => {
            if (res['statusCode'] == 200) {
              this.toastrService.success('Sales Contract submitted successfully!');
              this.setcommentSalesContract(this.loanId)
              //console.log('********',res)
              this.getallfiles();
              //this.data_sales_contract['files'] = res['data']['files'].filter(xx => xx.services == 'salescontract/uploadDocuments');
              this.files = [];
              this.listfiles = [];
              this.fileitems = [];
              this.upload_sales_date = res['data']['files'][0].updatedAt;
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
    }
  }

  setcommentSalesContract(id){
    this.service
      .authpost('opportunity/salescomments/' + id, 'partner', this.data_res)
      .pipe(first())
      .subscribe(
        (res) => {
          this.getOpportunityList()

        },
        (err) => {
          console.log(err);
        })

  }

  deleteFileSelected1(file) {
    this.eqipment_items.splice(
      this.fileitems.findIndex((f) => f.name == file.name),
      1
    );
  }

  deleteFileSelectedP1(file) {
    this.eqipmentPermit_items.splice(
      this.fileitems.findIndex((f) => f.name == file.name),
      1
    );
  }

  deleteFileSelected2(file) {
    this.construct_items.splice(
      this.fileitems.findIndex((f) => f.name == file.name),
      1
    );
  }

  deleteFileSelected(file) {
    this.fileitems.splice(
      this.fileitems.findIndex((f) => f.name == file.name),
      1
    );
  }

  deleteFileSelected_sales(file) {
    this.sales_items.splice(
      this.fileitems.findIndex((f) => f.name == file.name),
      1
    );
    // this.getallfiles()
    //console.log('11111-----',this.listfiles.length)
    if (this.listfiles.length >= 1) {
      this.listfiles.length = 0;
      this.getallfiles();
    }
  }

  deleteFilelist(file) {
    //console.log('file---',file)
    this.data_sales_contract['files'].length = 0;
  }

  getOpportunityList() {
    this.service
      .authget('opportunity/' + this.loanId, 'partner')
      .pipe(first())
      .subscribe(
        (res) => {
          console.log('res ID', res);
          //console.log('LOAN ID', this.loanId);
          this.selectedProduct = res['selectedProduct'][0]
          this.phase_type = res['customerFinanceDetails'][0].phase_flag;
          this.refno = res['customerFinanceDetails'][0].ref_no;
          if (this.phase_type != 'New') {
            this.isReadOnly = true; //
          }
          this.result = res['customerFinanceDetails'][0];

          if( res['customerFinanceDetails'][0].phase_flag == "New"){
            res['customerFinanceDetails'][0].phase_flag = "Underwriting"
            this.phase = res['customerFinanceDetails'][0].phase_flag
          }else if(res['customerFinanceDetails'][0].phase_flag == "Underwriting"){
            res['customerFinanceDetails'][0].phase_flag = "Project Setup"
            this.phase = res['customerFinanceDetails'][0].phase_flag
          }else if(res['customerFinanceDetails'][0].phase_flag == "Project Setup"){
            res['customerFinanceDetails'][0].phase_flag = "Contracting"
            this.phase = res['customerFinanceDetails'][0].phase_flag
          }else if(res['customerFinanceDetails'][0].phase_flag == "Contracting"){
            res['customerFinanceDetails'][0].phase_flag = "Construction"
            this.phase = res['customerFinanceDetails'][0].phase_flag
          }else if(res['customerFinanceDetails'][0].phase_flag == "Construction"){
            res['customerFinanceDetails'][0].phase_flag = ""
            this.phase = res['customerFinanceDetails'][0].phase_flag
          }
          this.result_sitedetails = res['customerFinanceDetails'][0];
          this.activity_res = res['activity'];

          this.salescontractreviewcomments = (res['contractReviewComments'].length > 0) ? res['contractReviewComments'][0] : [];

          this.milestoneReviewComments = (res['milestoneReviewComments'].length > 0) ? res['milestoneReviewComments'] : null;

          this.underwriting_status = res['customerFinanceDetails'][0].status_flag;

          if(this.milestoneReviewComments && res['milestoneReviewComments'].length > 0){
            this.milestoneReviewCommentsComplete = res['milestoneReviewComments'].filter(
              (xx) => xx.status == 'Approved'
            );

            if (this.milestoneReviewCommentsComplete[0].milestone == 'Construction') {
              this.construct_status = 'complete'
            }
            if (this.milestoneReviewCommentsComplete[0].milestone == 'Commercial Operation') {
              this.permission_status = 'complete'
            }
            if (this.milestoneReviewCommentsComplete[0].milestone == 'Equipment') {
              this.eqipment_status = 'complete'
            }
        }

          //console.log('this.milestoneReviewComments',this.milestoneReviewCommentsComplete)
          /********DROP DOWN VALUES LIST******/
          this.batteryManufaturer = res['batteryManufaturer'];
          this.inverterManufacturer = res['inverterManufacturer'];
          this.mountType = res['mountType'];
          this.panelManufacturer = res['panelManufacturer'];
          /********DROP DOWN VALUES LIST******/

          this.data.business_name =
            this.result_sitedetails?.legalName?.length > 35
              ? this.result_sitedetails.legalName.slice(0, 35) + '..'
              : this.result_sitedetails.legalName;
          this.data.business_owner_first_name = this.result_sitedetails.ownerFirstName;
          this.data.business_owner_last_name = this.result_sitedetails.ownerLastName;
          this.data.business_email = this.result_sitedetails.email;
          this.data.business_phone = this.result_sitedetails.businessPhone;
          this.data.businessAddress = this.result_sitedetails.businessAddress;
          this.data.financingRequested = this.result_sitedetails.financingRequested?.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          this.data.financingTermRequested = this.result_sitedetails.financingTermRequested;
          this.data.business_city = res['siteProjectDetails'][0].city;
          this.data.business_state = res['siteProjectDetails'][0].state;
          this.data.business_zipcode = res['siteProjectDetails'][0].zipCode;
          this.data.city = res['siteProjectDetails'][0].businessInstallCity;
          this.data.state = res['siteProjectDetails'][0].businessInstallState;
          this.data.zipcode = res['siteProjectDetails'][0].businessInstallZipCode;

          this.data.businessInstallLat = (res['siteProjectDetails'][0].businessInstallLat != null) ? parseFloat(res['siteProjectDetails'][0].businessInstallLat) : null;
          this.data.businessInstallLng = (res['siteProjectDetails'][0].businessInstallLng != null) ? parseFloat(res['siteProjectDetails'][0].businessInstallLng) : null;
          //console.log('11211', this.data.businessInstallLat,'2222', this.data.businessInstallLng)

          //console.log('contactaddr', this.result_sitedetails.businessAddress,
          //'siteaddr', this.siteProjectDetails.businessInstallAddress)

          //console.log('***',res['siteProjectDetails'][0].businessInstallCity,
          ///',res['siteProjectDetails'][0].businessInstallState,'***',res['siteProjectDetails'][0].businessInstallZipCode)


          this.siteProjectDetails = res['siteProjectDetails'][0];
          this.data.businessInstallAddress = this.siteProjectDetails.businessInstallAddress;
          this.data.siteType = this.siteProjectDetails.siteType;
          this.data.electricCompany = this.siteProjectDetails.electricCompany;
          this.data.avgUtilPerMonth = this.siteProjectDetails.avgUtilPerMonth;
          this.data.avgConsumptionPerMonth = this.siteProjectDetails.avgConsumptionPerMonth;
          this.data.totalProjectCost = this.siteProjectDetails.totalProjectCost;
          this.data.arraySize = this.siteProjectDetails.arraySize;
          this.data.batteryCapacity = this.siteProjectDetails.batteryCapacity;
          this.data.batteryManufacturer = this.siteProjectDetails.batteryManufacturer;
          this.data.estGeneration = this.siteProjectDetails.estGeneration;
          this.data.estGenerationRate = this.siteProjectDetails.estGenerationRate;
          this.data.panelManufacturer = this.siteProjectDetails.panelManufacturer;
          this.data.inverterManufacturer = this.siteProjectDetails.inverterManufacturer;
          this.data.inverterNamePlateCapacity = this.siteProjectDetails.inverterNamePlateCapacity;
          this.data.mountType = this.siteProjectDetails.mountType;
          this.data.nonSolarEquipmentWork = this.siteProjectDetails.nonSolarEquipmentWork;
          this.data.nonSolarProjectCost = this.siteProjectDetails.nonSolarProjectCost;

          this.setLoanApprovalExpirationDate();
        },
        (err) => {
          console.log(err);
        }
      );
  }

  addbusiness_details(loadid: any) {
    //alert(loadid);

    //console.log('uaddress',this.form.value)
    this.data_res.legalName = this.form.value['business_name'];
    this.data_res.ownerFirstName = this.form.value['business_owner_first_name'];
    this.data_res.ownerLastName = this.form.value['business_owner_last_name'];
    this.data_res.email = this.form.value['business_email'];
    this.data_res.businessPhone = this.data.business_phone;
    this.data_res.businessAddress = this.form.value['business_address'];
    this.data_res.lat = this.form.value['lat'];
    this.data_res.lng = this.form.value['lng'];

    // this.data_res.financingRequested = this.finance_form.value[
    //   'financingRequested'
    // ];



 // if((this.data.financingRequested > 25000 || this.showFinancingRequested > 25000) && this.data.businessAddress != 'Rhode Island, USA'){
    //   console.log("test");
    //   if (this.finance_form.value['financingRequested'] != '' && this.finance_form.value['financingRequested'] != null && this.finance_form.value['financingRequested'] != undefined) {
    //     this.data_res.financingRequested = this.finance_form.value['financingRequested'].replace(',', '');
    //     console.log("sub", this.data_res.financingRequested)
    //   }

    // }


    if (this.finance_form.value['financingRequested'] != '' && this.finance_form.value['financingRequested'] != null && this.finance_form.value['financingRequested'] != undefined) {
      this.data_res.financingRequested = this.finance_form.value['financingRequested'].replace(',', '');
    }

    this.data_res.financingTermRequested = this.finance_form.value[
      'financingTermRequested'
    ];
    this.data_res.productID = this.loanProductID

    this.data_res.businessInstallAddress = this.site_form.value[
      'businessInstallAddress'
    ];
    this.data_res.siteType = this.site_form.value['siteType'];
    this.data_res.electricCompany = this.site_form.value['electricCompany'];
    this.data_res.avgUtilPerMonth = this.site_form.value['avgUtilPerMonth'];
    this.data_res.avgConsumptionPerMonth = this.site_form.value[
      'avgConsumptionPerMonth'
    ];
    this.data_res.city = this.form.value['business_city'];
    this.data_res.state = this.form.value['business_state'];
    this.data_res.zipcode = this.form.value['business_zipcode'];

    this.data_res.businessInstallCity = this.site_form.value['city'];
    this.data_res.businessInstallState = this.site_form.value['state'];
    this.data_res.businessInstallZipCode = this.site_form.value['zipcode'];

    this.data_res.arraySize = this.projectSetUp_form.value['arraySize'];
    this.data_res.panelManufacturer = this.projectSetUp_form.value[
      'panelManufacturer'
    ];
    this.data_res.inverterNamePlateCapacity = this.projectSetUp_form.value[
      'inverterNamePlateCapacity'
    ];
    this.data_res.inverterManufacturer = this.projectSetUp_form.value[
      'inverterManufacturer'
    ];
    this.data_res.batteryCapacity = this.projectSetUp_form.value[
      'batteryCapacity'
    ];
    this.data_res.batteryManufacturer = this.projectSetUp_form.value[
      'batteryManufacturer'
    ];
    this.data_res.mountType = this.projectSetUp_form.value['mountType'];
    this.data_res.estGenerationRate = this.projectSetUp_form.value[
      'estGenerationRate'
    ];
    this.data_res.estGeneration = this.projectSetUp_form.value['estGeneration'];
    this.data_res.nonSolarEquipmentWork = this.projectSetUp_form.value[
      'nonSolarEquipmentWork'
    ];
    this.data_res.nonSolarProjectCost = this.projectSetUp_form.value[
      'nonSolarProjectCost'
    ];
    this.data_res.totalProjectCost = this.projectSetUp_form.value[
      'totalProjectCost'
    ];

    this.loading = true;

    this.service
      .authpost('opportunity/' + loadid, 'partner', this.data_res)
      .pipe(first())
      .subscribe(
        () => {
          this.loading = false;

          if (
            Number(this.data_res.financingRequested ) < 25001 ||
            Number(this.showFinancingRequested ) < 25001
          ) {
            this.condition1 = true
          } else {
            this.condition1=false
          }

          if(
            Number(this.data_res.financingRequested ) > 300000 ||
            Number(this.showFinancingRequested ) > 300000
          ) {
            this.condition2 = true
          } else {
            this.condition2 = false
          }
        },
        (err) => {
          if (err['status'] != 200) {
            this.isServer_error = false;

            setTimeout(() => {
              this.router.navigate(['partner/opportunity']);
            }, 5000);
          }
        }
      );
  }

  resendEmail() {
    const finance_req_term = this.data.financingTermRequested;
    const finance_req = this.data.financingRequested;
    const finance_req_amount = this.data.financingRequested != null ? Number(this.data.financingRequested.replace(/[^0-9]/g, "")) : null;

    this.sitevalid = true;

     if (finance_req && finance_req_term) {
      if (
        (this.data.businessAddress != "Rhode Island, USA" && finance_req_amount < 25001) ||
        (finance_req_amount > 300000) ||
        (this.data.businessAddress == "Rhode Island, USA" && finance_req_amount < 25001)
      ) {
        if (this.data.businessAddress != "Rhode Island, USA" && finance_req_amount < 25001) {
          this.resend_check = true;
          this.hidden_contract = true;
          this.hidden_underwriting = false;
          this.toastrService.error('The financing requested cannot be less than $25,001');

          return;
        } else if (finance_req_amount > 300000) {
          this.resend_check = true;
          this.hidden_contract = true;
          this.hidden_underwriting = false;
          this.toastrService.error('The financing requested is in excess of our current lending limit.');

          return;
        } else if (this.data.businessAddress == "Rhode Island, USA" && finance_req_amount < 25001) {
          this.resend_check = true;
          this.hidden_contract = true;
          this.hidden_underwriting = false;
          this.toastrService.error('The financing requested cannot be less than $25,001');

          return;
        } else if (this.data.financingTermRequested == null || this.data.financingTermRequested === 'null') {
          this.toastrService.error('Please provide Financing Term Requested to send the loan agreement');

          return;
        } else if (this.data.financingRequested == null) {
          this.toastrService.error('Please provide an Financing Requested amount to send the loan agreement');

          return;
        }

        if(this.site_form.controls.businessInstallAddress.errors?.required){
          this.resend_check = true;
          this.hiddensite = true;
        }

        if(this.projectSetUp_form.controls.panelManufacturer.errors?.required) {
          this.resend_check = true;
          this.hidden_underwriting = false;
          this.hidden_projectsetup = true;
        }

        if(this.projectSetUp_form.controls.inverterManufacturer.errors?.required){
          this.resend_check = true;
          this.hidden_underwriting = false;
          this.hidden_projectsetup = true;
        }

        if(this.projectSetUp_form.controls.totalProjectCost.errors?.required){
          this.resend_check = true;
          this.hidden_underwriting = false;
          this.hidden_projectsetup = true;
        }
      }

      this.service
        .authput(`create-opportunity/${this.loanId}/send-welcome-email`, 'sales', null)
        .pipe(first())
        .subscribe(
          (res) => {
            if (res['statusCode'] == 200) {
              this.toastrService.success('Credit Application Sent Successfully!');
            }
          },
          (err) => {
            this.toastrService.error('Credit Application E-mail Error!');

            if (err['error']['message']) {
              this.message = err['error']['message'];
            } else {
              this.message = [err['error']['message']];
            }

            this.modalRef = this.modalService.show(this.messagebox);
          }
        );
    } else {
      this.resend_check = true;
      this.hidden_contract = true;
      this.hidden_underwriting = false;

      if (!finance_req && !finance_req_term) {
        this.toastrService.error('Please Enter Financing Requested amount and Financing Term Requested!');
      } else if (!finance_req) {
        this.toastrService.error('Please enter a Financing Requested amount.');
      } else {
        this.toastrService.error('Please enter a Financing Term!');
      }
    }
  }

  view(filename: any) {
    filename = filename.split('/');
    filename = filename[filename.length - 1];
    
    this.service
      .authgetfile(`files/download/${filename}`, 'admin')
      .pipe(first())
      .subscribe(async (res) => {
        window.open(URL.createObjectURL(new Blob([res], { type: 'application/pdf' })));

      });
  }

  keyPressNumbers(event) {
    // console.log(event.target.id)
    if (event.target.id == "financingRequested") {
      // console.log("3", event.target.value)
      this.data.financingRequested = event.target.value.replace(',', '')
      // console.log("4", this.data.financingRequested)
    }
    var charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
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
  }

  securitypolicy() {
    window.open(
      'security-policy',
      '_blank' // <- This is what makes it open in a new window.
    );
    //this.router.navigate(['security-policy']);
  }

  handleAddressChange(address: any, type: any) {

    if (type == 'businessaddressval') {
      this.data.businessAddress = address.formatted_address;
      for (const component of address.address_components) {
        const componentType = component.types[0];

        switch (componentType) {

          case "postal_code": {
            this.data.business_zipcode = `${component.long_name}`;
            break;
          }
          case "locality": {
            this.data.business_city = component.long_name;
            break;
          }
          case "administrative_area_level_1": {
            this.data.business_state = component.long_name;
            break;
          }

        }

      }
    } else {
      this.data.businessInstallAddress = address.formatted_address;
      this.data.businessInstallLat = address.geometry.location.lat();
      this.data.businessInstallLng = address.geometry.location.lng();
      for (const component of address.address_components) {
        const componentType = component.types[0];

        switch (componentType) {

          case "postal_code": {
            this.data.zipcode = `${component.long_name}`;
            break;
          }
          case "locality": {
            this.data.city = component.long_name;
            break;
          }
          case "administrative_area_level_1": {
            this.data.state = component.long_name;
            break;
          }

        }

      }

      //console.log("gadd",address.geometry.location.lat(),address.geometry.location.lng());


      if (address.address_components) {
        this.autosaveforms();
      }


    }
  }

  sendfinanceform() {
    this.service
      .authpost(`opportunity/${this.loanId}/send-financing-contract-email`, 'partner', null)
      .pipe(first())
      .subscribe(
        () => {
          this.toastrService.success('Financing contract email successfully sent');
        },
        (err) => {
          const errorMessage = err.status === 500 ? 'Something went wrong. Please try again later' : err.error.message;

          this.toastrService.error(errorMessage);
        }
      );
  }

  onChangefinance(e) {
    let s = e.split(":");
    this.loanProductID = this.loanproductsmonths[(s[0] - 1)].productId
  }

  close(): void {
    this.modalRef.hide();
  }

  financingRequestedFormat(event) {
    // console.log("1")
    // console.log("ckk-->", (event.target.value).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    // this.showFinancingRequested = (event.target.value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    this.data.financingRequested = (event.target.value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    this.showFinancingRequested = event.target.value.replace(',', '')
    this.validationMessage = true;
    // console.log("fnr", this.showFinancingRequested,)
    // this.data.financingRequested = this.showFinancingRequested;
    //return this.showFinancingRequested;
  }

  financeRemove(e) {
    // console.log("2")
    this.data.financingRequested = e.target.value.replace(',', '');
    this.validationMessage = false;
  }

  financeRemoveComa(e) {
    // console.log("6")
    this.data.financingRequested = e.target.value.replace(',', '');
    this.validationMessage = false;
  }

  func(){
    console.log('checkdata', this.projectSetUp_form.controls.panelManufacturer.value)
  }

  switchShowUnderwritingTool(event){
    event.stopPropagation();
    this.showUnderwritingTool = ! this.showUnderwritingTool
  }

  setLoanApprovalExpirationDate() {
    const approvalDate = new Date(this.result_sitedetails['approval_denial_date']);

    this.approvalExpirationDate = new Date(approvalDate.setUTCMonth(approvalDate.getUTCMonth() + 2));
  }
}
