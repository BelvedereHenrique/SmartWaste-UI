import { Component, Input } from '@angular/core';
import { Router } from "@angular/router";

import { PointDetailedContract } from '../_shared/_models/point-detailed.model'
import { RouteHistoryModel } from '../_shared/_models/route-history.model'

@Component({
    selector: 'history',
    templateUrl: './history.template.html',
    styleUrls: ['./history.component.css']
})

export class HistoryComponent {
    @Input("history") history : RouteHistoryModel = new RouteHistoryModel();

    constructor(private router: Router) { }

} 