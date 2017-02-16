import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AccountMenuComponent } from './account-menu.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'account', component: AccountMenuComponent }
    ])
  ]
})
export class AccountMenuRoutingModule { }