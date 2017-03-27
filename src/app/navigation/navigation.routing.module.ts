import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NavigationComponent } from './navigation.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'navigation/:routeID', component: NavigationComponent }
    ])
  ]
})
export class NavigationRoutingModule { }