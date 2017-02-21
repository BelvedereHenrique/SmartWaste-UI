import { Component, OnInit } from "@angular/core"
import { Router, ActivatedRoute, Params } from "@angular/router"

import { NotificationService, Notification, NotificationButton, NotificationResult } from "../_shared/_services/notification.service";
import { AccountService } from "../_shared/_services/account.service";
import { JwtService } from "../_shared/_services/jwt.service";
import { SecurityManagerService } from "../_shared/_services/security-manager.service";

@Component({
    selector: "signin",
    templateUrl: "./signin.template.html",
    styleUrls: ["./signin.component.css"],
    providers: [JwtService]
})

export class SigninComponent implements OnInit {
    public title: string = "Sign in";
    public subtitle: string = "Use your personal/corporative e-mail to sign in";

    constructor(private _notificationService: NotificationService, 
                private _accountService: AccountService,
                private _activatedRoute: ActivatedRoute,                
                private _router: Router,
                private _securityManager: SecurityManagerService) {
        
    }

    ngOnInit() {
        if (this._securityManager.isAuthenticated())
            this._router.navigate(['/']);
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
                this._securityManager.checkAuth();
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
            this._securityManager.checkAuth();
        });
    }

    public onForgotPasswordClick(): void {

    }

    public onCreateAccountClick(): void {

    }
}