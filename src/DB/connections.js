const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { DB_URI } = require("../shared/constants/variables");
const isRemoteDbUri = require("../shared/functions/isRemoteDbUri");
dotenv.config();
 
mongoose.set("strictQuery", false);
mongoose.connect(DB_URI).then((success) => {
  console.log(`successfully connected with ${isRemoteDbUri() ? "Remote" : "Local"} database.`);
});
