const mongoose = require('mongoose');
const Bookings = mongoose.model('Bookings');

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

module.exports = {
    getTrekOverview
};