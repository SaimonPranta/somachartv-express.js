const schedule = require('node-schedule');
const remainingNewsCrawl = require("./remainingNewsCrawl")


remainingNewsCrawl()
// Schedule the task to run every 2 hours
schedule.scheduleJob('0 */2 * * *', remainingNewsCrawl);
