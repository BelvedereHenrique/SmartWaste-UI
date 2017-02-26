import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs';

import { ServiceHelpersService, ContentTypeEnum } from './service-helpers.service';
import { ResultDefault} from '../_models/ResultDefault.model';

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
  saveEnterprise(enterprise){
    let params = new URLSearchParams();
    params.append("enterprise", enterprise);
    debugger
    return this.serviceHelpers.post<any>("/Account/SaveEnterprise", enterprise, false, ContentTypeEnum.JSON);
  }
}