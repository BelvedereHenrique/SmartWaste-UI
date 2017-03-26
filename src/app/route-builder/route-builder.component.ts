/// <reference path="../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts"/>

import { Subscription } from 'rxjs';
import { Component, NgZone, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";

import { SlimLoadingBarService } from 'ng2-slim-loading-bar';
import { MapService, PushPinBuilder, PushPinColorEnum, PushPinType } from '../_shared/_services/map.service'
import { MapPointLoaderService } from '../_shared/_services/map-point-loader.service'
import { MapRouteMakerService } from '../_shared/_services/map-route-maker.service'
import { NotificationService, Notification, NotificationResult } from '../_shared/_services/notification.service'
import { PointService, PointSearch } from '../_shared/_services/point.service'
import { PointStatusEnum } from "../_shared/_models/point-status.enum"
import { PointRouteStatusEnum } from "../_shared/_models/point-route-status.enum"
import { PointTypeEnum } from "../_shared/_models/point-type.enum"
import { FloatActionButtonService, FloatActionButton, FloatActionButtonType } from '../_shared/_services/float-action-button.service'
import { RouteService, RouteFilterContract } from '../_shared/_services/route.service';
import { PointDetailedContract } from "../_shared/_models/point-detailed.model";
import { RouteDetailedContract } from '../_shared/_models/route-detailed.model';
import { SecurityManagerService } from '../_shared/_services/security-manager.service';
import { SecurityModel } from '../_shared/_models/security.model';

@Component({
    selector: 'route-builder',
    templateUrl: './route-builder.template.html',
    styleUrls: ['./route-builder.component.css']
})

export class RouteBuilderComponent implements OnInit, OnDestroy {
    @ViewChild("assignedTo") private assignedTo;

    private routeID : string = null;
    private title: string = "";
    private editTitle: string = "Editing route";
    private createTitle: string = "Creating route";
    private subtitle: string = "select points from the map to change the route";

    private assignedToList : any[] = [];
    private getDetailedListSubscription: Subscription = null;
    private route : Microsoft.Maps.Directions.DirectionsManager = null;
    private kilometers: number = 0;    
    private minutes : number = 0;
    private pushpins : PushPinBuilder[] = [];
    private detailedPoints : PointDetailedContract[] = [];
    private detailedPointsCache : PointDetailedContract[] = [];
    
    private onPushpinClickSubscription : Subscription = null;
    private onUpdatePushpinkSubscription : Subscription = null;
    private routeStatsSubscription : Subscription = null;
    private onAuthChangeSubscription : Subscription = null;

    constructor(private _activatedRouter: ActivatedRoute,
                private _router: Router,
                private _mapService : MapService,
                private _routeMakerService : MapRouteMakerService,
                private _pointLoaderService : MapPointLoaderService,
                private _notificationService : NotificationService,
                private _pointService : PointService,
                private _fabService : FloatActionButtonService,
                private _routeService : RouteService,
                private _ngZone: NgZone,
                private _loadingBar : SlimLoadingBarService,
                private _securityManagerService : SecurityManagerService) { 

    }

    ngOnInit() {
        this.reset();

        this.onAuthChangeSubscription = this._securityManagerService.onAuthChange$.subscribe((securityModel : SecurityModel) => {            
            if(!securityModel || !securityModel.CanSaveRoutes){
                this._router.navigate(["/"]);
                return;
            }

            this.createFloatActionButtons();
            this.loadAssigedTo();

            this._activatedRouter.params.subscribe((params) => {
                this.routeID = params["routeID"];         
                this.init(this.routeID);   
            });
        });
    }

    ngOnDestroy(){
        this._pointLoaderService.setDefaultPushpinClickEnabled(true);
        this.reset();
        
        if(this.onAuthChangeSubscription)
            this.onAuthChangeSubscription.unsubscribe();
    }

    private createFloatActionButtons() : void{
        this._fabService.clear();
        
        this._fabService.addButton(new FloatActionButton(
            "done",
            "Save route",
            "createRoute",
            FloatActionButtonType.normal,
            this.onSaveRouteClick.bind(this),
            1,
            false
        ));

        this._fabService.addButton(new FloatActionButton(
            "group_add",
            "Select all points in view",
            "selectAllPoint",
            FloatActionButtonType.mini,
            this.addAllPointsInView.bind(this),
            2,
            false
        ));

        this._fabService.addButton(new FloatActionButton(
            "clear",
            "Remove all points from route",
            "removeAllPoints",
            FloatActionButtonType.mini,
            this.onRemoveAllPointsFromRoute.bind(this),
            3,
            false
        ));

        this._fabService.addButton(new FloatActionButton(
            "delete_forever",
            "Delete route",
            "delete_route",
            FloatActionButtonType.mini,
            this.onDeleteRoute.bind(this),
            4,
            false
        ));
    }

    private isEditing() : boolean{
        return this.routeID && this.routeID.length == 36;
    }

    private updateFloatActionButtonsVisibility() : void {
        this._fabService.setVisible({
            name: "createRoute",
            visible: true
        });

        this._fabService.setVisible({
            name: "selectAllPoint",
            visible: true
        });

        this._fabService.setVisible({
            name: "removeAllPoints",
            visible: true
        });

        this._fabService.setVisible({
            name: "delete_route",
            visible: this.isEditing()
        });
    }

    private reset(){
        this.assignedToList = [];
        this.pushpins = [];
        this.detailedPoints = [];
        this.detailedPointsCache = [];
        this._fabService.clear();
        this._pointLoaderService.reset();
        this.kilometers = 0;
        this.minutes = 0;

        if(this.onPushpinClickSubscription)
            this.onPushpinClickSubscription.unsubscribe();

        if(this.onUpdatePushpinkSubscription)
            this.onUpdatePushpinkSubscription.unsubscribe();
    }

    private init(routeID : string) : void {
        this._mapService.onLoad.subscribe(() => {                  
            this._pointLoaderService.setDefaultPushpinClickEnabled(false);      
            this.onPushpinClickSubscription = this._pointLoaderService.onPushPinClick$.subscribe(this.onPushpinClick.bind(this));
            this.onUpdatePushpinkSubscription = this._pointLoaderService.onUpdatePushpins$.subscribe(this.onUpdatePushpin.bind(this));        
        
            this._ngZone.run(() => {
                if(routeID && routeID.length == 36){
                    this.title = this.editTitle;
                    this.initEditing(routeID);
                }else{
                    this.title = this.createTitle;
                    this.initCreating();
                }        
            });
        });        
    }

    private initEditing(routeID: string) : void {           
        this._pointLoaderService.setDefaultPushpinClickEnabled(false);

        let filter : RouteFilterContract = new RouteFilterContract();
        filter.ID = routeID;

        this._loadingBar.start();

        this._routeService.GetDetailed(filter).subscribe((jsonModel) =>{
            this._loadingBar.complete();
            if(jsonModel.Success){
                this.loadRoute(jsonModel.Result);
            }else{
                this._notificationService.notify(new Notification(jsonModel.Messages));
                this._router.navigate(["routes"]);
            }
        }, (jsonModelError) => {
            this._loadingBar.complete();
            this._notificationService.notify(new Notification("It was not possible to edit the route."));
            this._router.navigate(["routes"]);
        });        
    }

    private loadRoute(route : RouteDetailedContract) : void {
        this._pointLoaderService.setFilter(this.getPointsFilterForRoute(route));

        this.detailedPoints = route.Points;
        
        this.setRouteStats(route.ExpectedKilometers, route.ExpectedMinutes);

        if(route.AssignedTo)
            this.assignedTo.nativeElement.value = route.AssignedTo.ID;

        this._mapService.setView({
            center: new Microsoft.Maps.Location(route.Points[0].Latitude, route.Points[0].Longitude),
            zoom: 16
        });

        let editEvent : Subscription = this._pointLoaderService.onUpdatePushpins$.subscribe(() => {
            for(let i = 0; i < route.Points.length; i++){
                let pushpin : PushPinBuilder = new PushPinBuilder(
                    new Microsoft.Maps.Location(route.Points[i].Latitude, route.Points[i].Longitude));

                pushpin.setData(route.Points[i]);

                this.addPushpin(pushpin);
                editEvent.unsubscribe();
            }

            this.updateFloatActionButtonsVisibility();            
        });
    }

    private updateRouteStats() : void {
        if(this.routeStatsSubscription)
            this.routeStatsSubscription.unsubscribe();

        if(!this.detailedPoints || this.detailedPoints.length <= 1){
            this.resetRouteStats();
            return;
        }

        this.routeStatsSubscription = this._routeMakerService.getDirectionsFromPoints(this.detailedPoints).subscribe((result) => {
            if(result.statusDescription == "OK"){
                if(result.resourceSets.length > 0 && result.resourceSets[0].resources.length > 0){
                    let kilometers : number = result.resourceSets[0].resources[0].travelDistance.toFixed(2);

                    let seconds : number = result.resourceSets[0].resources[0].travelDuration;
                    let totalMinutes : number = seconds / 60;

                    this.setRouteStats(kilometers, totalMinutes);
                }else{
                    this.resetRouteStats();
                }
            }else{
                this.resetRouteStats();
            }
        }, error => {
            this.resetRouteStats();
        });
    }

    private setRouteStats(kilometers: number, totalMinutes: number) : void{
        this._ngZone.run(() => {
            this.kilometers = kilometers;
            this.minutes = totalMinutes;
        });
    }

    private resetRouteStats() : void{
        this._ngZone.run(() => {
            this.kilometers = 0;
            this.minutes = 0;
        });
    }

    private getPointsFilter() : PointSearch{
        var search : PointSearch = new PointSearch();
        search.Status = PointStatusEnum.Full;
        search.PointRouteStatus = PointRouteStatusEnum.Free;

        return search;
    }

    private getPointsFilterForRoute(route: any) : PointSearch {
        var search : PointSearch = this.getPointsFilter();
        
        route.Points.forEach((p) => search.AlwaysIDs.push(p.ID));

        return search;
    }

    private initCreating() : void{        
        this._pointLoaderService.setFilter(this.getPointsFilter());
        this.updateFloatActionButtonsVisibility();
    }

    private isPushpinSelected(pushpin: PushPinBuilder) : boolean{
        return this.pushpins.filter((p: PushPinBuilder) => p.getData().ID == pushpin.getData().ID).length > 0;
    }

    private onPushpinClick(pushpin: PushPinBuilder) : void{
        if(this.isPushpinSelected(pushpin))
            this.removePushpin(pushpin);
        else
            this.addPushpin(pushpin);

        this.updateRouteDetails();
    }

    private addPushpin(pushpin: PushPinBuilder) : void{
        if(this.isPushpinSelected(pushpin))
            return;

        pushpin.setSelected(true);

        this._ngZone.run(() => {
            this.pushpins.push(pushpin);
            this.updatePushpin(pushpin);        
        }); 
    }

    private removePushpin(pushpin: PushPinBuilder) : void{
        if(!this.isPushpinSelected(pushpin))
            return;

        pushpin.setSelected(false);

        var index : number = this.pushpins.indexOf(pushpin);
        this._ngZone.run(() => {
            this.pushpins.splice(index, 1);
            this.updatePushpin(pushpin);
        });
    }

    private onUpdatePushpin() : void{     
        let totalPushpinsToUpdate : number = this.pushpins.length;

        for(let i = 0; i < totalPushpinsToUpdate; i ++)
            this.updatePushpin(this.pushpins[i]);        
    }

    private updatePushpin(pushpin: PushPinBuilder) : void{        
        this._pointLoaderService.updatePushpin(pushpin);
    }

    private updateRouteDetails() : void {
        let search : PointSearch = this.getPointSearchFilter();

        if(search.IDs.length == 0){
            this.detailedPoints = this.getSelectedPointsFromCache();
            this.updateRouteStats();
            return;
        }

        if(this.getDetailedListSubscription)
            this.getDetailedListSubscription.unsubscribe();
        
        this.getDetailedListSubscription = this._pointService.GetDetailedList(search).subscribe((jsonModel) => {
            if(jsonModel.Success){
                this._ngZone.run(() => {
                    this.detailedPoints = this.getSelectedPointsFromCache();
                    this.detailedPoints = this.detailedPoints.concat(jsonModel.Result);
                    this.detailedPointsCache = this.detailedPointsCache.concat(jsonModel.Result);
                });                

                this.updateRouteStats();
            } else {

            }
        });
    }

    private getPointSearchFilter() : PointSearch {
        var search : PointSearch = new PointSearch();
        var IDs: string[] = [];
        IDs = this.getSelectedPushpinsIDs();

        for (let i = 0; i < IDs.length; i++){
            var cache = this.detailedPointsCache.filter((c) => c.ID == IDs[i]);

            if(!cache.length)            
                search.IDs.push(IDs[i]);
        } 

        return search;
    }

    private getSelectedPointsFromCache() : PointDetailedContract[]{
        let IDs : string[] = this.getSelectedPushpinsIDs();
        let cache : PointDetailedContract[] = [];

        for (let i = 0; i < IDs.length; i++){            
            var search = this.detailedPointsCache.filter((c) => c.ID == IDs[i]);

            if(search.length)
                cache.push(search[0]);
        } 

        return cache;
    }

    private getSelectedPushpinsIDs() : string[] {
        let IDs : string[] = [];
        for (let i = 0; i < this.pushpins.length; i++){            
            IDs.push(this.pushpins[i].getData().ID);
        } 

        return IDs;
    }

    private addAllPointsInTheMapView() : void{
        var pushpins : PushPinBuilder[] = this._pointLoaderService.getLoadedPushpins();

        for(let i = 0; i < pushpins.length; i++)
            this.addPushpin(pushpins[i]);
        
        this.updateRouteDetails();        
    }

    private addAllPointsInView() : void{
        var notification : Notification = new Notification("All points in map will be added to the route. Continue?", [], 0);

        notification.AddButton("yes", () => {
            this.addAllPointsInTheMapView();
        });

        notification.AddButton("no", () => {

        });

        this._notificationService.notify(notification);
    }

    private loadAssigedTo() : void{
        this._pointService.GetPeopleFromCompany().subscribe((jsonModel : any) => {
            if(jsonModel.Success){
                this.assignedToList = jsonModel.Result;
            }else{

            }
        });
    }

    private onRoutePointClick(pointDetailed : PointDetailedContract) : void {
        this._mapService.setView({
            center: new Microsoft.Maps.Location(pointDetailed.Latitude, pointDetailed.Longitude)                              
        });
    }

    private removeAllPointsFromRoute() : void{
        let totalPointsSelected : number = this.pushpins.length;

        for(let i = 0; i < totalPointsSelected; i++)
            this.removePushpin(this.pushpins[0]);
        
        this.updateRouteDetails();      
    }

    private onRemoveAllPointsFromRoute() : void{
        var notification : Notification = new Notification("Removing all points from route... Continue?", [], 0);

        notification.AddButton("yes", () => {
            this.removeAllPointsFromRoute();
        });

        notification.AddButton("no", () => {

        });

        this._notificationService.notify(notification);
    }

    private onSaveRouteClick() : void{
        if(!this.detailedPoints.length){
            this._notificationService.notify(new Notification("Select points to save the route."));
            return;
        }

        var notification : Notification = new Notification("Would you like to save the route?", [], 5000);
        notification.AddButton("Yes", () => {            
            this.saveRoute();
        });

        notification.AddButton("No", () => {
            
        });

        this._notificationService.notify(notification);
    }

    private recreateRoute(routeID: string, assignedToID: string, pointIDs : string[], loadingResult : NotificationResult, expectedKilometers: number, expectedMinutes: number) : void{        
        this._routeService.recreate(this.routeID, assignedToID, pointIDs, expectedKilometers, expectedMinutes).subscribe((jsonModel) => {
            loadingResult.Cancel();
            if(jsonModel.Success && jsonModel.Result.Success){                
                this._notificationService.notify(new Notification("Route saved.", [], 5000));
                this._router.navigate(["routes", jsonModel.Result.Result]);
            }else{
                this._notificationService.notify(new Notification(jsonModel.Messages.length ? jsonModel.Messages : jsonModel.Result.Messages));    
            }
        }, (jsonModelError) => {
            loadingResult.Cancel();
            this._notificationService.notify(new Notification("There were errors to create the route. Try again."));
        });
    }

    private saveRoute() : void {
        let pointIDs : string[] = [];
        let assignedToID : string;

        this.pushpins.forEach((pushpin) => pointIDs.push(pushpin.getData().ID));
        assignedToID = this.assignedTo.nativeElement.value;

        var loading : Notification = new Notification("Saving route...", [], 0);
        var loadingResult : NotificationResult = this._notificationService.notify(loading);

        if(this.isEditing())
            this.recreateRoute(this.routeID, assignedToID, pointIDs, loadingResult, this.kilometers, this.minutes);
        else
            this.createRoute(assignedToID, pointIDs, loadingResult, this.kilometers, this.minutes);
    }

    private createRoute(assignedToID: string, pointIDs : string[], loadingResult : NotificationResult, expectedKilometers: number, expectedMinutes: number) : void{
        this._routeService.create(assignedToID, pointIDs, expectedKilometers, expectedMinutes).subscribe((jsonModel) => {
            loadingResult.Cancel();
            if(jsonModel.Success && jsonModel.Result.Success){                
                this._notificationService.notify(new Notification("Route saved.", [], 5000));
                this._router.navigate(["routes", jsonModel.Result.Result]);
            }else{
                this._notificationService.notify(new Notification(jsonModel.Messages.length ? jsonModel.Messages : jsonModel.Result.Messages));    
            }
        }, (jsonModelError) => {
            loadingResult.Cancel();
            this._notificationService.notify(new Notification("There were errors to save the route. Try again."));
        });
    }

    private onDeleteRoute() : void{
        var notification : Notification = new Notification("The route will be deleted. Continue?", [], 5000);

        notification.AddButton("Yes", () => {
            this.deleteRoute(this.routeID);
        });

        notification.AddButton("No", () => {

        });

        this._notificationService.notify(notification);
    }

    private deleteRoute(routeID: string) : void {
        let notification : Notification = new Notification("Deleting route...", [], 0);
        let result = this._notificationService.notify(notification);

        this._routeService.Disable(routeID).subscribe((jsonModel) => {
            result.Cancel();
            if(jsonModel.Success && jsonModel.Result.Success){
                this._notificationService.notify(new Notification("Route deleted."));

                this._router.navigate(["routes"]);
            }else{
                this._notificationService.notify(new Notification(jsonModel.Messages.length ? jsonModel.Messages : jsonModel.Result.Messages));
            }
        }, (jsonModelError) => {
            this._notificationService.notify(new Notification("It was not possible to remove the route. Try again."));
            result.Cancel();
        });
    }

    private getFullAddress(p : PointDetailedContract) : string{
        return PointDetailedContract.getFullAddress(p);
    }

    private getIcon(pointDetailed : PointDetailedContract) : string{
        return PointDetailedContract.getIconClass(pointDetailed);
    }
} 