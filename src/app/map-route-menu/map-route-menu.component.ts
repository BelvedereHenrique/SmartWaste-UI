import { Component, OnInit } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { Subscription } from 'rxjs';

import { SlimLoadingBarService } from 'ng2-slim-loading-bar';
import { FloatActionButtonService, FloatActionButton, FloatActionButtonType }  from '../_shared/_services/float-action-button.service'
import { RouteService, RouteFilterContract }  from '../_shared/_services/route.service'
import { RouteContract } from '../_shared/_models/route.model'
import { NotificationService, Notification, NotificationButton, NotificationResult } from '../_shared/_services/notification.service'
import { SecurityModel } from '../_shared/_models/security.model'
import { SecurityManagerService } from '../_shared/_services/security-manager.service'
import { TabButton } from '../tab/tab.component';
import { RouteStatusEnum } from '../_shared/_models/route-status.enum';

@Component({
    selector: "map-route-menu",
    templateUrl: "./map-route-menu.template.html",
    styleUrls: ['./map-route-menu.component.css']
})

export class MapRouteMenuComponent implements OnInit{
    private routes : RouteContract[] = [];    
    private getListSubscription : Subscription = null;
    private onAuthChangeSubscription : Subscription = null;
    private routesLoaded : boolean = false;
    private tabButtons : TabButton[] = [];
    private userCanCreateRoutes : boolean = false;

    constructor(private _fabService : FloatActionButtonService,
                private _router : Router,
                private _activatedRoute : ActivatedRoute,
                private _routeService : RouteService,
                private _notificationService : NotificationService,
                private _slimLoadingBarService : SlimLoadingBarService,
                private _SecurityManagerService : SecurityManagerService){

    }

    ngOnInit(){
        this._fabService.clear();

        this._fabService.addButton(new FloatActionButton("add", 
                                                         "New Route", 
                                                         "add", 
                                                         FloatActionButtonType.normal,
                                                         this.onAddRouteClick.bind(this), 1));

        this.onAuthChangeSubscription = this._SecurityManagerService.onAuthChange$.subscribe(this.init.bind(this));
    }

    private addTabButtons(status : RouteStatusEnum) : void{
        this.tabButtons = [];

        let btnOpen : TabButton = new TabButton("Opened", () => {
            this._router.navigate(["routes", "opened"]);
        });

        btnOpen.setActive(status == RouteStatusEnum.Opened);

        let btnClosed : TabButton = new TabButton("Closed", () => {
            this._router.navigate(["routes", "closed"]);
        });

        btnClosed.setActive(status == RouteStatusEnum.Closed);

        let btnAll : TabButton = new TabButton("All", () => {
            this._router.navigate(["routes", "all"]);
        });

        btnAll.setActive(status == null);

        this.tabButtons.push(btnOpen);
        this.tabButtons.push(btnClosed);
        this.tabButtons.push(btnAll);
    }

    private init(model : SecurityModel) : void{
        if(!model || !model.ShowRoutesMenu)
        {
            this._router.navigate(["/"]);
            return;
        }

        this.userCanCreateRoutes = model.CanSaveRoutes;

        this._fabService.setVisible({
            name: "add",
            visible: model.CanSaveRoutes
        });

        this._activatedRoute.params.subscribe((params) => {
            let status : RouteStatusEnum = this.GetStatusFilter(params["status"]);
            this.LoadUserRoutes(status);
            this.addTabButtons(status);
        });
    }

    private GetStatusFilter(urlStatus : string) : RouteStatusEnum {
        let status : RouteStatusEnum = null;
        
        if(!urlStatus || urlStatus == "opened")
            status = RouteStatusEnum.Opened
        else if (urlStatus == "closed")
            status = RouteStatusEnum.Closed;        

        return status;
    }

    private unsubscribe() : void{
        if(this.getListSubscription)
            this.getListSubscription.unsubscribe();

        if(this.onAuthChangeSubscription)
            this.onAuthChangeSubscription.unsubscribe();
    }

    private LoadUserRoutes(status : RouteStatusEnum) : void {
        this._slimLoadingBarService.start();

        this.routesLoaded = false;
        this.routes = [];

        if(this.getListSubscription)
            this.getListSubscription.unsubscribe();

        this.getListSubscription = this._routeService.GetList(status).subscribe((jsonModel) => {
            this._slimLoadingBarService.complete();
            if(jsonModel.Success){
                this.routes =  jsonModel.Result.sort((a : RouteContract, b : RouteContract) => {
                    return new Date(a.CreatedOn).getTime() - new Date(b.CreatedOn).getTime();                    
                });
                this.routesLoaded = true;
            }else{
                this._notificationService.notify(new Notification(jsonModel.Messages, [], 6000));
            }
        }, jsonError => {
            this._slimLoadingBarService.complete();
            let tryAgainButton : NotificationButton = new NotificationButton("Try again", () => {
                this.LoadUserRoutes(status);
            });
            this._notificationService.notify(new Notification("There were errors to load the routes.", [
                tryAgainButton
            ], 6000));
        });
    }

    ngOnDestroy() {
        this.unsubscribe();
        this._fabService.clear();
    }

    private onAddRouteClick() : void{
        this._router.navigate(["/route/builder"]);
    }
}