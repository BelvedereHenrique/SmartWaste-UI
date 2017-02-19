import { Component } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { Http } from '@angular/http';
import { AccountPersonalService } from '../_shared/_services/account-personal.service';

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
      City: ""
    },
    IsValid: false,
  }
  private isLoading = true;

  constructor(private http: Http,
    private _service: AccountPersonalService) {
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

  getCountries() {
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

  getStates(countryID) {
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
        if (data == true) {
          alert("success")
        } else {
          alert()
        }
      });
  }
  validateEmail() {
    var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(this.Form.Fields.Email);
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
  validatePasswordLength(): boolean {
    if (this.Form.Fields.Password.length < 8) {
      this.Form.IsValid = false;
      return false;
    }
    return true;
  }
  validateCPF(): boolean {
    if (this.Form.Fields.CPF.length != 11) {
      this.Form.IsValid = false;
      return false;
    }
    return true;
  }
  validateCountry(): boolean {
    
      return false;
    
  }
  validateState(): boolean {
   
      return false;
    
  }
  validateCity(): boolean {
  
      return false;

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
  
}