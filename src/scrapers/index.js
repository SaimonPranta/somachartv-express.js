const scrapeProthomAlo = require("./prothomAlo.com/latestNewsPage");
require('./test')

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
    await scrapeProthomAlo();

    await waitHere();
    await startScrape();
  } catch (error) {
    console.log("Error form startScrape :-", error);
  }
};

// startScrape();
