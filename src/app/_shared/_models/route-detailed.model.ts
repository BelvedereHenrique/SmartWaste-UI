import { RoutePointContract } from './route-point.model'
import { RouteHistoryModel } from './route-history.model'
import { RouteContract } from './route.model'

export class RouteDetailedContract extends RouteContract
{
    constructor() {
        super();
        this.Histories = [];
        this.RoutePoints = [];
    }
    
    public RoutePoints : RoutePointContract[];
    public Histories : RouteHistoryModel[];
} 