import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class MapService {
    private onSearch = new Subject<string>();
    
    onSearch$ = this.onSearch.asObservable();

    public search(query : string) : void {
        this.onSearch.next(query);
    }
}