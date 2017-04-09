/// <reference path="../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts"/>

/*
    This component manages the Bing Maps V8.
*/

import { Observable, Subject, Subscription } from 'rxjs';

import { Component, Input, SimpleChanges, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';

import { NotificationService, Notification, NotificationResult, NotificationButton } from "../_shared/_services/notification.service";
import { MapService, ViewChangeResult, ZoomOptions, SearchOptions } from "../_shared/_services/map.service";
import { MapTypeEnum } from '../_shared/_models/map-type.enum'
import { BottomNavigationService, BottomNavigationMenuSizeEnum } from '../_shared/_services/bottom-navigation.service'

@Component({
    selector: 'map',
    templateUrl: './map.template.html',
    styleUrls: ['./map.component.css']
})

export class MapComponent{    
    @ViewChild('map') public map;
    private instance: Microsoft.Maps.Map;
    private pushpins: Microsoft.Maps.Pushpin[];

    private noMargin : boolean = false;

    private menuOpened: boolean;
    private menuSize : BottomNavigationMenuSizeEnum;

    private mapIconSize: number = 24;

    private mapType : MapTypeEnum = null;

    private isCompassEnabled : boolean = false;
    private watchPositionNumber : number = null;

    constructor(private _notificationService: NotificationService,
                private _mapService : MapService,
                private _bottomNavigationService: BottomNavigationService) {
                    
        this.pushpins = [];

        this._mapService.onSearch$.subscribe(this.search.bind(this));
        this._mapService.onAddPushpin$.subscribe(this.addPushpin.bind(this));
        this._mapService.onCreateRoute$.subscribe(this.createRoute.bind(this));      
        this._mapService.onAddLayer$.subscribe(this.addLayer.bind(this));      
        this._mapService.onRemoveLayer$.subscribe(this.removeLayer.bind(this));      
        this._mapService.onSetZoom$.subscribe(this.setZoom.bind(this));      
        this._mapService.onSetUserLocation$.subscribe(this.setUserLocation.bind(this));   
        this._mapService.onChangeMapType$.subscribe(this.changeMapType.bind(this));   
        this._mapService.onSetView.subscribe(this.setView.bind(this));
        this._mapService.onSetWatchPositionEnabled$.subscribe(this.setWatchPositionEnabled.bind(this));    
        this._mapService.onSetCompass$.subscribe(this.setCompass.bind(this));

        this._bottomNavigationService.onToggle$.subscribe(this.onMenuToggle.bind(this));
        this._bottomNavigationService.onSizeChange$.subscribe(this.onMenuSizeChange.bind(this));
        this._bottomNavigationService.onChangeBottomNavigationVisibility$.subscribe(this.onChangeBottomNavigationVisibility.bind(this));
    }

    ngAfterViewInit() {
        this.loadMap();        
    }
    
    private setupCompassEvent(enable : boolean) : void{
        if(!(<any>window).DeviceOrientationEvent)
            return;

        if (enable)
            window.addEventListener('deviceorientation', this.compassCallback.bind(this), false);
        else
            window.removeEventListener("deviceorientation", this.compassCallback);
    }

    private compassCallback(eventData) : void{
        if(this.map != null){
            this.setView({
                heading: eventData.alpha
            });
        }
    }

    private setCompass(enable : boolean) : void{
        this.isCompassEnabled = enable;
        this.setupCompassEvent(enable);
    }

    private setZoom(options : ZoomOptions) : void {        
        var actual : number = this.instance.getZoom();

        if (options.sum)
            actual += options.zoom;
        else
            actual = options.zoom;

        this.instance.setView({
            zoom: actual
        });
    }

    private changeMapType(type: Microsoft.Maps.MapTypeId) : void {        
        this.instance.setMapType(type);
    }

    private setView(view: Microsoft.Maps.IViewOptions) : void{        
        this.instance.setView(view);
    }

    private setUserLocation() : void {
        navigator.geolocation.getCurrentPosition((position: Position) => {
            this.instance.setView({
                center: new Microsoft.Maps.Location(position.coords.latitude, position.coords.longitude)
            });
        }, () => {
            this._notificationService.notify(new Notification("Allow the browser to get your location."));
        }, { enableHighAccuracy: true });
    }

    private addLayer(layer: Microsoft.Maps.Layer) : void {        
        this.instance.layers.insertAll([layer]);
    }

    private removeLayer(layer: Microsoft.Maps.Layer) : void {
        this.instance.layers.remove(layer);
    }

    private setWatchPositionEnabled(enable : boolean) : void {
        if(enable) {
            if (navigator.geolocation) {
                this.watchPositionNumber = navigator.geolocation.watchPosition(this.onPositionChange.bind(this), null, {
                    enableHighAccuracy: true,
                    timeout: 1000,
                    maximumAge: 0                
                });
            }
        } else {
            if(this.watchPositionNumber && navigator.geolocation)
                navigator.geolocation.clearWatch(this.watchPositionNumber);
        }        
    }

    private onPositionChange(position: Position) : void {            
        this._mapService.onPositionChange.next(new Microsoft.Maps.Location(position.coords.latitude, position.coords.longitude));        
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
    }

    public onViewChange(): void{        
        this._mapService.onViewChange.next(new ViewChangeResult(this.instance.getBounds(), this.instance.getZoom()));
    }

    /* NOTE: Docs for routes: https://msdn.microsoft.com/en-us/library/mt750406.aspx */
    public createRoute() : void {            
        Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {            
            this._mapService.onCreateRouteResult.next(
                new Microsoft.Maps.Directions.DirectionsManager(this.instance)
            );
        }.bind(this));
    }
    
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

    public search(options: SearchOptions): void {
        if (!this.instance) return;

        Microsoft.Maps.loadModule('Microsoft.Maps.Search', function () {
            var searchManager = new Microsoft.Maps.Search.SearchManager(this.instance);
            var requestOptions = {
                bounds: this.instance.getBounds(),
                where: options.query,
                count: options.count,
                callback: function (answer, userData) {                    
                    if(options.callback)
                        options.callback(answer);
                    else
                        this.instance.setView({ bounds: answer.results[0].bestView });                    
                }.bind(this)
            };

            searchManager.geocode(requestOptions);
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
                credentials: 'AvKQ5s33Ij_kD9Am76fBJGX75CGsW5v7s2Wq8hA8XBg-KTr_xKY1vXHvV4JG16qD',
                showMapTypeSelector: false,
                showLogo: false,
                showLocateMeButton: false,
                showBreadcrumb: false,
                showScalebar: false,
                showDashboard: false,
                showZoomButtons: false,
                showTermsLink: false,
                showTrafficButton: false,
                liteMode: true
            });

            Microsoft.Maps.Events.addHandler(this.instance, "click", this.onMapClick.bind(this));
            Microsoft.Maps.Events.addHandler(this.instance, "viewchangeend", this.onViewChange.bind(this));
            
            this._mapService.onLoad.next();
        }.bind(this);

        script.src = "https://www.bing.com/api/maps/mapcontrol?branch=release&callback=onBingLoad";
        script.async = true;
        firstScript.parentNode.insertBefore(script, firstScript);

        console.debug("loadmap ending");
 
    }

    private onMenuToggle(opened: boolean) : void{
        this.menuOpened = opened;
    }

    private onMenuSizeChange(size : BottomNavigationMenuSizeEnum) : void{
        this.menuSize = size;
    }

    private onChangeBottomNavigationVisibility(visible : boolean) : void{
        this.noMargin = visible;
    }
}

