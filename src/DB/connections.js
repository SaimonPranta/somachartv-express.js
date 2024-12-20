const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const URI = `mongodb+srv://saimonpranta:${process.env.DB_PASSWORD}@somacharcluster.vn9e3.mongodb.net/somachar?retryWrites=true&w=majority`;
// const URI = "mongodb://localhost:27017/somachar"
mongoose.set("strictQuery", false);
mongoose.connect(URI).then((success) => {
  console.log("successfully connected with database.");
});
