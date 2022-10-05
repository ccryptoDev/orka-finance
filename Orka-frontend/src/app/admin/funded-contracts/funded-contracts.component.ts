import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { HttpService } from 'src/app/_service/http.service';

@Component({
  selector: 'app-funded-contracts',
  templateUrl: './funded-contracts.component.html',
  styleUrls: ['./funded-contracts.component.scss']
})
export class FundedContractsComponent implements OnInit {
  data:any=[]

  constructor(private service: HttpService) { }

  ngOnInit(): void {
    this.get()
  }

  get(){
    this.service.authget('funded-contracts','admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log(res);
        
        this.data= res['data']
      }
    },err=>{
      console.log(err)
    })
  }

}
