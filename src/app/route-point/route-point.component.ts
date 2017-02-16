import { Component } from '@angular/core';
import { Router } from "@angular/router";

@Component({
    selector: 'route-point',
    templateUrl: './route-point.template.html',
    styleUrls: ['./route-point.component.css']
})

export class RoutePointComponent {
    constructor(private router: Router) { }

    routeID = 123231;
    title = "1º Ponto de Coleta";
    address = "Av. Gulmão Paraíba, 666, Centro Oeste, Dobrada - SP"
    imgUrl = "../../assets/img/reciclagem.png";
} 