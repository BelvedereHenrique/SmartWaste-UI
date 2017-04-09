import { Component, OnDestroy, OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { Subscription } from 'rxjs';

import { NotificationService, Notification, NotificationResult, NotificationButton } from '../_shared/_services/notification.service'
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';
import { AccountEnterpriseService } from "../_shared/_services/account-enterprise.service";
import { SecurityManagerService } from "../_shared/_services/security-manager.service";
import { MapService, PushPinBuilder, PushPinType, PushPinColorEnum } from "../_shared/_services/map.service";
import { MapTypeEnum } from '../_shared/_models/map-type.enum'
import { SecurityModel } from '../_shared/_models/security.model';

@Component({
  selector: "account-menu",
  templateUrl: "./account-menu.template.html",
  styleUrls: ["./account-menu.component.css"]
})

export class AccountMenuComponent implements OnDestroy, OnInit {

  private onAuthChangeSubscription: Subscription = null;

  constructor(private router: Router,
    private _accountService: AccountEnterpriseService,
    private _notificationService: NotificationService,
    private slimLoadingBarService: SlimLoadingBarService,
    private _securityManagerService: SecurityManagerService,
    private _mapService: MapService) {
    //check can make a enterprise
    this.CheckUserEnterprise();
  }

  private onMapClickSubscription: Subscription;
  private allowClickMap: boolean = false;
  private notificationResult: NotificationResult;
  public canShowEnterpriseMenu = false;
  public enterprise = null;
  public CanInviteUserToYourCompany : boolean;
  private isLoading = false;
  public fillform = true;
  public fillpointform = true;
  public resend = false;
  AccountEnterprise = {
    Name: '',
    CNPJ: '',
    Address: {
      Line1: '',
      Line2: '',
      ZipCode: '',
      Neighborhood: '',
      Latitude: '',
      Longitude: '',
      City: {
        ID: '',
        Name: ''
      }
    }
  }
  city = '';
  Countries = [];
  Cities = [];
  States = [];
  public onRequestEnterprisePermissionClick(): void {
    this.router.navigateByUrl("account/enterprise");
    //this.n.Notify(new Notification("Teste", [], 15000));
  }

  public Employee = {
    Email: '',
    check: true
  }

  public ngOnInit(): void {
    this.onAuthChangeSubscription = this._securityManagerService.onAuthChange$.subscribe((securityModel : SecurityModel) => {
      if (securityModel == null){
        this.router.navigate(["/"]);
        return
      }
          
        this.CanInviteUserToYourCompany = securityModel.CanInviteUserToYourCompany;        
      });
  }

  public ngOnDestroy(): void {
    if (this.onAuthChangeSubscription)
      this.onAuthChangeSubscription.unsubscribe();
  }

  private signOut(): void {
    this._securityManagerService.signout();
  }
  private CheckUserEnterprise(): void {
    this.slimLoadingBarService.start();
    this._accountService.getUserEnterprise().subscribe(
      data => {
        if (data.Success == true) {
          if (data.Result.ID != null) {
            this.enterprise = data.Result;
            this.canShowEnterpriseMenu = false;
          } else {
            this.canShowEnterpriseMenu = true;
          }
        }
      },
      error => {
        console.log(error)
        this._notificationService.notify(new Notification("An Error Ocurred on Server", [], 3000));
      },
      () => this.slimLoadingBarService.complete()
    );
  }

  public goToEmployeeRequest() {
    this.fillform = false;
  }
  public validateEmail() {
    var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var emailRegexResult = regex.test(this.Employee.Email);
    if (emailRegexResult)
      return true;
    else
      return false;
  }
  public checkAllProperties() {
    if (this.Employee.Email == '' || !this.validateEmail()) return false;
    return true;
  }
  public sendEmployeeToken() {
    this.slimLoadingBarService.start();
    this.Employee.check = true;
    
    this._accountService.sendEmployeeToken(this.Employee).subscribe(
      data => {
        if (data.Success == true) {
          this._notificationService.notify(new Notification("An email was sent to " + this.Employee.Email + " with the next instructions.", [], 5000));

          this.fillform = true;
          this.Employee.Email = ''          

          this.resend = false;
        } else {
          for (var i = 0; i < data.Messages.length; i++) {
            this._notificationService.notify(new Notification(data.Messages[i].Message));
            if (data.Messages[i].Message.indexOf('pending request') >= 0) {
              this.resend = true;
            } else {
              this.resend = false;
            }
          }
        }
      },
      error => {
        console.log(error)
        this._notificationService.notify(new Notification("An Error Ocurred on Server", [], 3000));
      },
      () => this.slimLoadingBarService.complete()
    );
  }

  public resendEmployeeToken() {
    this.slimLoadingBarService.start();
    this.Employee.check = false;
    
    this._accountService.sendEmployeeToken(this.Employee).subscribe(
      data => {
        if (data.Success == true) {
          this._notificationService.notify(new Notification("An email was sent to " + this.Employee.Email + " with the next instructions.", [], 5000));

          this.fillform = true;
          this.Employee.Email = '';
          this.resend = false;          
        } else {
          for (var i = 0; i < data.Messages.length; i++) {
            this._notificationService.notify(new Notification(data.Messages[i].Message));
          }
        }
      },
      error => {
        console.log(error)
        this._notificationService.notify(new Notification("An Error Ocurred on Server", [], 3000));
      },
      () => this.slimLoadingBarService.complete()
    );
  }
  goToPointRequest() {
    this.fillpointform = false;
  }
  public onCountryChange(value) {
    console.log(value);
  }

  public onStateChange(value) {
    this.Cities = [];
    this.getCities(value);
  }

  public getCountries() {
    this.slimLoadingBarService.start();
    this._accountService.getCountries().subscribe(
      data => {
        if (data.Success == true) {
          this.Countries = data.Result;
          if (this.Countries.length == 1) this.getStates(this.Countries[0].ID);
        }
      },
      error => this._notificationService.notify(new Notification("An Error Ocurred on Server: Get Countries", [], 3000)),
      () => this.slimLoadingBarService.complete()
    );
  }

  public getStates(countryID) {
    this.slimLoadingBarService.start();
    this._accountService.getStates(countryID).subscribe(
      data => {
        if (data.Success == true) {
          this.States = data.Result;
          if (this.States.length == 1) this.getCities(this.States[0].ID);
        }
      },
      error => this._notificationService.notify(new Notification("An Error Ocurred on Server: Get States", [], 3000)),
      () => this.slimLoadingBarService.complete()
    );
  }

  public getCities(stateID) {
    this.slimLoadingBarService.start();
    this._accountService.getCities(stateID).subscribe(
      data => {
        if (data.Success == true) {
          this.Cities = data.Result;
        }
      },
      error => this._notificationService.notify(new Notification("An Error Ocurred on Server: Get Cities", [], 3000)),
      () => this.slimLoadingBarService.complete()
    );
  }

  public checkPointProperties() {
    if (this.AccountEnterprise.Address.City.ID == '') return false;
    if (this.AccountEnterprise.Address.Latitude == '' || this.AccountEnterprise.Address.Longitude == '') return false;
    if (this.AccountEnterprise.Address.Line1 == '' || this.AccountEnterprise.Address.Neighborhood == '' || this.AccountEnterprise.Address.ZipCode == '') return false;
    if (this.AccountEnterprise.CNPJ == '') return false;
    if (this.AccountEnterprise.Name == '') return false;
    return true;
  }
}