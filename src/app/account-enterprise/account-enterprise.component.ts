/// <reference path="../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts"/>

import { Component, OnDestroy, OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { Http } from '@angular/http';
import { Subscription } from 'rxjs';

import { NotificationService, Notification, NotificationResult, NotificationButton } from '../_shared/_services/notification.service'
import {SlimLoadingBarService} from 'ng2-slim-loading-bar';
import { AccountEnterpriseService } from '../_shared/_services/account-enterprise.service';
import { MapService, PushPinBuilder, PushPinType, PushPinColorEnum } from "../_shared/_services/map.service";
import { MapTypeEnum } from '../_shared/_models/map-type.enum'
import { SecurityManagerService } from '../_shared/_services/security-manager.service';
import { MapPointLoaderService } from '../_shared/_services/map-point-loader.service';

@Component({
    selector: "account-enterprise-details",
    templateUrl: "./account-enterprise.template.html",
    styleUrls: ["./account-enterprise.component.css"]
})

export class AccountEnterpriseComponent implements OnDestroy, OnInit {
  constructor( private http: Http,
                 private _service: AccountEnterpriseService,
                 private _mapService: MapService,
                 private _notificationService: NotificationService,
                 private _securityManagerService : SecurityManagerService,
                 private _mapPointLoaderService : MapPointLoaderService,
                 private _router: Router,
                 private slimLoadingBarService: SlimLoadingBarService) {
                  this.getCountries();
    }
    
   AccountEnterprise={
      Name: '',
      CNPJ: '',
      Address:{
        Line1:'',
        Line2:'',
        ZipCode:'',
        Neighborhood:'',
        Latitude:'',
        Longitude:'',
        City:{
          ID:'',
          Name:''
        }
      }
    }
    city = '';
    Countries = [];
    Cities = [];
    States = [];

    private isLoading = true;
    private onMapClickSubscription : Subscription;
    private allowClickMap: boolean  = false;
    private notificationResult : NotificationResult;    

    private userLayer : Microsoft.Maps.Layer = null;

    ngOnInit() {
        this._mapService.onLoad.subscribe(() => {
            this.setupUserLayer();
            this._mapPointLoaderService.stop();
            this.onMapClickSubscription = this._mapService.onClick$.subscribe(this.onMapClick.bind(this));        
        });        
    }

    ngOnDestroy(){
      if(this.onMapClickSubscription)
        this.onMapClickSubscription.unsubscribe();
      this.clearUserLayer();
      if(this.notificationResult)
        this.notificationResult.Cancel();

      this._mapService.onLoad.subscribe(() => {
        this._mapPointLoaderService.start();
      });
    }

    private setupUserLayer() : void{
        if(this.userLayer == null)
            this.userLayer = new Microsoft.Maps.Layer();

        this._mapService.addLayer(this.userLayer);
    }

    private clearUserLayer() : void{
      if(this.userLayer)
      {
        this.userLayer.clear();      
      }
    }

    public onCountryChange(value){
      console.log(value);
    }

    public onStateChange(value){
      this.Cities = [];
      this.getCities(value);
    }

    public getCountries() {
      this.slimLoadingBarService.start();
      this._service.getCountries().subscribe(
        data => {
            if(data.Success == true){
              this.Countries = data.Result;        
              if(this.Countries.length == 1) this.getStates(this.Countries[0].ID);   
            }
          },
        error => this._notificationService.notify(new Notification("An Error Ocurred on Server: Get Countries",[],3000)),
        () =>     this.slimLoadingBarService.complete()
      );
    }

    public getStates(countryID) {     
      this.slimLoadingBarService.start();
      this._service.getStates(countryID).subscribe(
        data => {
            if(data.Success == true){
              this.States = data.Result; 
              if(this.States.length ==1) this.getCities(this.States[0].ID);                     
            }
          },
        error => this._notificationService.notify(new Notification("An Error Ocurred on Server: Get States",[],3000)),
        () =>this.slimLoadingBarService.complete()
      );
    }

    public getCities(stateID) {
      this.slimLoadingBarService.start();
      this._service.getCities(stateID).subscribe(
        data => {
            if(data.Success == true){
              this.Cities = data.Result;                  
            }
          },
        error => this._notificationService.notify(new Notification("An Error Ocurred on Server: Get Cities",[],3000)),
        () =>this.slimLoadingBarService.complete()
      );
    }
    
    public checkAllProperties(){
      if (this.AccountEnterprise.Address.City.ID == '') return false;
      if (this.AccountEnterprise.Address.Latitude =='' || this.AccountEnterprise.Address.Longitude=='') return false;
      if (this.AccountEnterprise.Address.Line1 == '' || this.AccountEnterprise.Address.Neighborhood == '' || this.AccountEnterprise.Address.ZipCode == '') return false;
      if (this.AccountEnterprise.CNPJ == '') return false;
      if (this.AccountEnterprise.Name == '') return false;
      return true;
    }

    public saveEnterprise(){
      this.slimLoadingBarService.start();
      let isValid = this.checkAllProperties();
      if(!isValid){
        this._notificationService.notify(new Notification("There're empty fields",[],5000));
        this.slimLoadingBarService.complete();
        return;
      }
      this._service.saveEnterprise(this.AccountEnterprise).subscribe(
        data => {
            if(data.Success == true){
              console.log(data); 
              this.slimLoadingBarService.complete()
              this._notificationService.notify(new Notification("Your enterprise was created. Please, sign in again.", [], 5000));

              this._router.navigateByUrl("/signin");
              this._securityManagerService.signout();
            }else{              
              for(var i = 0; i< data.Messages.length; i++){
                  this._notificationService.notify(new Notification(data.Messages[i].Message));
              }
            }
          },
        error => {
          console.log(error);
          this._notificationService.notify(new Notification("An Error Ocurred on Server: Save Enterprise",[],3000));
        },
        () => this.slimLoadingBarService.complete()
      );
      console.log(this.AccountEnterprise);
    }

    public getCurrentLocation(){
      if(this.AccountEnterprise.Address.City.ID != '' && this.AccountEnterprise.Address.City.ID != null){
        let query:string;
        query = this.AccountEnterprise.Address.Line1 + ", " + this.AccountEnterprise.Address.City.Name;
        this._mapService.search(query);
        this.allowClickMap = true;
        this._notificationService.notify(new Notification("Search for your address and click on it!"));
      }else{
        this._notificationService.notify(new Notification("City must not be Empty!!"));
      }
    }

    private onMapClick(location : Microsoft.Maps.Location) : void {
      this._mapService.onLoad$.subscribe(() => {
        if(!this.allowClickMap) return;
        this.clearUserLayer();
        this._mapPointLoaderService.stop();
        this.userLayer.add(new PushPinBuilder(location).build());
        
        var notification : Notification = new Notification("Is the pin exactly on your address?", [], 0);
        notification.AddButton("No", () => {
            this.clearUserLayer();
            this.allowClickMap = true;
        });
        notification.AddButton("Yes", () => {
            this.allowClickMap = true;
            this.AccountEnterprise.Address.Latitude = location.latitude.toString();
            this.AccountEnterprise.Address.Longitude = location.longitude.toString();
        });
        this.notificationResult = this._notificationService.notify(notification);
      });        
    }
}