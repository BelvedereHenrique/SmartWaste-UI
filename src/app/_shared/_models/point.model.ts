import { PointStatusEnum } from "./point-status.enum"
import { PointRouteStatusEnum } from "./point-route-status.enum"
import { PointTypeEnum } from "./point-type.enum"

export class PointContract
{
    public ID : string;
    public Status :PointStatusEnum;
    public PointRouteStatus:PointRouteStatusEnum;
    public Type:PointTypeEnum;
    public DeviceID : string;
    public AddressID : string;
    public Latitude : number;
    public Longitude: number;
    public PersonID : string;
    public UserID : string;
}