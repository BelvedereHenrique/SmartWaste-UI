import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PointDetailsComponent } from './point-details.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'point/:pointID', component: PointDetailsComponent }
    ])
  ]
})
export class PointDetailsRoutingModule { }