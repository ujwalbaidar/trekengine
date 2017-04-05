const CronJob = require('cron').CronJob;
const job = new CronJob({
  cronTime: '00 00 */1 * * *',
  onTick: function() {
    console.log(new Date());
    /*
     * Runs every weekday (Monday through Friday)
     * at 11:30:00 AM. It does not run on Saturday
     * or Sunday.
     */
  },
  start: false,
  timeZone: 'America/Los_Angeles'
});
job.start();
