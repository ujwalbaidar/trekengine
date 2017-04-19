const CronJob = require('cron').CronJob;
const billingCtrl = require('../package-billings/package-billings.controller');
const socketScheduler = require('../../socket/socket.js');
module.exports = function(io) {
    const billingDaysJob = new CronJob({
        cronTime: '00 00 */1 * * *',
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

    const billingStatusJob = new CronJob({
        cronTime: '10 00 */1 * * *',
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

    const billingOnHoldJob = new CronJob({
        cronTime: '20 00 */1 * * *',
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

    const emailOnExpired = new CronJob({
        cronTime: '25 00 */1 * * *',
        onTick: function() {
            billingCtrl.emailOnExpired()
        },
        start: false,
        timeZone: 'Asia/Kathmandu'
    });
    emailOnExpired.start();

    const billingOnSocket = new CronJob({
        cronTime: '30 00 */1 * * *',
        onTick: function() {
            console.log('cron run at:' + new Date() + 'for billing socket');
            io.emit('transfer-cookie', 'tick');
        },
        start: false,
        timeZone: 'Asia/Kathmandu'
    });
    billingOnSocket.start();
}