import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Response, Http, URLSearchParams, RequestOptions, Headers, RequestMethod} from "@angular/http";
import { Observable } from 'rxjs';
import { AppSettings } from '../../AppSettings'

import { JwtModel } from '../_models/jwt.model'
import { JwtService } from './jwt.service'
import { SecurityManagerService } from "./security-manager.service";
import { NotificationService, Notification } from "./notification.service";

import 'rxjs/add/operator/map';

@Injectable()
export class ServiceHelpersService {
    constructor(private _http: Http,
                private _jwtService: JwtService,
                private _router: Router,
                private _securityManager: SecurityManagerService,
                private _notificationService: NotificationService){

    }

    public post<T>(url: string, data: any, addToken: boolean = true, contentType: ContentTypeEnum = ContentTypeEnum.JSON) : Observable<T>{
        return this._http.post(this.joinEndPoint(url), data, this.getOptions(RequestMethod.Post, null, contentType, addToken))
                .map(this.extractData)
                .catch(this.handleError.bind(this));
    }

    public get<T>(url : string, params: URLSearchParams) : Observable<T>{
        return this._http.get(this.joinEndPoint(url), this.getOptions(RequestMethod.Get, params, ContentTypeEnum.JSON, true))
                .map(this.extractData)
                .catch(this.handleError.bind(this));
    }
    public put<T>(url: string, data: any, addToken: boolean = true, contentType: ContentTypeEnum = ContentTypeEnum.JSON) : Observable<T>{
        return this._http.put(this.joinEndPoint(url), data, this.getOptions(RequestMethod.Post, null, contentType, addToken))
                .map(this.extractData)
                .catch(this.handleError.bind(this));
    }

    public getOptions(method: RequestMethod, params : URLSearchParams, contentType: ContentTypeEnum, addToken: boolean) : RequestOptions{        
        let headers =new Headers({ 
            'Accept': 'application/json'
        });

        switch(contentType){
            case ContentTypeEnum.JSON:{
                headers.append("Content-Type", "application/json");
                break;
            }
            case ContentTypeEnum.FORM:{
                headers.append("Content-Type", "application/x-www-form-urlencoded");
                break;
            }
        } 

        if (addToken){
            var jwt : JwtModel = this._jwtService.get();
            if(jwt){
                headers.set("Authorization", "Bearer " + jwt.access_token); 
            }
        }

        return new RequestOptions({             
            headers: headers,            
            search: params,
            method: method
        });
    }

    private joinEndPoint(url : string) : string{
        return Location.joinWithSlash(AppSettings.API_ENDPOINT, url);
    }

    private extractData(res: Response) : any{
        const body = res.json();
        return body || { };
    }

    private handleError (error: any) {        
        if(error.status == 401){
            // NOTE: User is not authorized. Redirecting to sign in component.
            this._securityManager.signout();
            this._router.navigate(["/signin"]);
            //this._notificationService.notify(new Notification("Something went wrong... Please, sign in again.", [], 5000));
        } else { 
            const errMsg = (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 'Server error';
            //console.error(errMsg); // log to console instead
            return Observable.throw(JSON.parse(error._body));
        }
    }
}

export enum ContentTypeEnum{
    JSON = 1,
    FORM = 2
}