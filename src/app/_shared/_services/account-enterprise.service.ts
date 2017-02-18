import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs';

import { ServiceHelpersService } from './service-helpers.service'

@Injectable()
export class AccountEnterpriseService{
  constructor(private serviceHelpers: ServiceHelpersService) {
    
  }

  getCountries () {    
    return this.serviceHelpers.get<any>("/Account/GetCountries", null);
  }
  getStates (countryID: number) {    
    let params = new URLSearchParams();
    params.set("countryID", countryID.toString());

    return this.serviceHelpers.get<any>("/Account/GetStates", params);
  }
  getCities (stateID: number) {
    let params = new URLSearchParams(); 
    params.set("stateID", stateID.toString());

    return this.serviceHelpers.get<any>("/Account/GetCities", params);
  }
}