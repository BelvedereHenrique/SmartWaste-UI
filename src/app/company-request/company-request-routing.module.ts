import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CompanyRequestComponent } from './company-request.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'account/companyrequest', component: CompanyRequestComponent }
    ])
  ]
})
export class CompanyRequestRoutingModule { }