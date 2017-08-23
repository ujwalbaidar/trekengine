import { Component, OnInit } from '@angular/core';
import { Checkout } from '../models/models';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'app-billing-checkout',
	templateUrl: './billing-checkout.component.html',
	styleUrls: ['./billing-checkout.component.css']
})
export class BillingCheckoutComponent implements OnInit {
	checkout: Checkout = <Checkout>{};
	constructor(private route: ActivatedRoute) { }

	ngOnInit() {
		switch (JSON.parse(localStorage.getItem('checkoutData')).product) {
			case "package":
				this.getPackageById();
				break;
			default:
				break;
		}
	}

	getPackageById(){
		let checkoutData = JSON.parse(localStorage.getItem('checkoutData'));
		console.log(checkoutData);
	}
}
