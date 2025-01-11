const filterHTML = require("../../shared/utilize/filterHTML");
const getWebpageDocument = require("../../shared/utilize/getWebpageHTML");
const saveToCollectedNews = require("../../shared/utilize/saveToCollectedNews");
const MAIN_DOMAIN = "https://www.amarsangbad.com";

const getNewsDetails = async (info) => {
  try {
    // link = "https://www.amarsangbad.com/politics/news/299768";
    const document = await getWebpageDocument(info.link);
    if (!document) {
      return;
    }
    const imgContainer = document.querySelector(".content-details");
    const newsContainer = document.querySelector(".details-content");

    const titleElement = newsContainer.querySelector("h1");
    const title = titleElement.textContent;
    const paragraphContainer = newsContainer.querySelector(".content-details");
    const paragraphElements = paragraphContainer.querySelectorAll("p");

    let category = {
      route: "",
      label: "",
    };
    let subCategory = {
      route: "",
      label: "",
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
      sourceUrl: info.link,
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
        alt: imgEle.alt || "",
      };

      const link = item.href;
      if (link && link.includes(MAIN_DOMAIN) && img.src) {
        newsLinks.push({ link, img });
      }
    });

    newsLinks = await Promise.all(
      newsLinks.map(async (link) => {
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
  } catch (error) {
    console.log("error -->>", error)

  }
};

// scrapeAmarsangbadNews();
module.exports = scrapeAmarsangbadNews;
