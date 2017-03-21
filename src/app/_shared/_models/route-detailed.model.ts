import { PointDetailedContract } from './point-detailed.model'
import { RouteHistoryModel } from './route-history.model'
import { RouteContract } from './route.model'

export class RouteDetailedContract extends RouteContract
{
    constructor() {
        super();
        this.Points = [];
        this.Histories = [];
    }
    
    public Points : PointDetailedContract[];
    public Histories : RouteHistoryModel[];
} 