import { Component, OnInit, OnDestroy, NgZone, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from 'rxjs';

import { SlimLoadingBarService } from 'ng2-slim-loading-bar';
import { FloatActionButtonService, FloatActionButton, FloatActionButtonType }  from '../_shared/_services/float-action-button.service';
import { RouteService, RouteFilterContract }  from '../_shared/_services/route.service';
import { RouteDetailedContract } from '../_shared/_models/route-detailed.model';
import { NotificationService, Notification, NotificationButton, NotificationResult } from '../_shared/_services/notification.service';
import { SecurityModel } from '../_shared/_models/security.model';
import { SecurityManagerService } from '../_shared/_services/security-manager.service';
import { MapService } from '../_shared/_services/map.service';
import { MapPointLoaderService } from '../_shared/_services/map-point-loader.service';
import { MapRouteMakerService, Route } from '../_shared/_services/map-route-maker.service';
import { PointSearch } from '../_shared/_services/point.service';
import { PointDetailedContract } from '../_shared/_models/point-detailed.model';
import { PointStatusEnum } from '../_shared/_models/point-status.enum';
import { BottomNavigationService, BottomNavigationMenuSizeEnum } from '../_shared/_services/bottom-navigation.service'
import { SearchBarService } from '../_shared/_services/search-bar.service';

@Component({
    selector: "navigation",
    templateUrl: "./navigation.template.html",
    styleUrls: ['./navigation.component.css']
})

export class NavigationComponent implements OnInit, OnDestroy {
    @ViewChild("answerInput") answerInput : any;

    private routeID : string = null;
    private route : RouteDetailedContract = null;
    private started : boolean = false;

    private userLocation : Microsoft.Maps.Location = null;
    private userWaypoint : Microsoft.Maps.Directions.Waypoint = null;
    private userLocationLayer : Microsoft.Maps.Layer = null;    
    private directionsLayer : Microsoft.Maps.Layer = null;    
    private userLocationPushpin : Microsoft.Maps.Pushpin = null;

    private KILOMETERS_LIMIT_TO_COLLECT_POINT : number = 0.1;
    private KILOMETERS_LIMIT_TO_UPDATE_ROUTE : number = 0.2;

    private collectedPoints : PointDetailedContract[] = [];
    private notCollectedPoints : PointDetailedContract[] = [];
    private waitingPoints : PointDetailedContract[] = [];

    private targetPoint : PointDetailedContract = null;    
    private directions : Route = null;

    private question : Question = null;

    private statsVisible : boolean = false;

    private lockUpdateNavigation : boolean = false;

    private onAuthChangeSubcription : Subscription = null;
    private onPositionChangeSubscription : Subscription = null;

    constructor(private _activatedRoute : ActivatedRoute,
                private _router : Router,
                private _securityManagerService : SecurityManagerService,
                private _routeService : RouteService,
                private _loadingBar : SlimLoadingBarService,
                private _notificationService : NotificationService,
                private _mapService : MapService,
                private _mapPointLoaderService : MapPointLoaderService,
                private _mapRouteMakerService : MapRouteMakerService,
                private _bottomNavigationService : BottomNavigationService,
                private _searchBarService : SearchBarService,
                private _ngZone: NgZone){

    }

    public ngOnInit() : void {
        this.onAuthChangeSubcription = this._securityManagerService.onAuthChange$.subscribe((securityModel : SecurityModel) => {
            if(securityModel == null || !securityModel.CanNavigateRoutes)
                this._router.navigate(["/"]);
            else
                this.init();
        });

        this._bottomNavigationService.setSize(BottomNavigationMenuSizeEnum.Mini);
        this._bottomNavigationService.setBottomNavigationVisible(false);
        this._searchBarService.setVisibility(false);
    }

    public ngOnDestroy() : void {
        if(this.onAuthChangeSubcription)
            this.onAuthChangeSubcription.unsubscribe();
        
        if(this.onPositionChangeSubscription)
            this.onPositionChangeSubscription.unsubscribe();

        this._bottomNavigationService.resetSize();
        this._bottomNavigationService.setBottomNavigationVisible(true);
        this._searchBarService.setVisibility(true);

        this._mapPointLoaderService.reset();

        if(this.directionsLayer){                      
            this.directionsLayer.clear();
            this._mapService.removeLayer(this.directionsLayer);            
        }
            
        if(this.userLocationLayer){
            this.userLocationLayer.clear();   
            this._mapService.removeLayer(this.userLocationLayer);                             
        }

        this._mapService.setWatchPositionEnabled(false);   
    }

    private init() : void{
        this._activatedRoute.params.subscribe((params) => {
            if(!params["routeID"])
                this._router.navigate(["/"]);
            else
                this.loadRoute(params["routeID"]);
        });
    }

    private loadRoute(routeID : string) : void{
        this.routeID = routeID;

        this._loadingBar.start();

        this._routeService.StartNavigation(this.routeID).subscribe((jsonModel) => {
            this._loadingBar.complete();
            if(jsonModel.Success && jsonModel.Result.Success){
                this.startNavigation(jsonModel.Result.Result);
            } else {
                this._notificationService.notify(new Notification(!jsonModel.Success ? jsonModel.Messages : jsonModel.Result.Messages, [], 5000));
                this._router.navigate(["/route-details", this.routeID]);
            }
        }, (jsonErrorModel) => {
            this._loadingBar.complete();
            this._notificationService.notify(new Notification("There were errors to load the route.", [
                new NotificationButton("Try again", () => {
                    this.loadRoute(this.routeID);
                })
            ], 5000));
        });
    }

    private startNavigation(route : RouteDetailedContract) : void {
        this.route = route;
        this.collectedPoints = this.route.RoutePoints.filter(x => x.IsCollected === true).map(x => x.Point);
        this.notCollectedPoints = this.route.RoutePoints.filter(x => x.IsCollected === false).map(x => x.Point);
        this.waitingPoints = this.route.RoutePoints.filter(x => x.IsCollected === null).map(x => x.Point);

        this._mapService.onLoad.subscribe(() => {            
            this.setupPointsOnMap();
            this.onPositionChangeSubscription = this._mapService.onPositionChange.subscribe(this.onPositionChange.bind(this));

            this._mapService.setWatchPositionEnabled(true);   
            this._mapService.setCompass(true);            
        });
    }

    private finishNavigation() : void {
        this.lockUpdateNavigation = true;
        this._notificationService.notify(new Notification("Navigation finished!", [], 5000));
        this._router.navigate(["/route-details", this.routeID]);
    }

    private setupPointsOnMap() : void{
        let pointSearch : PointSearch = new PointSearch();
        pointSearch.IDs = this.route.RoutePoints.map(p => p.Point.ID);

        this._mapPointLoaderService.setFilter(pointSearch);        
    }

    private onPositionChange(location : Microsoft.Maps.Location) : void{ 
        this.updateUserLocation(location);  
        this.updateNavigation(location);      
    }

    private updateNavigationWithLastUserLocation() : void {
        if(this.userLocation)
            this.updateNavigation(this.userLocation);
    }

    private updateNavigation(userLocation : Microsoft.Maps.Location) : void {
        if(this.lockUpdateNavigation)
            return;

        if(this.isNavigationDone()){
            this.finishNavigation();
            return;
        } 
        
        if (this.needsANewTargetPoint()) {        
            this.targetPoint = this.getNextPoint(userLocation);
            this.setDirections(userLocation, this.targetPoint);  

            return;                   
        } 
        
        if(this.isRouteReady()) {
            this._bottomNavigationService.setSize(BottomNavigationMenuSizeEnum.Mini);
            this.checkUserPosition(userLocation);
        }
    }    

    private needsANewTargetPoint() : boolean {
        return this.targetPoint == null;
    }

    private isNavigationDone() : boolean {
        return this.waitingPoints.length == 0;
    }

    private isRouteReady() : boolean {
        return this.directions != null && this.directions.routeLines.length > 0;
    }

    private checkUserPosition(userLocation : Microsoft.Maps.Location) : void{
        if(this.isWaitingUserAnswer())
            return;

        if(this.isUserNearTheDestination(userLocation)){
            console.log("USER IS CLOSE TO DESTIONATION");
            this.setQuestionIfPointWasCollected();            
        } else {
            console.log("USER IS NOT CLOSE TO DESTIONATION");
            this.updateRoute(userLocation);
        }
    }

    private updateRoute(userLocation : Microsoft.Maps.Location) : void{        
        if(this.routeNeedToBeUpdated(userLocation)){
            this.setDirections(userLocation, this.targetPoint);
            console.log("NEED UPDATE");
        }else{
            console.log("NO NEED UPDATE");
        }
    }

    private setQuestionIfPointWasCollected(yesConfirmation : boolean = false) : void{
        this.lockUpdateNavigation = true;

        this._bottomNavigationService.setSize(BottomNavigationMenuSizeEnum.Normal);

        this.setStatsVisible(false);

        this.question = new Question("Was this point collected?");
        this.question.addAnswer("yes", "btn-success", () => {
            if(!yesConfirmation)
                this.setQuestionIfPointWasCollected(true);
            else
                this.setPointAsCollected(this.targetPoint, true, "");
        });
        this.question.addAnswer("no", "btn-danger pull-right", () => {
            this.setQuestionWhyPointWastCollected();
        });
    }    

    private setQuestionWhyPointWastCollected() : void {
        this.setStatsVisible(false);

        this.question = new Question("Add or choose a reason...");
        this.question.setInputVisible(true);
        this.question.addTip("Nobody was home", () => {
            this.question.setInputValue("Nobody was home");
        });
        this.question.addTip("Home isn't accessible", () => {
            this.question.setInputValue("Home isn't accessible");
        });

        this.question.addAnswer("Go back", "btn-success", () => {
            this.setQuestionIfPointWasCollected();
        });
        
        this.question.addAnswer("Confirm", "btn-danger pull-right", () => {
            if(!this.question.getInputValue().trim())
                this.answerInput.nativeElement.focus();
            else
                this.setPointAsCollected(this.targetPoint, false, this.question.getInputValue());
        });           
    }  

    private setPointAsCollected(point : PointDetailedContract, collected: boolean, reason : string) : void{        
        if (!collected && (!reason || !reason.trim()))
            return;

        let notificationLoading : NotificationResult = 
            this._notificationService.notify(new Notification(
                collected ? "Setting point as collected..." : "Setting point as not collected...", 
                [], 5000));

        this._routeService.CollectPoint(this.route.ID, point.ID, collected, reason).subscribe((jsonModel) => {
            notificationLoading.Cancel();

            if(jsonModel.Success && jsonModel.Result.Success) {                
                
                let index : number = this.waitingPoints.findIndex((p) => p.ID == point.ID);
                this.waitingPoints.splice(index, 1);

                if(collected)
                    this.collectedPoints.push(point);
                else
                    this.notCollectedPoints.push(point);
                
                this.lockUpdateNavigation = false;
                this.hideQuestion();
                this.targetPoint = null;
                this.updateNavigationWithLastUserLocation();                
            } else {
                this._notificationService.notify(new Notification(
                    !jsonModel.Success ? jsonModel.Messages : jsonModel.Result.Messages,
                    [], 8000
                ));
            }
        }, (jsonErrorModel) => {
            notificationLoading.Cancel();

            this._notificationService.notify(new Notification(
                    collected ? "It was not possible to set the point as collected.":
                    "It was not possible to set the point as not collected.",
                    [new NotificationButton("Try again", () => {
                        this.setPointAsCollected(point, collected, reason);
                    })], 8000
            ));
        });
    }

    private isWaitingUserAnswer() : boolean {
        return this.question != null;
    }

    private hideQuestion() : void{
        this.question = null;
    }

    private setStatsVisible(visible : boolean) : void {
        this.statsVisible = visible;
    }

    private isUserNearTheDestination(userLocation : Microsoft.Maps.Location) : boolean {
        let kilometers : number = this._mapRouteMakerService.getDistanceFromLatLonInKm(userLocation.latitude, userLocation.longitude, this.targetPoint.Latitude, this.targetPoint.Longitude);

        return kilometers <= this.KILOMETERS_LIMIT_TO_COLLECT_POINT;
    }

    private routeNeedToBeUpdated(userLocation : Microsoft.Maps.Location) : boolean {
        var origin : Microsoft.Maps.Location = this.directions.routeLines[0].getLocations()[0];

        let kilometers : number = this._mapRouteMakerService.getDistanceFromLatLonInKm(
            userLocation.latitude, userLocation.longitude, origin.latitude, origin.longitude);

        return kilometers >= this.KILOMETERS_LIMIT_TO_UPDATE_ROUTE;
    }

    private setDirections(userLocation : Microsoft.Maps.Location, point: PointDetailedContract) : void{
        var userPoint : PointDetailedContract = new PointDetailedContract();
        userPoint.Latitude = userLocation.latitude;
        userPoint.Longitude = userLocation.longitude;

        this._loadingBar.start();

        this.lockUpdateNavigation = true;
        this._mapRouteMakerService.getDirectionsFromPoints([userPoint, this.targetPoint]).subscribe((r) => {
            this._ngZone.run(() => {
                this._loadingBar.complete();

                if(!this.directionsLayer){
                    this.directionsLayer = new Microsoft.Maps.Layer();
                    this._mapService.addLayer(this.directionsLayer);
                }

                this.directionsLayer.clear();

                console.log(r);

                this.directions = this._mapRouteMakerService.translateDirections(r);

                this.setStatsVisible(true);
                console.log(this.directions);

                this.directions.routeLines.forEach((polyline) => {
                    this.directionsLayer.add(polyline);
                });

                this.lockUpdateNavigation = false;

                this.updateNavigationWithLastUserLocation();
            }); 
        });                
    }

    private getNextPoint(userLocation : Microsoft.Maps.Location) : PointDetailedContract{
        var userPoint : PointDetailedContract = new PointDetailedContract();
        userPoint.Latitude =  userLocation.latitude;
        userPoint.Longitude = userLocation.longitude;

        return this._mapRouteMakerService.getNearestPoint(userPoint, this.waitingPoints);
    }

    private getBestPointAddress() : string{        
        if(!this.targetPoint)
            return "";
        else
            return PointDetailedContract.getFullAddress(this.targetPoint);
    }

    private updateUserLocationToTheRoute(userLocation : Microsoft.Maps.Location) : void {
        if(this.userWaypoint == null){
            this.userWaypoint = new Microsoft.Maps.Directions.Waypoint({
                location: userLocation
            });
        }else{
            this.userWaypoint.setOptions({
                location: userLocation
            });
        }

        this._mapRouteMakerService.addWaypoint(this.userWaypoint);        
    }

    private updateUserLocation(location : Microsoft.Maps.Location) : void{
        this.userLocation = location;

        if(!this.userLocationLayer){            
            this.userLocationLayer = new Microsoft.Maps.Layer();
            this._mapService.addLayer(this.userLocationLayer);                
        }
        
        if(!this.userLocationPushpin){
            this.userLocationPushpin = new Microsoft.Maps.Pushpin(location, {            
                icon: "<svg xmlns='http://www.w3.org/2000/svg' fill='#ff9800' height='24' viewBox='0 0 24 24' width='24'>    <path d='M0 0h24v24H0z' fill='none'/>    <path d='M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z'/></svg>"
            });

            this.userLocationLayer.clear();
            this.userLocationLayer.add(this.userLocationPushpin);
            this._mapService.setView({
                center: location,
                zoom: 17
            });
        }else{
            this.userLocationLayer.clear();
            this.userLocationPushpin.setLocation(location);
            this.userLocationLayer.add(this.userLocationPushpin);
        }

        this._mapService.setView({
            center: location
        });
    }
}

class Question {
    private title : string;
    private answers : QuestionAnswer[];
    private showInput : boolean;
    private inputValue : string;
    private tips : QuestionTip[];

    constructor(title: string){
        this.title = title;
        this.answers = [];
        this.tips = [];
        this.inputValue = "";
    }

    public setInputValue(value : string) : void {
        this.inputValue = value;
    }

    public getInputValue() : string {
        return this.inputValue;
    }

    public addAnswer(title : string, classes: string, click : Function) : void {
        this.answers.push(new QuestionAnswer(title, classes, click));
    }

    public addTip(title : string, click : Function) : void {
        this.tips.push(new QuestionTip(title, click));
    }

    public setInputVisible(visible : boolean) : void{
        this.showInput = visible;
    }
}

class QuestionAnswer {
    constructor(title : string, classes : string, click: Function){
        this.title = title;
        this.classes = classes;
        this.click = click;
    }

    private title : string;
    private classes : string;
    private click : Function;
}

class QuestionTip {
    constructor(title : string, click: Function){
        this.title = title;
        this.click = click;
    }

    private title : string;
    private click : Function;
}