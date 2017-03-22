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
	booking: string;
	departure = {} as {
		name: string;
	    date: string;
	    time: string;
	    cost: number;
	};
	arrival = {} as {
		name: string;
	    date: string;
	    time: string;
	    cost: number;
	};
}

export class Departure {
    name: string;
    date: string;
    time: string;
    cost: number;
}

export class Arrival {
    name: string;
    date: string;
    time: string;
    cost: number;
}

export interface Traveler {
	firstName: string;
	middleName: string;
	lastName: string;
	nationality: string;
	dob: string;
	permanentAddress: string;
	email: string;
	telephone: string;
	emergencyContact: EmergencyContact;
	airportPickup: AirportPickup;
	hotel: Hotel;
	messageBox: string;
	status: boolean;
}

export class EmergencyContact {
	name: string;
	number: string;
	relation: string;
}

export class AirportPickup {
	confirmation: boolean;
	date: string;
	time: string;
}

export class Hotel {
	confirmation: boolean;
	name: string;
	address: string;
	telephone: string;
}