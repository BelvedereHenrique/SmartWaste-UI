import { PointContract  } from "./point.model"
import { PointTypeEnum } from './point-type.enum'
import { PointStatusEnum } from './point-status.enum'
import { PointRouteStatusEnum } from './point-route-status.enum'

export class PointDetailedContract extends PointContract {
    public Line1 : string;
    public Line2 : string;
    public ZipCode : string;
    public Neighborhood : string;
    public CityID : number;
    public CityName : string;
    public StateID : number;
    public StateName : string;
    public StateAlias : string;
    public CountryID : number;
    public CountryName : string;
    public CountryAlias : string;
    public Name : string;

    public static getFullAddress(p : PointDetailedContract) : string {
        let address : string = "";

        address += this.fomartAddressPart(address, p.Line1);
        address += this.fomartAddressPart(address, p.Line2);
        address += this.fomartAddressPart(address, p.Neighborhood ? p.Neighborhood : "");
        address += this.fomartAddressPart(address, p.CityName);
        address += this.fomartAddressPart(address, p.StateAlias);
        address += this.fomartAddressPart(address, p.CountryAlias);

        return address;
    }

    private static fomartAddressPart(address: string, part: string) : string {
        if(!part)
            return "";

        if(address && part)
            part = ", " + part;

        return part;
    }

    public static getIconClass(pointDetailed : PointDetailedContract) : string {
        if(pointDetailed.Type == PointTypeEnum.User)
            return "person";
        else 
            return "delete";
    }

    public static getStatusName(pointDetailed : PointDetailedContract) : string{
        if(pointDetailed.Status == PointStatusEnum.Empty)
            return "Empty";
        else
            return "Full";
    }

    public static getRouteStatusName(pointDetailed : PointDetailedContract) : string{
        if(pointDetailed.PointRouteStatus == PointRouteStatusEnum.Free)
            return "Free";
        else
            return "In a Route";
    }
}