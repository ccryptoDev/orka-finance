import { Component, OnInit } from '@angular/core';
import { LocationStrategy } from '@angular/common';

@Component({
  selector: 'app-sorry',
  templateUrl: './sorry.component.html',
  styleUrls: ['./sorry.component.scss']
})
export class SorryComponent implements OnInit {
  message1: string;
  message2: string;

  constructor(private location: LocationStrategy) {
    history.pushState(null, null, window.location.href);
    this.location.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
  }

  ngOnInit(): void {
    const count = Number(sessionStorage.getItem('messageCount'));
    if (count > 1) {
      this.message1 = sessionStorage.getItem('sorryMessage0')
      this.message2 = sessionStorage.getItem('sorryMessage1')
    }
    else {
      this.message1 = sessionStorage.getItem('sorryMessage0')
    }
    // console.log("m",this.message)
  }

}
