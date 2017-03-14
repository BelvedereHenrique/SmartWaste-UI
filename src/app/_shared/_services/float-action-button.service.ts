import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class FloatActionButtonService {
    private onAddButton = new Subject<FloatActionButton>();
    private onClear = new Subject<FloatActionButton>();
    private onNotificationShow = new Subject<boolean>();
    private onSetVisible = new Subject<IVisibleConfig>();

    onAddButton$ = this.onAddButton.asObservable();
    onClear$ = this.onClear.asObservable();
    onNotificationShow$ = this.onNotificationShow.asObservable();
    onSetVisible$ = this.onSetVisible.asObservable();

    public clear() : void{
        this.onClear.next();
    }

    public addButton(button : FloatActionButton) : void{
        this.onAddButton.next(button);
    }

    public setVisible(config : IVisibleConfig) : void {
        this.onSetVisible.next(config);
    }

    public setNotificationShow(show: boolean) : void{
        this.onNotificationShow.next(show);
    }
}

export class FloatActionButton {
     private icon : string;
     private title: string;
     private name: string;
     private visible: boolean;
     public type: FloatActionButtonType;
     public click: Function;
     public position: number;

     constructor(icon: string, title: string, name: string, type: FloatActionButtonType, click: Function, position: number, visible: boolean = true){
         this.icon = icon;
         this.title = title;
         this.name = name;
         this.type = type;
         this.click = click;
         this.position = position;
         this.visible = visible;
     }

     public getName() : string {
         return this.name;
     }

     public onClick() : void{
         if(this.click)
            this.click();
     }

     public setVisible(visible: boolean) : void{
         this.visible = visible;
     }

     public isVisible() : boolean {
         return this.visible;
     }
 }

export interface IVisibleConfig {
    name: string;
    visible: boolean;
}

 export enum FloatActionButtonType {
     normal = 1,
     mini = 2
 }