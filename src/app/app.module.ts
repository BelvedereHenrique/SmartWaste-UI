import { NgModule } from '@angular/core';
import { JsonpModule } from '@angular/http'
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
import { FloatActionButtonComponent } from './float-action-button/float-action-button.component';
import { MapControlsComponent } from './map-controls/map-controls.component'
import { AppMenuComponent }   from './app-menu/app-menu.component'
import { AccountPersonalComponent } from './account-personal/account-personal.component';
import { RouteBuilderComponent } from './route-builder/route-builder.component';
import { PasswordComponent } from './password/password.component';

import { NotificationService } from './_shared/_services/notification.service';
import { ServiceHelpersService } from './_shared/_services/service-helpers.service';
import { JwtService } from './_shared/_services/jwt.service';
import { SecurityManagerService } from './_shared/_services/security-manager.service';
import { MapService } from "./_shared/_services/map.service";
import { PointService } from "./_shared/_services/point.service"
import { MapPointLoaderService } from './_shared/_services/map-point-loader.service';
import { MapRouteMakerService } from './_shared/_services/map-route-maker.service';
import { FloatActionButtonService }  from './_shared/_services/float-action-button.service';
import { BottomNavigationService } from './_shared/_services/bottom-navigation.service';
import { RouteService } from './_shared/_services/route.service';
import { PasswordService } from './_shared/_services/password.service';

import { BottomNavigationModule } from './bottom-navigation/bottom-navigation.module';
import { MapRouteMenuRoutingModule } from './map-route-menu/map-route-menu-routing.module';
import { MapRouteDetailsRoutingModule } from './map-route-details/map-route-details-routing.module';
import { AccountMenuModule } from './account-menu/account-menu.module';
import { AccountMenuRoutingModule } from './account-menu/account-menu-routing.module';
import { AccountEnterpriseModule } from './account-enterprise/account-enterprise.module';
import { AccountEnterpriseRoutingModule } from './account-enterprise/account-enterprise-routing.module';
import { AccountPersonalModule } from './account-personal/account-personal.module';
import { AccountPersonalRoutingModule } from './account-personal/account-personal-routing.module';
import { SharedModule} from './_shared/shared.module';
import { SearchModule} from './search/search.module';
import { SigninModule } from './signin/signin.module'
import { SigninRoutingModule } from './signin/signin.routing.module'
import { AppMenuRoutingModule }   from './app-menu/app-menu-routing.module'
import { SlimLoadingBarModule } from 'ng2-slim-loading-bar';
import { RouteBuilderRoutingModule } from './route-builder/route-builder-routing.module'
import { PasswordRoutingModule } from './password/password.routing.module'

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
    ConfirmDirective,
    FloatActionButtonComponent,
    MapControlsComponent,
    AppMenuComponent,
    AccountPersonalComponent,
    ConfirmDirective,
    RouteBuilderComponent,
    PasswordComponent
  ],
  imports: [    
    RouterModule.forRoot([], {useHash: true}),
    SlimLoadingBarModule.forRoot(),
    AppRoutingModule,
    MapRouteMenuRoutingModule,
    SigninRoutingModule,
    AccountMenuRoutingModule,
    AccountEnterpriseRoutingModule,
    AccountPersonalRoutingModule,
    SharedModule,    
    MapRouteDetailsRoutingModule,
    AccountMenuModule,
    AccountEnterpriseModule,
    SigninModule,
    AppMenuRoutingModule,
    AccountPersonalModule,
    SigninModule,
    RouteBuilderRoutingModule,
    PasswordRoutingModule,
    JsonpModule
  ],
  providers: [NotificationService, 
              ServiceHelpersService, 
              JwtService, 
              SecurityManagerService, 
              MapService,
              PointService,
              MapPointLoaderService,
              MapRouteMakerService,
              FloatActionButtonService,
              BottomNavigationService,
              PasswordService,
              RouteService,
              ],
  bootstrap: [AppComponent]
})
export class AppModule { }
