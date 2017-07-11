const mongoose = require('mongoose');
const Bookings = mongoose.model('Bookings');
const TripInfos = mongoose.model('TripInfos');
const Travelers = mongoose.model('Travelers');

const getTrekOverview = (req, res) => {
    if(req.headers && req.headers.userId){
        let userId = req.headers.userId;
        
        let bookingTotals = new Promise((resolve, reject) => {
            Bookings.aggregate([
                {
                    $match:{
                        "userId" : userId,
                        "status" : true
                    }
                },{
                    $group:{
                        _id: null,
                        totalAdvanceAmount: { $sum: "$advancePaid"},
                        totalDueAmount: { $sum: "$dueAmount" },
                        totalSalesAmount: { $sum: "$totalCost" },
                        totalBookings: { $sum: 1 }
                    }
                },{
                    $project: {
                        _id: 0,
                        totalAdvanceAmount: 1,
                        totalDueAmount: 1,
                        totalSalesAmount: 1,
                        totalBookings: 1
                    }
                }
            ]).exec((err, totalData)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(totalData);
                }
            });
        });

        let overviewBooking = new Promise((resolve, reject) => {
            Bookings.aggregate([
                {
                    $match:{
                        "userId" : userId,
                        "status" : true
                    }
                },
                {
                    $group : {
                        _id : "$tripName",
                        total_bookings: { $sum: 1 },
                        total_sales: { $sum: { $multiply: [ "$travellerCount", "$tripCost" ] } }
                    }
                },
                {
                    $sort: {total_sales:-1}
                }
            ]).exec((err, overviewData)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(overviewData);
                }
            });
        });

        Promise.all([bookingTotals, overviewBooking])
            .then(overViewObjects => {
                res.status(200).json({success:true, data: overViewObjects, message: 'Overview data retrieved successfully!'});
            }).catch(overViewErr=>{
                res.status(400).json({success:false, data: overViewErr, message:'Failed to retrieve overview data!'});
            });
    }else{
        res.status(401).json({success:false, message: 'Login is Required!'});
    }
}

const getTrekBookingAnalytics = (req, res)=>{
	if(req.headers && req.headers.userId){
        let userId = req.headers.userId;
		
		Bookings.aggregate([
		    {
		        $match:{
		            "userId" : userId,
		            "status" : true
		        }
		    },
		    {
		      $lookup:{
		          from: "travelers",
		          localField: "bookingId",
		          foreignField: "bookingId",
		          as: "travelerInfos"
		      }
		    },
		    { 
		        "$addFields": {
		            "travelerAvgAge": { "$avg": "$travelerInfos.age" }
		        }
		    },
		    {
		        $group:{
		            _id : "$tripName",
		            avgAges: {
		                $push:"$travelerAvgAge"
		            },
		            total_bookings: { $sum: 1 },
		            avgPrice: { $avg: "$tripCost" },
		            totalSalesAmt: { $sum: "$totalCost" },
		            totalTravelers: { $sum: "$travellerCount" },
		            
		        }
		    },
		    {
		        $project: {
		            _id: 1,
		            total_bookings: 1,
		            avgPrice: 1,
		            totalSalesAmt: 1,
		            totalTravelers:1,
		            travelerAvgAgeArr : { 
		                $filter :  {
	                        input: "$avgAges",
	                        as: "avgAges",
	                        cond: { $gte: [ "$$avgAges", 0 ] }
		                }
		            }
		        }
		    },
		    {
		        $project: {
		            _id: 1,
		            total_bookings: 1,
		            avgPrice: 1,
		            totalSalesAmt: 1,
		            totalTravelers:1,
		            travelerAvgAge: { $avg: "$travelerAvgAgeArr"}
		        }
		    },
		    {
		        $lookup:{
		            from: "tripinfos",
		            localField: "_id",
		            foreignField: "name",
		            as: "tripInfos"
		        }
		    }
		]).exec((err, analyticsData)=>{
	        if(err){
	            res.status(400).json({success:false, data: err, message:'Failed to retrieve Trek Bookings Analytics Data!'});
	        }else{
	            res.status(200).json({success:true, data: analyticsData, message: 'Trek Bookings Analytics Data retrieved successfully!'});
	        }
	    });
    }else{
        res.status(401).json({success:false, message: 'Login is Required!'});
    }
}

