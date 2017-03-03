import { Component } from "@angular/core"
import { Router } from "@angular/router"

import { NotificationService, Notification, NotificationResult, NotificationButton } from '../_shared/_services/notification.service'
import {SlimLoadingBarService} from 'ng2-slim-loading-bar';
import { AccountEnterpriseService } from "../_shared/_services/account-enterprise.service";
//import { NotificationComponent, Notification } from "./notification.component"

@Component({
    selector: "account-menu",
    templateUrl: "./account-menu.template.html",
    styleUrls: ["./account-menu.component.css"]
})


export class AccountMenuComponent {
    constructor(private router: Router, private _accountService: AccountEnterpriseService, private _notificationService: NotificationService, private slimLoadingBarService: SlimLoadingBarService ) {
        this.CheckUserEnterprise();
        console.log(this.retrieve());
        //check can make a enterprise

    }
    public canShowEnterpriseMenu = false;
    public enterprise = null;
    private isLoading = false;
    public onRequestEnterprisePermissionClick(): void {
        this.router.navigateByUrl("account/enterprise");
        //this.n.Notify(new Notification("Teste", [], 15000));
    }

    public currentUser: User = new User();
    
    public mockUser(): void {
        this.currentUser.name = "Felipe";
        this.currentUser.userID = 1234;
        localStorage.setItem("currentUser", JSON.stringify({ user: this.currentUser }));
    }
    private CheckUserEnterprise():void{
      this.slimLoadingBarService.start();
      this._accountService.getUserEnterprise().subscribe(
      data => {
            if(data.Success == true){
                debugger
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
        () =>  this.slimLoadingBarService.complete()
        );
    }

    private retrieve() {
        let storedUser: string = localStorage.getItem("currentUser");
        if (!storedUser) throw 'no token found';
        return JSON.parse(storedUser);
    }

}
export class User {
    name: string;
    userID: number;
}