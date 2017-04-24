export class User {
	fname: string;
  	lname: string;
  	firstName: string;
  	lastName: string;
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
		hrTime:string;
		minTime: string;
	};
	hotel = {} as {
		name: string;
		number: string;
		relation: string;
	};
	messageBox: string;
	status: boolean;
}

export class FeaturePackage {
	packageName: string;
	packageValue: string;
	packageDesc: string;
	cost: number;
	validDays: number;
	features: any;
}

export class AppFeatures {
	name: string;
	description: string;
	status: boolean;
}

export class AppPackage {
	name: string;
	description: string;
	cost: number;
	validDays: number;
	days: number;
	trialPeriod: number;
	features: AppFeatures[];
}

export class BillingHistory {
    packageType : string;
    packageCost : number;
    activatesOn : any;
    expiresOn : number;
    remainingDays : number;
    usesDays : number;
    status : boolean;
    onHold : boolean;
    freeUser : boolean;
    features : any;
    activatedDate: Object;
    expiryDate: Object;
}

export class ProfilePassword {
	userPassword: string;
	confirmPassword: string;
}