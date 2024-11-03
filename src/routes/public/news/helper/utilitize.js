const getDocument = require("../../../../shared/utilize/getDocument");

const createImgFrame = (imgInfo, newsInfo) => {
  // const getDocument = require("../../../shared/utilize/getDocument");
  const document = getDocument();
  const figureEle = document.createElement("figure");
  const imgEle = document.createElement("img");
  const figcaptionEle = document.createElement("figcaption");

  if (imgInfo.src) {
    imgEle.src = imgInfo.src;
  }
  imgEle.alt = imgInfo.alt || newsInfo.title; 
  figcaptionEle.textContent  = imgInfo.figcaption || newsInfo.title;
  figureEle.className = !imgInfo.figcaption ? "hidden-figcaption" : "";
  figureEle.appendChild(imgEle);
  figureEle.appendChild(figcaptionEle); 
  return figureEle.outerHTML;
};

module.exports = { createImgFrame };





 