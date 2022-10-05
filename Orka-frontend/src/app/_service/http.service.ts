import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders} from '@angular/common/http';
import { ToastrService } from "ngx-toastr";

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  salesapiurl = environment.salesapiurl;
  adminapiurl = environment.adminapiurl;
  borrowerapiurl = environment.borrowerapiurl;
  installerapiurl = environment.installerapiurl;
  de = environment.de;
  constructor(private http:HttpClient,private toastrService: ToastrService) { }

  geturl(uri: string, key: string) {
    let url = "";

    switch (key) {
      case 'sales':
        url = this.salesapiurl + uri;
        break;
      case 'admin':
        url = this.adminapiurl + uri;
        break;
      case 'adminenvelope':
        url = this.borrowerapiurl + uri;
        break;
      case 'borrower':
        url = this.borrowerapiurl + uri;
        break;
      case 'partner':
        url = this.installerapiurl + uri;
        break;
      case 'de':
        url = this.de + uri;
        break;
    }

    return url;
  }


  gettoken(key){
    let token = ""
    switch (key) {
      case 'admin':
        token =  "Bearer "+sessionStorage.getItem('admin_token')
        break;
      case 'adminenvelope':
        token =  "Bearer "+sessionStorage.getItem('admin_token')
      break;
      case 'borrower':
        token =  "Bearer "+sessionStorage.getItem('borrower_token')
        break;
      case 'partner':
        token =  "Bearer "+sessionStorage.getItem('installer_token')
        break;
    }
    return token;
  }

  get(url,key){
    let httpHeaders = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('Access-Control-Allow-Origin','*')
    let options = {
        headers: httpHeaders
    };
    let nurl = this.geturl(url,key);
    
     return this.http.get(nurl,options)
  }

  successMessage(m){
    this.toastrService.success(m);
  }

  errorMessage(m){
    this.toastrService.error(m)

  }

  post(url,key,data){    
    let httpHeaders = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('Access-Control-Allow-Origin','*')
    let options = {
        headers: httpHeaders
    };
    let nurl = this.geturl(url,key);
     return this.http.post(nurl,data,options)
  }

  put(url,key,data){
    let httpHeaders = new HttpHeaders()
    .set('Content-Type','application/json')
    .set('Access-Control-Allow-Origin','*')
    let options = {
      headers: httpHeaders
    };
    let nurl = this.geturl(url,key);
    return this.http.put(nurl,data,options)
  }

  files(url,key,data){
    let httpHeaders = new HttpHeaders()
    .set('dataType', 'jsonp')
    .set('Access-Control-Allow-Origin','*')
    let options = {
      headers: httpHeaders
  };
    let nurl = this.geturl(url,key);
    return this.http.post(nurl,data,options)
  }

  authfiles(url,key,data){
    
    let httpHeaders = new HttpHeaders()
    .set('dataType', 'jsonp')
    .set('Access-Control-Allow-Origin','*')
    .set('Authorization', this.gettoken(key))
    let options = {
      headers: httpHeaders
  };
    let nurl = this.geturl(url,key);
    return this.http.post(nurl,data,options)
  }

  authget(url,key){
    let httpHeaders = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('Access-Control-Allow-Origin','*')
    .set('Authorization', this.gettoken(key))
    let options = {
        headers: httpHeaders
    };
    let nurl = this.geturl(url,key);
     return this.http.get(nurl,options)
  }

  authgetfile(url,key){
    let httpHeaders = new HttpHeaders()
    .set('Content-Type', 'application/pdf')
    .set('Access-Control-Allow-Origin','*')
    .set('Authorization', this.gettoken(key))
    let options = {
        headers: httpHeaders,
    };
    let nurl = this.geturl(url,key);
     return this.http.get(nurl,{ headers: httpHeaders, responseType: 'blob' })
  }

  authpost(url,key,data) {
    const httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin','*')
      .set('Authorization', this.gettoken(key));
    const options = { headers: httpHeaders };
    const nurl = this.geturl(url,key);
  
    return this.http.post(nurl,data,options)
  }

  authput(url,key,data) {​​​​​​​​
    const httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin','*')
      .set('Authorization', this.gettoken(key));
    const options = {​​​​​​​​ headers: httpHeaders }​​​​​​​​;
    const nurl = this.geturl(url,key);

    return this.http.put(nurl,data,options)
  }

  authpatch(url, key, data) {
    const httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin','*')
      .set('Authorization', this.gettoken(key));
    const options = {​​​​​​​​ headers: httpHeaders }​​​​​​​​;
    const nurl = this.geturl(url,key);

  return this.http.patch(nurl,data,options);
  }

  logout(){
    sessionStorage.clear()
    location.reload();
  }

  addlog(module,loan_id,key){
    let httpHeaders = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('Access-Control-Allow-Origin','*')
    .set('Authorization', this.gettoken(key))
    let options = {
        headers: httpHeaders
    };
    let data = {
      module:module,
      loan_id:loan_id
    }
    let nurl = ""
    switch(key){
      case "admin":
        data['user_id']=JSON.parse(sessionStorage.getItem('resuser'))['id']
        nurl = this.geturl("pending/addlogs",key);
        return this.http.post(nurl,data,options)
      break;
      case "borrower":
        data['user_id']=sessionStorage.getItem('UserId')
        nurl = this.geturl("overview/addlogs",key);
        return this.http.post(nurl,data,options)
      break;
      case "partner":
        data['user_id']=sessionStorage.getItem('InstallerUserId')
        nurl = this.geturl("logs/addlogs",key);
        return this.http.post(nurl,data,options)
      break;
    }
  }

  authdelete(url,key){
    let httpHeaders = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('Access-Control-Allow-Origin','*')
    .set('Authorization', this.gettoken(key))
    let options = {
    headers: httpHeaders
    };
    let nurl = this.geturl(url,key);
    return this.http.delete(nurl,options)
  }
  
  getOsName() {
    // const agent = window.navigator
    // alert(agent)
  
      var userAgent = window.navigator.userAgent,
          platform = window.navigator.platform,
          macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
          windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
          iosPlatforms = ['iPhone', 'iPad', 'iPod'],
          os = null;
    
      if (macosPlatforms.indexOf(platform) !== -1) {
        os = 'MacOS';
      } else if (iosPlatforms.indexOf(platform) !== -1) {
        os = 'iOS';
      } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = 'Windows';
      } else if (/Android/.test(userAgent)) {
        os = 'Android';
      } else if (!os && /Linux/.test(platform)) {
        os = 'Linux';
      }
  
    return os;
  
  }
}
