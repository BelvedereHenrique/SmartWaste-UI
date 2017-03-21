import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { ServiceHelpersService } from '../_services/service-helpers.service';
import { JsonModel } from '../_models/json-model';
import { SecurityModel } from '../_models/security.model';
import { JwtService } from './jwt.service';
import { JwtModel } from '../_models/jwt.model';
import { SecurityManagerService } from '../_services/security-manager.service';

@Injectable()
export class SecurityService { 
    constructor(private _serviceHelpers : ServiceHelpersService,
                private _jwtService: JwtService,
                private _securityManagerService : SecurityManagerService){
        this._securityManagerService.onSignIn$.subscribe(this.signin.bind(this));
        this._securityManagerService.onSignOut$.subscribe(this.signout.bind(this));
        this._securityManagerService.onUpdateUserInformation$.subscribe(this.updateUserInformation.bind(this));
        this._securityManagerService.onCheckAuth$.subscribe(this.checkAuth.bind(this));        
    }

    private SECURITY_MODEL_KEY = "security_model";

    public getUserInfo() : Observable<JsonModel<SecurityModel>> {
        return this._serviceHelpers.get<JsonModel<SecurityModel>>("/Security/GetUserInfo", null);
    }

    public signin(token: JwtModel) : void{
        this._jwtService.save(token);
        this.updateUserInformation();        
    }

    public updateUserInformation() : void {
        this.getUserInfo().subscribe(jsonModel => {
            if(jsonModel.Success){
                this.saveSecurityModel(jsonModel.Result);                
            }

            this.checkAuth();
        }, (jsonError) => 
        {
            this.checkAuth();
        });
    }

    private saveSecurityModel(model : SecurityModel) : void {
        localStorage[this.SECURITY_MODEL_KEY] = JSON.stringify(model);
    }

    private getSecurityModel() : SecurityModel{
        let json : string = localStorage.getItem(this.SECURITY_MODEL_KEY);

        if(json)
            return JSON.parse(json);
        else
            return null;
    }

    private clearSecurityModel() : void{
        localStorage.removeItem(this.SECURITY_MODEL_KEY);
    }

    public signout() : void{
        this._jwtService.delete();
        this.clearSecurityModel();
        this.checkAuth();        
    }

    public checkAuth() : void {        
        this._securityManagerService.authChange(this.getSecurityModel());
    }
}