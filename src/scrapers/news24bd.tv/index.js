const filterHTML = require("../../shared/utilize/filterHTML");
const getWebpageDocument = require("../../shared/utilize/getWebPageDocument");
const saveToCollectedNews = require("../../shared/utilize/saveToCollectedNews");

const getNewsDetails = async (link) => {
  try {
    const document = await getWebpageDocument(
      "https://www.bd-pratidin.com/national/2024/12/12/1060495"
    );
    if (!document) {
      return;
    }

    // const identifierElement = document.querySelector(".content_p");
    // if (!identifierElement) {
    //   return;
    // }
    const newsContainer = document.querySelector(".detailsArea");

   

    const titleElement = document.querySelector(".card-title");
    const title = titleElement.textContent;

    const imageElements = newsContainer.querySelectorAll("img.w-100");
    const paragraphContainer = newsContainer.querySelector("article");
    const paragraphElements = paragraphContainer.querySelectorAll("p");
    // const categoryContainer = document.querySelector("h5");
    // const categoryList = categoryContainer.querySelectorAll("a");
    // const categoryElement = categoryList[1];
    // const subCategoryElement = categoryList[2];

    let category = "";
    let subCategory = "";

    // if (categoryElement) {
    //   if (categoryElement) {
    //     const categoryLinkList = categoryElement.href.split("/");
    //     category = categoryLinkList[categoryLinkList.length - 1];
    //   }
    // }
    // if (subCategoryElement) {
    //   if (subCategoryElement) {
    //     const categoryLinkList = subCategoryElement.href.split("/");
    //     subCategory = subCategoryElement[categoryLinkList.length - 1];
    //   }
    // }

    const images = await Array.from(imageElements).map((img) => {
      return {
        src: img?.src || "",
        alt: img?.alt || ""
      };
    });
    console.log("images ==>>", images);

    let htmlDescription = "";
    await paragraphElements.forEach((p) => {
      htmlDescription += p.outerHTML;
    });
    console.log("htmlDescription ==>>", htmlDescription);
    htmlDescription = await filterHTML(htmlDescription);
    console.log("htmlDescription ==>>", htmlDescription);

    if (!title && !htmlDescription && !images.length) {
      return null;
    }
    const articles = {
      title,
      htmlDescription,
      images,
      category: category,
      subCategory: subCategory,
      sourceUrl: link
    };

    return articles;
  } catch (error) {
    console.log("error =>>", error);
    return null;
  }
};

const scrapeSomoyNews = async () => {
  try {
    const mainDomain = "https://www.bd24live.com/bangla/";

    const document = await getWebpageDocument(mainDomain);
    if (!document) {
      return;
    }
    let newsContainer = await document.querySelector("#pills-home");
    const aElements = await newsContainer.querySelectorAll("a");
    let newsLinks = [];
    await aElements.forEach((item) => {
      const link = item.href;
      if (link) {
        newsLinks.push(link);
      }
    });
    newsLinks = await Promise.all(
      newsLinks.slice(0, 1).map(async (link) => {
        try {
          const geNewsInfo = await getNewsDetails(link);
          return geNewsInfo;
        } catch (error) {
          console.log("errro form newsLinks looping ==>>", getNewsDetails);
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
      // await saveToCollectedNews(content);
    });
  } catch (error) {
    console.log("error", error);
  }
};

scrapeSomoyNews();
module.exports = scrapeSomoyNews;
