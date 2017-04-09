/// <reference path="../../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts"/>

import { Component, OnDestroy, OnInit} from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { Subscription } from 'rxjs';
import { Http } from '@angular/http';
import { AccountPersonalService } from '../_shared/_services/account-personal.service';
import { ViewChild } from '@angular/core';
import { NotificationService, Notification, NotificationResult } from '../_shared/_services/notification.service';
import { Router } from "@angular/router"
import { MapService, PushPinBuilder, PushPinType, PushPinColorEnum } from "../_shared/_services/map.service";
import { MapTypeEnum } from '../_shared/_models/map-type.enum'
import { MapPointLoaderService } from '../_shared/_services/map-point-loader.service';

@Component({
  selector: "account-personal-details",
  templateUrl: "./account-personal.template.html",
  styleUrls: ["./account-personal.component.css"]
})

export class AccountPersonalComponent implements OnInit, OnDestroy {
  Countries = [];
  Cities = [];
  States = [];
  Form = {
    Fields: {
      Name: "",
      Email: "",
      Password: "",
      PasswordConfirmation: {
        Value: "",
        IsValid: true,
      },
      CPF: "",
      Country: "",
      State: "",
      City: "",
      Line1: "",
      Line2: "",
      ZipCode: "",
      Neighborhood:"",
      Latitude: 0,
      Longitude: 0
    },
    
    
    IsValid: false,
  }
  EmailAlreadyInUse = false;
  DocumentAlreadyInUse = false;
  private isLoading = true;

  private onMapClickSubscription : Subscription;
  private allowClickMap : boolean = false;
  private notificationResult : NotificationResult;

  private userLayer : Microsoft.Maps.Layer = null;

  constructor(private http: Http,
    private _service: AccountPersonalService,
    private _notificationService: NotificationService,
    private _mapService: MapService,
    private _mapPointLoaderService: MapPointLoaderService,
    private _router: Router) {
    this.getCountries();
  }

  public ngOnInit() : void{
        this._mapService.onLoad.subscribe(() => {       
            this.setupUserLayer();
            this.onMapClickSubscription = this._mapService.onClick$.subscribe(this.onMapClick.bind(this)); 
            this._mapPointLoaderService.stop();       
        });
  }

