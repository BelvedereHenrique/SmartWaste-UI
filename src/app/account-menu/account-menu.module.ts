import { NgModule } from '@angular/core';

import { AccountMenuComponent } from './account-menu.component';

//import { MapRouteItemService } from '../_shared/_services/MapRouteItem.service';

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
    //MapRouteItemService
  ]
})
export class AccountMenuModule { }