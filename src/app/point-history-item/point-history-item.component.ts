import { Component, Input } from '@angular/core';

import { PointHistoryContract } from '../_shared/_models/point-history.model'

@Component({
    selector: 'point-history-item',
    templateUrl: './point-history-item.template.html',
    styleUrls: ['./point-history-item.component.css']
}) 

export class PointHistoryItemComponent {
    @Input("history") history : PointHistoryContract = new PointHistoryContract();
    
    constructor() { }
} 