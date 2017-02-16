import { Injectable } from "@angular/core";

@Injectable()
export class NotificationService {
    private notifications: Notification[] = [];
    private onNotifyCallback: Function;
    private onHideCallback: Function;

    public notificationAnimation: number = 300;
    public notificationTimeout: number = 5000;
    public showNotification: boolean = false;
    public index: number = -1;

    public showingNotification: Notification;

    constructor() {
        console.log("NotificationService Initalized!");
    }

    public ready(): void {

    }

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

    private callOnNotifyCallback(notification: Notification): void {
        this.onNotifyCallback(notification);
    }

    private callOnHideCallback(): void {
        if (this.onHideCallback)
            return this.onHideCallback();
    }

    public setOnNotify(callback: Function): void {
        this.onNotifyCallback = callback;
    }

    public setOnHide(callback: Function): void {
        this.onHideCallback = callback;
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
        this.callOnNotifyCallback(this.showingNotification);
        this.showNotification = true;

        //setTimeout(() => {
        if (this.showingNotification.GetTimeout() != 0)
            setTimeout(this.HideNotification.bind(this, this.index), this.showingNotification.GetTimeout() + this.notificationAnimation);
        //}, this.notificationAnimation);
    }

    private HideNotification(index: number) {
        if (index != this.index) return;
                
        this.callOnHideCallback();

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
    public buttons: NotificationButton[];
    public onClickCallback: Function;
    private timeout: number;

    constructor(title: String, buttons: NotificationButton[] = [], timeout: number = 5000) {
        this.title = title;
        this.buttons = buttons || [];
        this.timeout = timeout || 0;
        this.status = NotificationStatusEnum.Active;

        for (let i = 0; i < buttons.length; i++)
            this.AddButtonInternal(this.buttons[i]);
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