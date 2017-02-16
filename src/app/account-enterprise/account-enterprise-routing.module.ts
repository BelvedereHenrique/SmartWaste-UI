import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AccountEnterpriseComponent } from './account-enterprise.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'account/enterprise', component: AccountEnterpriseComponent }
    ])
  ]
})
export class AccountEnterpriseRoutingModule { }