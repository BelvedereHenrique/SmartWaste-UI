import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { JwtService } from './jwt.service';
import { JwtModel } from '../_models/jwt.model' 

@Injectable()
export class SecurityManagerService {
    private onAuthChange = new Subject<boolean>();
    
    onAuthChange$ = this.onAuthChange.asObservable();

    constructor(private _jwtService: JwtService){

    }

    public signin(token: JwtModel) : void{
        this._jwtService.save(token);
        this.checkAuth();
    }

    public signout() : void{
        this._jwtService.delete();
        this.checkAuth();
    }

    public isAuthenticated() : boolean {
        return !!this._jwtService.get();
    }

    public checkAuth() : void {
        this.setupSecurity(this.isAuthenticated());
    }

    public setupSecurity(isAuthenticated: boolean) : void{
        this.onAuthChange.next(isAuthenticated);
    }
}