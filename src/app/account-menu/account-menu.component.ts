import { Component } from "@angular/core"
import { Router } from "@angular/router"
//import { NotificationComponent, Notification } from "./notification.component"

@Component({
    selector: "account-menu",
    templateUrl: "./account-menu.template.html",
    styleUrls: ["./account-menu.component.css"]
})

export class AccountMenuComponent {
    constructor(private router: Router/*, private n: NotificationComponent*/) {
        this.mockUser();
        console.log(this.retrieve());

    }
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