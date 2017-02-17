import { Component } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { Http } from '@angular/http';
import { AccountEnterpriseService } from '../_shared/_services/account-enterprise.service';

@Component({
    selector: "account-enterprise-details",
    templateUrl: "./account-enterprise.template.html",
    styleUrls: ["./account-enterprise.component.css"]
})

export class AccountEnterpriseComponent {
    Countries = [];
    Cities = [];
    States = [];
    private isLoading = true;

    constructor( private http: Http,
                 private _service: AccountEnterpriseService) {
                  this.getCountries();
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
      debugger;
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