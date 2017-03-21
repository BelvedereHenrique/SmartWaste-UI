import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { BottomNavigationButton } from "../_shared/_models/BottomNavigationButton.model";
import { SecurityManagerService } from "../_shared/_services/security-manager.service";
import { SecurityModel } from '../_shared/_models/security.model'

@Component({
    selector: 'bottom-navigation',
    templateUrl: './bottom-navigation.template.html',
    styleUrls: ['./bottom-navigation.component.css']
})

export class BottomNavigationComponent {
    public buttons: BottomNavigationButton[] = [];
    @Output() onNavigationClick: EventEmitter<BottomNavigationButton> = new EventEmitter();

    constructor(private _securityManager: SecurityManagerService) {
        this.AddButton(new BottomNavigationButton('map', 'map', 'Map', this.onClick.bind(this), "/", true));
        this.AddButton(new BottomNavigationButton('routes', 'directions', 'Routes', this.onClick.bind(this), "/routes", false));
        this.AddButton(new BottomNavigationButton('history', 'history', 'History', this.onClick.bind(this), "", false));
        this.AddButton(new BottomNavigationButton('account', 'account_circle', 'Account', this.onClick.bind(this), "/account", false));
        this.AddButton(new BottomNavigationButton('signin', 'assignment_ind', 'Sign in', this.onClick.bind(this), "/signin", false));
        this.AddButton(new BottomNavigationButton('signout', 'power_settings_new', 'Sign out', this.signout.bind(this), "/signin", false));

        this._securityManager.onAuthChange$.subscribe(securityModel => {
            this.setup(securityModel);            
        });
    }

    private setup(securityModel: SecurityModel): void {         
        
        this.getButton("map").setVisible(true);
        this.getButton("routes").setVisible(securityModel != null ? securityModel.ShowRoutesMenu : false); 
        this.getButton("history").setVisible(securityModel != null);
        this.getButton("account").setVisible(securityModel != null); 
        this.getButton("signin").setVisible(securityModel == null);
        this.getButton("signout").setVisible(securityModel != null); 
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

    public signout() : void {
      this._securityManager.signout();
    }
    
    public onClick(button: BottomNavigationButton) {
        for (var i: number = 0; i < this.buttons.length; i++) {
            this.buttons[i].setActive(false);
        }

        this.onNavigationClick.emit(button);
        button.setActive(true);
    };
}

