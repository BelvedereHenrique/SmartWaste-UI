/// <reference path="../../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts"/>

import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { MapTypeEnum } from '../_models/map-type.enum'
import { MapService, PushPinBuilder, PushPinType, PushPinMaterialType, ViewChangeResult } from './map.service'
import { MapPointLoaderService } from "./map-point-loader.service"
import { RouteContract } from "../_models/route.model"
import { PointDetailedContract } from "../_models/point-detailed.model"
import { Response, Http, URLSearchParams, RequestOptions, Headers, RequestMethod, Jsonp} from "@angular/http";
import { Observable } from 'rxjs';

@Injectable()
export class MapRouteMakerService  {
    private canLoad: boolean = false;
    private route: Microsoft.Maps.Directions.DirectionsManager = null;

    constructor(private _mapService : MapService,
                private _pointService : MapPointLoaderService,
                private _jsonp: Jsonp){
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

    public getDirectionsFromRoute(route : RouteContract) : Observable<any>{        
        return this.getDirectionsFromPoints(route.Points);     
    }

    public getDirectionsFromPoints(points : PointDetailedContract[]) : Observable<any> {
        let url : string = "http://dev.virtualearth.net/REST/v1/Routes?";
        let query : string = "";

        for(let i = 0; i < points.length; i++){
            
            for(let j = 0; j < points.length; j++){
                let jD = this.getDistanceFromLatLonInKm(points[j].Latitude, points[j].Longitude, points[i].Latitude, points[i].Longitude);

                for(let k = 0; k < points.length; k++){
                    let kD = this.getDistanceFromLatLonInKm(points[i].Latitude, points[i].Longitude, points[k].Latitude, points[k].Longitude);

                    if(jD < kD){
                        this.invert(points, k, j)
                    }
                }                
            }
        }

        for(let i = 0; i < points.length; i++){
            if(query)
                query += "&";
            query += "waypoint." + i + "=" + points[i].Latitude + "," + points[i].Longitude;
        }
        
        return this._jsonp.get(url + query + "&jsonp=JSONP_CALLBACK&key=AvKQ5s33Ij_kD9Am76fBJGX75CGsW5v7s2Wq8hA8XBg-KTr_xKY1vXHvV4JG16qD&optmz=distance").map(result => {
            return result.json();
        });
    }

    invert(list : any[], x : number, y: number){
        var b = list[y];
        list[y] = list[x];
        list[x] = b;
    }

    getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
        var dLon = this.deg2rad(lon2-lon1); 
        var a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2)
            ; 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; // Distance in km
        return d;
    }

    deg2rad(deg) {
        return deg * (Math.PI/180)
    }
}