const getBookingAnalysisDetails = (req, res)=>{
	if(req.headers && req.headers.userId){
        let userId = req.headers.userId;
		let tripInfoId = req.query.tripInfoId;

		TripInfos.aggregate([
		    {
		        $match:{
		            _id:mongoose.Types.ObjectId(tripInfoId)
		        }
		    },
		    {
		      $lookup:{
		          from: "bookings",
		          localField: "name",
		          foreignField: "tripName",
		          as: "bookings"
		      }
		    },
		    {
		        $unwind:"$bookings"
		    },
		    {
		        $match:{
		            "bookings.userId": userId,
		            "bookings.status": true
		        }
		    },
		    {
		        $project:{
		            tripName: "$name",
		            bookingId: "$bookings.bookingId",
		            tripCost: "$bookings.tripCost",
		            totalCost: "$bookings.totalCost",
		            advancePaid: "$bookings.advancePaid",
		            dueAmount: "$bookings.dueAmount",
		            travellerCount: "$bookings.travellerCount"
		        }
		    },
		    {
		      $lookup:{
		          from: "travelers",
		          localField: "bookingId",
		          foreignField: "bookingId",
		          as: "travelerInfos"
		      }
		    },
		    { 
		        "$addFields": {
		            "travelerAvgAge": { "$avg": "$travelerInfos.age" }
		        }
		    },
		    {
		        $group:{
		            _id : "$tripName",
		            avgAges: {
		                $push:"$travelerAvgAge"
		            },
		            travelerInfos: {
		                $push: "$travelerInfos"
		            },
		            total_bookings: { $sum: 1 },
		            avgPrice: { $avg: "$tripCost" },
		            totalSalesAmt: { $sum: "$totalCost" },
		            totalTravelers: { $sum: "$travellerCount" },
		            
		        }
		    },
		    {
		        $project: {
		            _id: 1,
		            total_bookings: 1,
		            avgPrice: 1,
		            totalSalesAmt: 1,
		            totalTravelers:1,
		            travelerInfos: 1,
		            travelerAvgAgeArr : { 
		                $filter :  {
		                        input: "$avgAges",
		                        as: "avgAges",
		                        cond: { $gte: [ "$$avgAges", 0 ] }
		                }
		            }
		        }
		    },
		    {
		        $project: {
		            _id: 1,
		            total_bookings: 1,
		            avgPrice: 1,
		            totalSalesAmt: 1,
		            totalTravelers:1,
		            travelerInfos: 1,
		            travelerAvgAge: { $avg: "$travelerAvgAgeArr"}
		        }
		    },
		]).exec((err, analyticsData)=>{
			if(err){
	            res.status(400).json({success:false, data: err, message:'Failed to retrieve Booking Details Analytics Data!'});
	        }else{
				Bookings.find({userId:userId}, (bookingsErr,bookings)=>{
					if(bookingsErr){
						res.status(400).json({success:false, data: bookingsErr, message:'Failed to retrieve Booking Details Analytics Data!'});
					}else{
						keyValueBooking(bookings)
							.then(keyValueBooking=>{
								analyticsData[0].travelerInfos = [].concat.apply([], analyticsData[0].travelerInfos);
								groupTravelers(analyticsData[0].travelerInfos, keyValueBooking)
									.then(groupData=>{
										let data = {analyticsData:analyticsData, groupData: groupData};
			            				res.status(200).json({success:true, data: data, message: 'Booking Details Analytics Data retrieved successfully!'});
									});
							});
						
					}
				});
	        }
		});
	}else{
        res.status(401).json({success:false, message: 'Login is Required!'});
    }
}

function groupTravelers(travelers, keyValueBooking){
	return new Promise(resolve=>{
		let country = {};
		let maleTraveler = [];
		let femaleTraveler = [];
		let age = {
			'18-':[],
			'18-24':[],
			'25-34':[],
			'35-44':[],
			'45-54':[],
			'55-64':[],
			'65+':[]
		};
		travelers.map((traveler, index, travelers) => {
			if(traveler.nationality){
				let lowercaseCountry = traveler.nationality.toLowerCase();
				if(country[lowercaseCountry] == undefined){
					country[lowercaseCountry] = [];
				}
				if(traveler.bookingId !== undefined){
					traveler.tripCost = keyValueBooking[traveler.bookingId].tripCost;
				}

				country[lowercaseCountry].push(traveler);
			}

			if(traveler.gender){
				if(traveler.gender === 'male'){
					maleTraveler.push(traveler);
				}else{
					femaleTraveler.push(traveler);
				}
			}

			if(traveler.age){
				if(traveler.age>=18 && traveler.age <=24){
					age['18-24'].push(traveler);
				}else if(traveler.age>=25 && traveler.age <=34){
					age['25-34'].push(traveler);
				}else if(traveler.age>=35 && traveler.age <=44){
					age['35-44'].push(traveler);
				}else if(traveler.age>=45 && traveler.age <=54){
					age['45-54'].push(traveler);
				}else if(traveler.age>=55 && traveler.age <=64){
					age['55-64'].push(traveler);
				}else if(traveler.age>=65){
					age['65+'].push(traveler);
				}else{
					age['18-'].push(traveler);
				}
			}

			if(index===(travelers.length-1)){
				resolve({country:country, maleTraveler: maleTraveler, femaleTraveler: femaleTraveler, age: age});
			}
		});
	});
}

