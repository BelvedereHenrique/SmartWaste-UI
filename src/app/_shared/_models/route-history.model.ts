import { RouteStatusEnum } from "./route-status.enum";

export class RouteHistoryModel
{
    public ID : string;
    public RouteID : string;
    public Status : RouteStatusEnum;
    public PersonID : string;
    public Reason : string;
}