import { PersonModel } from './person.model'
import { RouteStatusEnum } from './route-status.enum'

export class RouteContract
{
    constructor() {
        this.AssignedTo = new PersonModel();
        this.CreatedBy = new PersonModel();        
    }

    public ID : string;
    public AssignedTo : PersonModel;
    public CreatedOn : Date;
    public ClosedOn : Date;
    public Status : RouteStatusEnum;
    public CreatedBy : PersonModel;
    public CompanyID : string;
    public ExpectedKilometers : number;
    public ExpectedMinutes : number;
} 