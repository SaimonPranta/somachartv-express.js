const { DB_URI } = require("../constants/variables");

const isRemoteDbUri = () => {
    return !DB_URI.includes("localhost")
  };
   
  module.exports = isRemoteDbUri;
  