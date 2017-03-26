import { Component, OnInit, OnDestroy } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

import { PointContract } from '../_shared/_models/point.model';
import { PointRouteStatusEnum } from '../_shared/_models/point-route-status.enum';
import { PointStatusEnum } from '../_shared/_models/point-status.enum';
import { PointTypeEnum } from '../_shared/_models/point-type.enum';
import { SecurityManagerService } from '../_shared/_services/security-manager.service';
import { SecurityModel } from '../_shared/_models/security.model';
import { NotificationService } from "../_shared/_services/notification.service";

@Component({
    selector: "map-legend",
    templateUrl: "./map-legend.template.html",
    styleUrls: ["./map-legend.component.css"]
})
export class MapLegendComponent implements OnInit, OnDestroy {  
    private items : MapLegendItem[] = [];
    private colors : MapLegendColor[] = [];    

    constructor (private _domSanitizer : DomSanitizer,
                 private _securityManager : SecurityManagerService,
                 private _notificationService : NotificationService){

    }

    public ngOnInit() : void{
        this.items.push(new MapLegendItem("Trashcan",this._domSanitizer.bypassSecurityTrustResourceUrl(PointContract.getDataImageSvgIcon(false, PointTypeEnum.CompanyTrashCan, null, PointRouteStatusEnum.Free))));
        this.items.push(new MapLegendItem("User",this._domSanitizer.bypassSecurityTrustResourceUrl(PointContract.getDataImageSvgIcon(false, PointTypeEnum.User, null, PointRouteStatusEnum.Free))));

        this.colors.push(new MapLegendColor("Empty point", "#009688"));
        this.colors.push(new MapLegendColor("Full point", "#F44336"));
        this.colors.push(new MapLegendColor("Point in a route", "#FF9800"));

        this._securityManager.onAuthChange$.subscribe((securityModel : SecurityModel) => {            
            this.colors.forEach(color => color.setVisible(securityModel && securityModel.CanSeeMapLegendColors));
        });
    }

    public ngOnDestroy() : void{
        
    }

    private getColors() : MapLegendColor[]{
        return this.colors.filter(color => color.isVisible());
    }
}

class MapLegendItem {
    private description : string;
    private svgIcon : any;

    constructor(description : string, svgIcon : any) {
        this.description = description;
        this.svgIcon = svgIcon;
    }
}

class MapLegendColor {
    private description : string;
    private color : string;
    private visible : boolean = false;

    constructor(description : string, color : string) {
        this.description = description;
        this.color = color;
    }

    public setVisible(visible : boolean) : void{
        this.visible = visible;
    }

    public isVisible() : boolean{
        return this.visible;
    }
}