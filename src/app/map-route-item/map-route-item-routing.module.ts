import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MapRouteItemComponent } from './map-route-item.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'routes/:routeID', component: MapRouteItemComponent }
    ])
  ]
})
export class MapRouteItemRoutingModule { }