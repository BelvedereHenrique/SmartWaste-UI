import { PointDetailedContract } from './point-detailed.model'

export class RoutePointContract
{    
    public Point : PointDetailedContract;
    public ID : string;
    public IsCollected : boolean;
    public CollectedBy : string;
    public CollectedOn : Date;
    public Reason : string;
} 