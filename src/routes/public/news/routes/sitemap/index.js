const NewsCollection = require("../../../../../DB/Modals/news");

const router = require("express").Router();

router.get("/", async (req, res) => {
  try {
    const news = await NewsCollection.find()
      .sort({ createdAt: -1 })
      .select("_id title category createdAt subcategory images updatedAt");
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    res.json({
      message: "Internal server error"
    });
  }
});
router.get("/google-news", async (req, res) => {
  try {
    const currentTime = new Date();
    const time48HoursBefore = new Date(currentTime);
    time48HoursBefore.setHours(currentTime.getHours() - 50);
    const news = await NewsCollection.find({
        createdAt: {
          $gte: time48HoursBefore,  
          $lte: currentTime        
        }
      })
        .sort({ createdAt: -1 })
        .select("_id title category createdAt subcategory images updatedAt");
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    res.json({
      message: "Internal server error"
    });
  }
});

module.exports = router;
