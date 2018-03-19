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
        cronTime: '00 30 17 * * 0',
        onTick: function() {
            console.log('cron run at:' + new Date() + 'for weekly trip notification');
            tripCtrl.weeklyTripNotification()
        },
        start: false,
        timeZone: 'Asia/Kathmandu'
    });
    weeklyTripNotifyJob.start();

    const guideDailyTripNotifyJob = new CronJob({
        cronTime: '00 00 18 * * *',
        onTick: function() {
            console.log('cron run at:' + new Date() + 'for daily trip notification');
            tripCtrl.guideDailyTripNotification()
        },
        start: false,
        timeZone: 'Asia/Kathmandu'
    });
    guideDailyTripNotifyJob.start();

    const guideWeeklyTripNotifyJob = new CronJob({
        cronTime: '00 30 18 * * 0',
        onTick: function() {
            console.log('cron run at:' + new Date() + 'for weekly trip notification');
            tripCtrl.guideWeeklyTripNotification();
        },
        start: false,
        timeZone: 'Asia/Kathmandu'
    });
    guideWeeklyTripNotifyJob.start();

    const tripFeedbackJob = new CronJob({
        cronTime: '*/60 * * * * *',
        onTick: function() {
            tripCtrl.requestTripFeedback();
        },
        start: false,
        timeZone: 'Asia/Kathmandu'
    });
    tripFeedbackJob.start();
}