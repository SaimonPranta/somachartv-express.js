const filterHTML = require("../../shared/utilize/filterHTML");
const getWebpageDocument = require("../../shared/utilize/getWebpageHTML");
const saveToCollectedNews = require("../../shared/utilize/saveToCollectedNews");
const MAIN_DOMAIN = "https://www.bd-pratidin.com";

const getNewsDetails = async (link) => {
  try {
    const document = await getWebpageDocument(link);
    if (!document) {
      return;
    }
 
    const newsContainer = document.querySelector(".detailsArea");

    const titleElement = document.querySelector(".card-title");
    const title = titleElement.textContent;

    const imageElements = newsContainer.querySelectorAll("img.w-100");
    const paragraphContainer = newsContainer.querySelector("article");
    const paragraphElements = paragraphContainer.querySelectorAll("p");

    let category = {
      route: "",
      label: "",
    };
    let subCategory = {
      route: "",
      label: "",
    };

    category.route = link.replace(`${MAIN_DOMAIN}/`, "").split("/")[0]
 

   

    const images = await Array.from(imageElements).map((img) => {
      return {
        src: img?.src || "",
        alt: img?.alt || "",
      };
    }); 
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
      sourceUrl: link,
    };
    return articles;
  } catch (error) {
    return null;
  }
};

const scrapeBDPratidinNews = async () => {
  try { 

    const document = await getWebpageDocument(MAIN_DOMAIN);
    if (!document) {
      return;
    }
    let leadNewsContainer = await document.querySelector(".newLeadArea");
    let highlightNewsContainer = await document.querySelector(".highlights");
     
    const leadNewsAElements = await leadNewsContainer.querySelectorAll("a");
    const highlightAElements = await highlightNewsContainer.querySelectorAll("a");
  
    let newsLinks = [];
 
    await leadNewsAElements.forEach((item) => {
      const link = item.href;
      if (link && link.includes(MAIN_DOMAIN)) {
        newsLinks.push(link);
      }
    });
    await highlightAElements.forEach((item) => {
      const link = item.href;
      if (link && link.includes(MAIN_DOMAIN)) {
        newsLinks.push(link);
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

// scrapeBDPratidinNews();
module.exports = scrapeBDPratidinNews;
