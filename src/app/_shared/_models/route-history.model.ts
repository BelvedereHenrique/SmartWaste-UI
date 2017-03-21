import { RouteStatusEnum } from "./route-status.enum";
import { PersonModel  } from './person.model'

export class RouteHistoryModel
{
    public ID : string;
    public RouteID : string;
    public Status : RouteStatusEnum;
    public Person : PersonModel;
    public Reason : string;
    public Date : Date;
}