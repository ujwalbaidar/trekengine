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
	    hrTime: string;
	    minTime: string;
	    cost: number;
	};
	arrival = {} as {
		name: string;
	    date: string;
	    hrTime: string;
	    minTime: string;
	    cost: number;
	};
}

export class Traveler {
	firstName: string;
	middleName: string;
	lastName: string;
	nationality: string;
	dob: string;
	permanentAddress: string;
	email: string;
	telephone: string;
	emergencyContact={} as {
		name: string;
		number: string;
		relation: string;
	};
	airportPickup = {} as {
		confirmation: boolean;
		date: string;
		time: string;
	};
	hotel = {} as {
		name: string;
		number: string;
		relation: string;
	};
	messageBox: string;
	status: boolean;
}

// export class EmergencyContact {
// 	name: string;
// 	number: string;
// 	relation: string;
// }

// export class AirportPickup {
// 	confirmation: boolean;
// 	date: string;
// 	time: string;
// }

// export class Hotel {
// 	confirmation: boolean;
// 	name: string;
// 	address: string;
// 	telephone: string;
// }