import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {

  constructor(public router:Router,private route: ActivatedRoute) { }

  ngOnInit(): void {
  }
  privacy() { 
    this.router.navigate(['partner/opportunity']);
  }

}
