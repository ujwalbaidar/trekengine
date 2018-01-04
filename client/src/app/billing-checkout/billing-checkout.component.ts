import { Component, OnInit } from '@angular/core';
import { Checkout } from '../models/models';
import { ActivatedRoute, Router, Params } from '@angular/router';
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
	checkoutMessage: String;
	storageData: any;
	checkoutItems: any;
	processCheckout: Boolean = false;
	submitCheckoutBtn: Boolean = false;

	public paymentMethods = [
		{name: 'Paypal', value: 'Paypal', status: true},
		// {name: 'eSewa', value: 'eSewa', status: false}
	];

	constructor(private route: ActivatedRoute, private _route:Router, public packagesService: PackagesService, public snackBar: MdSnackBar, public billingCheckoutService: BillingCheckoutService) { }

	ngOnInit() {
		this.checkout['paymentMethod'] = 'Paypal';
		this.storageData = JSON.parse(localStorage.getItem('checkoutData'));
		if(this.storageData !== null){
			this.route.params.subscribe((params:Params)=>{
				if(params.success !== undefined){
					if(Boolean(params.success) === true){
						this.showPayamentSuccessInfo();
					}else{
						this.showPaymentErrorInfo();
					}
				}else{
					switch (this.storageData.product) {
						case "package":
							this.processCheckout = true;
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
			});
		}else{
			this.snackBar.open('You have not select anything to checkout. Please select a package first.', '', {
					duration: 3000,
				});
				setTimeout(()=>{ 
					this._route.navigate(['/app/package-billings']);
				}, 3000);
		}
	}

	showPayamentSuccessInfo(){
		localStorage.clear();
		this.checkoutMessage = "Payment process has been completed succefully.";
	}

	showPaymentErrorInfo(){
		localStorage.clear();
		this.checkoutMessage = "Error has been occured on Payment process. Please Try again.";
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
		this.submitCheckoutBtn = true;
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
				if(checkResponse.success === true){
					window.location.href = checkResponse.url;
				}else{
					this.snackBar.open(checkResponse.msg, '', {
						duration: 3000,
					});
					setTimeout(()=>{ 
						this._route.navigate(['/app/package-billings']);
					}, 3000);
				}
			}, checkoutError=>{
				this.snackBar.open('Error has been occured in checkout data.', '', {
						duration: 3000,
					});
					setTimeout(()=>{ 
						location.reload();
					}, 3000);
			});
	}
}
