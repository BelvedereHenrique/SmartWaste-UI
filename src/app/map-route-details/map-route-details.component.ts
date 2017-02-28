import { Component, OnInit, OnDestroy } from "@angular/core"
import { ActivatedRoute } from "@angular/router"

import { FloatActionButtonService, FloatActionButton, FloatActionButtonType }  from '../_shared/_services/float-action-button.service'

@Component({
    selector: "map-route-details",
    templateUrl: "./map-route-details.template.html",
    styleUrls: ["./map-route-details.component.css"]
})

export class MapRouteDetailsComponent implements OnInit, OnDestroy {
    public title: String;
    public subtitle: String;
    public author: String;
    public createdOn: Date;

    private routeID: String;

    constructor(private _route: ActivatedRoute,
                private _fabService: FloatActionButtonService) {
        _route.params.subscribe(params => {
            this.routeID = params["routeID"]
        });

        this.title = "Rota 1";
        this.author = "Juca Pirama";
        this.createdOn = new Date();        
    }

    ngOnInit(){
        this._fabService.clear();
        this._fabService.addButton(new FloatActionButton("history", 
                                                         "History", 
                                                         "history", 
                                                         FloatActionButtonType.mini,
                                                         this.onEditRouteClick.bind(this), 3));

        this._fabService.addButton(new FloatActionButton("create", 
                                                         "Edit Route", 
                                                         "edit", 
                                                         FloatActionButtonType.mini,
                                                         this.onEditRouteClick.bind(this), 2));

        this._fabService.addButton(new FloatActionButton("navigation", 
                                                         "Navigate", 
                                                         "navigate", 
                                                         FloatActionButtonType.normal,
                                                         this.onNavigateClick.bind(this), 1));
    }

    ngOnDestroy() {
        this._fabService.clear();
    }

    private onEditRouteClick() : void {

    }

    private onNavigateClick() : void{

    }
}