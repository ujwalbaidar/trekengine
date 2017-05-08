const CronJob = require('cron').CronJob;
const tripCtrl = require('../trips/trips.controller');

module.exports = function(io) {
    const dailyTripNotifyJob = new CronJob({
        cronTime: '00 00 17 * * *',
        onTick: function() {
            console.log('cron run at:' + new Date() + 'for daily trip notification');
            tripCtrl.dailyTripNotification()
        },
        start: false,
        timeZone: 'Asia/Kathmandu'
    });
    dailyTripNotifyJob.start();

    const weeklyTripNotifyJob = new CronJob({
        cronTime: '00 30 17 * * 1',
        onTick: function() {
            console.log('cron run at:' + new Date() + 'for weekly trip notification');
            tripCtrl.weeklyTripNotification()
        },
        start: false,
        timeZone: 'Asia/Kathmandu'
    });
    weeklyTripNotifyJob.start();
}