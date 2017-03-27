import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class BottomNavigationService {
    private defaultSize : BottomNavigationMenuSizeEnum = BottomNavigationMenuSizeEnum.Normal;
    private actualSize : BottomNavigationMenuSizeEnum = this.defaultSize;

    private onToggle = new Subject<boolean>();
    private onSizeChange = new Subject<BottomNavigationMenuSizeEnum>();
    private onChangeBottomNavigationVisibility = new Subject<boolean>();

    onToggle$ = this.onToggle.asObservable();
    onSizeChange$ = this.onSizeChange.asObservable();
    onChangeBottomNavigationVisibility$ = this.onChangeBottomNavigationVisibility.asObservable();

    public toggle(open : boolean) : void {
        this.onToggle.next(open);
    }

    public setBottomNavigationVisible(visible : boolean) : void{
        this.onChangeBottomNavigationVisibility.next(visible);
    }

    public getActualSize() : number{
        return this.actualSize;
    }

    public setSize(size : BottomNavigationMenuSizeEnum) : void {
        this.actualSize = size;
        this.onSizeChange.next(this.actualSize);
    }

    public resetSize() : void{
        this.actualSize = this.defaultSize;     
        this.onSizeChange.next(this.actualSize);
    }
}

export enum BottomNavigationMenuSizeEnum {
    Normal = 1,
    Mini = 2
}