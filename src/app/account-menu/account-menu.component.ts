import { Component, OnDestroy, OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { Subscription } from 'rxjs';

import { NotificationService, Notification, NotificationResult, NotificationButton } from '../_shared/_services/notification.service'
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';
import { AccountEnterpriseService } from "../_shared/_services/account-enterprise.service";
import { SecurityManagerService } from "../_shared/_services/security-manager.service";

@Component({
  selector: "account-menu",
  templateUrl: "./account-menu.template.html",
  styleUrls: ["./account-menu.component.css"]
})

export class AccountMenuComponent implements OnDestroy, OnInit {

  private onAuthChangeSubscription : Subscription = null;

  constructor(private router: Router, private _accountService: AccountEnterpriseService, private _notificationService: NotificationService, private slimLoadingBarService: SlimLoadingBarService, private _securityManagerService: SecurityManagerService) {    
    //check can make a enterprise
    this.CheckUserEnterprise();    
  }

  public canShowEnterpriseMenu = false;
  public enterprise = null;
  private isLoading = false;
  public fillform = true;
  public resend = false;
  public onRequestEnterprisePermissionClick(): void {
    this.router.navigateByUrl("account/enterprise");
    //this.n.Notify(new Notification("Teste", [], 15000));
  }

  public Employee = {
    Email: '',
    check: true
  }

  public ngOnInit() : void{
    this.onAuthChangeSubscription = this._securityManagerService.onAuthChange$.subscribe(securityModel => {
            if(securityModel == null)
                this.router.navigate(["/"]);              
    });
  }

  public ngOnDestroy() : void {
    if(this.onAuthChangeSubscription)
      this.onAuthChangeSubscription.unsubscribe();
  }  
  
  private signOut() : void {
      this._securityManagerService.signout();
  }
  private CheckUserEnterprise(): void {
    this.slimLoadingBarService.start();
    this._accountService.getUserEnterprise().subscribe(
      data => {
        if (data.Success == true) {
          if (data.Result.ID != null) {
            this.enterprise = data.Result;
            this.canShowEnterpriseMenu = false;
          } else {
            this.canShowEnterpriseMenu = true;
          }
        }
      },
      error => {
        console.log(error)
        this._notificationService.notify(new Notification("An Error Ocurred on Server", [], 3000));
      },
      () => this.slimLoadingBarService.complete()
    );
  }

  public goToEmployeeRequest() {
    this.fillform = false;
  }
  public validateEmail() {
    var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var emailRegexResult = regex.test(this.Employee.Email);
    if (emailRegexResult)
      return true;
    else
      return false;
  }
  public checkAllProperties() {
    if (this.Employee.Email == '' || !this.validateEmail()) return false;
    return true;
  }
  public sendEmployeeToken() {
    this.slimLoadingBarService.start();
    this.Employee.check = true;
    debugger;
    this._accountService.sendEmployeeToken(this.Employee).subscribe(
      data => {
        if (data.Success == true) {
          this.fillform = true;
          this.Employee.Email = ''
          this.resend = false;
        } else {
          for (var i = 0; i < data.Messages.length; i++) {
            this._notificationService.notify(new Notification(data.Messages[i].Message));
            if (data.Messages[i].Message.indexOf('pending request') >= 0) {
              this.resend = true;
            } else {
              this.resend = false;
            }
          }
        }
      },
      error => {
        console.log(error)
        this._notificationService.notify(new Notification("An Error Ocurred on Server", [], 3000));
      },
      () => this.slimLoadingBarService.complete()
    );
  }

    public resendEmployeeToken() {
      this.slimLoadingBarService.start();
      this.Employee.check = false;
      debugger;
      this._accountService.sendEmployeeToken(this.Employee).subscribe(
      data => {
            if(data.Success == true){
              this.fillform = true;
              this.Employee.Email = '';
              this.resend = false;
            } else{
              for(var i = 0; i< data.Messages.length; i++){
                  this._notificationService.notify(new Notification(data.Messages[i].Message));
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
}