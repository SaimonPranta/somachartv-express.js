const filterHTML = require("../../shared/utilize/filterHTML");
const getWebpageDocument = require("../../shared/utilize/getWebpageHTML");
const saveToCollectedNews = require("../../shared/utilize/saveToCollectedNews");
const MAIN_DOMAIN = "https://www.ittefaq.com.bd";

const getNewsDetails = async (info) => {
  try {
    const document = await getWebpageDocument(info.link);
    if (!document) {
      return;
    }
   
    const newsContainer = document.querySelector(".content_detail");

    const titleElement = newsContainer.querySelector("h1");
    const title = titleElement.textContent;

    const paragraphContainer = newsContainer.querySelector(".jw_article_body");
    const imgWrappers = newsContainer.querySelectorAll(".jwImgWrap");
    let images = await Array.from(imgWrappers).map((element) => {
      let innerEle = element.querySelector("span");
      innerEle = innerEle.getAttribute("data-ari");
      if (innerEle) {
        const imgObj = JSON.parse(innerEle);
        if (imgObj) {
          const rootPath =
            "https://cdn.ittefaqbd.com/contents/cache/images/1100x618x1/uploads/";
          return {
            src: `${rootPath}${imgObj.path}` || "",
            alt: imgObj.alt || "",
          };
        }
      }
    });

    images = images.filter((item) => item.src);
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
    const categoryContainer = document.querySelector(".breadcrumb ");
    const categoryList = categoryContainer.querySelectorAll("a");
    const categoryElement = categoryList[1];
    const subCategoryElement = categoryList[2];
    if (categoryElement) {
      const categoryPats = categoryElement.href.split("/")
      if (categoryPats.length) {
      category.route = categoryPats[categoryPats.length -1].trim()
        
      }
      let categoryEle = categoryElement.querySelector("strong");
      if (categoryEle) {
        category.label = categoryEle.textContent.trim();
      }
    }
    if (subCategoryElement) {
      const categoryPats = subCategoryElement.href.split("/")
      if (categoryPats.length) {
      category.route = categoryPats[categoryPats.length -1].trim()
        
      }
      let categoryEle = categoryElement.querySelector("strong");
      if (categoryEle) {
        category.label = categoryEle.textContent.trim();
      }
    }
    let htmlDescription = "";
    await paragraphElements.forEach((p) => {
      htmlDescription += p.outerHTML;
    });


    htmlDescription = await htmlDescription.replace(/<span[\s\S]*?<\/span>/g, '');
    htmlDescription = await htmlDescription.replace(/<script[\s\S]*?<\/script>/g, '');
    htmlDescription = await htmlDescription.replace(/\t/g, '');

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
    console.log("error ==>>", error)

    return null;
  }
};

const scrapeIttefaqNews = async () => {
  try {
    const document = await getWebpageDocument(`${MAIN_DOMAIN}/latest-news`);
    if (!document) {
      return;
    }
    let leadNewsContainer = await document.querySelector(".summery_view");
    const leadNewsAElements = await leadNewsContainer.querySelectorAll(".link_overlay");
    let newsLinks = [];
    await Array.from(leadNewsAElements).map((item, index) => {
      const link = `https:${item.href}`;
      if (link ) {
        newsLinks.push({ link });
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

// scrapeIttefaqNews();
module.exports = scrapeIttefaqNews;
