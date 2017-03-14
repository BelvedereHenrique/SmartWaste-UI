import { Component, OnInit, OnDestroy } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"

import { FloatActionButtonService, FloatActionButton, FloatActionButtonType }  from '../_shared/_services/float-action-button.service'
import { RouteService, RouteFilterContract } from '../_shared/_services/route.service';
import { RouteContract } from "../_shared/_models/route.model"

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

    private route : RouteContract = new RouteContract();

    private routeID: string;

    constructor(private _activatedRoute: ActivatedRoute,
                private _router : Router,
                private _routeService : RouteService,
                private _fabService: FloatActionButtonService) {


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

        this._activatedRoute.params.subscribe(params => {
            this.routeID = params["routeID"]
            this.init();
        });
    }

    ngOnDestroy() {
        this._fabService.clear();
    }

    private init() {
        var filter : RouteFilterContract = new RouteFilterContract();
        filter.ID = this.routeID;

        this._routeService.Get(filter).subscribe((jsonModel) => {
            if(jsonModel.Success){
                this.route = jsonModel.Result;
            }else{

            }
        }, (jsonModelError) => {

        });
    }

    private onEditRouteClick() : void {
        if(this.routeID)
            this._router.navigate(["route", "builder", this.routeID]);
    }

    private onNavigateClick() : void{

    }
}