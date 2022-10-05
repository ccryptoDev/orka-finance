import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  dataurl:any =[];
  dataMurl:any=[];
  constructor() { }
  setData(data){
    this.dataurl =data
  }
  getData(){
    return this.dataurl
  }
  setMData(d){
    this.dataMurl =d
  }
  getMData(){
    return this.dataMurl
  }
}
