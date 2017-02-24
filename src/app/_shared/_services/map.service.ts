/// <reference path="../../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts"/>

import { Injectable } from '@angular/core';
import { Observable, Subject, ReplaySubject } from 'rxjs';

import { MapTypeEnum } from '../_models/map-type.enum'
import { PointService, PointSearch, PointCoordinator } from "./point.service"


@Injectable()
export class MapService {
    private onSearch = new Subject<string>();
    private onSetup = new Subject<MapTypeEnum>();
    private onAddPushpin = new Subject<Microsoft.Maps.Pushpin>();
    public onClick = new Subject<Microsoft.Maps.Location>();
    private onClear = new Subject();
    public onPositionChange = new Subject<Microsoft.Maps.Location>();
    public onLoad = new ReplaySubject(1);
    private onCreateRoute = new Subject<Microsoft.Maps.Directions.DirectionsManager>();
    public onViewChange = new Subject<ViewChangeResult>();
    public onAddLayer = new Subject<Microsoft.Maps.Layer>();
    public onRemoveLayer = new Subject<Microsoft.Maps.Layer>();

    onSearch$ = this.onSearch.asObservable();
    onSetup$ = this.onSetup.asObservable();
    onClick$ = this.onClick.asObservable();
    onAddPushpin$ = this.onAddPushpin.asObservable();
    onClear$ = this.onClear.asObservable();
    onPositionChange$ = this.onPositionChange.asObservable();
    onLoad$ = this.onLoad.asObservable();
    onCreateRoute$ = this.onCreateRoute.asObservable();
    onViewChange$ = this.onViewChange.asObservable();
    onAddLayer$ = this.onAddLayer.asObservable();
    onRemoveLayer$ = this.onRemoveLayer.asObservable();

    
    constructor(private _routesService: PointService){
        
    }

    public search(query : string) : void {
        this.onSearch.next(query);
    }

    public setup(type: MapTypeEnum): void {        
        this.onSetup.next(type);
    }

    public addPushPin(pushpin: Microsoft.Maps.Pushpin) : void{
        this.onAddPushpin.next(pushpin);
    }

    public createRoute() : void {
        this.onCreateRoute.next();
    }

    public clear() : void{
        this.onClear.next();
    }

    public addLayer(layer: Microsoft.Maps.Layer) : void{
        this.onAddLayer.next(layer);
    }

    public removeLayer(layer: Microsoft.Maps.Layer) : void{
        this.onRemoveLayer.next(layer);
    }
}

export class PushPinBuilder {
    private _type: PushPinType;
    private _material: PushPinMaterialType;
    private _location: Microsoft.Maps.Location;
    private size: number = 24;
    private _onClick : Function = null;

    constructor(location: Microsoft.Maps.Location, type: PushPinType, material: PushPinMaterialType) {
        this._location = location;
        this._type = type;
        this._material = material;
    }

    public build(): Microsoft.Maps.Pushpin {
        var pushPin : Microsoft.Maps.Pushpin = new Microsoft.Maps.Pushpin(this._location, {
            icon: this.getSvgIcon(),
            anchor: new Microsoft.Maps.Point(this.size / 2, this.size)
        });

        Microsoft.Maps.Events.addHandler(pushPin, 'click', this.onClick);

        return pushPin;
    }

    public setSizeForZoom(zoom: number) : void{        
        this.size = Math.pow(zoom, 2) / 15;
    }

    private onClick() : void{
        if(this._onClick)
            this._onClick(this);
    }

    public setOnClick(onClick : Function){
        this._onClick = onClick;
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

export enum PushPinType {
    CollectPoint = 1,
    PickupPoint = 2
}

export enum PushPinMaterialType {
    Glass = 1,
    Steel = 2,
    Plastic = 3,
    Organic = 4,
    Paper = 5
}

export class ViewChangeResult{
    public bounds: Microsoft.Maps.LocationRect;
    public zoom: number;

    constructor(bounds: Microsoft.Maps.LocationRect, zoom: number){
        this.bounds = bounds;
        this.zoom = zoom;
    }
}