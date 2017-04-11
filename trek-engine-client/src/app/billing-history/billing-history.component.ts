import { Component, OnInit } from '@angular/core';
import { PackageBillingsService } from '../services/package-billings.service';
@Component({
  selector: 'app-billing-history',
  templateUrl: './billing-history.component.html',
  styleUrls: ['./billing-history.component.css']
})
export class BillingHistoryComponent implements OnInit {
	constructor(private billingService: PackageBillingsService) { }
	billings: any;
	billingError:any;
  	ngOnInit() {
  		this.getBillingHistory();
 	}

  	getBillingHistory(){
		this.billingService.getUserBillings()
			.subscribe(billings=>{
				this.billings = billings;
			}, error=>{
				this.billingError = error;
			});
  	}
}
