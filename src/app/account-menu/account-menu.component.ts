import { Component } from "@angular/core"
import { Router } from "@angular/router"

import { NotificationService, Notification, NotificationResult, NotificationButton } from '../_shared/_services/notification.service'
import {SlimLoadingBarService} from 'ng2-slim-loading-bar';
import { AccountEnterpriseService } from "../_shared/_services/account-enterprise.service";
import { SecurityManagerService } from "../_shared/_services/security-manager.service";

@Component({
    selector: "account-menu",
    templateUrl: "./account-menu.template.html",
    styleUrls: ["./account-menu.component.css"]
})


export class AccountMenuComponent {
    public canShowEnterpriseMenu = false;
    public enterprise = null;
    private isLoading = false;

    constructor(private _router: Router, 
                private _accountService: AccountEnterpriseService, 
                private _notificationService: NotificationService, 
                private _slimLoadingBarService: SlimLoadingBarService,
                private _securityManagerService: SecurityManagerService) {
        this.CheckUserEnterprise();

        this._securityManagerService.onAuthChange$.subscribe(securityModel => {
            if(securityModel == null)
                this._router.navigate(["/"]);
        });
    }
    
    public onRequestEnterprisePermissionClick(): void {
        this._router.navigateByUrl("account/enterprise");
    }

    private CheckUserEnterprise():void{
      this._slimLoadingBarService.start();
      this._accountService.getUserEnterprise().subscribe(
      data => {
            if(data.Success == true){
                if(data.Result.ID != null){
                    this.enterprise = data.Result;
                    this.canShowEnterpriseMenu = false;
                }else{
                    this.canShowEnterpriseMenu = true;
                }
            }
        },
        error => {
          console.log(error)
          this._notificationService.notify(new Notification("An Error Ocurred on Server",[],3000));
        },
        () =>  this._slimLoadingBarService.complete()
        );
    }

    private signOut() : void {
        this._securityManagerService.signout();
    }
}