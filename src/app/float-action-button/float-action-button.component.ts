import { Component, Input, SimpleChanges, NgZone } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';

import { FloatActionButtonService, FloatActionButton, IVisibleConfig }  from '../_shared/_services/float-action-button.service'

@Component({
    selector: 'float-action-button',
    templateUrl: './float-action-button.template.html',
    styleUrls: ['./float-action-button.component.css']
})
export class FloatActionButtonComponent {    
    private buttons: FloatActionButton[];
    private showingNotification: boolean = false;

    constructor(private _fabService: FloatActionButtonService,
                private _ngZone: NgZone) {
        this.buttons = [];

        _fabService.onAddButton$.subscribe(this.addButton.bind(this));
        _fabService.onClear$.subscribe(this.clear.bind(this));
        _fabService.onNotificationShow$.subscribe(this.setNotificationShow.bind(this));
        _fabService.onSetVisible$.subscribe(this.setVisible.bind(this));
    }

    public clear() : void {
        this.buttons = [];
    }

    public setVisible(config: IVisibleConfig) : void{
        var button : FloatActionButton = this.buttons.find((b) => b.getName() == config.name);

        if(button){
            this._ngZone.run(() => {
                button.setVisible(config.visible);
            });
        }
    }

    public addButton(button : FloatActionButton) : void{
        this.buttons.push(button);
    }

    public setNotificationShow(show: boolean) : void {         
        this._ngZone.runGuarded(() => {                    
            this.showingNotification = show;
        });
    }

    public getButtons(): FloatActionButton[]{        
        return this.buttons.filter((b) => b.isVisible()).sort((a, b) => { 
            return b.position - a.position;
        });
    }
}

