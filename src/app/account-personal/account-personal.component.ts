import { Component } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { Http } from '@angular/http';
import { AccountPersonalService } from '../_shared/_services/account-personal.service';
import {ViewChild} from '@angular/core';
import {NotificationService, Notification} from '../_shared/_services/notification.service';
import { Router } from "@angular/router"

@Component({
  selector: "account-personal-details",
  templateUrl: "./account-personal.template.html",
  styleUrls: ["./account-personal.component.css"]
})

export class AccountPersonalComponent {
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
      Neighborhood:""
    },
    
    
    IsValid: false,
  }
  EmailAlreadyInUse = false;
  DocumentAlreadyInUse = false;
  private isLoading = true;

  constructor(private http: Http,
    private _service: AccountPersonalService,
    private _notificationService: NotificationService,
    private _router: Router) {
    this.getCountries();
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
    this._service.saveRequest(this.Form).subscribe(
      data => {
        if (data.Result == true) {
          this._notificationService.notify(new Notification("User subscribed!",[]))
          this._router.navigateByUrl("signin/");
        } else {
          this._notificationService.notify(new Notification("There was an error on subscription: " + data.Rsult,[]))
        }
      });
  }
  validateName(): boolean {
    if (!this.Form.Fields.Name || this.Form.Fields.Name.length < 3) {
      this.Form.IsValid = false;
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
      this.Form.IsValid = false;
      return false;
    }
    return true;
  }
  public validatePassword(): boolean {
    if ((this.Form.Fields.Password && this.Form.Fields.PasswordConfirmation.Value) && (this.Form.Fields.Password == this.Form.Fields.PasswordConfirmation.Value)) {
      this.Form.Fields.PasswordConfirmation.IsValid = true;
      this.checkFormValidation();
      return true;
    } else {
      this.Form.Fields.PasswordConfirmation.IsValid = false;
      this.checkFormValidation();
      return false;
    }
  }

  public validateCPF(): boolean {
    if (this.Form.Fields.CPF.length != 11) {
      this.Form.IsValid = false;
      return false;
    }
    return true;
  }
  public validateCountry(): boolean {

    if (!this.Form.Fields.Country) {
      this.Form.IsValid = false;
      return false
    }
    return true;
  }
  public validateState(): boolean {

    if (!this.Form.Fields.State) {
      this.Form.IsValid = false;
      return false
    }
    return true;
  }
  public validateCity(): boolean {

    if (!this.Form.Fields.City) {
      this.Form.IsValid = false;
      return false
    }
    return true;
  }

  public checkFormValidation(): void {
    if (this.Form.Fields.Name &&
      this.Form.Fields.Email &&
      this.Form.Fields.Password &&
      this.Form.Fields.Password.length >= 8 &&
      this.Form.Fields.PasswordConfirmation.Value &&
      this.Form.Fields.PasswordConfirmation.IsValid &&
      this.Form.Fields.CPF &&
      this.Form.Fields.Country &&
      this.Form.Fields.State &&
      this.Form.Fields.City
    )
      this.Form.IsValid = true;
    else
      this.Form.IsValid = false;
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
            this.Form.IsValid = false;
            return false;
          }
        }
      );
    } else {
      this.Form.IsValid = false;
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
      this.Form.IsValid = false;
      return false;
    }
  }
  public validateAddressLine1(): boolean {
    if (!this.Form.Fields.Line1) {
      this.Form.IsValid = false;
      return false;
    }
    return true;

  }
  public validateZipCode(): boolean {
    if (!this.Form.Fields.ZipCode) {
      this.Form.IsValid = false;
      return false;
    }
    return true;

  }
  public validateNeighborhood(): boolean {
    if (!this.Form.Fields.Neighborhood) {
      this.Form.IsValid = false;
      return false;
    }
    return true;

  }

}