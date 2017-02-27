/// <reference path="../../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts"/>

import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { MapTypeEnum } from '../_models/map-type.enum'
import { MapService, PushPinBuilder, PushPinType, PushPinMaterialType, ViewChangeResult } from './map.service'
import { PointService, PointSearch, PointCoordinator } from "./point.service"

import { NotificationService, Notification, NotificationResult } from './notification.service';

@Injectable()
export class MapPointLoaderService  {
    private pointsLayer: Microsoft.Maps.EntityCollection = null;
    private pointsSubscription : Subscription = null;
    private limitZoomToShowPoints : number = 14;
    private canLoad: boolean = false;
    private isInitialized : boolean = false;

    constructor(private _mapService : MapService,
                private _pointService : PointService,
                private _notificationService : NotificationService){

    }

    public init() : void{
        if (this.isInitialized) return;
        
        this._mapService.onLoad.subscribe(() => {                        
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

    private clearPointsLayer() : void{
        if(this.pointsLayer){
            this.pointsLayer.clear();
            this.pointsLayer.dispose();                
        }
    }

    private loadPoints(viewChange: ViewChangeResult) : void{
        if (!this.canLoad) return;

        var northWest: Microsoft.Maps.Location = viewChange.bounds.getNorthwest();     
        var southEast: Microsoft.Maps.Location = viewChange.bounds.getSoutheast();

        var search : PointSearch = new PointSearch();
        search.northWest = new PointCoordinator();
        search.northWest.latitude = northWest.latitude;
        search.northWest.longitude = northWest.longitude;

        search.southEast = new PointCoordinator();
        search.southEast.latitude = southEast.latitude;
        search.southEast.longitude = southEast.longitude;

        if (this.pointsSubscription)
            this.pointsSubscription.unsubscribe();

        if (viewChange.zoom < this.limitZoomToShowPoints){
            this.clearPointsLayer();            
            return;
        }

        this.pointsSubscription = this._pointService.GetList(search).subscribe((jsonResult) => {
            if(jsonResult.Success){
                this.clearPointsLayer();

                this.pointsLayer = new Microsoft.Maps.EntityCollection();
                this._mapService.removeLayer(this.pointsLayer);

                for(let i = 0; i < jsonResult.Result.length; i++){
                    let pushpinBuilder = new PushPinBuilder(new Microsoft.Maps.Location(jsonResult.Result[i].Latitude, jsonResult.Result[i].Longitude), PushPinType.CollectPoint, PushPinMaterialType.Plastic);
                    pushpinBuilder.setOnClick(this.onPushPinClick.bind(this));
                    pushpinBuilder.setSizeForZoom(viewChange.zoom);

                    this.pointsLayer.add(pushpinBuilder.build());                    
                }

                this._mapService.addLayer(this.pointsLayer);
            }else{
                var notification = new Notification("There was an error to load the map.");
                notification.AddButton("Try again", () => {
                    this.loadPoints(viewChange);
                });
                this._notificationService.notify(notification);
            }
        });
    }

    private onPushPinClick(pushpin: Microsoft.Maps.Pushpin) : void{
        console.log("clicked");        
    }
}