import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { BottomNavigationButton } from "../_shared/_models/BottomNavigationButton.model";
import { SecurityManagerService } from "../_shared/_services/security-manager.service";

@Component({
    selector: 'bottom-navigation',
    templateUrl: './bottom-navigation.template.html',
    styleUrls: ['./bottom-navigation.component.css']
})

export class BottomNavigationComponent {
    public buttons: BottomNavigationButton[] = [];
    @Output() onNavigationClick: EventEmitter<BottomNavigationButton> = new EventEmitter();

    constructor(private _securityManager: SecurityManagerService) {
        this.AddButton(new BottomNavigationButton('map', 'map', 'Map', this.onClick, "/", true));
        this.AddButton(new BottomNavigationButton('routes', 'directions', 'Routes', this.onClick, "/routes", false));
        this.AddButton(new BottomNavigationButton('history', 'history', 'History', this.onClick, "", false));
        this.AddButton(new BottomNavigationButton('account', 'account_circle', 'Account', this.onClick, "/account", false));
        this.AddButton(new BottomNavigationButton('signin', 'assignment_ind', 'Sign in', this.onClick, "/signin", false));
        this.AddButton(new BottomNavigationButton('signout', 'power_settings_new', 'Sign out', this.signout, "/signin", false));

        this._securityManager.onAuthChange$.subscribe(isAuthenticated => {
            this.setup(isAuthenticated);            
        });
    }

    private setup(isAuthenticated: boolean): void {
        this.getButton("map").setVisible(true);
        this.getButton("routes").setVisible(isAuthenticated);
        this.getButton("history").setVisible(isAuthenticated);
        this.getButton("account").setVisible(isAuthenticated);
        this.getButton("signin").setVisible(!isAuthenticated);
      this.getButton("signout").setVisible(isAuthenticated);
    }

    private getButton(name : string) : BottomNavigationButton {
        return this.buttons.filter(b => b.name == name)[0];
    }

    public AddButton(button: BottomNavigationButton): void {
        this.buttons.push(button);
    }

    public getButtonsWidth(): string {
        if (this.buttons.length == 0)
            return "100%";

        return (100 / this.buttons.filter(button => button.visible).length).toString() + "%";
    }
    signout = function () {
      localStorage.removeItem('jwt');
      location.reload();
    }
    
    onClick = function (button: BottomNavigationButton) {
        for (var i: number = 0; i < this.buttons.length; i++) {
            this.buttons[i].setActive(false);
        }

        this.onNavigationClick.emit(button);
        button.setActive(true);
    }.bind(this);
}

