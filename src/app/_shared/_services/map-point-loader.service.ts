/// <reference path="../../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts"/>

import { Injectable } from '@angular/core';
import { Subscription, Subject, Observable } from 'rxjs';

import { MapTypeEnum } from '../_models/map-type.enum'
import { MapService, PushPinBuilder, PushPinType, PushPinColorEnum, ViewChangeResult } from './map.service'
import { PointService, PointSearch, PointCoordinator } from "./point.service"

import { PointStatusEnum } from "../_models/point-status.enum"
import { PointRouteStatusEnum } from "../_models/point-route-status.enum"
import { PointTypeEnum } from "../_models/point-type.enum"

import { NotificationService, Notification, NotificationResult } from './notification.service';

@Injectable()
export class MapPointLoaderService  {
    private pointsLayer: Microsoft.Maps.EntityCollection = null;
    private pointsSubscription : Subscription = null;
    private limitZoomToShowPoints : number = 14;
    private canLoad: boolean = false;
    private isInitialized : boolean = false;
    private pushpins: PushPinBuilder[] = [];    
    private lastViewChange : ViewChangeResult = null;
    private search: PointSearch = null;

    private defaultClickEnabled : boolean = false;
    private defaultOnClick : Function = null;

    private onPushPinClick : Subject<PushPinBuilder> = new Subject<PushPinBuilder>();
    onPushPinClick$ = this.onPushPinClick.asObservable();

    private onUpdatePushpins: Subject<any> = new Subject();
    onUpdatePushpins$ = this.onUpdatePushpins.asObservable();

    constructor(private _mapService : MapService,
                private _pointService : PointService,
                private _notificationService : NotificationService){
        
    }

    public init(defaultPushpinClick : Function) : void{
        if (this.isInitialized) return;
        
        this._mapService.onLoad.subscribe(() => {
            this.defaultOnClick = defaultPushpinClick;
            this.setDefaultPushpinClickEnabled(true);

            this.start();
            this._mapService.onViewChange.subscribe((bounds: ViewChangeResult) => {      
                this.loadPoints(bounds);                      
            });

            this.isInitialized = true;
        });
    }

    public start() : void {
        this.canLoad = true;
    }

    public stop() : void {
        this.canLoad = false;
    }

    public setDefaultPushpinClickEnabled(enabled: boolean) : void{
        this.defaultClickEnabled = enabled;
    }

    private callDefaultPushpinClick(pushpin: PushPinBuilder) : boolean {
        let canCall : boolean = this.defaultClickEnabled && null != this.defaultOnClick;

        if(canCall)
            this.defaultOnClick(pushpin);
        
        return canCall;
    }

    public updatePushpin(pushpin : PushPinBuilder) : void{
        this.removePushpin(pushpin);
        this.addPushpin(pushpin);
    }

    private getPushpin(ID : string) : PushPinBuilder{
        let result : PushPinBuilder[];
        result = this.pushpins.filter((p : PushPinBuilder) => p.getData().ID == ID);

        if(result.length)
            return result[0];
        else
            return null;
    }

    public reset() : void{
        this.search = null;
        this.pushpins = [];
        this.clearPointsLayer();

        this.reload();
    }

    private clearPointsLayer() : void{
        if(this.pointsLayer){        
            this.pushpins = [];
            this.pointsLayer.clear();                       
        }
    }

    public setFilter(search: PointSearch) : void {
        this.search = search;    

        this.reload();    
    }

    private reload() : void{
        if(this.lastViewChange)
            this.loadPoints(this.lastViewChange);
    }

    private getFilter(viewChange: ViewChangeResult) : PointSearch {
        var northWest: Microsoft.Maps.Location = viewChange.bounds.getNorthwest();     
        var southEast: Microsoft.Maps.Location = viewChange.bounds.getSoutheast();

        var search : PointSearch = new PointSearch();

        if(this.search)
            search = this.search;

        search.Northwest = new PointCoordinator();
        search.Northwest.Latitude = northWest.latitude;
        search.Northwest.Longitude = northWest.longitude;

        search.Southeast = new PointCoordinator();
        search.Southeast.Latitude = southEast.latitude;
        search.Southeast.Longitude = southEast.longitude;

        search.NotIDs = [];
        
        return search;
    }

    public getLoadedPushpins() : PushPinBuilder[] {
        if(!this.pushpins)
            return [];
         
        let copyList : PushPinBuilder [] = [];

        for(let i = 0; i < this.pushpins.length; i++)
            copyList.push(this.pushpins[i]);

         return copyList;
    }

    private removePushpin(pushpin : PushPinBuilder) : void{
        var oldPushpin : PushPinBuilder = this.getPushpin(pushpin.getData().ID);
        
        if(oldPushpin){            
            this.pointsLayer.remove(oldPushpin.build());
            this.pushpins.splice(this.pushpins.indexOf(oldPushpin), 1);
        }
    }

    private addPushpin(pushpin : PushPinBuilder) : void{
        pushpin.setOnClick(this.PushPinClick.bind(this));

        if(this.lastViewChange)
            pushpin.setSizeForZoom(this.lastViewChange.zoom);
        
        this.pushpins.push(pushpin);
        this.pointsLayer.add(pushpin.build()); 
    }

    private loadPoints(viewChange: ViewChangeResult) : void{
        if (!this.canLoad) return;

        this.lastViewChange = viewChange;

        var search : PointSearch = this.getFilter(viewChange);        

        if (this.pointsSubscription)
            this.pointsSubscription.unsubscribe();

        if (viewChange.zoom < this.limitZoomToShowPoints){
            this.clearPointsLayer();                        
            return;
        }

        this.pointsSubscription = this._pointService.GetList(search).subscribe((jsonResult) => {            
            if(jsonResult.Success){                
                this.clearPointsLayer();

                if(!this.pointsLayer)
                    this.pointsLayer = new Microsoft.Maps.EntityCollection();
                
                for(let i = 0; i < jsonResult.Result.length; i++){
                    let pushpinBuilder = new PushPinBuilder(new Microsoft.Maps.Location(jsonResult.Result[i].Latitude, 
                            jsonResult.Result[i].Longitude));
                    
                    pushpinBuilder.setData(jsonResult.Result[i]);
                    this.addPushpin(pushpinBuilder);
                }

                this._mapService.addLayer(this.pointsLayer);
                this.onUpdatePushpins.next();
            }else{
                var notification = new Notification("There was an error to load the map.");
                notification.AddButton("Try again", () => {
                    this.loadPoints(viewChange);
                });
                this._notificationService.notify(notification);
            }
        });
    }

    private PushPinClick(pushpin: PushPinBuilder) : void{
        if(this.callDefaultPushpinClick(pushpin))
            return;

        this.onPushPinClick.next(pushpin);     
    }
} 