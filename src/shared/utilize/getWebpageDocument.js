const getDocument = require("./getDocument");

const getWebpageDocument = async (link) => {
  try {
    const data = await fetch(link);
    if (!data.ok) {
      return null;
    }
    const webPage = await data.text();
    const document = getDocument(webPage); 
    return document;
  } catch (error) {
    return null;
  }
};


module.exports = getWebpageDocument;
