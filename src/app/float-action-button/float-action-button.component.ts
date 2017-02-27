import { Component, Input, SimpleChanges, NgZone } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';

import { FloatActionButtonService, FloatActionButton }  from '../_shared/_services/float-action-button.service'

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
    }

    public clear() : void {
        this.buttons = [];
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
        return this.buttons.sort((a, b) => { 
            return b.position - a.position;
        });
    }
}

