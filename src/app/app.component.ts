import { Component, OnInit, NgZone } from '@angular/core';
import { Router, Event, NavigationStart } from "@angular/router";

import { BottomNavigationButton } from "./_shared/_models/BottomNavigationButton.model";
import { SecurityManagerService } from "./_shared/_services/security-manager.service";
import { MapService, PushPinBuilder } from './_shared/_services/map.service'
import { MapPointLoaderService } from './_shared/_services/map-point-loader.service'
import { NotificationService, Notification } from './_shared/_services/notification.service'
import { BottomNavigationService } from './_shared/_services/bottom-navigation.service'
import { SecurityService } from './_shared/_services/security.service'

@Component({
    selector: 'app-root',
    templateUrl: "./app.template.html",
    styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
    public showMenu: boolean = true;    

    constructor(private _router: Router,
                private _securityManager: SecurityManagerService,
                private _locationLoaderService: MapPointLoaderService,
                private _notificationService: NotificationService,
                private _mapService : MapService,
                private _bottomNavigationService: BottomNavigationService,
                private _securityService : SecurityService,
                private _ngZone: NgZone) {

        this._router.events.subscribe((val : Event) => {     
            if(val instanceof NavigationStart)       
                this.VerifyMenuForUrl(val.url);
        });

        this._locationLoaderService.init((point : PushPinBuilder) => {
            this._ngZone.run(() => {
                this._router.navigate(["point", point.getData().ID]);                
            });     
        });

        this._mapService.onLoad.subscribe(() => {
            this._mapService.setUserLocation();
        });        

        this._bottomNavigationService.onToggle$.subscribe(this.toggleMenu.bind(this));
    }

    ngOnInit() {
        // NOTE: Check if the user is authenticated and setup the app;                
        this._securityService.updateUserInformation();
    }

    private toggleMenu(open : boolean) : void{                
            this.showMenu = open;   
    }

    private VerifyMenuForUrl(url: string) {
        if(url == "/")
            this._bottomNavigationService.toggle(false);            
        else 
            this._bottomNavigationService.toggle(true);            
    }
}