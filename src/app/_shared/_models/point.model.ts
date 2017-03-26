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

    public static getDataImageSvgIcon(selected : boolean, type: PointTypeEnum, status : PointStatusEnum, routeStatus: PointRouteStatusEnum, size : number = 24, strokeColor : string = "", strokeWidth : number = 0) : string {
        return "data:image/svg+xml;utf8," +  PointContract.getSvgIcon(selected, type, status, routeStatus, size, strokeColor, strokeWidth);
    }

    public static getSvgIcon(selected : boolean, type: PointTypeEnum, status : PointStatusEnum, routeStatus: PointRouteStatusEnum, size : number = 24, strokeColor : string = "", strokeWidth : number = 0) : string {
        let color : string = PointContract.getColor(status, routeStatus);
        
        if(selected && type == PointTypeEnum.User)
            return "<svg xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns='http://www.w3.org/2000/svg' height='" + size + "' width='" + size + "' version='1.1' xmlns:cc='http://creativecommons.org/ns#' xmlns:dc='http://purl.org/dc/elements/1.1/' viewBox='0 0 99.999862 99.998733'>	<g  transform='translate(-30.009 -41.504)'>		<path fill='" + color + "' d='m80.009 41.504a50 50 0 0 0 -50 50 50 50 0 0 0 50 49.996 50 50 0 0 0 50.001 -49.996 50 50 0 0 0 -50.001 -50zm-0.4263 5.0921c10.126 0 18.327 8.1844 18.327 18.29 0 10.105-8.2013 18.29-18.327 18.29s-18.327-8.1844-18.327-18.29c0-10.105 8.2013-18.29 18.327-18.29zm0 45.725c12.233 0 36.654 6.1268 36.654 18.29v9.1458h-21.256-30.795-21.256v-9.1458c0-12.163 24.421-18.29 36.654-18.29z'/>	</g></svg>";
       else if (selected)
            return "<svg xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns='http://www.w3.org/2000/svg' height='" + size + "' width='" + size + "' version='1.1' xmlns:cc='http://creativecommons.org/ns#' xmlns:dc='http://purl.org/dc/elements/1.1/' viewBox='0 0 99.999862 99.998733'>	<g transform='translate(-30.009 -41.504)'>		<path d='m49.145 0.033203a49.939 49.939 0 0 0 -49.94 49.94 49.939 49.939 0 0 0 49.94 49.939 49.939 49.939 0 0 0 49.939 -49.939 49.939 49.939 0 0 0 -49.939 -49.94zm-9.821 14.352h19.953l3.991 3.992h13.968v7.98h-55.871v-7.98h13.969l3.99-3.992zm-13.967 20.047h47.889v43.802c0 4.39-3.593 7.983-7.982 7.983h-31.926c-4.39 0-7.981-3.593-7.981-7.983v-43.802z' transform='translate(30.009 41.504)' fill='" + color + "'/>			</g></svg>";       
       else if(type == PointTypeEnum.User)
            return "<svg fill='" + color + "' height='" + size + "' viewBox='0 0 125 125' width='" + size + "' xmlns='http://www.w3.org/2000/svg'><g xmlns='http://www.w3.org/2000/svg' transform='translate(-30.009,-15.66)'><path stroke-width='" + strokeWidth + "' stroke='" + strokeColor + "' d='m84.171 16.179c-14.306 0-25.893 11.587-25.893 25.893s11.587 25.893 25.893 25.893 25.893-11.587 25.893-25.893-11.587-25.893-25.893-25.893zm0 64.732c-17.283 0-51.785 8.6741-51.785 25.893v12.945h30.031l21.754 21.754 21.754-21.754h30.031v-12.945c0-17.218-34.502-25.893-51.785-25.893z'/></g><path d='M0 0h24v24H0z' fill='none'/></svg>";
       else
            return "<svg fill='" + color + "' height='" + size + "' viewBox='0 0 125 125' width='" + size + "' xmlns='http://www.w3.org/2000/svg'><g xmlns='http://www.w3.org/2000/svg' transform='translate(-30.009,-15.66)'><path stroke-width='" + strokeWidth + "' stroke='" + strokeColor+ "' d='m43.162 127.43c0 7.6987 6.299 13.998 13.998 13.998h55.991c7.6987 0 13.998-6.299 13.998-13.998v-76.822h-83.986zm90.985-104.98h-24.496l-6.9988-6.9988h-34.994l-6.9988 6.9988h-24.496v17.998h97.984z'/></g><path d='M0 0h24v24H0z' fill='none'/></svg>";
    }

    public static getColor(type: PointStatusEnum, routeStatus: PointRouteStatusEnum): string {        
        if(routeStatus == PointRouteStatusEnum.InARoute){
            return "#FF9800";
        }
        else if(type == PointStatusEnum.Empty){
            return "#009688";
        }else if(type == PointStatusEnum.Full){
            return "#F44336";
        }else{
            return "#607D8B";
        }
    }
}