function keyValueBooking(bookings){
	let bookingObjects = {};
	return new Promise((resolve)=>{
		bookings.map((booking, index)=>{
			bookingObjects[booking.bookingId] = booking;
			if(index === (bookings.length-1)){
				resolve(bookingObjects);
			}
		});
	});
}

const getAudienceOverview = (req, res) =>{
	let userId = "592d2b7c6cbc010e10d9e888";
	db.getCollection('travelers').aggregate([
	    {
	        $match:{
	            "userId": userId,
	            "status": true
	        }
	    },
	    {
	        $project: {
	            email: 1,
	            bookingId: 1,
	            age: 1,
	            "18-24": {
	                $cond: [ { $and: [ { $gte: [ "$age", 18 ] }, { $lte: [ "$age", 24 ] } ] }, 1, 0 ]
	            },
	            "25-34": {
	                $cond: [ { $and: [ { $gte: [ "$age", 25 ] }, { $lte: [ "$age", 34 ] } ] }, 1, 0 ]
	            },
	            "35-44": {
	                $cond: [ { $and: [ { $gte: [ "$age", 35 ] }, { $lte: [ "$age", 44 ] } ] }, 1, 0 ]
	            },
	            "45-54": {
	                $cond: [ { $and: [ { $gte: [ "$age", 45 ] }, { $lte: [ "$age", 54 ] } ] }, 1, 0 ]
	            },
	            "55-64": {
	                $cond: [ { $and: [ { $gte: [ "$age", 55 ] }, { $lte: [ "$age", 64 ] } ] }, 1, 0 ]
	            },
	            "65+": {
	                $cond: [ { $gte: [ "$age", 65 ] }, 1, 0 ]
	            },
	            "male": {
	                $cond: [ { $eq: [ "$gender", 'male' ] }, 1, 0 ]
	            },
	            "female": {
	                $cond: [ { $eq: [ "$gender", 'female' ] }, 1, 0 ]
	            },
	        }
	    },
	    {
	        $group:{
	            _id: null,
	            "18-34": { $sum: "$18-24" },
	            "25-34": { $sum: "$25-34" },
	            "35-44": { $sum: "$35-44" },
	            "45-54": { $sum: "$45-54" },
	            "55-64": { $sum: "$55-64" },
	            "65+": { $sum: "$65+" },
	            "male": { $sum: "$male" },
	            "female": { $sum: "$female" },
	            "count": { $sum: 1 }
	        }
	    },
	]).exec((err, analyticsData)=>{
        if(err){
            res.status(400).json({success:false, data: err, message:'Failed to Analytics Data for Audience Overview!'});
        }else{
            res.status(200).json({success:true, data: analyticsData, message: 'Audience Overview Analytics Data retrieved successfully!'});
        }
    });
}

const getAudienceByCountry = (req, res)=>{
	let userId = "592d2b7c6cbc010e10d9e888";
	Travelers.aggregate([
	    {
	        $match:{
	            "userId": userId
	        }
	    },
	    {
	        $lookup:{
	            from: "bookings",
	            localField: "bookingId",
	            foreignField: "bookingId",
	            as: "bookingInfos"
	        }
	    },    
	    {
	        $unwind: "$bookingInfos"
	    },
	    {
	        $project: {
	            "_id": 0,
	            "bookingId": 1,
	            "email": 1,
	            "nationality": 1,
	            "travelCost": "$bookingInfos.tripCost"
	        }
	    },
	    {
	        $group:{
	            _id:"$nationality",
	            totalSalesAmt: { $sum: "$travelCost" },
	            travelerCounts: { $sum: 1 },
	            travelers:{
	                $push: "$$ROOT"
	            }
	        }
	    }
	]).exec((err, analyticsData)=>{
        if(err){
            res.status(400).json({success:false, data: err, message:'Failed to Analytics Data for Audience Country!'});
        }else{
            res.status(200).json({success:true, data: analyticsData, message: 'Audience Country Analytics Data retrieved successfully!'});
        }
    });
}


module.exports = {
    getTrekOverview,
    getTrekBookingAnalytics,
    getBookingAnalysisDetails,
    getAudienceByCountry
};

