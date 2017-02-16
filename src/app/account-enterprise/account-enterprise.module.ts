import { NgModule } from '@angular/core';

import { AccountEnterpriseComponent } from './account-enterprise.component';

import { AccountEnterpriseService } from '../_shared/_services/account-enterprise.service';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';

@NgModule({
  declarations: [
    //MapRouteItemComponent
  ],
  imports: [
      FormsModule,
      ReactiveFormsModule,
      CommonModule,
      RouterModule
  ],
  providers: [
    AccountEnterpriseService
  ]
})
export class AccountEnterpriseModule { }