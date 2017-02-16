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
    private Countries = [];
    private isLoading = true;

    private Country: {};

    constructor( private http: Http,
                 private _service: AccountEnterpriseService) {
                  this.getCountries();
    }
    
  getCountries() {
    this._service.getCountries().subscribe(
      data => {
          if(data.Success == true){this.Countries = data.Result; console.log(this.Countries)}
        },
      error => console.log(error),
      () => this.isLoading = false
    );
  }


}