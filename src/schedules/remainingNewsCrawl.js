const NewsCollection = require("../DB/Modals/news");
const notifyGoogle = require("../shared/utilize/notifyGoogle");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const index = async () => {
  try {
    const newsList = await NewsCollection.find({
      $or: [
        { "googleIndexInfo.indexed": false },
        { googleIndexInfo: { $exists: false } },
      ],
    })
      .limit(310)
      .select("_id googleIndexInfo");
    if (!newsList.length) {
      return;
    }
    Promise.all(
      newsList.map(async (news, index) => {
        try {
          if (news && news.googleIndexInfo && news.googleIndexInfo.indexed) {
            return;
          }
          const newsDetailsPageUrl = `https://somacharnews.com/news/${news._id}`;
          const notifyResponse = await notifyGoogle(newsDetailsPageUrl);

          if (notifyResponse) {
            await NewsCollection.findOneAndUpdate(
              { _id: news._id },
              {
                googleIndexInfo: {
                  indexed: true,
                  date: new Date(),
                },
              }
            );
            await sleep(2000);
          }
        } catch (error) {
          console.log("error ===>>", error);
        }
      })
    );
  } catch (error) {
    console.log("error ===>>", error);
  }
};

module.exports = index;
