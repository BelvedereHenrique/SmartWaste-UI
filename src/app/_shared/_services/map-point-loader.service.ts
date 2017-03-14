/// <reference path="../../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts"/>

import { Injectable } from '@angular/core';
import { Subscription, Subject, Observable } from 'rxjs';

import { MapTypeEnum } from '../_models/map-type.enum'
import { MapService, PushPinBuilder, PushPinType, PushPinMaterialType, ViewChangeResult } from './map.service'
import { PointService, PointSearch, PointCoordinator } from "./point.service"

import { PointStatusEnum } from "../_models/point-status.enum"
import { PointRouteStatusEnum } from "../_models/point-route-status.enum"
import { PointTypeEnum } from "../_models/point-type.enum"

import { NotificationService, Notification, NotificationResult } from './notification.service';

@Injectable()
export class MapPointLoaderService  {
    private pointsLayer: Microsoft.Maps.EntityCollection = null;
    private pointsSubscription : Subscription = null;
    private limitZoomToShowPoints : number = 14;
    private canLoad: boolean = false;
    private isInitialized : boolean = false;
    private pushpins: PushPinBuilder[] = [];    
    private lastViewChange : ViewChangeResult = null;
    private search: PointSearch = null;

    //private biggestSearch : PointSearch = null;
    //private searchHistory : PointSearch[] = [];
    //private dataCache: any[] = [];

    private onPushPinClick : Subject<PushPinBuilder> = new Subject<PushPinBuilder>();
    onPushPinClick$ = this.onPushPinClick.asObservable();

    private onUpdatePushpins: Subject<any> = new Subject();
    onUpdatePushpins$ = this.onUpdatePushpins.asObservable();

    constructor(private _mapService : MapService,
                private _pointService : PointService,
                private _notificationService : NotificationService){

    }

    public init() : void{
        if (this.isInitialized) return;
        
        this._mapService.onLoad.subscribe(() => {                        
            this.start();
            this._mapService.onViewChange.subscribe((bounds: ViewChangeResult) => {      
                this.loadPoints(bounds);                      
            });

            this.isInitialized = true;
        });
    }

    public start() : void {
        this.canLoad = true;
    }

    public stop() : void {
        this.canLoad = false;
    }

    public updatePushpin(pushpin : PushPinBuilder) : void{
        this.removePushpin(pushpin);
        this.addPushpin(pushpin);
    }

    private getPushpin(ID : string) : PushPinBuilder{
        let result : PushPinBuilder[];
        result = this.pushpins.filter((p : PushPinBuilder) => p.getData().ID == ID);

        if(result.length)
            return result[0];
        else
            return null;
    }

    public reset() : void{
        this.search = null;
        this.pushpins = [];
        //this.dataCache = [];
        this.clearPointsLayer();

        this.reload();
    }

    private clearPointsLayer() : void{
        if(this.pointsLayer){        
            this.pushpins = [];
            this.pointsLayer.clear();
            this.pointsLayer.dispose();                            
        }
    }

    public setFilter(search: PointSearch) : void {
        this.search = search;    

        this.reload();    
    }

    private reload() : void{
        if(this.lastViewChange)
            this.loadPoints(this.lastViewChange);
    }

    private getFilter(viewChange: ViewChangeResult) : PointSearch {
        var northWest: Microsoft.Maps.Location = viewChange.bounds.getNorthwest();     
        var southEast: Microsoft.Maps.Location = viewChange.bounds.getSoutheast();

        var search : PointSearch = new PointSearch();

        if(this.search)
            search = this.search;

        search.Northwest = new PointCoordinator();
        search.Northwest.Latitude = northWest.latitude;
        search.Northwest.Longitude = northWest.longitude;

        search.Southeast = new PointCoordinator();
        search.Southeast.Latitude = southEast.latitude;
        search.Southeast.Longitude = southEast.longitude;

        search.NotIDs = [];
        //for(let i = 0; i < this.dataCache.length; i++)
          //  search.NotIDs.push(this.dataCache[i].ID)
        
        return search;
    }

    public getLoadedPushpins() : PushPinBuilder[] {
        if(!this.pushpins)
            return [];
         
        let copyList : PushPinBuilder [] = [];

        for(let i = 0; i < this.pushpins.length; i++)
            copyList.push(this.pushpins[i]);

         return copyList;
    }

    private removePushpin(pushpin : PushPinBuilder) : void{
        var oldPushpin : PushPinBuilder = this.getPushpin(pushpin.getData().ID);
        
        if(oldPushpin){            
            this.pointsLayer.remove(oldPushpin.build());
            this.pushpins.splice(this.pushpins.indexOf(oldPushpin), 1);
        }
    }

