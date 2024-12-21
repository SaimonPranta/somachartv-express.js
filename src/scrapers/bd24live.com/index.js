const filterHTML = require("../../shared/utilize/filterHTML");
const getWebpageDocument = require("../../shared/utilize/getWebpageHTML");
const saveToCollectedNews = require("../../shared/utilize/saveToCollectedNews");


const getNewsDetails = async (link) => {
  try {
    const document = await getWebpageDocument(link);
    if (!document) {
      return;
    }
    const identifierElement = document.querySelector(".content_p");
    if (!identifierElement) {
      return;
    }
    const newsContainer = identifierElement.parentElement;
    const titleElement = document.querySelector("h2");
    const title = titleElement.textContent;
    const imageElements = newsContainer.querySelectorAll("img");
    const paragraphElements = newsContainer.querySelectorAll("p");
    const categoryContainer = document.querySelector("h5");
    const categoryList = categoryContainer.querySelectorAll("a");
    const categoryElement = categoryList[1];
    const subCategoryElement = categoryList[2];

    let category = {
      route: "",
      label: "",
    };
    let subCategory = {
      route: "",
      label: "",
    };
    if (categoryElement) {
      if (categoryElement) {
        const categoryLinkList = categoryElement.href.split("/");
        category.label = categoryElement.textContent.trim()
        category.route = categoryLinkList[categoryLinkList.length - 1].trim();
      }
    }
    if (subCategoryElement) {
      if (subCategoryElement) {
        const categoryLinkList = subCategoryElement.href.split("/");
        subCategory.route = subCategoryElement[categoryLinkList.length - 1].trim();
        subCategory.label = subCategoryElement.textContent.trim()
      }
    }


    const images = await Array.from(imageElements).map((img) => {
      return {
        src: img?.src || "",
        alt: img?.alt || ""
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
      sourceUrl: link
    };

    return articles;
  } catch (error) {
    return null;
  }
};

const scrapeBD24LiveNews = async () => {
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
    newsLinks =  await Promise.all(
      newsLinks.map(async (link) => {
        try {
          const geNewsInfo = await getNewsDetails(link); 
          return geNewsInfo
        } catch (error) {
          console.log("Error form newsLinks looping ==>>", error);
          return null
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
    console.log("error", error);
  }
  
};

// scrapeBD24LiveNews();
module.exports = scrapeBD24LiveNews;
