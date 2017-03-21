import { Component, Input } from "@angular/core"
import { Router } from "@angular/router"
//import { NotificationComponent, Notification } from "./notification.component"

import { RouteDetailedContract } from '../_shared/_models/route-detailed.model'

@Component({
    selector: "map-route-item",
    templateUrl: "./map-route-item.template.html",
    styleUrls: ["./map-route-item.component.css"]
})

export class MapRouteItemComponent {
    constructor(private router: Router/*, private n: NotificationComponent*/) { }

    @Input("route") private route : RouteDetailedContract;

    public onItemClick(route : RouteDetailedContract): void {
        this.router.navigate(["routes", route.ID]);
    }

    private getAssignedTo() : string {
        if(this.route.AssignedTo)
            return "Assigned to " + this.route.AssignedTo.Name;
        else
            return "Assigned to nobody";
    }
}