import { Injectable } from '@angular/core';
import { Observable, Subject, ReplaySubject } from 'rxjs';

import { JwtService } from './jwt.service';
import { JwtModel } from '../_models/jwt.model';
import { SecurityService } from '../_services/security.service';
import { JsonModel } from '../_models/json-model';
import { SecurityModel } from '../_models/security.model';

@Injectable()
export class SecurityManagerService {
    constructor(){

    } 

    private onCheckAuth = new Subject<any>();
    private onAuthChange = new ReplaySubject<SecurityModel>(1);
    private onSignIn = new Subject<JwtModel>();
    private onUpdateUserInformation = new Subject<any>();
    private onSignOut = new Subject<any>();
    private onIsAuthenticated = new Subject<SecurityModel>();

    onCheckAuth$ = this.onCheckAuth.asObservable();
    onAuthChange$ = this.onAuthChange.asObservable();
    onSignIn$ = this.onSignIn.asObservable();
    onUpdateUserInformation$ = this.onUpdateUserInformation.asObservable();
    onSignOut$ = this.onSignOut.asObservable();    
    onIsAuthenticated$ = this.onIsAuthenticated.asObservable();

    public isAuthenticated() : Observable<SecurityModel> {        
        return this.onIsAuthenticated$;
    }

    public UpdateUserInformation() : void{
        this.onUpdateUserInformation.next();
    }
    
    public signout() : void {
        this.onSignOut.next();
    }

    public signin(model : JwtModel) : void{
        this.onSignIn.next(model);
    }

    public authChange(model : SecurityModel) : void{
        this.onAuthChange.next(model);
    }
}