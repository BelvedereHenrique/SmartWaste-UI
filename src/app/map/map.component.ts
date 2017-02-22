/// <reference path="../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts"/>

/*
    This component manages the Bing Maps V8.
*/

import { Observable, Subject, Subscription } from 'rxjs';

import { Component, Input, SimpleChanges } from '@angular/core';
import { ViewChild } from '@angular/core';

import { NotificationService, Notification, NotificationResult, NotificationButton } from "../_shared/_services/notification.service";
import { MapService } from "../_shared/_services/map.service";
import { MapTypeEnum } from '../_shared/_models/map-type.enum'

@Component({
    selector: 'map',
    templateUrl: './map.template.html',
    styleUrls: ['./map.component.css']
})

export class MapComponent {    
    @ViewChild('map') public map;
    private instance: Microsoft.Maps.Map;
    private pushpins: Microsoft.Maps.Pushpin[];

    private mapIconSize: number = 24;

    private mapType : MapTypeEnum = null;

    constructor(private _notificationService: NotificationService,
                private _mapService : MapService) {
                    
        this.pushpins = [];

        this._mapService.onSearch$.subscribe(this.search.bind(this));
        this._mapService.onSetup$.subscribe(this.setup.bind(this));
        this._mapService.onAddPushpin$.subscribe(this.addPushpin.bind(this));
        this._mapService.onClear$.subscribe(this.clear.bind(this));        
    }

    ngAfterViewInit() {
        this.loadMap();        
    }

    private setup(type: MapTypeEnum): void {
        this.clear();
        this.mapType = type;       

    }   

    private clear(): void {
        this.mapType = null;
        this.instance.entities.clear();
        this.instance.layers.clear();   
    };

    private setupPosition() : void {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(this.onPositionChange.bind(this), null, {
                enableHighAccuracy: true,
                timeout: 1000                
            });
        }
    }

    private onPositionChange(position: Position) : void {    
        this._mapService.onPositionChange.next(new Microsoft.Maps.Location(position.coords.altitude, position.coords.longitude));        
    }

    private getLocationFromPixel(x: number, y: number): Microsoft.Maps.Location {
        var location: Microsoft.Maps.Location | Microsoft.Maps.Location[] = this.instance.tryPixelToLocation(new Microsoft.Maps.Point(x, y));
        if (location instanceof Microsoft.Maps.Location)
            return location;
        else if (location instanceof Array && location.length > 0)
            return location[0];
        else
            return null;
    }

    public onMapClick(e: Microsoft.Maps.IMouseEventArgs): void {
        var location = this.getLocationFromPixel(e.getX(), e.getY());

        this._mapService.onClick.next(location);

        //var push = new PushPinBuilder(location, PushPinType.CollectPoint, PushPinMaterialType.Paper).build();

        //this.addPushpin(push);

        //this.makeRoute(location);
    }

    public createRoute() : void {
        Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
            return new Microsoft.Maps.Directions.DirectionsManager(this.instance);                            
        });
    }

    /* NOTE: Docs for routes: https://msdn.microsoft.com/en-us/library/mt750406.aspx */
    public route: Microsoft.Maps.Directions.DirectionsManager;

    public makeRoute(location: Microsoft.Maps.Location): void {        
        Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {

            if (this.route == null) {
                this.route = new Microsoft.Maps.Directions.DirectionsManager(this.instance);                
            }

            this.route.setRenderOptions({
                autoUpdateMapView: false
            });
                        
            var waypoint = new Microsoft.Maps.Directions.Waypoint({ location: location });
            this.route.addWaypoint(waypoint);

            this.route.calculateDirections();
        }.bind(this));
        
    }

    public search(query: string): void {
        if (!this.instance) return;

        Microsoft.Maps.loadModule('Microsoft.Maps.Search', function () {
            var searchManager = new Microsoft.Maps.Search.SearchManager(this.instance);
            var requestOptions = {
                bounds: this.instance.getBounds(),
                where: query,
                callback: function (answer, userData) {
                    this.instance.setView({ bounds: answer.results[0].bestView });
                    this.instance.entities.push(new Microsoft.Maps.Pushpin(answer.results[0].location));
                }.bind(this)
            };
            searchManager.geocode(requestOptions);

            console.log(JSON.stringify(this.instance.getBounds()));
        }.bind(this));
    };

    public addPushpin(pushpin: Microsoft.Maps.Pushpin): void {
        this.instance.entities.push(pushpin);
        this.pushpins.push(pushpin);
    }

    public loadMap(): void {
        console.debug(this.map);

        // Store a copy of the ZoneAwarePromise defined above
        window["zoneAwarePromise"] = window["Promise"];

        // Load Bing Maps
        let firstScript = document.getElementsByTagName("script")[0];
        let script = document.createElement("script");

        window["onBingLoad"] = function () {
            window["Promise"] = window["zoneAwarePromise"];

            this.instance = new Microsoft.Maps.Map(document.getElementById("map"), {
                credentials: 'AvKQ5s33Ij_kD9Am76fBJGX75CGsW5v7s2Wq8hA8XBg-KTr_xKY1vXHvV4JG16qD'
            });

            Microsoft.Maps.Events.addHandler(this.instance, "click", this.onMapClick.bind(this));

            
            this._mapService.onLoad.next();
        }.bind(this);

        script.src = "https://www.bing.com/api/maps/mapcontrol?branch=release&callback=onBingLoad";
        script.async = true;
        firstScript.parentNode.insertBefore(script, firstScript);

        console.debug("loadmap ending");
 
    }
}

