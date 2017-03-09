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

export class Flight {
	departure?: Departure;
	arrival?: Arrival;
}

export class Departure {
    name?: string;
    date?: string;
    time?: string;
    cost?: number;
}

export class Arrival {
    name?: string;
    date?: string;
    time?: string;
    cost?: number;
}