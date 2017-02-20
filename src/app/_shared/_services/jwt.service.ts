import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { JwtModel } from '../_models/jwt.model'

@Injectable()
export class JwtService{
    private LOCAL_STORAGE_TOKEN_KEY : string = "jwt";

    public save(token : JwtModel) : void {
        localStorage[this.LOCAL_STORAGE_TOKEN_KEY] = JSON.stringify(token);
    }

    public delete() : void {
        localStorage.removeItem(this.LOCAL_STORAGE_TOKEN_KEY);
    }

    public get() : JwtModel {
        var jwt = localStorage[this.LOCAL_STORAGE_TOKEN_KEY];

        if (!jwt)
            return null;

        return JSON.parse(jwt);
    }
}