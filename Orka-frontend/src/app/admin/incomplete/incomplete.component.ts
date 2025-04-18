import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { HttpService } from '../../_service/http.service';

@Component({
  selector: 'app-incomplete',
  templateUrl: './incomplete.component.html',
  styleUrls: ['./incomplete.component.scss']
})
export class IncompleteComponent implements OnInit {
  data: any = [];

  constructor(private service: HttpService) {}

  ngOnInit(): void {
    this.get();
  }

  get(){
    this.service
      .authget('incomplete','admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.data = res['data'];
          }
        }
      );
  }

}
