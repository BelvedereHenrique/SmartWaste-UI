
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { RouteBuilderComponent } from './route-builder.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'route/builder', component: RouteBuilderComponent },
      { path: 'route/builder/:routeID', component: RouteBuilderComponent }
    ])
  ]
})
export class RouteBuilderRoutingModule { }