  public ngOnDestroy() : void{
    if(this.onMapClickSubscription)
        this.onMapClickSubscription.unsubscribe();

    this._mapService.onLoad.subscribe(() => {      
      this.clearUserLayer();
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

  private onMapClick(location : Microsoft.Maps.Location) : void {
        if(!this.allowClickMap) return;
        this._mapService.onLoad.subscribe(() => {
          this._mapPointLoaderService.stop();
          this.clearUserLayer();
          this.userLayer.add(new PushPinBuilder(location).build());
          
          var notification : Notification = new Notification("Is the pin exactly on your address?", [], 0);
          notification.AddButton("No", () => {
              this.clearUserLayer();
              this.allowClickMap = true;
          });
          notification.AddButton("Yes", () => {
              this.allowClickMap = true;
              this.Form.Fields.Latitude = location.latitude;
              this.Form.Fields.Longitude = location.longitude;
          });
          this.notificationResult = this._notificationService.notify(notification);
        });
    }

    private getCityName() : string{
      return this.Cities.find(x => x.ID == this.Form.Fields.City).Name;
    }

    public getCurrentLocation(){
      if(this.Form.Fields.City != '' && this.Form.Fields.City != null){
        let query:string;
        query = this.Form.Fields.Line1 + ", " + this.getCityName();
        this._mapService.search(query);
        this.allowClickMap = true;
        this._notificationService.notify(new Notification("Search for your address and click on it!"));
      }else{
        this._notificationService.notify(new Notification("City must not be Empty!!"));
      }
    }

  public onCountryChange(value) {
    this.getStates(value);
    this.checkFormValidation();
  }

  public onStateChange(value) {
    this.Cities = [];
    this.getCities(value);
    this.checkFormValidation();
  }
  public onCityChange(value) {
    this.checkFormValidation();

  }

  public getCountries() {
    this._service.getCountries().subscribe(
      data => {
        if (data.Success == true) {
          this.Countries = data.Result;

        }
      },
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  public getStates(countryID) {
    this._service.getStates(countryID).subscribe(
      data => {
        if (data.Success == true) {
          this.States = data.Result;
          if (this.States.length == 1) this.getCities(this.States[0].ID);
        }
      },
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  getCities(stateID) {
    this._service.getCities(stateID).subscribe(
      data => {
        if (data.Success == true) {
          this.Cities = data.Result;
        }
      },
      error => console.log(error),
      () => this.isLoading = false
    );
  }
  public saveRequest() {
    this.checkFormValidation();
    
    this._service.saveRequest(this.Form).subscribe(
      data => {
        if (data.Result == true) {
          this._notificationService.notify(new Notification("Account created.",[]))
          
          this._router.navigateByUrl("signin");
          
        
      } else {
          this._notificationService.notify(new Notification("There was an error on subscription: " + data.Rsult,[]))
        }
      });
  }
  validateName(): boolean {
    if (!this.Form.Fields.Name || this.Form.Fields.Name.length < 3) {
      
      return false;
    }
    return true;

  }
  public validateEmail() {
    var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var emailRegexResult = regex.test(this.Form.Fields.Email);
    if (emailRegexResult)
      return true;
    else
      return false;
  }
  public validatePasswordLength(): boolean {
    if (this.Form.Fields.Password.length < 8) {
      
      return false;
    }
    return true;
  }
  public validatePassword(): boolean {
    if ((this.Form.Fields.Password && this.Form.Fields.PasswordConfirmation.Value) && (this.Form.Fields.Password == this.Form.Fields.PasswordConfirmation.Value)) {
      this.Form.Fields.PasswordConfirmation.IsValid = true;
      return true;
    } else {
      this.Form.Fields.PasswordConfirmation.IsValid = false;
      return false;
    }
  }

  public validateCPF(): boolean {
    if (this.Form.Fields.CPF.length != 11) {
      
      return false;
    }
    return true;
  }
  public validateCountry(): boolean {

    if (!this.Form.Fields.Country) {
      
      return false
    }
    return true;
  }
  public validateState(): boolean {

    if (!this.Form.Fields.State) {
      
      return false
    }
    return true;
  }
  public validateCity(): boolean {

    if (!this.Form.Fields.City) {
      
      return false
    }
    return true;
  }

  public checkFormValidation(): boolean {
    if ((this.Form.Fields.Name &&
      this.Form.Fields.Email &&
      this.Form.Fields.Password &&
      this.Form.Fields.Password.length >= 8 &&
      this.Form.Fields.PasswordConfirmation.Value &&
      this.Form.Fields.PasswordConfirmation.IsValid &&
      this.Form.Fields.Neighborhood &&
      this.Form.Fields.Line1 &&
      this.Form.Fields.CPF &&
      this.Form.Fields.Country &&
      this.Form.Fields.State &&
      this.Form.Fields.City &&
      !this.EmailAlreadyInUse &&
      !this.DocumentAlreadyInUse &&
      this.Form.Fields.Latitude != 0 &&
      this.Form.Fields.Longitude != 0
    )&&
    (this.validateAddressLine1()&&
    this.validateCity()&&
    this.validateCountry()&&
    this.validateCPF()&&
    this.validateEmail()&&
    this.validateName()&&
    this.validateNeighborhood()&&
    this.validatePassword()&&
    this.validatePasswordLength()&&
    this.validateState()&&
    this.validateZipCode()
    )
    ){
      this.Form.IsValid = true;
      return true;
    }else{
      this.Form.IsValid = false;
      return false;
    }
  }

  public checkEmailAvailability(): boolean {
    if (this.validateEmail()) {
      this._service.checkEmailAvailability(this.Form.Fields.Email).subscribe(
        data => {
          if (data.Result == true) {
            this.EmailAlreadyInUse = false;
            return true;
          } else {
            this.EmailAlreadyInUse = true;
            return false;
          }
        }
      );
    } else {
      
      return false;
    }
  }
  public checkCPFAvailability(): boolean {
    if (this.validateCPF()) {
      this._service.checkCPFAvailability(this.Form.Fields.CPF).subscribe(
        data => {
          if (data.Result == true) {
            this.DocumentAlreadyInUse = false;
            return true;
          } else {
            this.DocumentAlreadyInUse = true;
            
            return false;
          }
        }
      );
    } else {
      
      return false;
    }
  }
  public validateAddressLine1(): boolean {
    if (!this.Form.Fields.Line1) {
      return false;
    }
    return true;

  }
  public validateZipCode(): boolean {
    if (!this.Form.Fields.ZipCode) {
      return false;
    }
    return true;

  }
  public validateNeighborhood(): boolean {
    if (!this.Form.Fields.Neighborhood) {
      return false;
    }
    return true;

  }

}