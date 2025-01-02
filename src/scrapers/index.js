const scrapeProthomAlo = require("./prothomAlo.com/latestNewsPage");
const scrapeBD24LiveNews = require("./bd24live.com/index");
const scrapeBDPratidinNews = require("./bd-pratidin.com/index");
const scrapeAmarsangbadNews = require("./amarsangbad.com/index");
const scrapeIttefaqNews = require("./ittefaq.com.bd/index");
// const scrapeKalerkanthoNews = require("./kalerkantho.com");

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
    console.log("Start scrape ==>>", new Date());
    // await scrapeProthomAlo();
    await scrapeBD24LiveNews();
    await scrapeBDPratidinNews();
    await scrapeAmarsangbadNews();
    await scrapeIttefaqNews();

    console.log("End scrape ==>>", new Date());
    await waitHere();

    await startScrape();
  } catch (error) {
    console.log("Error form startScrape :-", error);
  }
};

startScrape();


// Scrape not working list 
// kalerkantho.com
