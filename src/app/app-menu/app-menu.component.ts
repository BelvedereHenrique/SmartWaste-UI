import { Component, OnInit } from "@angular/core";

import { FloatActionButtonService, FloatActionButton, FloatActionButtonType }  from '../_shared/_services/float-action-button.service';
import { NotificationService, Notification, NotificationResult } from '../_shared/_services/notification.service';
import { SecurityManagerService } from '../_shared/_services/security-manager.service';
import { SecurityModel } from '../_shared/_models/security.model';
import { PointService } from '../_shared/_services/point.service';

@Component({
    selector: "app-menu",
    templateUrl: "./app-menu.template.html",
    styleUrls: ['./app-menu.component.css']
})

export class AppMenuComponent implements OnInit{
    constructor(private _fabService : FloatActionButtonService,
                private _notificationService : NotificationService,
                private _securityManagerService: SecurityManagerService,
                private _pointService : PointService){

    }

    public ngOnInit() : void {
        this._fabService.clear();

        this._fabService.addButton(new FloatActionButton("filter_list", 
                                                         "Filter Map", 
                                                         "filter", 
                                                         FloatActionButtonType.normal,
                                                         this.onFilterClick.bind(this), 1, false));

        this._fabService.addButton(new FloatActionButton("delete", 
                                                         "Warn trashcan as full", 
                                                         "warn_trashcan_as_full", 
                                                         FloatActionButtonType.normal,
                                                         this.onWarnTrashcanAsFull.bind(this), 1, false));

        this._securityManagerService.onAuthChange$.subscribe(this.setupSecurity.bind(this));
    }

    ngOnDestroy() {
        this._fabService.clear();
    }

    private setupSecurity(securityModel : SecurityModel) : void {         
        this._fabService.setVisible({
            name : 'warn_trashcan_as_full',
            visible : securityModel && securityModel.CanSetTrashcanAsFull
        });
    }

    private onWarnTrashcanAsFull() : void {
        var notification = new Notification("Would you like set your trashcan as full?", [], 5000);

        notification.AddButton("Yes", this.setTrashCanAsFull.bind(this));
        notification.AddButton("No", this.cancelSetTrashCanAsFull.bind(this));

        this._notificationService.notify(notification);
    }

    private setTrashCanAsFull() : void {
        let loadingNotification : Notification = new Notification("Setting trashcan as full...", [], 0);
        let loadingNotificationResult : NotificationResult = this._notificationService.notify(loadingNotification);

        this._pointService.setTrashcanAsFull().subscribe((jsonModel) => {
            loadingNotificationResult.Cancel();

            if(jsonModel.Success && jsonModel.Result.Success){
                this._notificationService.notify(new Notification(
                        jsonModel.Result.Messages,
                        [],
                        5000
                ));
            } else {
                this._notificationService.notify(
                    new Notification(
                        !jsonModel.Success ? jsonModel.Messages : jsonModel.Result.Messages,
                        [],
                        5000
                    )
                );
            }
        }, (jsonErrorModel) => {
            loadingNotificationResult.Cancel();
            
            var errorNotification : Notification = new Notification("It wasn't possible to set your trashcan as full.", [], 5000);
            errorNotification.AddButton("Try again", () =>{
                this.setTrashCanAsFull();
            });
            this._notificationService.notify(errorNotification);
        });
    }

    private cancelSetTrashCanAsFull() : void{
        this._notificationService.notify(new Notification("Ok, when you're ready, we'll be here.", [], 5000));
    }

    private onFilterClick() : void{
        this._notificationService.notify(new Notification("Must open the filter component", []));
    }
}