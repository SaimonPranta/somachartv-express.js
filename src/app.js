const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
require("./DB/connections")
require("./scrapers/index")
require("./schedules/index")
const app = express()
const PORT = 8001 || precess.env.PORT


// App Configuration
app.use(cors())
app.use(express.json())
app.use(fileUpload());
// app.use(express.urlencoded({ extended: false })); 
// app.use(cookieParser()) 

 

// App Routes
app.get("/", (req, res) => {
    res.json({data: "Hey, Server is running."})
})
app.use("/media", require("./routes/media/index"))
app.use("/public", require("./routes/public/index"))
app.use("/admin", require("./routes/admin"))
app.use("/chrome-extension", require("./routes/chrome-extension"))

app.listen(PORT, () => {
    console.log(`Server is running on PORT:${PORT}`)
})
