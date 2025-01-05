const filterHTML = require("../../shared/utilize/filterHTML");
const getWebpageDocument = require("../../shared/utilize/getWebPageDocument");
const saveToCollectedNews = require("../../shared/utilize/saveToCollectedNews");
const MAIN_DOMAIN = "https://www.amarsangbad.com";

const getNewsDetails = async (info) => {
  try {
    info.link =
      "https://www.dailynayadiganta.com/chattagram/19676686/%E0%A6%AA%E0%A7%87%E0%A6%95%E0%A7%81%E0%A7%9F%E0%A6%BE%E0%A7%9F-%E0%A6%A1%E0%A6%BE%E0%A6%AE%E0%A7%8D%E0%A6%AA%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A6%BE%E0%A6%95-%E0%A6%85%E0%A6%9F%E0%A7%8B%E0%A6%B0%E0%A6%BF%E0%A6%95%E0%A6%B6%E0%A6%BE-%E0%A6%B8%E0%A6%82%E0%A6%98%E0%A6%B0%E0%A7%8D%E0%A6%B7%E0%A7%87-%E0%A6%B6%E0%A6%BF%E0%A6%B6%E0%A7%81%E0%A6%B8%E0%A6%B9-%E0%A6%A8%E0%A6%BF%E0%A6%B9%E0%A6%A4-%E0%A7%AB";

    const document = await getWebpageDocument(info.link);
    if (!document) {
      return;
    }

    const imgContainer = document.querySelector(".content-details");
    const newsContainer = document.querySelector(".details-content");

    const titleElement = newsContainer.querySelector("h1");
    const title = titleElement.textContent;
    const paragraphContainer = document.querySelector(".news-content"); //done
    const paragraphElements = paragraphContainer.querySelectorAll("p");

    let category = {
      route: "",
      label: ""
    };
    let subCategory = {
      route: "",
      label: ""
    };
    category.route = info.link.replace(`${MAIN_DOMAIN}/`, "").split("/")[0];
    const categoryContainer = document.querySelector(".details-breadcrumb");

    if (categoryContainer) {
      let categoryEle = categoryContainer.querySelector(".active");
      if (categoryEle) {
        categoryEle = categoryEle.querySelector("a");
        category.label = categoryEle.textContent.trim();
      }
    }

    const imgInfo = info.img;
    const images = [imgInfo];
    let htmlDescription = "";
    await paragraphElements.forEach((p) => {
      htmlDescription += p.outerHTML;
    });

    htmlDescription = await filterHTML(htmlDescription);

    if (!title && !htmlDescription && !images.length) {
      return null;
    }
    const articles = {
      title,
      htmlDescription,
      images,
      category: category,
      subCategory: subCategory,
      sourceUrl: info.link
    };
    return articles;
  } catch (error) {
    return null;
  }
};

const scrapeAmarsangbadNews = async () => {
  try {
    const document = await getWebpageDocument(MAIN_DOMAIN);
    if (!document) {
      return;
    }
    let leadNewsContainer = await document.querySelector("#pills-tabContent");

    const leadNewsAElements = await leadNewsContainer.querySelectorAll("a");
    let newsLinks = [];

    await leadNewsAElements.forEach((item) => {
      const imgEle = item.querySelector("img");
      const img = {
        src: imgEle.src || "",
        alt: imgEle.alt || ""
      };

      const link = item.href;
      if (link && link.includes(MAIN_DOMAIN) && img.src) {
        newsLinks.push({ link, img });
      }
    });

    newsLinks = await Promise.all(
      newsLinks.slice(0, 1).map(async (link) => {
        try {
          const geNewsInfo = await getNewsDetails(link);
          return geNewsInfo;
        } catch (error) {
          return null;
        }
      })
    );
    newsLinks = await newsLinks.filter((content, index) => {
      if (!content || !Object.keys(content || {}).length) {
        return false;
      }
      return true;
    });
    await newsLinks.map(async (content, index) => {
      await saveToCollectedNews(content);
    });
  } catch (error) {}
};

scrapeAmarsangbadNews();
module.exports = scrapeAmarsangbadNews;
