import { Component } from "@angular/core"
import { ActivatedRoute, Router, Params } from "@angular/router"
import { Http } from '@angular/http';
import { Subscription } from 'rxjs';

import { NotificationService, Notification, NotificationResult, NotificationButton } from '../_shared/_services/notification.service'
import {SlimLoadingBarService} from 'ng2-slim-loading-bar';
import { AccountEnterpriseService } from '../_shared/_services/account-enterprise.service';
import { SecurityManagerService } from '../_shared/_services/security-manager.service';

@Component({
    selector: "company-request",
    templateUrl: "./company-request.template.html",
    styleUrls: ["./company-request.component.css"]
})

export class CompanyRequestComponent {
  constructor(private http: Http,
    private _service: AccountEnterpriseService,
    private _notificationService: NotificationService,
    private _router: Router,
    private _securityManagerService : SecurityManagerService,
    private slimLoadingBarService: SlimLoadingBarService,
    private activatedRoute: ActivatedRoute) {
    
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      debugger;
      let email = params['email'];
      let token = params['token'];
      if (email != null && email != undefined) {
        this.CompanyRequest.email = email;
      }
      if (token != null && token != undefined) {
        this.CompanyRequest.token = token.toUpperCase();
      }
    });
  }
    
   CompanyRequest={
      email: '',
      password: '',
      token:''
    }
    
  public checkAllProperties(){
    if (this.CompanyRequest.email == '') return false;
    if (this.CompanyRequest.token =='' || this.CompanyRequest.password =='') return false;
    return true;
  }
  public setPermission() {     
    this.slimLoadingBarService.start();
    this._service.setEnterprisePermission(this.CompanyRequest).subscribe(
      data => {
          if(data.Success == true){
            this._router.navigateByUrl("/signin");
            this._securityManagerService.signout();
            this._notificationService.notify(new Notification("You joined in a company. Sign in again..", [], 5000));
          } else {
              for(var i = 0; i< data.Messages.length; i++){
                this._notificationService.notify(new Notification(data.Messages[i].Message));
            }
          }
        },
      error => this._notificationService.notify(new Notification("An Error Ocurred on Server: setPermission",[],3000)),
      () =>this.slimLoadingBarService.complete()
    );
  }
}