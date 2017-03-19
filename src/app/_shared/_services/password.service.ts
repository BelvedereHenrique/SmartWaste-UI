import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs';

import { ServiceHelpersService, ContentTypeEnum } from './service-helpers.service';
import { ResultDefault} from '../_models/ResultDefault.model';

@Injectable()
export class PasswordService{
  constructor(private serviceHelpers: ServiceHelpersService) {
    
  }

  sendToken(email) {
    var e = {
      email: email
    };
    return this.serviceHelpers.post<any>("/Account/SendPasswordToken", e, false, ContentTypeEnum.JSON);
  }

  checkUserToken(email) {
    let params = new URLSearchParams();
    params.set("email", email);
    return this.serviceHelpers.get<any>("/Account/CheckUserToken",params);
  }
  changePassword(password) {
    return this.serviceHelpers.post<any>("/Account/ChangePassword", password, false, ContentTypeEnum.JSON);
  }
}