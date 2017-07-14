import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-audience-age-details',
	templateUrl: './audience-age-details.component.html',
	styleUrls: ['./audience-age-details.component.css']
})
export class AudienceAgeDetailsComponent implements OnInit {
	public minAge: String;
	public maxAge: String;
	constructor(private route: ActivatedRoute) { }

	ngOnInit() {
		this.route.params.subscribe(params => {
			this.minAge = params.minAge;
			this.maxAge = params.maxAge;
		});
	}

}
