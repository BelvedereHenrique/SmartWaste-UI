import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Response, Http, URLSearchParams, RequestOptions, Headers} from "@angular/http";
import { Observable } from 'rxjs';
import { AppSettings } from '../../AppSettings'

import 'rxjs/add/operator/map';

@Injectable()
export class ServiceHelpersService {
    constructor(private http: Http){

    }

    public post<T>(url : string, data: any) : Observable<T>{
        return this.http.post(this.JoinEndPoint(url), data, this.getOptions(null))
                .map(this.extractData)
                .catch(this.handleError);
    }

    public get<T>(url : string, params: URLSearchParams) : Observable<T>{
        return this.http.get(this.JoinEndPoint(url), this.getOptions(params))
                .map(this.extractData)
                .catch(this.handleError);
    }

    public getOptions(params : URLSearchParams) : RequestOptions{        
        return new RequestOptions({ 
            //headers: new Headers({ 'Content-Type': 'application/json' }),
            search: params            
        });
    }

    private JoinEndPoint(url : string) : string{
        return Location.joinWithSlash(AppSettings.API_ENDPOINT, url);
    }

    private extractData(res: Response) : any{
        const body = res.json();
        return body || { };
    }

    private handleError (error: any) {
        const errMsg = (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }
}