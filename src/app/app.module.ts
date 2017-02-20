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
import { AccountMenuComponent } from './account-menu/account-menu.component';
import { AccountEnterpriseComponent } from './account-enterprise/account-enterprise.component';

import { NotificationService } from './_shared/_services/notification.service'
import { ServiceHelpersService } from './_shared/_services/service-helpers.service'
import { JwtService } from './_shared/_services/jwt.service'
import { SecurityManagerService } from './_shared/_services/security-manager.service';
import { MapService } from "./_shared/_services/map.service";

import { BottomNavigationModule } from './bottom-navigation/bottom-navigation.module';
import { MapRouteMenuRoutingModule } from './map-route-menu/map-route-menu-routing.module';
import { MapRouteDetailsRoutingModule } from './map-route-details/map-route-details-routing.module';
import { AccountMenuModule } from './account-menu/account-menu.module';
import { AccountMenuRoutingModule } from './account-menu/account-menu-routing.module';
import { AccountEnterpriseModule } from './account-enterprise/account-enterprise.module';
import { AccountEnterpriseRoutingModule } from './account-enterprise/account-enterprise-routing.module';
import { SharedModule} from './_shared/shared.module';
import { SearchModule} from './search/search.module';
import { SigninModule } from './signin/signin.module'
import { SigninRoutingModule } from './signin/signin.routing.module'

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
    AccountMenuComponent,
    AccountEnterpriseComponent,
    ConfirmDirective
  ],
  imports: [    
    RouterModule.forRoot([], {useHash: true}),
    AppRoutingModule,
    MapRouteMenuRoutingModule,
    SigninRoutingModule,
    AccountMenuRoutingModule,
    AccountEnterpriseRoutingModule,
    SharedModule,    
    MapRouteDetailsRoutingModule,
    AccountMenuModule,
    AccountEnterpriseModule,
    SigninModule
  ],
  providers: [NotificationService, ServiceHelpersService, JwtService, SecurityManagerService, MapService],
  bootstrap: [AppComponent]
})
export class AppModule { }
