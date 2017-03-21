import { Injectable } from "@angular/core";
import { Observable, Subject } from 'rxjs';

import { FloatActionButtonService } from './float-action-button.service'

@Injectable()
export class NotificationService {
    constructor(private _fabService: FloatActionButtonService){

    }

    private onNotify = new Subject<Notification>();
    private onHide = new Subject();

    public onNotify$ = this.onNotify.asObservable();
    public onHide$ = this.onHide.asObservable();

    private notifications: Notification[] = [];    

    public notificationAnimation: number = 300;
    public notificationTimeout: number = 5000;
    public showNotification: boolean = false;
    public index: number = -1;

    public showingNotification: Notification;

    public notify(notification: Notification): NotificationResult {
        notification.SetOnButtonClickCallback(this.onButtonNotificationClickCallback.bind(this));
        this.notifications.push(notification);

        if (this.showingNotification != null && this.showingNotification.GetTimeout() != 0) {
            this.HideNotification(this.index);
            return new NotificationResult(this.index + 1, this.OnNotificationCancel.bind(this));
        }
        else {
            this.CheckQueue();
            return new NotificationResult(this.index, this.OnNotificationCancel.bind(this));
        }
    }

    private CheckQueue(): void {
        if (this.showNotification)
            return;

        if (this.notifications.length > 0 && (this.notifications.length - 1 > this.index || this.index == -1))
            this.NextNotification();
    }

    private NextNotification() {
        this.index++;

        if (this.notifications[this.index].status == NotificationStatusEnum.Canceled) {
            this.CheckQueue();
            return;
        }

        this.showingNotification = this.notifications[this.index];

        this.onNotify.next(this.showingNotification);

        this.showNotification = true;
        this._fabService.setNotificationShow(true);

        //setTimeout(() => {
        if (this.showingNotification.GetTimeout() != 0)
            setTimeout(this.HideNotification.bind(this, this.index), this.showingNotification.GetTimeout() + this.notificationAnimation);
        //}, this.notificationAnimation);
    }

    private HideNotification(index: number) {
        if (index != this.index) return;
                
        this.onHide.next();
        this._fabService.setNotificationShow(false);
        
        setTimeout(() => {
            this.showNotification = false;            
            this.showingNotification = new Notification("", []);
            this.CheckQueue();            
        }, this.notificationAnimation);
    }

    private OnNotificationCancel(index: number): void {
        if (this.showingNotification.GetTimeout() == 0)
            this.HideNotification(index);
    }

    private onButtonNotificationClickCallback(): void {
        this.HideNotification(this.index);
    }
}

export class NotificationResult {
    private index: number;
    private onNotificationCancel: Function;

    constructor(index: number, onNotificationCancel: Function) {
        this.index = index;
        this.onNotificationCancel = onNotificationCancel;
    }

    public Cancel(): void {
        this.onNotificationCancel(this.index);
    }
}

export class Notification {
    public status: NotificationStatusEnum;
    public title: String;
    public buttons: NotificationButton[] = [];
    public onClickCallback: Function;
    private timeout: number;

    constructor(title: String | String[] | any[], buttons: NotificationButton[] = [], timeout: number = 5000) {
        this.title = this.getTitle(title);        
        this.timeout = timeout || 0;
        this.status = NotificationStatusEnum.Active;

        for (let i = 0; i < buttons.length; i++)
            this.AddButtonInternal(buttons[i]);
    }

    private getTitle(title: String | String[] | any[]) : String {
        var result : String = "";

        if(typeof title == "string")
            result = title;
        else
            (title as any[]).forEach((t) => result += " " + typeof t == "string" ? t : t.Message);

        return result;
    }

    public AddButton(text: string, callback: Function): void {
        this.AddButtonInternal(new NotificationButton(text, callback));
    }

    private AddButtonInternal(button: NotificationButton): void {
        button.setOnClickCallback(this.OnButtonClickCallback.bind(this));
        this.buttons.push(button);
    }

    public GetTimeout(): number {
        return this.timeout;
    }

    public OnButtonClickCallback(): void {
        if (this.onClickCallback) this.onClickCallback();
    }

    public SetOnButtonClickCallback(onButtonClickCallback: Function): void {
        this.onClickCallback = onButtonClickCallback;
    }

    public Cancel(): void {
        this.status = NotificationStatusEnum.Canceled;
    }
}

export class NotificationButton {
    public text: String;
    private onClickCallback: Function;
    private onUserClickEvent: Function;

    constructor(text, onClickEvent) {
        this.text = text;
        this.onUserClickEvent = onClickEvent;
    }

    public setOnClickCallback(onClickCallback: Function) {
        this.onClickCallback = onClickCallback;
    }

    public onClick() {
        if (this.onClickCallback) this.onClickCallback();
        if (this.onUserClickEvent) this.onUserClickEvent();
    }
}

export enum NotificationStatusEnum {
    Active = 1,
    Canceled = 2
}