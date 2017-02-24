import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs';

import { ServiceHelpersService, ContentTypeEnum } from './service-helpers.service'

@Injectable()
export class AccountPersonalService {
  constructor(private serviceHelpers: ServiceHelpersService) {
  }

  getCountries() {
    return this.serviceHelpers.get<any>("Account/GetCountries", null);
  }

  getStates(countryID: number) {
    let params = new URLSearchParams();
    params.set("countryID", countryID.toString());
    return this.serviceHelpers.get<any>("Account/GetStates", params);
  }

  getCities(stateID: number) {
    let params = new URLSearchParams();
    params.set("stateID", stateID.toString());
    return this.serviceHelpers.get<any>("Account/GetCities", params);
  }

  saveRequest(data: any) {
    return this.serviceHelpers.post<any>("Account/SavePersonalProfile", data, false, ContentTypeEnum.JSON)
  }
  checkEmailAvailability(email: string) {
    let params = new URLSearchParams();
    params.set("email", email)
    return this.serviceHelpers.get<any>("Account/CheckEmailAvailability", params);
  }
  checkCPFAvailability(cpf: string) {
    let params = new URLSearchParams();
    params.set("cpf", cpf)
    return this.serviceHelpers.get<any>("Account/CheckCPFAvailability", params);
  }
}