/// <reference path="../../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts"/>

import { Injectable } from '@angular/core';
import { Observable, Subject, ReplaySubject } from 'rxjs';

import { MapTypeEnum } from '../_models/map-type.enum'
import { PointService, PointSearch, PointCoordinator } from "./point.service"


@Injectable()
export class MapService {
    private onSearch = new Subject<SearchOptions>();
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
    public onSetZoom = new Subject<ZoomOptions>();
    public onSetUserLocation = new Subject();
    public onChangeMapType = new Subject<Microsoft.Maps.MapTypeId>();
    public onSetView = new Subject<Microsoft.Maps.IViewOptions>();

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
    onSetZoom$ = this.onSetZoom.asObservable();
    onSetUserLocation$ = this.onSetUserLocation.asObservable();
    onChangeMapType$ = this.onChangeMapType.asObservable();
    onSetView$ = this.onSetView.asObservable();

    constructor(private _routesService: PointService){
        
    }

    public setView(view: Microsoft.Maps.IViewOptions) : void{
        this.onSetView.next(view);
    }

    public search(query : string, callback: Function = null, count: number = null) : void {
        var options : SearchOptions = new SearchOptions();
        options.query = query;
        options.callback = callback;
        options.count = count;
        this.onSearch.next(options);
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

    public setZoom(zoom: number, sum: boolean) : void {
        var options : ZoomOptions = new ZoomOptions();
        options.zoom = zoom;
        options.sum = sum;

        this.onSetZoom.next(options);
    }

    public setUserLocation() : void {
        this.onSetUserLocation.next();
    }

    public setMapType(type: Microsoft.Maps.MapTypeId) : void{
        this.onChangeMapType.next(type);
    }
}

export class PushPinBuilder {
    private _type: PushPinType;
    private _material: PushPinMaterialType;
    private _location: Microsoft.Maps.Location;
    private size: number = 24;
    private _onClick : Function = null;
    private strokeColor: string = "#ffffff";
    private strokeWidth: number = 7;
    private userIconPath : string = "m84.171 16.179c-14.306 0-25.893 11.587-25.893 25.893s11.587 25.893 25.893 25.893 25.893-11.587 25.893-25.893-11.587-25.893-25.893-25.893zm0 64.732c-17.283 0-51.785 8.6741-51.785 25.893v12.945h30.031l21.754 21.754 21.754-21.754h30.031v-12.945c0-17.218-34.502-25.893-51.785-25.893z";
    private companyIconPath : string = "m43.162 127.43c0 7.6987 6.299 13.998 13.998 13.998h55.991c7.6987 0 13.998-6.299 13.998-13.998v-76.822h-83.986zm90.985-104.98h-24.496l-6.9988-6.9988h-34.994l-6.9988 6.9988h-24.496v17.998h97.984z";

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
        var path : string = "";
        if(this._type == PushPinType.CollectPoint)
            path = this.userIconPath;
        else
            path = this.companyIconPath;

        return "<svg fill='" + this.getColor() + "' height='" + this.size + "' viewBox='0 0 107.8652 125.84255' width='" + this.size + "' xmlns='http://www.w3.org/2000/svg'><g xmlns='http://www.w3.org/2000/svg' transform='translate(-30.009,-15.66)'><path stroke-width='" + this.strokeWidth + "' stroke='" + this.strokeColor + "' d='" + path +"'/></g><path d='M0 0h24v24H0z' fill='none'/></svg>";
    }

    private getColor(): string {
        switch (this._material) {
            case PushPinMaterialType.Glass: {
                return "#009688";
            }
            case PushPinMaterialType.Steel: {
                return "#FFC107";
            }
            case PushPinMaterialType.Plastic: {
                return "#F44336";
            }
            case PushPinMaterialType.Organic: {
                return "#607D8B";
            }
            case PushPinMaterialType.Paper: {
                return "#3F51B5";
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

export class ZoomOptions {
    zoom: number;
    sum: boolean;
}

export class SearchOptions {
    public query : string;
    public callback: Function;
    public count : number;
}