import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SearchBarService {
    private onSearchBarChangeVisibility : Subject<boolean> = new Subject<boolean>();

    onSearchBarChangeVisibility$ = this.onSearchBarChangeVisibility.asObservable();

    public setVisibility(visible : boolean) : void {
        this.onSearchBarChangeVisibility.next(visible);
    }
}