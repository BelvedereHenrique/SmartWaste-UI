/// <reference path="../../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts"/>

import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { MapTypeEnum } from '../_models/map-type.enum'
import { MapService, PushPinBuilder, PushPinType, PushPinMaterialType, ViewChangeResult } from './map.service'
import { MapPointLoaderService } from "./map-point-loader.service"


@Injectable()
export class MapRouteMakerService  {
    private canLoad: boolean = false;
    private route: Microsoft.Maps.Directions.DirectionsManager = null;

    constructor(private _mapService : MapService,
                private _pointService : MapPointLoaderService){
        this._pointService.init();
    }

    public init() : void {
        this._mapService.onLoad.subscribe(() => {
            this._mapService.onCreateRoute$.subscribe(this.onCreateRoute.bind(this));            
        });
    }

    public createRoute() : void {
        if(this.route) return;

        this._mapService.createRoute();
    }

    public clear() : void {
        if(!this.route) return;

        this.route.clearDisplay();
        this.route.clearAll();        
        this.route.dispose();
    }

    private onCreateRoute(route: Microsoft.Maps.Directions.DirectionsManager) : void {
        this.route = route;
        this.route.setRenderOptions({
            autoUpdateMapView: false
        });
    }

    public addWaypoint(waypoint: Microsoft.Maps.Directions.Waypoint) : void{
        if(!this.route) return;

        this.route.addWaypoint(waypoint);
        this.route.calculateDirections();
    }
}