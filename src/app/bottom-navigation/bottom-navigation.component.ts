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
        this.AddButton(new BottomNavigationButton('map', 'Map', this.onClick, "/", true));
        this.AddButton(new BottomNavigationButton('directions', 'Routes', this.onClick, "/routes", true));
        this.AddButton(new BottomNavigationButton('history', 'History', this.onClick, "", true));
        this.AddButton(new BottomNavigationButton('account_circle', 'Account', this.onClick, "/account", true));
        this.AddButton(new BottomNavigationButton('assignment_ind', 'Sign in', this.onClick, "/signin", true));
    }

    public AddButton(button: BottomNavigationButton): void {
        this.buttons.push(button);
    }

    public getButtonsWidth(): string {
        if (this.buttons.length == 0)
            return "100%";

        return (100 / this.buttons.filter(button => button.visible).length).toString() + "%";
    }

    onClick = function (button: BottomNavigationButton) {
        for (var i: number = 0; i < this.buttons.length; i++) {
            this.buttons[i].setActive(false);
        }

        this.onNavigationClick.emit(button);
        button.setActive(true);
    }.bind(this);
}

