const gotoPage = require("../shared/utilities/gotoPage");
const saveToCollectedNews = require("../../shared/utilize/saveToCollectedNews");
const CollectedNewsCollection = require("../../DB/Modals/collectedNews");
const NewsCollection = require("../../DB/Modals/news");
const remoteContentText = ["আরও পড়ুন", "বিজ্ঞাপন"];

const scrapeProthomAlo = async () => {
  const { page, browser } = await gotoPage(
    "https://www.prothomalo.com/collection/latest"
  );
  let pageEvaluate = await page.evaluate(() => {
    let articles = [
      {
        pageUrl: "https://www.prothomalo.com/entertainment/tollywood/hscg3knw9a"
      }
    ];
    const contentContainer = document.querySelectorAll(".xkXol");

    contentContainer.forEach((article) => {
      const pageUrl = article.querySelector("a")?.href;
      if (pageUrl) {
        articles.push({ pageUrl });
      }
    });

    return articles;
  });

  pageEvaluate = await Promise.all(
    pageEvaluate.filter(async (pageInfo) => {
      if (!pageInfo.pageUrl) {
        return false;
      }
      const existInCollectedNews = await CollectedNewsCollection.findOne({
        sourceUrl: pageInfo.pageUrl
      }).select("_id");
      if (existInCollectedNews) {
        return false;
      }
      const existIndNews = await NewsCollection.findOne({
        sourceUrl: pageInfo.pageUrl
      }).select("_id");
      if (existIndNews) {
        return false;
      }

      return true;
    })
  );

  let contentList = await await Promise.all(
    pageEvaluate.map(async (pageInfo) => {
      const { page, browser } = await gotoPage(pageInfo.pageUrl);
      const newsDetailsPageEvaluate = await page.evaluate(async (pageUrl) => {
        let articles = {};

        const titleElements = await document.querySelector(".IiRps");
        if (!titleElements) {
          return;
        }
        const title = await titleElements?.innerText;

        const newsContainer = await document.querySelector(".story-content");
        if (!newsContainer) {
          return {};
        }
        const readMoreElements = newsContainer.querySelectorAll(".also-read");
        const adsElements = newsContainer.querySelectorAll(".adsBox");

        if (readMoreElements && readMoreElements.length) {
          readMoreElements.forEach((element) => {
            element.remove();
          });
        }
        if (adsElements && adsElements.length) {
          adsElements.forEach((element) => {
            element.remove();
          });
        }
        const imageElements = await newsContainer.querySelectorAll("img");
        if (!imageElements || !imageElements.length) {
          return articles;
        }
        const images = await Array.from(imageElements).map((img) => {
          return {
            src: img?.src || "",
            alt: img?.alt || ""
          };
        });

        const contentBody = await newsContainer.querySelector(".VzzDZ");
        if (!contentBody) {
          return {};
        }
        const paragraphsElements = await contentBody.querySelectorAll("p");
        if (!paragraphsElements || !paragraphsElements.length) {
          return;
        }

        let htmlDescription = "";
        await paragraphsElements.forEach((p) => {
          htmlDescription += p.outerHTML;
        });

        let category = "";
        let subCategory = "";
        const domain = "https://www.prothomalo.com/";
        let url = pageUrl;

        url = url.replace(domain, "");
        const pathList = url.split("/");
        category = pathList[0];
        subCategory = pathList[1];
        if (title && images.length && htmlDescription) {
          articles = {
            title,
            htmlDescription,
            images,
            category,
            subCategory,
            sourceUrl: pageUrl
          };
        }
        return articles;
      }, pageInfo.pageUrl);

      return newsDetailsPageEvaluate;
    })
  );

  contentList = await contentList.filter((content, index) => {
    if (!content || !Object.keys(content || {}).length) {
      return false;
    }
    return true;
  });

  await contentList.map(async (content, index) => {
    await saveToCollectedNews(content);
  });
  await global.browser.close();
};

module.exports = scrapeProthomAlo;
