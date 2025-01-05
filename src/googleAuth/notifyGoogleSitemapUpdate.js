const { google } = require("googleapis");
const googleCrawlerSecrets = require("../shared/constants/googleCrawlerSecrets");

const choseSecret = () => {
  global.currentSecretNumber = global.currentSecretNumber || 0;
  const currentPosition = global.currentSecretNumber;
  global.currentSecretNumber =
    (currentPosition + 1) % googleCrawlerSecrets.length;
  return currentPosition;
};

// Authenticate for Search Console API
const authenticateSearchConsole = async () => {
  try {
// 0, 1, 2, 3, 4, 5, 6, 7, 8,9, 12,
    const secretPosition = choseSecret();
    console.log("Using secretPosition:", secretPosition);
    const auth = new google.auth.GoogleAuth({
      credentials: googleCrawlerSecrets[secretPosition],
      // credentials: googleCrawlerSecrets[10],
      scopes: ["https://www.googleapis.com/auth/webmasters"]
    });


    const authClient = await auth.getClient();
    return google.webmasters({
      version: "v3",
      auth: authClient
    });
  } catch (error) {
    console.error("Error authenticating Search Console API:", error);
    throw error;
  }
};


const notifyGoogleSitemapUpdate = async (sitemapPath) => {
  if (!sitemapPath) {
    return;
  }
  const siteUrl = "https://somacharnews.com"; // Replace with your site URL
  const sitemapUrl = `${siteUrl}/${sitemapPath}`;

  const searchConsole = await authenticateSearchConsole();

  try {
    const response = await searchConsole.sitemaps.submit({
      siteUrl: siteUrl,
      feedpath: sitemapUrl
    });

    console.log("Sitemap submitted successfully:", response.status);
    return true;
  } catch (error) {
    console.error("Error submitting sitemap:", error);
    return false;
  }
};

// notifyGoogleSitemapUpdate("sitemap.xml");

const listSites = async () => {
  const searchConsole = await authenticateSearchConsole();
  const response = await searchConsole.sites.list();
  console.log("Accessible sites:", response.data);
};
//   listSites();


module.exports = notifyGoogleSitemapUpdate
