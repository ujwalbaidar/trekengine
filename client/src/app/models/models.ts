export class User {
	fname: string;
  	lname: string;
  	email: string;
  	password: string;
  	role: number;
}

export class Trip {
	name: string;
  	departureDate: any;
  	arrivalDate: any;
  	guide: string;
}

export class Booking {
	groupName: string;
	trip: string;
	travellerCount: number;
	totalCost: number;
	tripCost: number;
	advancePaid: number;
	dueAmount: number;
	totalPaid: number;
}