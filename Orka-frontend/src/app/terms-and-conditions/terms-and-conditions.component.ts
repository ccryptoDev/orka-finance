import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss']
})
export class TermsAndConditionsComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    public router: Router,

    ) { }

  ngOnInit(): void {
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