    private addPushpin(pushpin : PushPinBuilder) : void{
        pushpin.setOnClick(this.PushPinClick.bind(this));

        if(this.lastViewChange)
            pushpin.setSizeForZoom(this.lastViewChange.zoom);
        
        this.pushpins.push(pushpin);
        this.pointsLayer.add(pushpin.build()); 
        //this.dataCache.push(pushpin.getData());
    }

    private loadPoints(viewChange: ViewChangeResult) : void{
        if (!this.canLoad) return;

        this.lastViewChange = viewChange;

        var search : PointSearch = this.getFilter(viewChange);        

        if (this.pointsSubscription)
            this.pointsSubscription.unsubscribe();

        //if(this.hasViewCached(search))
        //    return;

        if (viewChange.zoom < this.limitZoomToShowPoints){
            this.clearPointsLayer();                        
            return;
        }

        this.pointsSubscription = this._pointService.GetList(search).subscribe((jsonResult) => {
            if(jsonResult.Success){                
                this.clearPointsLayer();

                //this.checkBiggestSearch(search);
                //this.searchHistory.push(search); 

                this.pointsLayer = new Microsoft.Maps.EntityCollection();
                this._mapService.removeLayer(this.pointsLayer);

                //this.dataCache = this.dataCache.concat(jsonResult.Result);

                //jsonResult.Result = jsonResult.Result.concat(this.getDataFromCache(search));

                for(let i = 0; i < jsonResult.Result.length; i++){
                    let pushpinBuilder = new PushPinBuilder(new Microsoft.Maps.Location(jsonResult.Result[i].Latitude, 
                            jsonResult.Result[i].Longitude), 
                            jsonResult.Result[i].Type == PointTypeEnum.User ? PushPinType.Person : PushPinType.Trash, 
                            PushPinMaterialType.Plastic);
                    
                    pushpinBuilder.setData(jsonResult.Result[i]);
                    this.addPushpin(pushpinBuilder);
                }

                this._mapService.addLayer(this.pointsLayer);
                this.onUpdatePushpins.next();
            }else{
                var notification = new Notification("There was an error to load the map.");
                notification.AddButton("Try again", () => {
                    this.loadPoints(viewChange);
                });
                this._notificationService.notify(notification);
            }
        });
    }
/*
    private checkBiggestSearch(search : PointSearch) : void{
        if(this.biggestSearch == null)
        {
            this.biggestSearch = search;
            return;
        }

        if(!this.hasViewCached(search))
            this.biggestSearch = search;
    }
*/
/*
    private hasViewCached2(search: PointSearch): boolean {
        if(!this.searchHistory.length)
            return false;

        let hasViewCached : boolean = false;

        for(let i = 0; this.searchHistory.length; i++){

            if(this.biggestSearch.Northwest.Latitude > search.Northwest.Latitude ||
               this.biggestSearch.Northwest.Longitude < search.Northwest.Longitude ||
               this.biggestSearch.Southeast.Latitude < search.Southeast.Latitude ||
               this.biggestSearch.Southeast.Longitude > search.Southeast.Longitude){

                   break;
               }
        }

        return hasViewCached;
     }

    private hasViewCached(search: PointSearch): boolean {
        if(!this.biggestSearch)
            return false;

        return this.biggestSearch.Northwest.Latitude > search.Northwest.Latitude &&
               this.biggestSearch.Northwest.Longitude < search.Northwest.Longitude &&
               this.biggestSearch.Southeast.Latitude < search.Southeast.Latitude &&
               this.biggestSearch.Southeast.Longitude > search.Southeast.Longitude;
}*/

    /*private getDataFromCache(search: PointSearch) : any[]{
        return this.dataCache.filter((data : any) => {
            return search.NotIDs.filter((ID : string) => {
                return ID == data.ID;
            }).length > 0 &&
            (search.Northwest.Latitude == null || data.Latitude <= search.Northwest.Latitude) &&
            (search.Southeast.Latitude == null || data.Latitude >= search.Southeast.Latitude) &&
            (search.Northwest.Longitude == null || data.Latitude >= search.Northwest.Longitude) &&
            (search.Southeast.Longitude == null || data.Longitude <= search.Southeast.Longitude);
        });
    }*/

    private PushPinClick(pushpin: PushPinBuilder) : void{
        this.onPushPinClick.next(pushpin);     
    }
} 