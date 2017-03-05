import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class BottomNavigationService {
    private onToggle = new Subject<boolean>();

    onToggle$ = this.onToggle.asObservable();

    public toggle(open : boolean) : void{
        this.onToggle.next(open);
    }
}