import { Component, OnInit } from '@angular/core';
import { MovementsService, UserService } from '../../../services/index';
import { Booking } from '../../../models/models';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'booking-details',
    templateUrl: './src/app/movements/bookings/booking-details/booking-details.component.html'
})
export class BookingDetailsComponent implements OnInit  {
	bookingId: string;
	booking: any;
	trip: any;
	guide: any;
	flight: any;

	constructor(public movementService:MovementsService, public userService: UserService, private route: ActivatedRoute){
		this.route.params.subscribe(params => {
			this.bookingId = params['bookingId'];
	    });
	}
	ngOnInit(){
		this.getBookingDetails();
		this.getFlightDetails();
	}

	getBookingDetails(){
		this.movementService.getBooking([{bookingId:this.bookingId}])
			.subscribe(booking=>{
				this.booking = booking;
				if(booking['tripId'] !== undefined){
					this.movementService.getTripDetail([{_id:booking['tripId']}])
						.subscribe(trip=>{
							if(trip.length>0){
								this.trip = trip[0];
								if(trip[0]['guideId']){
									this.userService.queryUser([{email:trip[0]['guideId']}])
										.subscribe(guide=>{
											this.guide = guide;
										}, guideErr=>{
											console.log(guideErr);
										})
								}
							}
						}, tripErr=>{
							console.log(tripErr);
						});
				}
			}, bookingErr=>{
				console.log(bookingErr)
			});
	}

	getFlightDetails(){
		this.movementService.getFlightDetailsByParams([{bookingId: this.bookingId}])
			.subscribe(flight=>{
				this.flight = flight;
			}, flightErr=>{
				console.log(flightErr);
			});
	}
}
