import { Component, Output, EventEmitter } from '@angular/core';

import { MapService } from "../_shared/_services/map.service";

@Component({
  selector: 'search',
  templateUrl: './search.template.html',
  styleUrls: ['./search.component.css']
})

export class SearchComponent {
    private timer: number;
    private lastChange: Date;

    constructor(private _mapService : MapService){

    }

    public onSeachKepress(query: string): void {
        var now = new Date();

        if (this.timer)
            clearTimeout(this.timer);

        this.timer = setTimeout(this.callOnSearchEvent.bind(this, query, now), 500);
    }

    private callOnSearchEvent(query: string, now: Date): void {
        if (!query) return;
        this._mapService.search(query);
    }
}