import { Component, OnInit } from '@angular/core';

import { DecisionService } from '../../_service/decision.service';

@Component({
  selector: 'app-thankyou',
  templateUrl: './thankyou.component.html',
  styleUrls: ['./thankyou.component.scss']
})
export class ThankyouComponent implements OnInit {
  decision = '';

  constructor(
    private decisionService: DecisionService
  ) {}

  ngOnInit(): void {
    this.decisionService.decisionSource$
      .subscribe((decision) => {
        console.log(decision);

        this.decision = decision;
      });
  }
}
