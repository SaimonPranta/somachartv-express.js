const mongoose = require("mongoose");
const { DB_URI } = require("../shared/constants/variables");
const isRemoteDbUri = require("../shared/functions/isRemoteDbUri");
// const dotenv = require("dotenv");
// dotenv.config();
 
mongoose.set("strictQuery", false);
mongoose.connect(DB_URI).then((success) => {
  console.log(`successfully connected with ${isRemoteDbUri() ? "Remote" : "Local"} database.`);
});
