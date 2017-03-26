import { Component, OnInit, OnDestroy } from "@angular/core"
import { Router, ActivatedRoute, Params } from "@angular/router"
import { Subscription } from 'rxjs';

import { NotificationService, Notification, NotificationButton, NotificationResult } from "../_shared/_services/notification.service";
import { AccountService } from "../_shared/_services/account.service";
import { JwtService } from "../_shared/_services/jwt.service";
import { SecurityManagerService } from "../_shared/_services/security-manager.service";
import { SecurityModel } from '../_shared/_models/security.model'

@Component({
    selector: "signin",
    templateUrl: "./signin.template.html",
    styleUrls: ["./signin.component.css"],
    providers: [JwtService]
})

export class SigninComponent implements OnInit, OnDestroy {
    public title: string = "Sign in";
    public subtitle: string = "use your personal/enterprise account to sign in";

    private onAuthChangeSubscription : Subscription = null;

    constructor(private _notificationService: NotificationService, 
                private _accountService: AccountService,
                private _activatedRoute: ActivatedRoute,                
                private _router: Router,
                private _securityManager: SecurityManagerService) {
        
    }

    ngOnInit() {
        this.onAuthChangeSubscription = this._securityManager.onAuthChange$.subscribe((model : SecurityModel) => {
            if(model != null)
                this._router.navigate(['/']);
        });
    }

    ngOnDestroy() {
        if(this.onAuthChangeSubscription)
            this.onAuthChangeSubscription.unsubscribe();
    }

    public onSignInClick(email: string, password: string): void {
        if (!/([\w]{1,}[@]{1}[\w]{1,}[.]{1}[\w]{1,})/g.test(email)) {
            this._notificationService.notify(new Notification("Your e-mail is not valid.", [], 5000));
            return;
        }

        var notification: NotificationResult = this._notificationService.notify(
            new Notification("Signing in...", [], 0)
        );
        
        this._accountService.SignIn(email, password).subscribe((result) => {
            notification.Cancel();

            if (result.access_token) {
                this._securityManager.signin(result);                

                this._notificationService.notify(new Notification("Signed in!", [], 3000));

                this._router.navigate(["/"],);
            } else {
                this._notificationService.notify(new Notification("Error to sign in!", [], 1000));
            }
        }, (error) => {
            notification.Cancel();

            let message: string;
            
            if(error.error_description)
                message = error.error_description;
            else
                message = "Something went wrong... Please, try again.";

            this._notificationService.notify(new Notification(message, [], 5000));                        
        });
    }

    public onForgotPasswordClick(): void {
      this._router.navigateByUrl("password")
    }

    public onCreateAccountClick(): void {
        this._router.navigateByUrl("account/personal");
    }
}