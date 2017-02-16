import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'search',
  templateUrl: './search.template.html',
  styleUrls: ['./search.component.css']
})

export class SearchComponent {
    @Output() onSearch: EventEmitter<string> = new EventEmitter();

    private timer: number;
    private lastChange: Date;

    public onSeachKepress(query: string): void {
        var now = new Date();

        if (this.timer)
            clearTimeout(this.timer);

        this.timer = setTimeout(this.callOnSearchEvent.bind(this, query, now), 500);
    }

    private callOnSearchEvent(query: string, now: Date): void {
        if (!query) return;
        this.onSearch.emit(query);
    }
}