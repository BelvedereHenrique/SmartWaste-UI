/// <reference path="../../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts"/>

import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { MapTypeEnum } from '../_models/map-type.enum'
import { MapService, PushPinBuilder, PushPinType, PushPinMaterialType, ViewChangeResult } from './map.service'
import { PointService, PointSearch, PointCoordinator } from "./point.service"


@Injectable()
export class PointLoaderService  {
    private pointsLayer: Microsoft.Maps.EntityCollection = null;
    private pointsSubscription : Subscription = null;
    private limitZoomToShowPoints : number = 14;

    constructor(private _mapService : MapService,
                private _pointService : PointService){

        this._mapService.onLoad.subscribe(() => {
            this._mapService.onViewChange.subscribe((bounds: ViewChangeResult) => {      
                this.loadPoints(bounds);                      
            });
        });

    }

    private clearPointsLayer() : void{
        if(this.pointsLayer){
            this.pointsLayer.clear();
            this.pointsLayer.dispose();                
        }
    }

    private loadPoints(viewChange: ViewChangeResult) : void{
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
                
            }
        });
    }

    private onPushPinClick(pushpin: Microsoft.Maps.Pushpin) : void{
        console.log("clicked");
    }
}