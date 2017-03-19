import { Component, OnDestroy, OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { Http } from '@angular/http';
import { Subscription } from 'rxjs';

import { NotificationService, Notification, NotificationResult, NotificationButton } from '../_shared/_services/notification.service'
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';
import { PasswordService } from '../_shared/_services/password.service';

@Component({
    selector: "password",
    templateUrl: "./password.template.html",
    styleUrls: ["./password.component.css"]
})

export class PasswordComponent {
  constructor( private http: Http,
              private _notificationService: NotificationService,
              private _router: Router,
              private slimLoadingBarService: SlimLoadingBarService,
              private passwordService: PasswordService)
  {
    this.canShowSendTokenButton = false;
    this.canShowFirstForm = true;
  }
  canShowSendTokenButton: boolean;
  canShowFirstForm: boolean;

  Password={
    Email: '',
    Password: '',
    PasswordConfirmation: '',
    Token: ''
  }

  public checkUserToken() {
    this.slimLoadingBarService.start();
    if (this.Password.Email == '') {
      this.slimLoadingBarService.stop();
      return;
    }
    this.passwordService.checkUserToken(this.Password.Email).subscribe(
      data => {
        if (data.Success == true) {
          this.slimLoadingBarService.complete();
          this.canShowSendTokenButton = !data.Result;
          if (!this.canShowSendTokenButton) this.canShowFirstForm = false;
        } else {
          for (var i = 0; i < data.Messages.length; i++) {
            this._notificationService.notify(new Notification(data.Messages[i].Message));
          }
        }
      },
      error => this._notificationService.notify(new Notification("An Error Ocurred on Server: Get States", [], 3000)),
      () => this.slimLoadingBarService.complete()
    );
  }

  public sendToken() {
    this.slimLoadingBarService.start();
    if (!this.validateEmail()) {
      this.slimLoadingBarService.stop();
      return;
    }
    this.passwordService.sendToken(this.Password.Email).subscribe(
      data => {
        if (data.Success == true) {
          this.slimLoadingBarService.complete();
          this._notificationService.notify(new Notification("Success. You'll receive an email with the next instructions.",[],5000));
          this._router.navigateByUrl("/signin");
        
        } else {
          for (var i = 0; i < data.Messages.length; i++) {
            this._notificationService.notify(new Notification(data.Messages[i].Message));
          }
        }
      },
      error => this._notificationService.notify(new Notification("An Error Ocurred on Server: Get States", [], 3000)),
      () => this.slimLoadingBarService.complete()
    );
  }

 
  public changeEmail() {
    this.canShowFirstForm = true;
  }
  
  public toUpercase() {
    this.Password.Token = this.Password.Token.toUpperCase();
  }
  

  public checkPassword() {
    if (this.Password.Password != this.Password.PasswordConfirmation) return false;
    return true;
  }
  public checkPasswordLength(password) {
    debugger;
    if (password == null) return;
    if (password.length <= 7) return false;
    else return true;
  }
  public validateEmail() {
    var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var emailRegexResult = regex.test(this.Password.Email);
    if (emailRegexResult)
      return true;
    else
      return false;
  }

  public checkAllProperties() {
    if (!this.checkPassword()) return false;
    if (!this.checkPasswordLength(this.Password.Password)) return false;
    if (!this.validateEmail()) return false;
    if (this.Password.Email == '') return false;
    if (this.Password.Password == '' || this.Password.PasswordConfirmation =='') return false;
    if (this.Password.Token == '') return false;
    return true;
  } 

  public onChangePasswordClick() {
    this.slimLoadingBarService.start();
    if (!this.checkAllProperties()) {
      this.slimLoadingBarService.stop();
      this._notificationService.notify(new Notification("There are incorrect datas"));
      return;
    }
    this.passwordService.changePassword(this.Password).subscribe(
      data => {
        if (data.Success == true) {
          this.slimLoadingBarService.complete();
          this._notificationService.notify(new Notification("Success. Your password was changed. Try to log-in now",[],5000));
          this._router.navigateByUrl("/signin");
        } else {
          for (var i = 0; i < data.Messages.length; i++) {
            this._notificationService.notify(new Notification(data.Messages[i].Message));
          }
        }
      },
      error => this._notificationService.notify(new Notification("An Error Ocurred on Server: Get States", [], 3000)),
      () => this.slimLoadingBarService.complete()
    );
  }
}