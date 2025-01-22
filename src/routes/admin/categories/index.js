const router = require("express").Router();
const CategoriesCollection = require("../../../DB/Modals/categories");
const CategoriesGroupCollection = require("../../../DB/Modals/categoryGroup");
const CategoriesMapCollection = require("../../../DB/Modals/categoryMap");
const NewsCollection = require("../../../DB/Modals/news");

router.get("/", async (req, res) => {
  try {
    const categoriesList = await CategoriesCollection.find();
    res.json({
      success: true,
      data: categoriesList,
      message: "Categories updated successfully"
    });
  } catch (error) {
    res.json({
      message: "Internal server error"
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = req.body;

    let updateCategories = null;

    if (data.categoriesID) {
      updateCategories = await CategoriesCollection.findOneAndUpdate(
        { _id: data.categoriesID },
        {
          $push: { subCategories: { $each: [data] } }
        },
        { new: true }
      );
    } else {
      const categories = await new CategoriesCollection({ ...data });
      updateCategories = await categories.save();

      if (!updateCategories) {
        return res.json({
          success: false,
          message: "Failed to update categories"
        });
      }
    }

    res.json({
      success: true,
      data: updateCategories,
      message: "Categories updated successfully"
    });
  } catch (error) {
    res.json({
      message: "Internal server error"
    });
  }
});
router.delete("/", async (req, res) => {
  try {
    const { mainID } = req.body;
    await CategoriesCollection.findOneAndDelete({ _id: mainID });
    const users = await CategoriesCollection.find();
    res.json({
      success: false,
      data: users
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Internal server error"
    });
  }
});
router.delete("/subcategories", async (req, res) => {
  try {
    const { mainID, subID } = req.body;
    await CategoriesCollection.findOneAndUpdate(
      { _id: mainID },
      {
        $pull: {
          subCategories: { _id: subID }
        }
      },
      { new: true }
    );
    const users = await CategoriesCollection.find();
    res.json({
      success: false,
      data: users
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Internal server error"
    });
  }
});
router.post("/group", async (req, res) => {
  try {
    const data = req.body;

    let updateCategories = null;

    if (data._id) {
      updateCategories = await CategoriesGroupCollection.findOneAndUpdate(
        { _id: data._id },
        {
          ...data
        },
        { new: true }
      );
    } else {
      const isExist = await CategoriesGroupCollection.findOne({
        groupName: data.groupName
      });
      if (isExist) {
        return res.json({
          message: "This group name are already exist, try another one"
        });
      }
      const categories = await new CategoriesGroupCollection({ ...data });
      updateCategories = await categories.save();
    }
    console.log("updateCategories ===>>", updateCategories);

    res.json({
      success: true,
      data: updateCategories,
      message: "Categories updated successfully"
    });
  } catch (error) {
    res.json({
      message: "Internal server error"
    });
  }
});
router.get("/group", async (req, res) => {
  try {
    const categoriesList = await CategoriesGroupCollection.find();
    res.json({
      success: true,
      data: categoriesList,
      message: "Categories updated successfully"
    });
  } catch (error) {
    res.json({
      message: "Internal server error"
    });
  }
});
router.delete("/group", async (req, res) => {
  try {
    const { id } = req.body;
    await CategoriesGroupCollection.findOneAndDelete({ _id: id });
    const list = await CategoriesGroupCollection.find();
    res.json({
      success: false,
      data: list
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Internal server error"
    });
  }
});
router.get("/group/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id ==>>", id);
    const categoryInfo = await CategoriesGroupCollection.findOne({ _id: id });
    res.json({
      success: true,
      data: categoryInfo,
      message: "Get Category group successfully"
    });
  } catch (error) {
    res.json({
      message: "Internal server error"
    });
  }
});

router.get("/map", async (req, res) => {
  try {
    const categoriesList = await CategoriesMapCollection.find();
    res.json({
      success: true,
      data: categoriesList,
      message: "Category map updated successfully"
    });
  } catch (error) {
    res.json({
      message: "Internal server error"
    });
  }
});
router.post("/map", async (req, res) => {
  try {
    const data = req.body;

    let updateCategories = null;

    if (data._id) {
      updateCategories = await CategoriesMapCollection.findOneAndUpdate(
        { _id: data._id },
        {
          ...data
        },
        { new: true }
      );
    } else {
      const isExist = await CategoriesMapCollection.findOne({
        $or: [
          {
            label: data.label
          },
          {
            route: data.route
          }
        ]
      });
      if (isExist) {
        return res.json({
          message: "This group name are already exist, try another one"
        });
      }
      const categories = await new CategoriesMapCollection({ ...data });
      updateCategories = await categories.save();
    }

    res.json({
      success: true,
      data: updateCategories,
      message: "Categories updated successfully"
    });
  } catch (error) {
    console.log("error ==>>", error);
    res.json({
      message: "Internal server error"
    });
  }
});

router.delete("/map", async (req, res) => {
  try {
    const { id } = req.body;
    await CategoriesMapCollection.findOneAndDelete({ _id: id });
    const list = await CategoriesMapCollection.find();
    res.json({
      success: false,
      data: list
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Internal server error"
    });
  }
});
router.get("/map/sanitize/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};
    const orQuery = [];
    let queryList = [];

    const categoryInfo = await CategoriesMapCollection.findOne({ _id: id });
    if (!categoryInfo || !categoryInfo.label || !categoryInfo.route) {
      return res.json({
        message: "Category group not found"
      });
    }
    queryList.push({
      label: categoryInfo.label,
      route: categoryInfo.route
    });

    if (categoryInfo.categories && categoryInfo.categories.length) {
      queryList = [...queryList, ...categoryInfo.categories];
    }
    if (queryList.length) {
      await queryList.forEach((item) => {
        if (item.label) {
          orQuery.push({
            "category.label": item.label
          });
        }
        if (item.route) {
          orQuery.push({
            "category.route": item.route
          });
        }
      });
    }
    query["$or"] = orQuery;
    const updateNews = await NewsCollection.updateMany(
      { ...query },
      {
        $set: {
          "category.label": categoryInfo.label,
          "category.route": categoryInfo.route,
        },
      }
    );

    res.json({
      success: true,
      data: categoryInfo,
      message: "Get Category group successfully"
    });
  } catch (error) {
    console.log("error ===>>", error);
    res.json({
      message: "Internal server error"
    });
  }
});
router.get("/map/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const categoryInfo = await CategoriesMapCollection.findOne({ _id: id });
    res.json({
      success: true,
      data: categoryInfo,
      message: "Get Category group successfully"
    });
  } catch (error) {
    res.json({
      message: "Internal server error"
    });
  }
});
module.exports = router;
