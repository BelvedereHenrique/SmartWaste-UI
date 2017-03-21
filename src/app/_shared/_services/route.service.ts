import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs';

import { ServiceHelpersService, ContentTypeEnum } from './service-helpers.service';
import { RouteDetailedContract } from '../_models/route-detailed.model'
import { RouteContract } from '../_models/route.model'
import { JsonModel } from '../_models/json-model'

import 'rxjs/add/operator/map';

@Injectable()
export class RouteService {
    constructor(private serviceHelper: ServiceHelpersService) {
        
    }

    public create(assignedToID: string, pointIDs: string[], expectedKilometers: number, expectedMinutes: number): Observable<any> {
        var data : any = {
            AssignedToID: assignedToID,
            PointIDs: pointIDs,
            ExpectedKilometers: expectedKilometers,
            ExpectedMinutes: expectedMinutes
        };

        return this.serviceHelper.post<any>("/Route/Create", data, true, ContentTypeEnum.JSON);
    }

    public recreate(routeID: string, assignedToID: string, pointIDs: string[], expectedKilometers: number, expectedMinutes: number): Observable<any> {
        var data : any = {
            RouteID : routeID,
            AssignedToID: assignedToID,
            PointIDs: pointIDs,
            ExpectedKilometers: expectedKilometers,
            ExpectedMinutes: expectedMinutes
        };

        return this.serviceHelper.post<any>("/Route/Recreate", data, true, ContentTypeEnum.JSON);
    }

    public GetDetailed(filter : RouteFilterContract): Observable<JsonModel<RouteDetailedContract>> {
        return this.serviceHelper.post<JsonModel<RouteDetailedContract>>("/Route/GetDetailed", filter, true, ContentTypeEnum.JSON);
    }

    public GetDetailedList(filter : RouteFilterContract): Observable<JsonModel<RouteDetailedContract[]>> {
        return this.serviceHelper.post<JsonModel<RouteDetailedContract[]>>("/Route/GetDetailedList", filter, true, ContentTypeEnum.JSON);
    }

    public GetOpenedRoutes(): Observable<JsonModel<RouteContract[]>> {
        return this.serviceHelper.post<JsonModel<RouteContract[]>>("/Route/GetOpenedRoutes", null, true, ContentTypeEnum.JSON);
    }

    public GetUserCreatedRoutes(): Observable<JsonModel<RouteContract[]>> {
        return this.serviceHelper.post<JsonModel<RouteContract[]>>("/Route/GetUserCreatedRoutes", null, true, ContentTypeEnum.JSON);
    }

    public Disable(routeID : string) : Observable<any> {
        let data : any = {
            RouteID: routeID
        };

        return this.serviceHelper.post<any>("/Route/Disable", data, true, ContentTypeEnum.JSON);
    }
}

export class RouteFilterContract
{
    public ID : string;
    public AssignedToID : string;
    public CreatedBy : string;
    public LoadUnassigned : boolean;
}