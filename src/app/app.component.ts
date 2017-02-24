import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { BottomNavigationButton } from "./_shared/_models/BottomNavigationButton.model";
import { SecurityManagerService } from "./_shared/_services/security-manager.service";
import { PointLoaderService } from './_shared/_services/point-loader.service'

@Component({
    selector: 'app-root',
    templateUrl: "./app.template.html",
    styleUrls: ["./app.component.css"],
    providers: [PointLoaderService]
})
export class AppComponent implements OnInit {
    public showMenu: boolean = true;    

    constructor(private _router: Router,
                private _securityManager: SecurityManagerService,
                private _locationLoaderService: PointLoaderService) {

        this._router.events.subscribe((val) => {
            this.VerifyMenuForUrl(val.url);
        });

    }

    ngOnInit() {
        // NOTE: Check if the user is authenticated and setup the app;        
        this._securityManager.checkAuth();
    }

    private VerifyMenuForUrl(url: string) {
        if (url == "/")
            this.showMenu = false;
        else
            this.showMenu = true;
    }

    public onNavigationClick2(button: BottomNavigationButton) : void {
        
    };
}