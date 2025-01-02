const { google } = require("googleapis");
const path = require("path");
const NewsCollection = require("../../../src/DB/Modals/news");
const googleCrawlerSecrets = require("../../../secrets/googleCrawlerSecrets");
 
const choseSecret = () => {
  global.currentSecretNumber = global.currentSecretNumber || 0;
  const currentPosition = global.currentSecretNumber;
  global.currentSecretNumber = (currentPosition + 1) % googleCrawlerSecrets.length;
  return currentPosition;
};
 

const authenticate = async () => {
  try {
    const chosedSecret = choseSecret()
    console.log("chosedSecret ===>>", chosedSecret)
    const auth = new google.auth.GoogleAuth({
      // keyFile: KEY_PATH, // Use the path to the JSON file
      credentials: googleCrawlerSecrets[chosedSecret],  
      scopes: ["https://www.googleapis.com/auth/indexing"]
    });

    const authClient = await auth.getClient();
    return google.indexing({
      version: "v3",
      auth: authClient
    });
  } catch (error) {
    console.log("error from authenticate function: ->", error);
  }
};

const notifyGoogle = async (url, type = "URL_UPDATED") => {
  const indexing = await authenticate();

  const body = {
    url: url,
    type: type // 'URL_UPDATED' or 'URL_REMOVED'
  };

  try {
    const response = await indexing.urlNotifications.publish({
      requestBody: body
    });

    console.log("Google crawler request has been submit:->", response.data);
    if (response.data.urlNotificationMetadata) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error notifying Google:", error);
    return false;
  }
};

// Example usage (uncomment the line below to test)
// notifyGoogle("https://somacharnews.com/news/6770cb827f47a62ba2d95555"); // Replace with your URL

 
module.exports = notifyGoogle;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const notifyAllNews = async () => {
  try {
    const newsList = await NewsCollection.find({
      $or: [
        { "googleIndexInfo.indexed": false },
        { googleIndexInfo: { $exists: false } }
      ]
    })
      .limit(310)
      .select("_id googleIndexInfo");
    let totalCowlCount = 0;
    Promise.all(
      newsList.map(async (news, index) => {
        try {
          if (news && news.googleIndexInfo && news.googleIndexInfo.indexed) {
            return;
          }
          const newsDetailsPageUrl = `https://somacharnews.com/news/${news._id}`;
          const notifyResponse = await notifyGoogle(newsDetailsPageUrl);

          if (notifyResponse) {
            totalCowlCount = totalCowlCount + 1;
            await NewsCollection.findOneAndUpdate(
              { _id: news._id },
              {
                googleIndexInfo: {
                  indexed: true,
                  date: new Date()
                }
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

// notifyAllNews();