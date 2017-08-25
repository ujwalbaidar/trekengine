import { Component, OnInit } from '@angular/core';
import { Checkout } from '../models/models';
import { ActivatedRoute, Router } from '@angular/router';
import { PackagesService } from '../services/packages.service';
import { BillingCheckoutService } from '../services/billing-checkout.service';
import { MdSnackBar } from '@angular/material';

@Component({
	selector: 'app-billing-checkout',
	templateUrl: './billing-checkout.component.html',
	styleUrls: ['./billing-checkout.component.css']
})
export class BillingCheckoutComponent implements OnInit {
	checkout: Checkout = <Checkout>{};
	storageData: any;
	checkoutItems: any;
	public paymentMethods = [
		{name: 'Paypal', value: 'Paypal', status: true},
		{name: 'eSewa', value: 'eSewa', status: false}
	];

	constructor(private route: ActivatedRoute, private _route:Router, public packagesService: PackagesService, public snackBar: MdSnackBar, public billingCheckoutService: BillingCheckoutService) { }

	ngOnInit() {
		this.checkout['paymentMethod'] = 'Paypal';
		this.storageData = JSON.parse(localStorage.getItem('checkoutData'));
		switch (this.storageData.product) {
			case "package":
				this.getPackageById();
				break;
			default:
				this.snackBar.open('Error has been occured to retrieve item information.', '', {
					duration: 3000,
				});
				setTimeout(()=>{ 
					this._route.navigate(['/app/package-billings']);
				}, 3000);
				break;
		}
	}

	getPackageById(){
		let checkoutData = JSON.parse(localStorage.getItem('checkoutData'));
		this.packagesService.queryPackageById(checkoutData.productId)
			.subscribe(packages=>{
				this.checkoutItems = packages;
			}, errror=>{
				this.snackBar.open('Error has been occured to retrieve item information.', '', {
					duration: 3000,
				});
				setTimeout(()=>{ 
					this._route.navigate(['/app/package-billings']);
				}, 3000);
			});
	}

	onPaymentMethodChange(entry){
		this.checkout['paymentMethod'] = entry.name;
	}

	submitCheckoutForm(){
		switch (this.storageData.product){
			case "package":
				this.submitPackageCheckout();
				break;
			default:
				this.snackBar.open('Error has been occured to to checkout item.', '', {
					duration: 3000,
				});
				setTimeout(()=>{ 
					this._route.navigate(['/app/package-billings']);
				}, 3000);
				break;
		}
	}

	submitPackageCheckout(){
		this.billingCheckoutService.processCheckoutPayment(localStorage.getItem('checkoutData'), this.checkout.paymentMethod)
			.subscribe(checkResponse=>{
				window.location.href = checkResponse.url;
			}, checkoutError=>{
				console.log('error')
				// debugger;
			})
	}
}
