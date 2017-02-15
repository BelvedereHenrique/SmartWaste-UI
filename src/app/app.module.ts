import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SearchComponent } from './search/search.component';
import { MapComponent } from './map/map.component';
import { MapRouteItemComponent } from './map-route-item/map-route-item.component';
import { MapRouteMenuComponent } from './map-route-menu/map-route-menu.component';
import { MapRouteDetailsComponent } from './map-route-details/map-route-details.component';
import { NotificationComponent } from './notification/notification.component';
import { BottomNavigationComponent } from './bottom-navigation/bottom-navigation.component';
import { RoutePointComponent } from './route-point/route-point.component';

import { BottomNavigationModule } from './bottom-navigation/bottom-navigation.module';
import { MapRouteMenuRoutingModule } from './map-route-menu/map-route-menu-routing.module';
import { SharedModule} from './_shared/shared.module';
import { SearchModule} from './search/search.module';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ConfirmDirective } from './_shared/_directives/confirm.directive';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    MapComponent,
    MapRouteItemComponent,
    MapRouteMenuComponent,
    MapRouteDetailsComponent,
    BottomNavigationComponent,
    RoutePointComponent,
    NotificationComponent,
    ConfirmDirective
  ],
  imports: [
    SharedModule,
    AppRoutingModule,
    MapRouteMenuRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
