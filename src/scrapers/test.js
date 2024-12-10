const getDocument = require("../../src/shared/utilize/getDocument");
const getnews = async (
  pageUrl = "https://www.prothomalo.com/entertainment/tollywood/hscg3knw9a"
) => {
  try {
    const data = await fetch(pageUrl);
    if (!data.ok) {
      return null;
    }
    const webPage = await data.text();

    const document = getDocument(webPage);

    const h1 = document.querySelector("h1");
    console.log("h1 ==>>", h1.innerHTML);

    let articles = {};

    const titleElements = await document.querySelector(".IiRps");
    if (!titleElements) {
      return;
    }
    const title = await titleElements?.textContent;
    console.log("title ==>>", title)

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

    const imageElements = await document.querySelectorAll("figure");
    // const imageElements = await newsContainer.querySelectorAll("img");
    console.log("imageElements", imageElements)
    console.log("imageElements", imageElements.length)

    console.log('imageElements ==>>', imageElements.length)
    if (!imageElements || !imageElements.length) {
      return articles;
    }
    const images = await Array.from(imageElements).map((img) => {
        console.log("img ========>>>", img.innerHTML)
      return {
        src: img?.src || "",
        alt: img?.alt || "",
      };
    });

    const contentBody = await newsContainer.querySelector(".VzzDZ");
    if (!contentBody) {
      return {};
    }
    const paragraphsElements = await contentBody.querySelectorAll("p");
    console.log("paragraphsElements ==>>", paragraphsElements)
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
        sourceUrl: pageUrl,
      };
    }

    console.log("articles ==>>", articles);
    return articles;
  } catch (error) {
    console.log("error ===>>", error);
  }
};
getnews();
