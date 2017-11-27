import {Pipe,PipeTransform} from "@angular/core";
@Pipe({
    name: 'sumTotalPipe'
})
export class SumTotalPipe implements PipeTransform {
    transform(items: any[], attr: string): any {
    	return items.reduce((sum, value) =>{
			return sum + value[attr];
		}, 0);
    }
}