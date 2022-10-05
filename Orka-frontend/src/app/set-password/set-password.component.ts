import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss']
})
export class SetPasswordComponent implements OnInit {

  leadId: string = '';
  loanType: string = '';
  loader: boolean = false;
  forgotForm: FormGroup;
  submitted: boolean = false;
  userId: string = '';
  fieldTextType1: boolean=false;
  fieldTextType2: boolean =false;
  constructor(private formbuilder: FormBuilder, private router: Router,  private route: ActivatedRoute,) {

  }
  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get("id");
    console.log(this.userId);
    
  }
  validPassword() {
    
  }
  onSubmit() {
   console.log("Submitted",this.fieldTextType1,this.fieldTextType2)

  }
  openRestpasswordDialog() {
    
  }

  toggleFieldTextType1() {
    this.fieldTextType1 = !this.fieldTextType1;
    }

    toggleFieldTextType2() {
      this.fieldTextType2 = !this.fieldTextType2;
      }
}
