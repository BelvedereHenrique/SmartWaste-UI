import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import {AppSettings} from '../../AppSettings'
import 'rxjs/add/operator/map';

@Injectable()
export class AccountEnterpriseService{
    
private url = 'http://localhost:3000/todo/';
private headers = new Headers({ 'Content-Type': 'application/json' });
private options = new RequestOptions({ headers: this.headers });

  constructor(private http: Http) {
  }

  getCountries () {
    return this.http.get("http://localhost:15538/Account/GetCountries")
                    .map(this.extractData)
                    .catch(this.handleError);
  }
  private extractData(res: Response) {
    const body = res.json();
    return body || { };
  }
  
  private handleError (error: any) {
    const errMsg = (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }

}