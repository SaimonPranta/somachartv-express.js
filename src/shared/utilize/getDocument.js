const { JSDOM } = require("jsdom");

const getDocument = (element = "<div></div>") => {
  const dom = new JSDOM(element);
  const document = dom.window.document;
  return document;
};

module.exports = getDocument;
