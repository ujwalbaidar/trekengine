const mongoose = require('mongoose');
const Bookings = mongoose.model('Bookings');

const exportBookings = (req, res)=>{
	if(req.headers && parseInt(req.headers.role) === 20){
		switch(req.query.type){
			case 'csv':
				getBookings(req.headers.userId)
					.then(bookings=>{
						generateBookingsCsv(bookings)
							.then(csvArr=>{
								res.status(200).json({data: csvArr});
							})
					})
					.catch(bookingsErr=>{
						res.status(400).json({data: bookingsErr});
					});
				break;
			default:

		}
	}else{
		res.status(401).json({success:false, data: {}, message: 'You are not authorized for this request.'});
	}
}

const generateBookingsCsv = (data)=>{
	return new Promise(resolve=>{
		let csvArr = [];
		for(let i=0; i<data.length; i++){
			let csvData = {
				'Group Name': data[i]['groupName'],
				'Trip Name': data[i]['tripName'],
				'Total Members': data[i]['travellerCount'],
				'Trip Cost': data[i]['tripCost'],
				'Total Name': data[i]['totalCost'],
				'Advance Paid': data[i]['advancePaid'],
				'Due Amount': data[i]['dueAmount']
			};

			if(data[i]['trip']!==undefined){
				csvData['Trip Departure Date'] = data[i]['trip']['departureDate']['formatted'];
				csvData['Trip Departure Time'] = data[i]['trip']['departureTime']['hrTime']+':'+data[i]['trip']['departureTime']['minTime'];
				csvData['Trip Arrival Date'] = data[i]['trip']['arrivalDate']['formatted'];
				csvData['Trip Arrival Time'] = data[i]['trip']['arrivalTime']['hrTime']+':'+data[i]['trip']['departureTime']['minTime'];
			}else{
				csvData['Trip Departure Date'] = '';
				csvData['Trip Departure Time'] = '';
				csvData['Trip Arrival Date'] = '';
				csvData['Trip Arrival Time'] = '';
			}

			if(data[i]['guide']!==undefined){
				csvData['Guide Name'] = data[i]['guide']['firstName']+' '+data[i]['guide']['lastName'];
				csvData['Guide Email'] = data[i]['guide']['email'];
			}else{
				csvData['Guide Name'] = '';
				csvData['Guide Email'] = '';
			}

			if(data[i]['flight']!==undefined){
				csvData['Flight Departure Date'] = data[i]['flight']['departure']['date']['formatted'];
				csvData['Flight Departure Time'] = data[i]['flight']['departure']['hrTime']+':'+data[i]['flight']['departure']['minTime'];
				csvData['Flight Arrival Date'] = data[i]['flight']['arrival']['date']['formatted'];
				csvData['Flight Arrival Time'] = data[i]['flight']['arrival']['hrTime']+':'+data[i]['flight']['arrival']['minTime'];
			}else{
				csvData['Flight Departure Date'] = '';
				csvData['Flight Departure Time'] = '';
				csvData['Flight Arrival Date'] = '';
				csvData['Flight Arrival Time'] = '';
			}

			if(data[i]['travelerTripCost']!==undefined){
			    csvData["Guide No."] = data[i]["tripGuideCount"];
			    csvData["Guide Days"] = data[i]["tripGuideDays"];
			    csvData["Guide Perday Cost"] = data[i]["tripGuidePerDayCost"];
			    csvData["Porter No."] = data[i]["tripPoerterNumber"];
			    csvData["Porter Days"] = data[i]["tripPoerterDays"];
			    csvData["Porter Perday Cost"] = data[i]["tripPoerterPerDayCost"];
			    csvData["Transportation Cost"] = data[i]["tripTransportationCost"];
			    csvData["Transportation Remarks"] = data[i]["tripTransportationRemarks"];
				csvData["Accomodation Cost"] = data[i]["tripAccomodationCost"];
			    csvData["Food Cost"] = data[i]["tripFoodCost"];
			    csvData["Pickup Cost"] = data[i]["tripPickupCost"];
			    csvData["Permit Cost"] = data[i]["tripPermitCost"];
			    csvData["Flight Cost"] = data[i]["tripFlightCost"];
			    csvData["Hotel Cost"] = data[i]["tripHotelCost"];
			    csvData["Hotel Remarks"] = data[i]["tripHotelRemark"];
			    csvData["Trip Remarks"] = data[i]["tripRemark"];
			    csvData["Total Trip Cost"] = data[i]["travelerTripCost"];
			}else{
				csvData["Guide No."] = 0;
			    csvData["Guide Days"] = 0;
			    csvData["Guide Perday Cost"] = 0;
			    csvData["Porter No."] = 0;
			    csvData["Porter Days"] = 0;
			    csvData["Porter Perday Cost"] = 0;
			    csvData["Transportation Cost"] = 0;
			    csvData["Transportation Remarks"] = "";
				csvData["Accomodation Cost"] = 0;
			    csvData["Food Cost"] = 0;
			    csvData["Pickup Cost"] = 0;
			    csvData["Permit Cost"] = 0;
			    csvData["Flight Cost"] = 0;
			    csvData["Hotel Cost"] = 0;
			    csvData["Hotel Remarks"] = "";
			    csvData["Trip Remarks"] = "";
			    csvData["Total Trip Cost"] = 0;
			}

			let csvTraveler = [];
			let csvString = "";
			if(data[i].travelers.length>0){
				for(let j=0;j<data[i].travelers.length;j++){
					if(j==0){
						csvString += "\"";
					}
					let travelerData = data[i].travelers[j]['firstName'] + " " + data[i].travelers[j]['lastName'] + " (" + data[i].travelers[j]['email']+")";
					csvString += travelerData ; 

					if((j+1)<data[i].travelers.length){
						csvString += "\n";
					}

					if((j+1) === data[i].travelers.length){
						csvString += "\""; 
						csvData["Travelers"] = csvString;
					}
				}
			}else{
				csvData["Travelers"] = "";
			}
			csvArr.push(csvData);
			if((i+1) === data.length){
				resolve(csvArr);
			}
		}
	});
} 

const getBookings = (userId)=>{
	return new Promise((resolve, reject)=>{
		Bookings.aggregate([
		    { 
		    	$match: { 
		    		userId: userId
		    	} 
		    },
		    { 
		        $lookup: {
		            from: "trips",
		            localField: "bookingId",
		            foreignField: "bookingId",
		            as: "trip"
		        } 
		    },
		    { 
		        $lookup: {
		            from: "users",
		            localField: "selectedGuide",
		            foreignField: "email",
		            as: "guide"
		        } 
		    },
		    { 
		        $lookup: {
		            from: "flights",
		            localField: "bookingId",
		            foreignField: "bookingId",
		            as: "flight"
		        } 
		    },
		    { 
		        $lookup: {
		            from: "travelers",
		            localField: "bookingId",
		            foreignField: "bookingId",
		            as: "travelers"
		        } 
		    },
		    {
		        $unwind: {
		            path: "$trip",
		            preserveNullAndEmptyArrays: true
		        }
		    },
		    {
		        $unwind: {
		            path: "$guide",
		            preserveNullAndEmptyArrays: true
		        }
		    },
		    {
		        $unwind: {
		            path: "$flight",
		            preserveNullAndEmptyArrays: true
		        }
		    }
		]).exec((err, bookings)=>{
			if(err){
				reject(err);
			}else{
				resolve(bookings);
			}
		})
	});
}

module.exports = {
	exportBookings
}