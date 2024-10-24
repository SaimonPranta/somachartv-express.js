const scrapeProthomAlo = require("./prothomAlo.com/latestNewsPage");

const waitHere = () => {
  let intervalTime = 10 * 60 * 1000; // 5 minutes

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("done");
    }, intervalTime);
  });
};

const startScrape = async () => {
  try {
    await scrapeProthomAlo();

    console.log("hello after scrap");
    await waitHere();
    await startScrape();
  } catch (error) {
    console.log("Error form startScrape :-", error);
  }
};

startScrape();
