/// <reference path="../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts"/>
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { PointDetailedContract } from '../_shared/_models/point-detailed.model'
import { MapService, PushPinBuilder, PushPinColorEnum, PushPinType } from '../_shared/_services/map.service'
import { RoutePointContract } from '../_shared/_models/route-point.model';

@Component({
    selector: 'route-point',
    templateUrl: './route-point.template.html',
    styleUrls: ['./route-point.component.css']
})

export class RoutePointComponent {
    @Input("enable-click") enableClick : boolean = true;
    @Input("point") point : PointDetailedContract = new PointDetailedContract();
    @Input("routePoint") routePoint : RoutePointContract = null;
    
    private showDetails : boolean = false;
    private canShowDetails : boolean = false;

    constructor(private _mapService: MapService,
                private _dom : DomSanitizer) { }

    private onClick() : void {
        this.showDetails = !this.showDetails;
        this.canShowDetails = this.showDetails && this.routePoint != null && this.routePoint.IsCollected !== null;

        if(!this.enableClick) return;

        this._mapService.onLoad.subscribe(() => {            
            this._mapService.setView({
                center: new Microsoft.Maps.Location(this.point.Latitude, this.point.Longitude),
                zoom: 15
            });
        });
    }

    public getFullAddress(point : PointDetailedContract) : string{
        return PointDetailedContract.getFullAddress(point);
    }

    private getSvgIcon() {
        return this._dom.bypassSecurityTrustResourceUrl(PointDetailedContract.getDataImageSvgIcon(true, this.point.Type, this.point.Status, this.point.PointRouteStatus));
    }
} 