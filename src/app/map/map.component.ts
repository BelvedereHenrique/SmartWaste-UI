/// <reference path="../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts"/>

/*
    This component manages the Bing Maps V8.
*/

import { Component, OnChanges, Input, SimpleChanges } from '@angular/core';
import { ViewChild } from '@angular/core';


import { NotificationService, Notification, NotificationResult, NotificationButton } from "../_shared/_services/notification.service";
@Component({
    selector: 'map',
    templateUrl: './map.template.html',
    styleUrls: ['./map.component.css']
})

export class MapComponent implements OnChanges {
    @Input() searchQuery;
    @ViewChild('map') public map;
    private instance: Microsoft.Maps.Map;
    private pushpins: Microsoft.Maps.Pushpin[];

    private mapIconSize: number = 24;

    constructor(private _notificationService: NotificationService) {
        this.pushpins = [];
    }

    ngAfterViewInit() {
        this.loadMap();        
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes["searchQuery"].currentValue != changes["searchQuery"].previousValue)
            this.search(changes["searchQuery"].currentValue);
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

        if (!location)
            return;

        var push = new PushPinBuilder(location, PushPinType.CollectPoint, PushPinMaterialType.Paper).build();

        this.addPushpin(push);

        this.makeRoute(location);
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

        var n: Notification = new Notification("Added pushpin! :)", [], 5000);
        n.AddButton("Undo", () => {
            this.instance.entities.remove(pushpin);
        });

        this._notificationService.notify(n);
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

            this.search("Dobrada");

            Microsoft.Maps.Events.addHandler(this.instance, "click", this.onMapClick.bind(this));

        }.bind(this);

        script.src = "https://www.bing.com/api/maps/mapcontrol?branch=release&callback=onBingLoad";
        script.async = true;
        firstScript.parentNode.insertBefore(script, firstScript);

        console.debug("loadmap ending");
    }
}

class PushPinBuilder {
    private _type: PushPinType;
    private _material: PushPinMaterialType;
    private _location: Microsoft.Maps.Location;
    private size: number = 24;

    constructor(location: Microsoft.Maps.Location, type: PushPinType, material: PushPinMaterialType) {
        this._location = location;
        this._type = type;
        this._material = material;
    }

    public build(): Microsoft.Maps.Pushpin {
        return new Microsoft.Maps.Pushpin(this._location, {
            icon: this.getSvgIcon()
        });
    }

    private getSvgIcon(): string {
               return "<svg fill='" + this.getColor() + "' height='" + this.size + "' viewBox='0 0 24 24' width='" + this.size + "' xmlns='http://www.w3.org/2000/svg'><path d='M19 2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 3.3c1.49 0 2.7 1.21 2.7 2.7 0 1.49-1.21 2.7-2.7 2.7-1.49 0-2.7-1.21-2.7-2.7 0-1.49 1.21-2.7 2.7-2.7zM18 16H6v-.9c0-2 4-3.1 6-3.1s6 1.1 6 3.1v.9z'/><path d='M0 0h24v24H0z' fill='none'/></svg>";

        //return "<svg xmlns='http://www.w3.org/2000/svg' height='" + this.size + "'width='" + this.size + "' ><g transform='translate(-30.009 -15.66)'><path d='m41.994 15.66c-6.6517 0-11.985 5.3935-11.985 11.985v83.895c0 6.5918 5.3336 11.985 11.985 11.985h23.969l17.977 17.977 17.978-17.977h23.969c6.5918 0 11.985-5.3935 11.985-11.985v-83.895c0-6.5918-5.3935-11.985-11.985-11.985h-83.895zm28.802 9.5214c0.60465 0.002 1.2499 0.0504 1.9415 0.15234l24.902 0.33847c2.5357 0.13041 4.4276 1.3571 5.9181 3.2703l7.3601 10.915 6.6614-2.9928-10.387 17.996-21.304-0.32211 5.4371-3.3878-7.8411-14.058-11.389 19.185-19.018-10.679 9.2286-15.613c2.0265-2.5258 4.2572-4.817 8.4897-4.8048zm48.776 29.423 9.1166 15.676c1.3807 3.4184 2.3585 6.9112-1.1242 11.222l-12.748 21.066c-1.3826 2.0971-3.4086 3.0973-5.8365 3.4118l-13.28 0.81839-0.6976 7.1783-10.635-17.857 10.936-18.007 0.26118 6.3306 16.284 0.34393-11.178-19.306 18.901-10.877zm-59.093 0.42768 10.369 18.33-5.6983-2.9427-8.444 13.715 22.569 0.12093 0.11529 21.558-18.345-0.0641c-3.6967-0.53177-7.2567-1.4434-9.307-6.5689l-12.153-21.405c-1.1531-2.2276-1.0212-4.4555-0.0838-6.6832l5.9203-11.734-5.9627-4.1844 21.02-0.14042z' fill='" + this.getColor() + "'/></g></svg>";

    }

    private getColor(): string {
        switch (this._material) {
            case PushPinMaterialType.Glass: {
                return "green";
            }
            case PushPinMaterialType.Steel: {
                return "yellow";
            }
            case PushPinMaterialType.Plastic: {
                return "red";
            }
            case PushPinMaterialType.Organic: {
                return "gray";
            }
            case PushPinMaterialType.Paper: {
                return "blue";
            }
        }
    }
}

enum PushPinType {
    CollectPoint = 1,
    PickupPoint = 2
}

enum PushPinMaterialType {
    Glass = 1,
    Steel = 2,
    Plastic = 3,
    Organic = 4,
    Paper = 5
}