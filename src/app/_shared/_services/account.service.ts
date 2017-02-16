import { Injectable } from "@angular/core";
import { Http } from "@angular/http";

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

@Injectable()
export class AccountService {
    constructor(private _http: Http) {
        
    }

    public SignIn(email: String, password: String): Observable<any> {
        //return new Promise<JsonResult<any>>(() => {
        //    this._http.post("/Account/SignIn", {
        //        email: email,
        //        password: password
        //    }).subscribe();
        //});


        return this._http.post("/Account/SignIn", {
            email: email,
            password: password
        });
    }
}

export class JsonResult<T> {
    public Success: boolean;
    public Messages: JsonResultMessage[];
    public Result: T;
}

export class JsonResultMessage {
    public IsError: boolean;
    public Message: string;
}