const getDocument = require("./getDocument");

const filterHTML = async (htmlContent = `<div></div>`) => {
  const document = getDocument();
  const container = document.createElement("div");
  container.innerHTML = htmlContent;
  try {
    const elementsWithStyle = container.querySelectorAll("*");
    elementsWithStyle?.forEach((element) => {
      const attributes = element.attributes;
      while (attributes.length > 0) {
        const attributeName = element.attributes[0].name;
        element.removeAttribute(attributeName);
      }
    });
    return container.innerHTML;
  } catch (error) {
    console.log("error ==>", error);
  }
};

module.exports = filterHTML;
