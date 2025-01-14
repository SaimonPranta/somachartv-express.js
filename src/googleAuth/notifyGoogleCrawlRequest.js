const { google } = require("googleapis");
const path = require("path");
const NewsCollection = require("../DB/Modals/news");
const googleCrawlerSecrets = require("../shared/constants/googleCrawlerSecrets");
const notifyGoogleSitemapUpdate = require("./notifyGoogleSitemapUpdate");
const isProduction = require("../shared/functions/isProduction");
const isRemoteDbUri = require("../shared/functions/isRemoteDbUri");

const choseSecret = () => {
  global.currentSecretNumber = global.currentSecretNumber || 0;
  const currentPosition = global.currentSecretNumber;
  global.currentSecretNumber =
    (currentPosition + 1) % googleCrawlerSecrets.length;
  return currentPosition;
};

const authenticate = async () => {
  try {
    const secretPosition = choseSecret();
    const auth = new google.auth.GoogleAuth({
      // keyFile: KEY_PATH, // Use the path to the JSON file
      credentials: googleCrawlerSecrets[secretPosition],
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

const notifyGoogleCrawlRequest = async (url, type = "URL_UPDATED") => {
  if (!isProduction()) {
    return;
  }
  if (!isRemoteDbUri()) {
    return;
  }

  await notifyGoogleSitemapUpdate("sitemap.xml");
  await notifyGoogleSitemapUpdate("image-sitemap.xml");

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
// notifyGoogleCrawlRequest("https://somacharnews.com/news/6776afa35ae5c1207a8b880d");

module.exports = notifyGoogleCrawlRequest;
