/// <reference path="../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts"/>

import { Component, OnInit, OnDestroy } from "@angular/core"

import { FloatActionButton, FloatActionButtonType }  from '../_shared/_services/float-action-button.service'
import { MapService, ViewChangeResult, ZoomOptions } from "../_shared/_services/map.service";
import { NotificationService, Notification } from "../_shared/_services/notification.service"

@Component({
    selector: "map-controls",
    templateUrl: "./map-controls.template.html",
    styleUrls: ["./map-controls.component.css"]
})

export class MapControlsComponent  {
    private buttons: FloatActionButton[] = [];
    private mapType : Microsoft.Maps.MapTypeId;

    constructor(private _mapService: MapService,
                private _notificationService: NotificationService) {        

    }

    ngOnInit(){
        this.buttons.push(new FloatActionButton("my_location", 
                                                         "My Location", 
                                                         "my_location", 
                                                         FloatActionButtonType.mini,
                                                         this.onMyLocationClick.bind(this), 4));

        this.buttons.push(new FloatActionButton("remove", 
                                                         "Zoom -", 
                                                         "zoom-", 
                                                         FloatActionButtonType.mini,
                                                         this.onZoomClick.bind(this, -1), 2));

        this.buttons.push(new FloatActionButton("add", 
                                                         "Zoom +", 
                                                         "zoom+", 
                                                         FloatActionButtonType.mini,
                                                         this.onZoomClick.bind(this, 1), 1)); 

        this.buttons.push(new FloatActionButton("layers", 
                                                         "Change Layer", 
                                                         "changelayer", 
                                                         FloatActionButtonType.mini,
                                                         this.onChangeLayerClick.bind(this, 1), 3)); 
    }

    public getButtons() : FloatActionButton[]{
        return this.buttons.sort((a, b) => { return a.position - b.position; }); 
    }

    private onChangeLayerClick() : void {
        this._mapService.onLoad.subscribe(() => {
            if(this.mapType == null)
               this.mapType = Microsoft.Maps.MapTypeId.road; 

            if(this.mapType == Microsoft.Maps.MapTypeId.aerial){
                this._mapService.setMapType(Microsoft.Maps.MapTypeId.road);
                this.mapType = Microsoft.Maps.MapTypeId.road;
            }else{
                this._mapService.setMapType(Microsoft.Maps.MapTypeId.aerial);
                this.mapType = Microsoft.Maps.MapTypeId.aerial;
            }
        });
    }

    private onZoomClick(zoomChange: number) : void{
        this._mapService.onLoad.subscribe(() => {
            this._mapService.setZoom(zoomChange, true);
        });
    }

    private onMyLocationClick() : void {
        this._mapService.onLoad.subscribe(() => {
            this._mapService.setUserLocation();
        });
    }    
}