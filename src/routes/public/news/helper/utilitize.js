const getDocument = require("../../../../shared/utilize/getDocument");

const createImgFrame = (imgInfo, newsInfo) => {
  // const getDocument = require("../../../shared/utilize/getDocument");
  const document = getDocument();
  const figureEle = document.createElement("figure");
  const imgEle = document.createElement("img");
  const figcaptionEle = document.createElement("figcaption");

  if (imgInfo.src) {
    // imgEle.src = `http://localhost:8001/${imgInfo.src}`;
    imgEle.src = `/api/media/${imgInfo.src}`;
    // imgEle.src = imgInfo.src;
  }
  imgEle.width = 800;
  imgEle.height = 600;
  imgEle.alt = imgInfo.alt || newsInfo.title;
  figcaptionEle.innerHTML = `<span aria-hidden="true"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="m350.54 148.68-26.62-42.06C318.31 100.08 310.62 96 302 96h-92c-8.62 0-16.31 4.08-21.92 10.62l-26.62 42.06C155.85 155.23 148.62 160 140 160H80a32 32 0 0 0-32 32v192a32 32 0 0 0 32 32h352a32 32 0 0 0 32-32V192a32 32 0 0 0-32-32h-59c-8.65 0-16.85-4.77-22.46-11.32z"></path><path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M124 158v-22h-24v22m235.76 127.22v-13.31a80 80 0 0 0-131-61.6M176 258.78v13.31a80 80 0 0 0 130.73 61.8"></path><path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="m196 272-20-20-20 20m200 0-20 20-20-20"></path></svg></span>`
  // figcaptionEle.textContent = imgInfo.figcaption || newsInfo.title;
  const textNode = document.createTextNode(imgInfo.figcaption || newsInfo.title);
  figcaptionEle.appendChild(textNode);
  figureEle.className = `img-section ${!imgInfo.figcaption ? "hidden-figcaption" : ""}`;
  figureEle.appendChild(imgEle);
  figureEle.appendChild(figcaptionEle);
  return figureEle.outerHTML;
};

module.exports = { createImgFrame };
