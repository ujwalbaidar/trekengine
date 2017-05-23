const CronJob = require('cron').CronJob;
const billingCtrl = require('../package-billings/package-billings.controller');
const socketScheduler = require('../../socket/socket.js');
module.exports = function(io) {
    /**
    * Runs every day at 00:00:00
    * decrease remaining days and increase uses days of active billing whose cost gt 0
    * i.e. does not update free user
    **/
    const billingDaysJob = new CronJob({
        cronTime: '00 00 00 * * *',
        // cronTime: '*/10 * * * * *',
        onTick: function() {
            billingCtrl.updateBillingDays()
                .then(updateResponse => {
                    console.log('cron run at:' + new Date() + 'for udpdate Billing Days');
                })
        },
        start: false,
        timeZone: 'Asia/Kathmandu'
    });
    billingDaysJob.start();

    /**
    * Runs every day at 00:00:10
    * checks if remaining days == 0
    * if true set status false
    **/
    const billingStatusJob = new CronJob({
        cronTime: '10 00 00 * * *',
        // cronTime: '*/15 * * * * *',
        onTick: function() {
            billingCtrl.updateBillingStatus()
                .then(updateResponse => {
                    console.log('cron run at:' + new Date() + 'for udpdate Billing Status');
                })
        },
        start: false,
        timeZone: 'Asia/Kathmandu'
    });
    billingStatusJob.start();

    /**
    * Runs every day at 00:00:15
    * checks if status:true, onhold:true, usesdays:0 and activateDate: today's date
    * if true set onhold false
    **/

    const billingOnHoldJob = new CronJob({
        cronTime: '15 00 00 * * *',
        // cronTime: '*/20 * * * * *',
        onTick: function() {
            billingCtrl.updateBillingOnHold()
                .then(updateResponse => {
                    console.log('cron run at:' + new Date() + 'for udpdate Billing OnHold');
                })
        },
        start: false,
        timeZone: 'Asia/Kathmandu'
    });
    billingOnHoldJob.start();

    /**
    * Runs every day at 00:00:20
    * send email if remaining days <= 2 to the active billings and cost >0
    **/
    const emailOnExpired = new CronJob({
        cronTime: '20 00 00 * * *',
        // cronTime: '*/25 * * * * *',
        onTick: function() {
            billingCtrl.emailOnExpired()
        },
        start: false,
        timeZone: 'Asia/Kathmandu'
    });
    emailOnExpired.start();

    /**
    * tick socket every minutes and send billing data
    **/
    const billingOnSocket = new CronJob({
        cronTime: '00 * * * * *',
        // cronTime: '* * * * * *',
        onTick: function() {
            // console.log('cron run at:' + new Date() + 'for billing socket');
            io.emit('transfer-cookie', 'tick');
        },
        start: false,
        timeZone: 'Asia/Kathmandu'
    });
    billingOnSocket.start();

    const deactiveUnpaidAccountJob = new CronJob({
        cronTime: '*/10 * * * * *',
        onTick: function() {
            billingCtrl.deactiveUnpaidAccount()
                .then(updateResponse => {
                    console.log('cron run at:' + new Date() + 'deacivate unpaid account');
                })
        },
        start: false,
        timeZone: 'Asia/Kathmandu'
    });
    deactiveUnpaidAccountJob.start();
}