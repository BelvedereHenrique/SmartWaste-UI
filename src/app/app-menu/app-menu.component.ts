import { Component, OnInit } from "@angular/core"

import { FloatActionButtonService, FloatActionButton, FloatActionButtonType }  from '../_shared/_services/float-action-button.service'
import { NotificationService, Notification } from '../_shared/_services/notification.service';

@Component({
    selector: "app-menu",
    templateUrl: "./app-menu.template.html",
    styleUrls: ['./app-menu.component.css']
})

export class AppMenuComponent implements OnInit{
    constructor(private _fabService : FloatActionButtonService,
                private _notificationService : NotificationService){

    }

    ngOnInit(){
        this._fabService.clear();

        this._fabService.addButton(new FloatActionButton("filter_list", 
                                                         "Filter Map", 
                                                         "filter", 
                                                         FloatActionButtonType.normal,
                                                         this.onFilterClick.bind(this), 1));
    }

    ngOnDestroy() {
        this._fabService.clear();
    }

    private onFilterClick() : void{
        this._notificationService.notify(new Notification("Must open the filter component", []));
    }
}