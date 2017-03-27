import { Component, Input } from "@angular/core"
import { Router, ActivatedRoute, Params } from "@angular/router"

@Component({
    selector: "tab",
    templateUrl: "./tab.template.html",
    styleUrls: ["./tab.component.css"]
})

export class TabComponent {
    @Input("buttons") private buttons : TabButton[] = [];

    private getWidth() : string {
        if(!this.buttons || this.buttons.length == 0)
            return "0%";
                
        return (100 / this.buttons.length).toString() + "%";
    }

    private onClick(button : TabButton) : void {
        this.buttons.forEach(btn => btn.setActive(false));
        button.setActive(true);

        button.click();
    }
}

export class TabButton {
    private title : string;    
    private active : boolean = false;
    private onClick : Function;

    constructor(title: string, onClick : Function){
        this.title = title;
        this.onClick = onClick;
    }

    public setActive(active : boolean) : void{
        this.active = active;
    }

    public click() : void {
        if(this.onClick)
            this.onClick();
    }   
}