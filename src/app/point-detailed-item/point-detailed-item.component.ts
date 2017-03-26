/// <reference path="../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts"/>
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'

import { PointDetailedContract } from '../_shared/_models/point-detailed.model'
import { MapService, PushPinBuilder, PushPinColorEnum, PushPinType } from '../_shared/_services/map.service'

@Component({
    selector: 'point-detailed-item',
    templateUrl: './point-detailed-item.template.html',
    styleUrls: ['./point-detailed-item.component.css']
}) 

export class PointDetailedItemComponent {
    @Input("enable-click") enableClick : boolean = true;
    @Input("point") point : PointDetailedContract = new PointDetailedContract();
    
    constructor(private _mapService: MapService,
                private _domSanitizer : DomSanitizer) { }

    private onClick() : void {
        if(!this.enableClick) return;

        this._mapService.onLoad.subscribe(() => {            
            this._mapService.setView({
                center: new Microsoft.Maps.Location(this.point.Latitude, this.point.Longitude),
                zoom: 15
            });
        });
    }

    public getFullAddress() : string{
        return PointDetailedContract.getFullAddress(this.point);
    }

    private getDataSvgIcon() {
        return this._domSanitizer.bypassSecurityTrustResourceUrl(PointDetailedContract.getDataImageSvgIcon(true, this.point.Type, this.point.Status, this.point.PointRouteStatus));
    }

    private getStatusName() : string{
        return PointDetailedContract.getStatusName(this.point);
    }

    private getRouteStatusName() : string{        
        return PointDetailedContract.getRouteStatusName(this.point);
    }
} 