import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'duration'})
export class DurationPipe implements PipeTransform {
    transform(value: number): string {
        if(!value && value !== 0)
            return "-";

        let hours : number = value / 60;
        let hoursInt : number = Math.floor(hours);
        let minutesLeft : number = Math.round((hours - hoursInt) * 60);

        let result : string = "";

        result += this.addZero(hoursInt);
        result += ":";
        result += this.addZero(minutesLeft);

        return result;
    }

    private addZero(n : number) : string {
        if(n >= 0 && n <= 9)
            return "0" + n.toString();
        else
            return n.toString();
    }
}