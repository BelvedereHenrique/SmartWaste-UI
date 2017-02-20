import { NgModule } from '@angular/core';

import { SearchComponent } from './search.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';



@NgModule({
  declarations: [
    //SearchComponent
  ],
  imports: [
      FormsModule,
      ReactiveFormsModule,
      CommonModule,
      RouterModule
  ],
  providers: [
    //SearchService
  ]
})
export class SearchModule { }