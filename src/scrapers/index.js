const scrapeProthomAlo = require("./prothomAlo.com/latestNewsPage");
let scrapeCount = 1;

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
    console.log(`Start Scrape:- ${scrapeCount}`);
    await scrapeProthomAlo();

    console.log(`End Scrape:- ${scrapeCount}`);
    scrapeCount += 1;
    await waitHere();
    await startScrape();
  } catch (error) {
    console.log("Error form startScrape :-", error);
  }
};

startScrape();
