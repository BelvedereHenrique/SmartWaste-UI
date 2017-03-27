/// <reference path="../../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts"/>

import { Injectable } from '@angular/core';
import {  Observable, Subject, ReplaySubject, Subscription } from 'rxjs';

import { MapTypeEnum } from '../_models/map-type.enum'
import { MapService, PushPinBuilder, PushPinType, PushPinColorEnum, ViewChangeResult } from './map.service'
import { MapPointLoaderService } from "./map-point-loader.service"
import { RouteDetailedContract } from "../_models/route-detailed.model"
import { PointDetailedContract } from "../_models/point-detailed.model"
import { Response, Http, URLSearchParams, RequestOptions, Headers, RequestMethod, Jsonp} from "@angular/http";

@Injectable()
export class MapRouteMakerService  {
    private canLoad: boolean = false;
    private route: Microsoft.Maps.Directions.DirectionsManager = null;

    private onRouteReady = new ReplaySubject<Microsoft.Maps.Directions.DirectionsManager>(1);
    onRouteReady$ = this.onRouteReady.asObservable();

    constructor(private _mapService : MapService,
                private _pointService : MapPointLoaderService,
                private _jsonp: Jsonp){
        //this._pointService.init();
    }

    public init() : void {
        this._mapService.onLoad.subscribe(() => {
            this._mapService.onCreateRouteResult$.subscribe(this.onCreateRoute.bind(this));            
        });
    }

    public routeExists() : boolean{
        return this.route != null;
    }

    public createRoute() : void {
        debugger;
        if(this.route) return;
        this._mapService.createRoute();
    }

    public clear() : void {
        if(!this.route) return;

        this.route.clearDisplay();
        this.route.clearAll();        
        this.route.dispose();
        this.onRouteReady.unsubscribe();
    }

    private onCreateRoute(route: Microsoft.Maps.Directions.DirectionsManager) : void {
        debugger;
        if(route){
            this.route = route;

            Microsoft.Maps.Events.addHandler(this.route, 'directionsError', (displayError) => {
                console.log(displayError);
            });

            this.route.setRenderOptions({
                autoUpdateMapView: false,
                displayManeuverIcons: false,
                displayDisclaimer : false,
                displayPostItineraryItemHints: false,
                displayRouteSelector: false,
                displayPreItineraryItemHints: false,
                displayStepWarnings: false,
                displayWalkingWarning: false,
                showInputPanel: false
            });
            
            this.onRouteReady.next(this.route);
        }
    }

    public addWaypoint(waypoint: Microsoft.Maps.Directions.Waypoint) : void{
        if(!this.route) return;

        this.route.addWaypoint(waypoint);

        this.route.calculateDirections();
    }

    public getDirectionsFromRoute(route : RouteDetailedContract) : Observable<any>{        
        return this.getDirectionsFromPoints(route.RoutePoints.map(routePoint => routePoint.Point));     
    }

    public getDirectionsFromPoints(points : PointDetailedContract[]) : Observable<any> {
        let url : string = "https://dev.virtualearth.net/REST/v1/Routes?";
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

        query += "&ra=routePath";
        
        return this._jsonp.get(url + query + "&jsonp=JSONP_CALLBACK&key=AvKQ5s33Ij_kD9Am76fBJGX75CGsW5v7s2Wq8hA8XBg-KTr_xKY1vXHvV4JG16qD&optmz=distance").map(result => {
            return result.json();
        });
    }

    public translateDirections(data : any) : Route {
        var route : Route = new Route();

        var resources = data.resourceSets[0].resources[0];

        route.expectedKilometers = resources.travelDistance;
        route.expectedMinutes = resources.travelDurationTraffic / 60;

        resources.routePath.line.coordinates.forEach((c) => {
            route.routePath.push(new Microsoft.Maps.Location(c[0], c[1]));                        
        });

        for (let i = 0; i < route.routePath.length; i++){
            if(i == 0)
                continue;
            
            route.routeLines.push(new Microsoft.Maps.Polyline([
                route.routePath[i - 1],
                route.routePath[i]
            ],{
                strokeColor: new Microsoft.Maps.Color(1, 0, 150, 136),
                strokeThickness: 5
            }));
        }

        resources.routeLegs.forEach((l) => {
            l.itineraryItems.forEach((i) => {
                let instruction : RouteInstructions = new RouteInstructions();

                instruction.location = new Microsoft.Maps.Location(
                        i.maneuverPoint.coordinates[0],
                        i.maneuverPoint.coordinates[1]
                );

                instruction.text = i.instruction.text;
                instruction.type = i.instruction.maneuverType;

                route.instructions.push(instruction);
            });
        });

        return route;     
    }

    public getNearestPoint(origin : PointDetailedContract, options : PointDetailedContract[]) : PointDetailedContract {
        var nearestPoint : PointDetailedContract = null;
        var bestDistace : number = null;

        options.forEach((option : PointDetailedContract) => {
            var distance = this.getDistanceFromLatLonInKm(origin.Latitude, origin.Longitude, option.Latitude, option.Longitude);

            if(bestDistace == null || bestDistace > distance){
                nearestPoint = option;
                bestDistace = distance;
            }
        });

        return nearestPoint;
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

export class Route {
    constructor(){
        this.routeLines = [];
        this.routePath = [];
        this.instructions = [];

    }

    public routePath: Microsoft.Maps.Location[];
    public routeLines : Microsoft.Maps.Polyline[];
    public instructions : RouteInstructions[];
    public expectedKilometers : number;
    public expectedMinutes : number;
}

export class RouteInstructions {
    public text : string;
    public type : string;
    public location : Microsoft.Maps.Location;
}