import { Component, OnDestroy, OnInit } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { Http } from '@angular/http';
import { Subscription } from 'rxjs';

import { NotificationService, Notification, NotificationResult, NotificationButton } from '../_shared/_services/notification.service'
import { AccountEnterpriseService } from '../_shared/_services/account-enterprise.service';
import { MapService, PushPinBuilder, PushPinType, PushPinMaterialType } from "../_shared/_services/map.service";
import { MapTypeEnum } from '../_shared/_models/map-type.enum'

@Component({
    selector: "account-enterprise-details",
    templateUrl: "./account-enterprise.template.html",
    styleUrls: ["./account-enterprise.component.css"]
})

export class AccountEnterpriseComponent implements OnDestroy, OnInit {
    Countries = [];
    Cities = [];
    States = [];
    private isLoading = true;

    private onMapClickSubscription : Subscription;
    private allowClickMap: boolean  = false;

    private notificationResult : NotificationResult;

    constructor( private http: Http,
                 private _service: AccountEnterpriseService,
                 private _mapService: MapService,
                 private _notificationService: NotificationService) {
                  this.getCountries();
    }

    ngOnInit() {
        console.log("ngOnInit");
        this._mapService.onLoad.subscribe(() => {
            console.log("ONLOAD");
            this.allowClickMap = true;
            this._mapService.setup(MapTypeEnum.CoordinatesColletor);        
            this.onMapClickSubscription = this._mapService.onClick$.subscribe(this.onMapClick.bind(this));        
        });        
    }

    ngOnDestroy(){
      if(this.onMapClickSubscription)
        this.onMapClickSubscription.unsubscribe();
      this._mapService.clear();
      if(this.notificationResult)
        this.notificationResult.Cancel();
    }

    private onMapClick(location : Microsoft.Maps.Location) : void {
        if(!this.allowClickMap) return;
        this.allowClickMap = false;
        this._mapService.addPushPin(new PushPinBuilder(location, PushPinType.CollectPoint, PushPinMaterialType.Paper).build());
        
        var notification : Notification = new Notification("Is the pin exactly on your address?", [], 0);
        notification.AddButton("No", () => {
            this._mapService.clear();
            this.allowClickMap = true;
        });

        notification.AddButton("Yes", () => {
            this.allowClickMap = false;
        });

        this.notificationResult = this._notificationService.notify(notification);
    }

 public onCountryChange(value){
   console.log(value);
 }

  public onStateChange(value){
   this.Cities = [];
   this.getCities(value);
 }

    
  getCountries() {
    this._service.getCountries().subscribe(
      data => {
          if(data.Success == true){
            this.Countries = data.Result;        
            if(this.Countries.length == 1) this.getStates(this.Countries[0].ID);   
          }
        },
      error => console.log(error),
      () => this.isLoading = false
    );
  }

   getStates(countryID) {
     
    this._service.getStates(countryID).subscribe(
      data => {
          if(data.Success == true){
            this.States = data.Result; 
            if(this.States.length ==1) this.getCities(this.States[0].ID);                     
          }
        },
      error => console.log(error),
      () => this.isLoading = false
    );
  }

    getCities(stateID) {
    this._service.getCities(stateID).subscribe(
      data => {
          if(data.Success == true){
            this.Cities = data.Result;                  
          }
        },
      error => console.log(error),
      () => this.isLoading = false
    );
  }


}