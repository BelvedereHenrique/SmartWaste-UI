import { Component } from "@angular/core"
import { Router } from "@angular/router"
//import { NotificationComponent, Notification } from "./notification.component"

@Component({
    selector: "map-route-item",
    templateUrl: "./map-route-item.template.html",
    styleUrls: ["./map-route-item.component.css"]
})

export class MapRouteItemComponent {
    constructor(private router: Router/*, private n: NotificationComponent*/) { }

    public title: String = "Rota 1";
    public author: String = "Juca Pirama";
    public createdOn: Date = new Date();
    private routeID: String = "654";
    
    public onItemClick(): void {
        this.router.navigate(["routes", this.routeID]);
        //this.n.Notify(new Notification("Teste", [], 15000));
    }
}