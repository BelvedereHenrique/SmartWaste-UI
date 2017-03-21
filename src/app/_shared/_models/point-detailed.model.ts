import { PointContract  } from "./point.model"
import { PointTypeEnum } from './point-type.enum'

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
}