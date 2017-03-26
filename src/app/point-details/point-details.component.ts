/// <reference path="../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts"/>
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs';

import { SlimLoadingBarService } from 'ng2-slim-loading-bar';
import { PointDetailedHistoriesContract } from '../_shared/_models/point-detailed-histories.model'
import { MapService, PushPinBuilder, PushPinColorEnum, PushPinType } from '../_shared/_services/map.service'
import { PointService, PointSearch } from '../_shared/_services/point.service'
import { NotificationService, Notification, NotificationButton } from '../_shared/_services/notification.service'
import { SecurityManagerService } from '../_shared/_services/security-manager.service';
import { SecurityModel } from '../_shared/_models/security.model';
import { PointTypeEnum } from '../_shared/_models/point-type.enum';
import { MapPointLoaderService } from '../_shared/_services/map-point-loader.service'

@Component({
    selector: 'point-details',
    templateUrl: './point-details.template.html',
    styleUrls: ['./point-details.component.css']
})

export class PointDetailsComponent implements OnInit, OnDestroy {
    private pointID : string = null;
    private point : PointDetailedHistoriesContract = new PointDetailedHistoriesContract();
    private onAuthChangeSubscription : Subscription = null;
    private onUpdatePushpinsSubscription : Subscription = null;

    constructor(private _pointService : PointService,
                private _activatedRoute : ActivatedRoute,
                private _router : Router,
                private _loadingBar : SlimLoadingBarService,
                private _notificationService : NotificationService,
                private _securityManagerService : SecurityManagerService,
                private _mapService : MapService,
                private _mapPointLoader : MapPointLoaderService){

    }

    public ngOnInit() : void{
        this._activatedRoute.params.subscribe(params => {
            this.pointID = params["pointID"]
            this.loadPoint(this.pointID);
        });
    }

    public ngOnDestroy() : void{
        if(this.onAuthChangeSubscription)
            this.onAuthChangeSubscription.unsubscribe();
        
        if(this.onUpdatePushpinsSubscription)
            this.onUpdatePushpinsSubscription.unsubscribe();
    }

    private loadPoint(pointID : string) : void {
        this._loadingBar.start();

        var search : PointSearch = new PointSearch();
        search.IDs.push(pointID);

        this._pointService.GetDetailed(search).subscribe((jsonModel) => {
            this._loadingBar.complete();
            if(jsonModel.Success){
                this.checkSecurity(jsonModel.Result);
            } else {
                this._notificationService.notify(new Notification(jsonModel.Messages, [], 5000));
            }
        }, (jsonErrorModel) => {
            this._loadingBar.complete();

            let notification : Notification = new Notification("It couldn't load the point.", [], 5000);
            notification.AddButton("Try again", () => {
                this.loadPoint(this.pointID);
            });

            this._notificationService.notify(notification);
        });
    }

    private checkSecurity(point : PointDetailedHistoriesContract) : void{
        this.onAuthChangeSubscription = this._securityManagerService.onAuthChange$.subscribe((securityModel : SecurityModel) => {
            if((!securityModel && point.Type == PointTypeEnum.CompanyTrashCan) || 
            (securityModel && (securityModel.CanSeeAllPointDetails || securityModel.PersonID == point.PersonID))){
                this.showPoint(point);
            }
            else
                this._router.navigate(["/"]);
        });
    }

    private showPoint(point : PointDetailedHistoriesContract) : void{
        this.point = point;
        this._mapService.onLoad.subscribe(() => {            
            this._mapService.setView({
                center: new Microsoft.Maps.Location(point.Latitude, point.Longitude),
                zoom: 15
            });

            this.onUpdatePushpinsSubscription = this._mapPointLoader.onUpdatePushpins$.subscribe(() => {
                var pushpins : PushPinBuilder[] = this._mapPointLoader.getLoadedPushpins();

                pushpins.forEach((pushpin : PushPinBuilder) => {
                    if(pushpin.getData().ID == this.point.ID){
                        pushpin.setSelected(true);
                        this._mapPointLoader.updatePushpin(pushpin);
                    }
                });                
            });
        });         
    }

    private getAddress() : string {        
        return PointDetailedHistoriesContract.getFullAddress(this.point);
    }

    private getIcon() : string{
        return PointDetailedHistoriesContract.getIconClass(this.point);
    }
}