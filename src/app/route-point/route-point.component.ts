import { Component, Input } from '@angular/core';
import { Router } from "@angular/router";

import { PointDetailedContract } from '../_shared/_models/point-detailed.model'

@Component({
    selector: 'route-point',
    templateUrl: './route-point.template.html',
    styleUrls: ['./route-point.component.css']
})

export class RoutePointComponent {
    @Input("point") point : PointDetailedContract = new PointDetailedContract();

    constructor(private router: Router) { }

    public getFullAddress(point : PointDetailedContract) : string{
        return PointDetailedContract.getFullAddress(point);
    }

    imgUrl = "../../assets/img/reciclagem.png";
} 