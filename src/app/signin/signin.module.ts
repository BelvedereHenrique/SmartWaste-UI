import { NgModule } from '@angular/core';

//import { SearchService } from '../_shared/_services/Search.service';

import { RouterModule }   from '@angular/router';
import { SigninComponent } from './signin.component'
import { AccountService } from '../_shared/_services/account.service'

@NgModule({
  declarations: [
    SigninComponent
  ],
  imports: [      
      RouterModule
  ],
  providers: [
    AccountService
  ]
})
export class SigninModule { }