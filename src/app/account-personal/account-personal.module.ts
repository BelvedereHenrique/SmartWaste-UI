import { NgModule } from '@angular/core';

import { AccountPersonalComponent } from './account-personal.component';

import { AccountPersonalService } from '../_shared/_services/account-personal.service';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';

@NgModule({
  declarations: [
    
  ],
  imports: [
      FormsModule,
      ReactiveFormsModule,
      CommonModule,
      RouterModule
  ],
  providers: [
    AccountPersonalService
  ]
})
export class AccountPersonalModule { }