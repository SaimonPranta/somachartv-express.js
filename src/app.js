const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const isProduction = require("./shared/functions/isProduction");

require("./DB/connections");
require("./scrapers/index");
require("./schedules/index");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

// App Configuration
app.use(cors());
app.use(express.json({ limit: '100mb' })); // Increase JSON payload size limit
app.use(express.urlencoded({ extended: true, limit: '100mb' })); // Increase URL-encoded payload size limit
app.use(
  fileUpload({
    limits: { fileSize: 100 * 1024 * 1024 }, // Set file upload size limit to 100MB
  })
);

// App Routes
app.get("/", (req, res) => {
  res.json({ data: "Hey, Server is running." });
});
app.use("/media", require("./routes/media/index"));
app.use("/public", require("./routes/public/index"));
app.use("/admin", require("./routes/admin"));
app.use("/chrome-extension", require("./routes/chrome-extension"));
app.use("/backup", require("./routes/backup/index"));

// Start Server
app.listen(PORT, () => {
  console.log(
    `Server is running in ${
      isProduction() ? "Production" : "Development"
    } mode on PORT: ${PORT}`
  );
});
