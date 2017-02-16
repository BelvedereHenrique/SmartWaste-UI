import { Component, Output, EventEmitter } from '@angular/core';

import { BottomNavigationButton } from "../_shared/_models/BottomNavigationButton.model";

@Component({
    selector: 'bottom-navigation',
    templateUrl: './bottom-navigation.template.html',
    styleUrls: ['./bottom-navigation.component.css']
})

export class BottomNavigationComponent {
    public buttons: BottomNavigationButton[] = [];
    @Output() onNavigationClick: EventEmitter<BottomNavigationButton> = new EventEmitter();

    constructor() {
        this.AddButton(new BottomNavigationButton('map', 'Map', this.onClick, "/", false));
        this.AddButton(new BottomNavigationButton('directions', 'Routes', this.onClick, "/routes", true));
        this.AddButton(new BottomNavigationButton('history', 'History', this.onClick, "", true));
        this.AddButton(new BottomNavigationButton('account_circle', 'Account', this.onClick, "/account", true));
    }

    public AddButton(button: BottomNavigationButton): void {
        this.buttons.push(button);
    }

    onClick = function (button: BottomNavigationButton) {
        for (var i: number = 0; i < this.buttons.length; i++) {
            this.buttons[i].setActive(false);
        }

        this.onNavigationClick.emit(button);
        button.setActive(true);
    }.bind(this);
}

