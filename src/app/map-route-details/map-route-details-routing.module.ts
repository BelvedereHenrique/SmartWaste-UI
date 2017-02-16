import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MapRouteDetailsComponent } from './map-route-details.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'routes/:routeID', component: MapRouteDetailsComponent }
    ])
  ]
})
export class MapRouteDetailsRoutingModule { }