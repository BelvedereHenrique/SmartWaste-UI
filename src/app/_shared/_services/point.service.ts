import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs';

import { ServiceHelpersService, ContentTypeEnum } from './service-helpers.service';
import { JwtModel } from '../_models/jwt.model'

import { PointStatusEnum } from "../_models/point-status.enum"
import { PointRouteStatusEnum } from "../_models/point-route-status.enum"
import { PointTypeEnum } from "../_models/point-type.enum"
import { PointContract } from "../_models/point.model"
import { PointDetailedContract } from "../_models/point-detailed.model"
import { JsonModel } from "../_models/json-model"
import { PointDetailedHistoriesContract } from '../_models/point-detailed-histories.model'

import 'rxjs/add/operator/map';

@Injectable()
export class PointService {
    constructor(private serviceHelper: ServiceHelpersService) {
        
    }

    public GetList(search: PointSearch): Observable<JsonModel<PointContract[]>> {
        return this.serviceHelper.post<JsonModel<PointContract[]>>("/Point/GetList", search, true, ContentTypeEnum.JSON);
    }

    public GetDetailed(search: PointSearch) : Observable<JsonModel<PointDetailedHistoriesContract>>{
        return this.serviceHelper.post<JsonModel<PointDetailedHistoriesContract>>("/Point/GetDetailed", search, true, ContentTypeEnum.JSON);
    }

    public GetDetailedList(search: PointSearch) : Observable<JsonModel<PointDetailedContract[]>>{
        return this.serviceHelper.post<JsonModel<PointDetailedContract[]>>("/Point/GetDetailedList", search, true, ContentTypeEnum.JSON);
    }

    public GetPeopleFromCompany() : Observable<any>{
        return this.serviceHelper.post<any>("/Point/GetPeopleFromCompany", null, true, ContentTypeEnum.JSON);
    } 

    public setTrashcanAsFull() : Observable<JsonModel<any>> {
        return this.serviceHelper.post<JsonModel<any>>("/Point/SetAsFull", null, true, ContentTypeEnum.JSON);
    }

    public GetOwnPoint() : Observable<JsonModel<PointDetailedContract>> {
        return this.serviceHelper.post<JsonModel<PointDetailedContract>>("/Point/GetOwnPoint", null, true, ContentTypeEnum.JSON);
    }    
}

export class PointSearch {
    constructor (){
        this.IDs = [];
        this.NotIDs = [];
        this.AlwaysIDs = [];
    }

    public Northwest: PointCoordinator;
    public Southeast: PointCoordinator;
    public IDs: string[];
    public NotIDs: string[];
    public AlwaysIDs: string[];
    public PersonID: string;
    public Status : PointStatusEnum;
    public PointRouteStatus : PointRouteStatusEnum;
    public Type : PointTypeEnum;
}

export class PointCoordinator{
    public Latitude: number;
    public Longitude: number;
}