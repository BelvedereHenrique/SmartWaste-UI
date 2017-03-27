import { Component, OnInit, OnDestroy } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { Subscription } from 'rxjs';

import { SlimLoadingBarService } from 'ng2-slim-loading-bar';
import { FloatActionButtonService, FloatActionButton, FloatActionButtonType }  from '../_shared/_services/float-action-button.service'
import { RouteService, RouteFilterContract } from '../_shared/_services/route.service';
import { RouteDetailedContract } from "../_shared/_models/route-detailed.model"
import { MapService, PushPinBuilder, PushPinColorEnum, PushPinType } from '../_shared/_services/map.service'
import { MapPointLoaderService } from '../_shared/_services/map-point-loader.service'
import { SecurityManagerService } from '../_shared/_services/security-manager.service'
import { SecurityModel } from '../_shared/_models/security.model'
import { RoutePointContract } from '../_shared/_models/route-point.model';
import { RouteStatusEnum } from '../_shared/_models/route-status.enum';

@Component({
    selector: "map-route-details",
    templateUrl: "./map-route-details.template.html",
    styleUrls: ["./map-route-details.component.css"]
})

export class MapRouteDetailsComponent implements OnInit, OnDestroy {    
    private onUpdatePushpinsSubscription : Subscription = null;
    private onAuthChangeSubscription : Subscription = null;

    private route : RouteDetailedContract = new RouteDetailedContract();    
    private routeID: string;

    private securityModel : SecurityModel = null;

    constructor(private _activatedRoute: ActivatedRoute,
                private _router : Router,
                private _routeService : RouteService,
                private _fabService: FloatActionButtonService,
                private _loadingBar: SlimLoadingBarService,
                private _mapService : MapService,
                private _mapPointLoaderService : MapPointLoaderService,
                private _securityManagerService : SecurityManagerService) {
   
    }

    ngOnInit(){
        this._fabService.clear();        

        this._fabService.addButton(new FloatActionButton("create", 
                                                         "Edit Route", 
                                                         "edit", 
                                                         FloatActionButtonType.mini,
                                                         this.onEditRouteClick.bind(this), 2, false));

        this._fabService.addButton(new FloatActionButton("navigation", 
                                                         "Navigate", 
                                                         "navigate", 
                                                         FloatActionButtonType.normal,
                                                         this.onNavigateClick.bind(this), 1, false));

        this.onAuthChangeSubscription = this._securityManagerService.onAuthChange$.subscribe(this.init.bind(this));        
    }

    private init(model : SecurityModel) : void {
        this.securityModel = model;

        if(!model || !model.ShowRoutesMenu)
        {
            this._router.navigate(["/"]);
            return;
        }

        this._activatedRoute.params.subscribe(params => {
            this.routeID = params["routeID"]
            this.loadRoute();
        });

        this._mapService.onLoad.subscribe(() => {
            this._mapPointLoaderService.reset();
            this.onUpdatePushpinsSubscription = this._mapPointLoaderService.onUpdatePushpins$.subscribe(this.onUpdatePushpin.bind(this));            
        });
    }

    private checkFabSecurity(securityModel : SecurityModel, route: RouteDetailedContract) : void{
        this._fabService.setVisible({
            name: "edit",
            visible: securityModel.CanSaveRoutes && route.Status == RouteStatusEnum.Opened
        });

        this._fabService.setVisible({
            name: "navigate",
            visible: securityModel.CanNavigateRoutes && route.Status == RouteStatusEnum.Opened
        });
    }

    private onUpdatePushpin() : void {
        if(this.route){
            var pushpins : PushPinBuilder[] = this._mapPointLoaderService.getLoadedPushpins();

            this.route.RoutePoints.forEach((routePoint : RoutePointContract) => {
                var pushpin : PushPinBuilder = pushpins.find((builder) => builder.getData().ID == routePoint.Point.ID);

                if(pushpin){
                    pushpin.setSelected(true);
                    //pushpin.setMaterialType(PushPinColorEnum.Green);
                    this._mapPointLoaderService.updatePushpin(pushpin);
                }
            });
        }
    }

    private setRouteViewOnMap() : void{
        this._mapService.onLoad.subscribe(() => {
            if(this.route && this.route.RoutePoints.length){            
                this._mapService.setView({
                    center: new Microsoft.Maps.Location(this.route.RoutePoints[0].Point.Latitude, this.route.RoutePoints[0].Point.Longitude),
                    zoom: 15
                });
            }
        });
    }

    private unsubscribe() : void{
        if(this.onUpdatePushpinsSubscription)
            this.onUpdatePushpinsSubscription.unsubscribe();                    

        if(this.onAuthChangeSubscription)
            this.onAuthChangeSubscription.unsubscribe();
    }

    ngOnDestroy() {
        this.unsubscribe();
        this._mapPointLoaderService.reset();        
        this._fabService.clear();
        this.route = null;
    }

    private loadRoute() {
        this._loadingBar.start();        

        var filter : RouteFilterContract = new RouteFilterContract();
        filter.ID = this.routeID;

        this._routeService.GetDetailed(filter).subscribe((jsonModel) => {
            this._loadingBar.complete();
            if(jsonModel.Success){
                this.route = jsonModel.Result;
                this.setRouteViewOnMap();
                this.checkFabSecurity(this.securityModel, this.route);
            }else{

            }
        }, (jsonModelError) => {
            this._loadingBar.complete();
        });
    }

    private getStatusName() : string{
        if(!this.route.ID)
            return "";

        return RouteDetailedContract.getStatusName(this.route).toLocaleLowerCase();
    }

    private getAssignedTo() : string{
        if(!this.route.ID)
            return "";

        if(this.route.AssignedTo)
            return "Assigned to " + this.route.AssignedTo.Name;
        else
            return "Assigned to nobody";
    }

    private onEditRouteClick() : void {
        if(this.routeID)
            this._router.navigate(["route", "builder", this.routeID]);
    }

    private onNavigateClick() : void{
        this._router.navigate(["navigation", this.routeID]);
    }
}