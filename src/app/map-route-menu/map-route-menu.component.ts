import { Component, OnInit } from "@angular/core"
import { Router } from "@angular/router"

import { FloatActionButtonService, FloatActionButton, FloatActionButtonType }  from '../_shared/_services/float-action-button.service'

@Component({
    selector: "map-route-menu",
    templateUrl: "./map-route-menu.template.html",
    styleUrls: ['./map-route-menu.component.css']
})

export class MapRouteMenuComponent implements OnInit{
    title = "TODO: We need to list here the user routes.";

    constructor(private _fabService : FloatActionButtonService,
                private _router : Router){

    }

    ngOnInit(){
        this._fabService.clear();

        this._fabService.addButton(new FloatActionButton("add", 
                                                         "New Route", 
                                                         "add", 
                                                         FloatActionButtonType.normal,
                                                         this.onAddRouteClick.bind(this), 1));
    }

    ngOnDestroy() {
        this._fabService.clear();
    }

    private onAddRouteClick() : void{
        this._router.navigate(["/route/builder"]);
    }
}