import { PersonModel } from './person.model'
import { RouteStatusEnum } from './route-status.enum'
import { PointDetailedContract } from './point-detailed.model'
import { RouteHistoryModel } from './route-history.model'

export class RouteContract
{
    constructor() {
        this.AssignedTo = new PersonModel();
        this.CreatedBy = new PersonModel();
        this.Points = [];
        this.Histories = [];
    }

    public ID : string;
    public AssignedTo : PersonModel;
    public CreatedOn : Date;
    public ClosedOn : Date;
    public Status : RouteStatusEnum;
    public CreatedBy : PersonModel;
    public Points : PointDetailedContract[];
    public Histories : RouteHistoryModel[];
    public CompanyID : string;
    public ExpectedKilometers : number;
    public ExpectedMinutes : number;
} 