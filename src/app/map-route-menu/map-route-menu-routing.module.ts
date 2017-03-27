
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MapRouteMenuComponent } from './map-route-menu.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'routes', component: MapRouteMenuComponent },
      { path: 'routes/:status', component: MapRouteMenuComponent }
    ])
  ]
})
export class MapRouteMenuRoutingModule { }