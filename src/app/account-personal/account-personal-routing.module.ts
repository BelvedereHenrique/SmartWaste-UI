import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AccountPersonalComponent } from './account-personal.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'account/personal', component: AccountPersonalComponent }
    ])
  ]
})
export class AccountPersonalRoutingModule { }