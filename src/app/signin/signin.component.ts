import { Component } from "@angular/core"

import { NotificationService, Notification, NotificationButton, NotificationResult } from "../_shared/_services/notification.service";
import { AccountService } from "../_shared/_services/account.service";

@Component({
    selector: "signin",
    templateUrl: "./signin.template.html",
    styleUrls: ["./signin.component.css"]
})

export class SigninComponent {
    public title: string = "Sign in";
    public subtitle: string = "Use your personal/corporative e-mail to sign in";

    constructor(private _notificationService: NotificationService, private _accountService: AccountService) {

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
            console.debug(JSON.stringify(result.json()));

            notification.Cancel();


            if (result.Success) {
                this._notificationService.notify(new Notification("Signed in!", [], 1000));
            } else {
                this._notificationService.notify(new Notification("Error to sign in!", [], 1000));
            }
        }, (error) => {
            this._notificationService.notify(new Notification("Error to sign in!", [], 1000));
            notification.Cancel();
        });
    }

    public onForgotPasswordClick(): void {

    }

    public onCreateAccountClick(): void {

    }
}