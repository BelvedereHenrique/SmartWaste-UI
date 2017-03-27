import { Component, Output, EventEmitter, NgZone, ViewChild } from '@angular/core';

import { MapService, SearchOptions } from "../_shared/_services/map.service";
import { SearchBarService } from '../_shared/_services/search-bar.service';

@Component({
  selector: 'search',
  templateUrl: './search.template.html',
  styleUrls: ['./search.component.css']
})

export class SearchComponent {    
    @ViewChild("search") private search;
    private results : any[] = [];
    private timeout: number;
    private autocompleteHeight: string = "0px";
    private autocompleteItemHeight: number = 40;
    private limitResults: number = 5;
    private visible : boolean = true;

    constructor(private _mapService : MapService,
                private _searchBarService : SearchBarService,
                private _ngZone: NgZone){
        this._searchBarService.onSearchBarChangeVisibility$.subscribe(this.onSearchBarChangeVisibility.bind(this));
    }

    private onSearchBarChangeVisibility(visible : boolean) : void {
        this.visible = visible;
    }

    public onSeachKepress(query: string): void {
        if(this.timeout)
            clearTimeout(this.timeout);
        this.timeout = setTimeout(this.callOnSearchEvent.bind(this, query), 100);        
    }

    private onSuggestionClick(result : any) : void {
        this._mapService.setView({
            bounds: result.bestView
        });

        this.search.nativeElement.value = result.address.formattedAddress;
        this.results = [];        
        this.autocompleteHeight = "0px";
    }

    private onClearSearch() : void{        
        this.results = [];
        this.search.nativeElement.value = "";
        this.autocompleteHeight = "0px";
    }

    private callOnSearchEvent(query: string): void {        
        if (!query) {
            this.onClearSearch();
            return;   
        }

        if(query != this.search.nativeElement.value)
            return;

        this._mapService.onLoad.subscribe(() => {
            this._mapService.search(query, (result) => {
                this._ngZone.run(() => {
                    if (!this.search.nativeElement.value) {
                        this.onClearSearch();
                    }else{
                        this.results = result.results;
                        this.autocompleteHeight = result.results.length * this.autocompleteItemHeight + "px";
                    }
                });            
            }, this.limitResults); 
        });        
    }
}