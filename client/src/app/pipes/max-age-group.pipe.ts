import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'maxAgeGroup'
})
export class MaxAgeGroupPipe implements PipeTransform {

	transform(arrays: any, args?: any): any {
		arrays.sort(function(a, b) {
			return b.countAge - a.countAge;
		});
		return arrays[0]['ageGroup'];
	}

}
