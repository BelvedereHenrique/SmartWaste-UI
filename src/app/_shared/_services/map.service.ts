/// <reference path="../../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts"/>

import { Injectable } from '@angular/core';
import { Observable, Subject, ReplaySubject } from 'rxjs';

import { MapTypeEnum } from '../_models/map-type.enum';
import { PointService, PointSearch, PointCoordinator } from "./point.service";
import { PointStatusEnum } from '../_models/point-status.enum';
import { PointRouteStatusEnum } from '../_models/point-route-status.enum';
import { PointContract } from '../_models/point.model';
import { PointTypeEnum } from '../_models/point-type.enum';

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
    private pushpin : Microsoft.Maps.Pushpin = null;
    private _location: Microsoft.Maps.Location;
    private size: number = 24;
    private _onClick : Function = null;
    private strokeColor: string = "#ffffff";
    private strokeWidth: number = 7;

    private data : any = null;
    private selected : boolean = false;

    constructor(location: Microsoft.Maps.Location) {
        this._location = location;        
    }

    public build(): Microsoft.Maps.Pushpin {
        if(!this.pushpin){
            this.pushpin = new Microsoft.Maps.Pushpin(this._location, this.getOptions());

            Microsoft.Maps.Events.addHandler(this.pushpin, 'click', this.onClick.bind(this));
        }else{
            this.pushpin.setOptions(this.getOptions());
        }
        
        return this.pushpin;
    }

    private getOptions() : Microsoft.Maps.IPushpinOptions{
        return {
            icon: this.getSvgIcon(),
            anchor: new Microsoft.Maps.Point(this.size / 2, this.size)
        };
    }

    public setData(data : any) : void {
        this.data = data;
    }

    public getData() : any{
        return this.data;
    }

    public setSizeForZoom(zoom: number) : void {        
        this.size = Math.pow(zoom, 2) / 15;
    }

    private onClick() : void {
        if(this._onClick)
            this._onClick(this);
    }

    public setOnClick(onClick : Function){
        this._onClick = onClick;
    }

    private getSvgIcon() : string {
        return PointContract.getSvgIcon(this.selected, this.getPointType(), this.getPointStatus(), this.getPointRouteStatus(), this.getSize(), this.getStrokeColor(), this.getStrokeWidth());
    }

    private getPointType() : PointTypeEnum{
        if(this.data && this.data.Type)
            return this.data.Type;
        else
            return PointTypeEnum.User;
    }

    private getPointStatus() : PointStatusEnum{
        if(this.data && this.data.Status)
            return this.data.Status;
        else
            return PointStatusEnum.Empty;
    }

    private getPointRouteStatus() : PointRouteStatusEnum{
        if(this.data && this.data.PointRouteStatus)
            return this.data.PointRouteStatus;
        else
            return PointRouteStatusEnum.Free;
    }

    private getSize() : number{        
        return this.size;
    }

    private getStrokeColor() : string{
        return this.strokeColor;
    }

    private getStrokeWidth() : number{
        return this.strokeWidth;
    }

    public setSelected(selected : boolean) : void{
        this.selected = selected;
    }
}

export enum PushPinType {
    Person = 1,
    Trash = 2
}

export enum PushPinColorEnum {
    Green = 1,
    Yellow = 2,
    Red = 3,
    Blue = 4
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