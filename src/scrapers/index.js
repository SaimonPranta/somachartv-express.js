const isProduction = require("../shared/functions/isProduction");
const {getFullDate} = require("../shared/functions/formatDate");
const scrapeProthomAlo = require("./prothomAlo.com/latestNewsPage");
const scrapeBD24LiveNews = require("./bd24live.com/index");
const scrapeBDPratidinNews = require("./bd-pratidin.com/index");
const scrapeAmarsangbadNews = require("./amarsangbad.com/index");
const scrapeIttefaqNews = require("./ittefaq.com.bd/index");
const scrapeDailynayadigantaNews = require("./dailynayadiganta.com");

const waitHere = () => {
  let intervalTime = 15 * 60 * 1000; // 15 minutes

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("done");
    }, intervalTime);
  });
};

const startScrape = async () => {
  try {
    if (!isProduction()) {
      return;
    }
    console.log("Start scrape ==>>", getFullDate());
    await scrapeBD24LiveNews();
    await scrapeBDPratidinNews();
    await scrapeAmarsangbadNews();
    await scrapeIttefaqNews();
    // await scrapeDailynayadigantaNews();

    console.log("End scrape ==>>", getFullDate());
    await waitHere();

    await startScrape();
  } catch (error) {
    console.log("Error form startScrape :-", error);
  }
};

startScrape();


// Scrape not working list 
// kalerkantho.com
