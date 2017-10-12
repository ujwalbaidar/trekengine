const mongoose = require('mongoose');
const Bookings = mongoose.model('Bookings');
const TripInfos = mongoose.model('TripInfos');
const Travelers = mongoose.model('Travelers');
const Trips = mongoose.model('Trips');

const getTrekOverview = (req, res) => {
    if(req.headers && req.headers.userId){
        let userId = req.headers.userId;
        let limitValue = 10;

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
                    $sort: {
                    	total_bookings:-1,
                    	total_sales: -1
                    }
                },
                {
		        	$limit: limitValue
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
		let skipValue = 0;
		let limitValue = 10;

		TripInfos.aggregate([
		    {
		        $match:{
		            userId: userId,
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
		        $unwind: "$travelerInfos"
		    },
		    {
		        $project: {
		            _id: 0,
		            tripName: 1,
		            bookingId: 1,
		            tripCost: 1,
		            totalCost: 1,
		            advancePaid: 1,
		            dueAmount: 1,
		            travellerCount: 1,
		            travelerEmail: "$travelerInfos.email",
		            travelerAge: "$travelerInfos.age",
		            travelerGender: "$travelerInfos.gender",
		            country: "$travelerInfos.nationality",
		            "18-24": {
		                $cond: [ { $and: [ { $gte: [ "$travelerInfos.age", 18 ] }, { $lte: [ "$travelerInfos.age", 24 ] } ] }, 1, 0 ]
		            },
		            "25-34": {
		                $cond: [ { $and: [ { $gte: [ "$travelerInfos.age", 25 ] }, { $lte: [ "$travelerInfos.age", 34 ] } ] }, 1, 0 ]
		            },
		            "35-44": {
		                $cond: [ { $and: [ { $gte: [ "$travelerInfos.age", 35 ] }, { $lte: [ "$travelerInfos.age", 44 ] } ] }, 1, 0 ]
		            },
		            "45-54": {
		                $cond: [ { $and: [ { $gte: [ "$travelerInfos.age", 45 ] }, { $lte: [ "$travelerInfos.age", 54 ] } ] }, 1, 0 ]
		            },
		            "55-64": {
		                $cond: [ { $and: [ { $gte: [ "$travelerInfos.age", 55 ] }, { $lte: [ "$travelerInfos.age", 64 ] } ] }, 1, 0 ]
		            },
		            "65+": {
		                $cond: [ { $gte: [ "$travelerInfos.age", 65 ] }, 1, 0 ]
		            },
		            "male": {
		                $cond: [ { $eq: [ "$travelerInfos.gender", 'male' ] }, 1, 0 ]
		            },
		            "female": {
		                $cond: [ { $eq: [ "$travelerInfos.gender", 'female' ] }, 1, 0 ]
		            },
		        }
		        
		    },
		    {
		        $group:{
		            _id: null,
		            bookingIds:{
		                $addToSet: "$bookingId",
		            },
		            tripName:{
		                $addToSet: "$tripName",
		            },
		            "totalTraveler": { $sum: 1 },
		            "avgPrice": { $avg: "$tripCost" },
		            "avgAge": { $avg: "$travelerAge" },
		            "totalSales": { $sum: "$tripCost" },
		            "18-24": { $sum: "$18-24" },
		            "25-34": { $sum: "$25-34" },
		            "35-44": { $sum: "$35-44" },
		            "45-54": { $sum: "$45-54" },
		            "55-64": { $sum: "$55-64" },
		            "65+": { $sum: "$65+" },
		            "male": { $sum: "$male" },
		            "female": { $sum: "$female" },
		            root:{
		                $push:"$$ROOT"
		            } 
		        }
		    },
		    {
		        $unwind: "$root"
		    },
		    {
		        $project:{
		            _id: 0,
		            totalBookings: { $size: "$bookingIds" },
		            tripName: { $arrayElemAt: [ "$tripName", 0 ]},
		            "totalTraveler" : 1,
		            "avgPrice" : 1,
		            "avgAge" : 1,
		            "totalSales" : 1,
		            "18-24" : 1,
		            "25-34" : 1,
		            "35-44" : 1,
		            "45-54" : 1,
		            "55-64" : 1,
		            "65+" : 1,
		            "male" : 1,
		            "female" : 1,
		            "country": "$root.country",
		            "tripCost": "$root.tripCost"
		        }
		    },
		    {
		        $group:{
		            _id: "$country",
		            totalTraveler: { $sum: 1 },
		            totalCost: { $sum: "$tripCost" },
		            result:{
		                $push: "$$ROOT"
		            }
		        }
		    },
		    {
		        $project:{
		            _id: 0,
		            country: "$_id",
		            totalTraveler: 1,
		            totalCost: 1,
		            result: {
		                $arrayElemAt: [ "$result", 0 ]
		            }
		        }
		    },
		    {
		        $sort:{
		            totalCost: -1
		        }
		    },
		    { $skip : skipValue },
		    { $limit: limitValue },
		    {
		        $group:{
		            _id: null,
		            tableData: {
		                $push:{
		                    "country": "$country",
		                    "totalCost": "$totalCost",
		                    "totalTraveler": "$totalTraveler"
		                }
		            },
		            result: {
		                $addToSet:{
		                    "totalTraveler":"$result.totalTraveler",
		                    "avgPrice":"$result.avgPrice",
		                    "avgAge": "$result.avgAge",
		                    "totalSales":"$result.totalSales",
		                    "18-24":"$result.18-24",
		                    "25-34":"$result.25-34",
		                    "35-44":"$result.35-44",
		                    "45-54" :"$result.45-54",
		                    "55-64":"$result.55-64",
		                    "65+":"$result.65+",
		                    "male":"$result.male",
		                    "female":"$result.female",
		                    "tripName" : "$result.tripName",
            				"totalBookings" : 3
		                }
		            }
		            
		        }
		    }
		]).exec((err, trekDetailAnalyticsData)=>{
	        if(err){
	            res.status(400).json({success:false, data: err, message:'Failed to retrieve Trek Bookings Details Analytics Data!'});
	        }else{
	            res.status(200).json({success:true, data: trekDetailAnalyticsData[0], message: 'Trek Bookings Analytics Details Data retrieved successfully!'});
	        }
	    });
	}else{
        res.status(401).json({success:false, message: 'Login is Required!'});
    }
}

const getAudienceOverview = (req, res) =>{
	if(req.headers && req.headers.userId){
		let userId = req.headers.userId;
		let ageGenderOverview = new Promise((resolve, reject)=>{
			Travelers.aggregate([
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
			            "18-24": { $sum: "$18-24" },
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
			]).exec((err, ageGenderOverviewData)=>{
		        if(err){
		            reject(err);
		        }else{
		            resolve(ageGenderOverviewData[0]);
		        }
		    });
		});
		let limitValue = 10;
		let countryOverview = new Promise((resolve, reject) => {
			Travelers.aggregate([
			    {
			        $match:{
			            "userId": userId,
			            "status": true
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
			    },
			    {
			        $sort: { "totalSalesAmt": -1 }
			    },
			    { $limit: limitValue }
			]).exec((err, countryOverviewData)=>{
		        if(err){
		            reject(err);
		        }else{
		            resolve(countryOverviewData);
		        }
		    });
		});

		Promise.all([ageGenderOverview, countryOverview])
	        .then(overViewObjects => {
	            res.status(200).json({success:true, data: overViewObjects, message: 'Audience Overview data retrieved successfully!'});
	        }).catch(overViewErr=>{
	            res.status(400).json({success:false, data: overViewErr, message:'Failed to retrieve audience overview data!'});
	        });
	}else{
        res.status(401).json({success:false, message: 'Login is Required!'});
    }

}

const getAudienceByAge = (req, res)=>{
	if(req.headers && req.headers.userId){
		let userId = req.headers.userId;
		Travelers.aggregate([
		    {
		        $match:{
		            "userId": userId,
		            "status": true
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
		            "email": 1,
		            "bookingId": 1,
		            "gender": 1,
		            "tripName": "$bookingInfos.tripName",
		            "tripCost": "$bookingInfos.tripCost",
		            "age":1,
		            "ageGroup": {
		                $switch:
		                {
		                    branches:[
		                        {
		                            case: { $and: [ { $gte: [ "$age", 18 ] }, { $lte: [ "$age", 24 ] } ] },
		                            then: "18-24"
		                        },
		                        {
		                            case: { $and: [ { $gte: [ "$age", 25 ] }, { $lte: [ "$age", 34 ] } ] },
		                            then: "25-34"
		                        },
		                        {
		                            case: { $and: [ { $gte: [ "$age", 35 ] }, { $lte: [ "$age", 44 ] } ] },
		                            then: "35-44"
		                        },
		                        {
		                            case: { $and: [ { $gte: [ "$age", 45 ] }, { $lte: [ "$age", 54 ] } ] },
		                            then: "45-54"
		                        },
		                        {
		                            case: { $and: [ { $gte: [ "$age", 55 ] }, { $lte: [ "$age", 64 ] } ] },
		                            then: "55-64"
		                        },
		                        {
		                            case: { $gte: [ "$age", 65 ] },
		                            then: "65+"
		                        }
		                    ],
		                    default: "Under Age"
		                }
		            }
		        }   
		    },
		    {
		        $group:{
		            _id: {
		                "ageGroup":"$ageGroup",
		                "bookingId":"$bookingId",
		                "tripName": "$tripName"
		            },
		            total_cost: { $sum: "$tripCost" },
		            count: { $sum: 1 },
		        }
		    },
		    {
		        $project:{
		            _id: 0,
		            ageGroup: "$_id.ageGroup",
		            bookingId: "$_id.bookingId",
		            tripName: "$_id.tripName",
		            total_cost: 1,
		            count: 1
		        }
		    },
		    {
		        $group:{
		            _id: "$ageGroup",
		            totalSales: { $sum: "$total_cost" },
		            root: { $push: "$$ROOT"}            
		        }
		    },
		    {
		        $sort: { _id: 1 }
		    }
		]).exec((err, audienceAgeData)=>{
		        if(err){
		            res.status(400).json({success:false, data: err, message:'Failed to retrieve audience age data!'});
		        }else{
		            res.status(200).json({success:true, data: audienceAgeData, message: 'Audience Age data retrieved successfully!'});
		        }
		    });
	}else{
        res.status(401).json({success:false, message: 'Login is Required!'});
    }
	
}

const getAudienceByGender = (req, res)=>{
	if(req.headers && req.headers.userId){
		let userId = req.headers.userId;
		Travelers.aggregate([
		    {
		        $match: {
		            "userId" : userId,
		            status: true
		        }
		    },
		    {
		        $project: {
		            "_id": 0,
		            "bookingId": 1,
		            "email": 1,
		            "gender": 1
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
		            "email": 1,
		            "bookingId": 1,
		            "gender": 1,
		            "tripName": "$bookingInfos.tripName",
		            "tripCost": "$bookingInfos.tripCost",
		            "male": {
		                $cond: [ { $eq: [ "$gender", 'male' ] }, 1, 0 ]
		            },
		            "female": {
		                $cond: [ { $eq: [ "$gender", 'female' ] }, 1, 0 ]
		            },
		        }
		    },
		    {
		        $group: {
		            _id: "$tripName",
		            "male": { $sum: "$male" },
		            "female": { $sum: "$female" },
		            "count": { $sum: 1 },
		            "total_sales": { $sum: "$tripCost" }
		        }
		    }
		]).exec((err, audienceGenderData)=>{
		        if(err){
		            res.status(400).json({success:false, data: err, message:'Failed to retrieve audience gender data!'});
		        }else{
		            res.status(200).json({success:true, data: audienceGenderData, message: 'Audience Gender data retrieved successfully!'});
		        }
		    });
	}else{
        res.status(401).json({success:false, message: 'Login is Required!'});
    }
}

const getAudienceByCountry = (req, res)=>{
	if(req.headers && req.headers.userId){
		let userId = req.headers.userId;
		getAudienceCountryData(userId)
			.then(countryData=>{
				res.status(200).json({success:true, data: countryData, message: 'Audience Country data retrieved successfully!'});
			})
			.catch(countryErr=>{
				res.status(400).json({success:false, data: countryErr, message:'Failed to retrieve audience country data!'});
			});
	}else{
        res.status(401).json({success:false, message: 'Login is Required!'});
    }
}

function getAudienceCountryData(userId){
	return new Promise((resolve, reject)=>{
		Travelers.aggregate([
		    {
		        $match:{
		            "userId": userId,
		            "status": true
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
		]).exec((err, countryOverviewData)=>{
	        if(err){
	            reject(err);
	        }else{
	            resolve(countryOverviewData);
	        }
	    });
	});
}

const getAudienceDetailsByAge = (req, res) =>{
	if(req.headers && req.headers.userId){
		let userId = req.headers.userId;
		let limitValue = 10;
		let minAge = parseInt(req.query.minAge);
		let maxAge = parseInt(req.query.maxAge);
		Travelers.aggregate([
		    {
		        $match: {
		            "userId": userId,
		            "status": true
		        }
		    },
		    {
		        $project: {
		            email: 1,
		            nationalitiy: 1,
		            bookingId: 1,
		            age:1,
		            "male": {
		                $cond: [ { $eq: [ "$gender", 'male' ] }, 1, 0 ]
		            },
		            "female": {
		                $cond: [ { $eq: [ "$gender", 'female' ] }, 1, 0 ]
		            },
		            result: { $and: [ { $gte: [ "$age", minAge ] }, { $lte: [ "$age", maxAge ] } ] }
		        }
		    },
		    {
		        $match: {
		            result: true
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
		        $project:{
		            _id: 0,
		            email: 1,
		            age: 1,
		            bookingId: 1,
		            gender: 1,
		            male: 1,
		            female: 1,
		            tripName: "$bookingInfos.tripName",
		            tripCost: "$bookingInfos.tripCost"
		        }
		    },
		    {
		        $group: {
		            _id: "$tripName",
		            countTravelers: { $sum: 1 },
		            sales: { $sum: "$tripCost" },
		            male: { $sum: "$male"},
		            female: { $sum: "$female"},
		            root: {
		                $push: "$$ROOT"
		            }
		        }
		    },
		    {
		        $sort : { countTravelers : -1 }
		    },
		    {
		        $limit: limitValue
		    },
		    {
		        $group:{
		            _id: null,
		            totalSales: { $sum: "$sales" },
		            root:{
		                $push: "$$ROOT"
		            }
		        }
		    },
		    {
		        $unwind: "$root"
		    },
		    {
		        $project:{
		            _id: "$root._id",
		            totalSales: 1,
		            countTravelers: "$root.countTravelers",
		            sales: "$root.sales",
		            male: "$root.male",
		            female: "$root.female",
		            root: "$root.root"
		        }
		    }
		]).exec((err, audienceAgeDetails)=>{
	        if(err){
	            res.status(400).json({success:false, data: err, message:'Failed to retrieve audience age details data!'});
	        }else{
	            res.status(200).json({success:true, data: audienceAgeDetails, message: 'Audience Age Details data retrieved successfully!'});
	        }
	    });
	}else{
        res.status(401).json({success:false, message: 'Login is Required!'});
    }
}

const getAudienceDetailsByCountry = (req, res) =>{
	if(req.headers && req.headers.userId){
		let userId = req.headers.userId;
		let limitValue = 10;
		let countryName = req.query.countryName;

		Travelers.aggregate([
		    {
		        $match: {
		            "userId": userId,
		            "status": true,
		            "nationality": countryName
		        }
		    },
		    {
		        $project: {
		            email: 1,
		            nationalitiy: 1,
		            bookingId: 1,
		            age:1,
		            "male": {
		                $cond: [ { $eq: [ "$gender", 'male' ] }, 1, 0 ]
		            },
		            "female": {
		                $cond: [ { $eq: [ "$gender", 'female' ] }, 1, 0 ]
		            },
		            "ageGroup": {
		                $switch:
		                {
		                    branches:[
		                        {
		                            case: { $and: [ { $gte: [ "$age", 18 ] }, { $lte: [ "$age", 24 ] } ] },
		                            then: "18-24"
		                        },
		                        {
		                            case: { $and: [ { $gte: [ "$age", 25 ] }, { $lte: [ "$age", 34 ] } ] },
		                            then: "25-34"
		                        },
		                        {
		                            case: { $and: [ { $gte: [ "$age", 35 ] }, { $lte: [ "$age", 44 ] } ] },
		                            then: "35-44"
		                        },
		                        {
		                            case: { $and: [ { $gte: [ "$age", 45 ] }, { $lte: [ "$age", 54 ] } ] },
		                            then: "45-54"
		                        },
		                        {
		                            case: { $and: [ { $gte: [ "$age", 55 ] }, { $lte: [ "$age", 64 ] } ] },
		                            then: "55-64"
		                        },
		                        {
		                            case: { $gte: [ "$age", 65 ] },
		                            then: "65+"
		                        }
		                    ],
		                    default: "Under Age"
		                }
		            }
		        }
		    },
		    {
		        $group:{
		            _id: {
		                ageGroup: "$ageGroup",
		                bookingId: "$bookingId"
		            },
		            countAge: { $sum: 1 },
		            root: {
		                $push: "$$ROOT"
		            }
		        }
		    },
		    {
		        $unwind: "$root"
		    },
		    {
		        $lookup:{
		            from: "bookings",
		            localField: "root.bookingId",
		            foreignField: "bookingId",
		            as: "bookingInfos"
		        }
		    },
		    {
		        $unwind: "$bookingInfos"
		    },
		    {
		        $project:{
		            _id: 0,
		            ageGroup: "$_id.ageGroup",
		            email: "$root.email",
		            age: "$root.age",
		            bookingId: "$root.bookingId",
		            gender: "$root.gender",
		            male: "$root.male",
		            female: "$root.female",
		            tripName: "$bookingInfos.tripName",
		            tripCost: "$bookingInfos.tripCost",
		            countAge: 1
		        }
		    },
		    {
		        $group: {
		            _id: {
		                bookingId: "$bookingId",
		                tripName: "$tripName",
		            },
		            countTravelers: { $sum: 1 },
		            sales: { $sum: "$tripCost" },
		            male: { $sum: "$male"},
		            female: { $sum: "$female"},
		            root: {
		                $push: "$$ROOT"
		            }
		        }
		    },
		    {
		        $sort: {
		            "root.countAge": 1
		        }
		    },
		    {
		        $limit: limitValue
		    },
		    {
		        $group:{
		            _id: null,
		            totalSales: { $sum: "$sales" },
		            root:{
		                $push: "$$ROOT"
		            }
		        }
		    },
		    {
		        $unwind: "$root"
		    },
		    {
		        $project:{
		            _id: "$root._id",
		            totalSales: 1,
		            countTravelers: "$root.countTravelers",
		            sales: "$root.sales",
		            male: "$root.male",
		            female: "$root.female",
		            root: "$root.root"
		        }
		    }
		]).exec((err, audienceCountryDetails)=>{
	        if(err){
	            res.status(400).json({success:false, data: err, message:'Failed to retrieve audience age details data!'});
	        }else{
	            res.status(200).json({success:true, data: audienceCountryDetails, message: 'Audience Age Details data retrieved successfully!'});
	        }
	    });
	}else{
        res.status(401).json({success:false, message: 'Login is Required!'});
    }
}

const getMonthlyBookings = (req, res) =>{
	if(req.headers && req.headers.userId){
		Trips.aggregate([
		    {
		        $match:{
		            "userId" : req.headers.userId, 
		            status: true
		        }
		    },
		    {
		        $project:{
		            _id: 0,
		            departureDate: 1
		        }
		    },
		    {
		        $group: {
		            _id: {
		                year: "$departureDate.date.year",
		                month: "$departureDate.date.month"
		            },
		            totalBookings: { $sum: 1 }
		        }       
		    },
		    {
		        $project: {
		            _id: "$_id.month",
		            year: "$_id.year",
		            totalBookings: 1,
		            month: {
		                $switch:{
		                    branches:[
		                        {
		                            case: { $eq: [ "$_id.month", 1 ] },
		                            then: "Jan"
		                        },
		                        {
		                            case: { $eq: [ "$_id.month", 2 ] },
		                            then: "Feb"
		                        },
		                        {
		                            case: { $eq: [ "$_id.month", 3 ] },
		                            then: "Mar"
		                        },{
		                            case: { $eq: [ "$_id.month", 4 ] },
		                            then: "Apr"
		                        },{
		                            case: { $eq: [ "$_id.month", 5 ] },
		                            then: "May"
		                        },{
		                            case: { $eq: [ "$_id.month", 6 ] },
		                            then: "Jun"
		                        },
		                        {
		                            case: { $eq: [ "$_id.month", 7 ] },
		                            then: "Jul"
		                        },
		                        {
		                            case: { $eq: [ "$_id.month", 8 ] },
		                            then: "Aug"
		                        },
		                        {
		                            case: { $eq: [ "$_id.month", 9 ] },
		                            then: "Sept"
		                        },
		                        {
		                            case: { $eq: [ "$_id.month", 10 ] },
		                            then: "Oct"
		                        },
		                        {
		                            case: { $eq: [ "$_id.month", 11 ] },
		                            then: "Nov"
		                        },
		                        {
		                            case: { $eq: [ "$_id.month", 12 ] },
		                            then: "Dec"
		                        }
		                    ]
		                }
		            }
		        }
		    },
		    {
		        $group:{
		            _id: "$year",
		            data: { $push: "$$ROOT"}
		        }
		    }
    ]).exec((err, monthlyBookings)=>{
	        if(err){
	            res.status(400).json({success:false, data: err, message:'Failed to retrieve monthly booking count!'});
	        }else{

	        	let salesBookingYears = [];
	        	let salesBookingData = [];
	        	for(let i=0;i<monthlyBookings.length;i++){
		        	let monthlyData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	        		salesBookingYears.push(monthlyBookings[i]['_id']);
	        		salesBookingData.push([]);
	        		for(let j=0; j<monthlyBookings[i].data.length;j++){
		        		let monthlyBookingObj = monthlyBookings[i].data[j];
		        		monthlyData[(monthlyBookingObj._id)-1] = monthlyBookingObj.totalBookings;
		        		if(j == (monthlyBookings[i].data.length-1)){
		        			salesBookingData[i] = monthlyData;
			        		if(i === (monthlyBookings.length-1)){
			        			let monthlyBookingCountsObj = {
			        				salesBookingYears: salesBookingYears,
			        				salesBookingYearsData:salesBookingData 
			        			};
					            res.status(200).json({success:true, data: monthlyBookingCountsObj, message: 'Monthly bookings count retrieved successfully!'});
			        		}
		        		}
	        		}
	        	}
	        }
	    });
	}else{
        res.status(401).json({success:false, message: 'Login is Required!'});
    }
}

module.exports = {
    getTrekOverview,
    getTrekBookingAnalytics,
    getBookingAnalysisDetails,
    getAudienceOverview,
	getAudienceByAge,
	getAudienceByGender,
    getAudienceByCountry,
    getAudienceDetailsByAge,
    getAudienceDetailsByCountry,
    getMonthlyBookings
};

