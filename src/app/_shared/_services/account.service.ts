import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs';

import { ServiceHelpersService, ContentTypeEnum } from './service-helpers.service';
import { JwtModel } from '../_models/jwt.model'

import 'rxjs/add/operator/map';

@Injectable()
export class AccountService {
    constructor(private serviceHelper: ServiceHelpersService) {
        
    }

    public SignIn(email: string, password: string): Observable<JwtModel> {
        var params = new URLSearchParams();
        params.append("grant_type", "password");
        params.append("username", email);
        params.append("password", password);

        return this.serviceHelper.post<JwtModel>("/token", params, false, ContentTypeEnum.FORM);
    }
}