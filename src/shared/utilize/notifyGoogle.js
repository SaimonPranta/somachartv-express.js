const { google } = require("googleapis");
const path = require("path");
const NewsCollection = require("../../../src/DB/Modals/news");
const googleCrawlerSecrets = require("../../../src/shared/constants/googleCrawlerSecrets");
 const submitSitemap = require("../../../")
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

 