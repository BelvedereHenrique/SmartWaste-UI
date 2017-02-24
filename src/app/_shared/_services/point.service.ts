import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs';

import { ServiceHelpersService, ContentTypeEnum } from './service-helpers.service';
import { JwtModel } from '../_models/jwt.model'

import 'rxjs/add/operator/map';

@Injectable()
export class PointService {
    constructor(private serviceHelper: ServiceHelpersService) {
        
    }

    public GetList(search: PointSearch): Observable<any> {
        return this.serviceHelper.post<any>("/Point/GetList", search, true, ContentTypeEnum.JSON);
    }
}

export class PointSearch {
    public northWest: PointCoordinator;
    public southEast: PointCoordinator;
}

export class PointCoordinator{
    public latitude: number;
    public longitude: number;
}