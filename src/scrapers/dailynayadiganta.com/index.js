const filterHTML = require("../../shared/utilize/filterHTML");
const getWebpageDocument = require("../../shared/utilize/getWebpageHTML");
const saveToCollectedNews = require("../../shared/utilize/saveToCollectedNews");
const MAIN_DOMAIN = "https://www.dailynayadiganta.com";

const getNewsDetails = async (info) => {
  try { 
    const document = await getWebpageDocument(info.link);
    if (!document) {
      return;
    }

    const titleElementContainer = document.querySelector(".headline-header");
    const titleElement = titleElementContainer.querySelector("h1");
    const title = titleElement.textContent;
    const imgContainer = document.querySelectorAll(".figure");
    let images = await Array.from(imgContainer).map((imgWrapper) => {
      const img = imgWrapper.querySelector("img");
      if (!img) {
        return;
      }
      return {
        src: img.src || "",
        alt: img.alt || ""
      };
    });
    images = await images.filter((img) => img.src);

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
    const categoryContainer = document.querySelector(".breadcrumb");

    if (categoryContainer) {
      const categoryElements = categoryContainer.querySelectorAll("a");

      if (categoryElements && categoryElements.length) {
        await Array.from(categoryElements).map((anchorElement, index) => {
          const link = anchorElement.href;
          const pathname = new URL(link).pathname;
          if (pathname === "/" || (category.label && subCategory.label)) {
            return;
          }
          const label = anchorElement.textContent;
          if (label) {
            if (!category.label) {
              category.label = label;
            } else {
              subCategory.label = label;
            }
          }
          const route = pathname.split("/")[1];
          if (route) {
            if (!category.label) {
              category.route = route;
            } else {
              subCategory.route = route;
            }
          }
 
        });
      }
    } 
    const imgInfo = info.img;
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
    const staticImgPath = "https://www.dailynayadiganta.com/resources/img/sitesetup/1_1.png"
    const isStaticImage = images.some((imgInfo) => imgInfo.src ===  staticImgPath)

    if (isStaticImage) {
      return null
    }

    return articles;
  } catch (error) {
    return null;
  }
};

const scrapeDailynayadigantaNews = async () => {
  try {
    const pageUrl = `${MAIN_DOMAIN}/archive`
    const document = await getWebpageDocument(`${MAIN_DOMAIN}/archive`);
    if (!document) {
      return;
    }
    let leadNewsContainer = await document.getElementById("list");
    const leadNewsAElements = await leadNewsContainer.querySelectorAll("a");
    let newsLinks = [];
    await leadNewsAElements.forEach((item) => {
      const link = item.href;
      if (link && link.includes(MAIN_DOMAIN)) {
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
  } catch (error) {}
};

module.exports = scrapeDailynayadigantaNews;
