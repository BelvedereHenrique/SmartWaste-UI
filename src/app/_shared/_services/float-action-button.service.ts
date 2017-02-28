import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class FloatActionButtonService {
    private onAddButton = new Subject<FloatActionButton>();
    private onClear = new Subject<FloatActionButton>();
    private onNotificationShow = new Subject<boolean>();

    onAddButton$ = this.onAddButton.asObservable();
    onClear$ = this.onClear.asObservable();
    onNotificationShow$ = this.onNotificationShow.asObservable();

    public clear() : void{
        this.onClear.next();
    }

    public addButton(button : FloatActionButton) : void{
        this.onAddButton.next(button);
    }

    public setNotificationShow(show: boolean) : void{
        this.onNotificationShow.next(show);
    }
}

export class FloatActionButton {
     private icon : string;
     private title: string;
     private name: string;
     public type: FloatActionButtonType;
     public click: Function;
     public position: number;

     constructor(icon: string, title: string, name: string, type: FloatActionButtonType, click: Function, position: number){
         this.icon = icon;
         this.title = title;
         this.name = name;
         this.type = type;
         this.click = click;
         this.position = position;
     }

     public onClick() : void{
         if(this.click)
            this.click();
     }
 }

 export enum FloatActionButtonType {
     normal = 1,
     mini = 2
 }