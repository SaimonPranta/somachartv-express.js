const CategoriesGroupCollection = require("../../DB/Modals/categoryGroup");

const getNewsOrQueries = async (reqQuery = {}) => {
  const { search, category, subcategory, categoryGroup, fromDate, toDate } =
    reqQuery;
  let query = {};
  const categoryGroupInfo = await CategoriesGroupCollection.findOne({
    groupName: categoryGroup,
  });
  if (search) {
    const queryArray = [
      {
        title: new RegExp(search, "i"),
      },
      {
        description: new RegExp(search, "i"),
      },
      {
        "images.src": new RegExp(search, "i"),
      },
      {
        "images.alt": new RegExp(search, "i"),
      },
      {
        "images.figcaption": new RegExp(search, "i"),
      },
      {
        "category.label": new RegExp(search, "i"),
      },
      {
        "category.route": new RegExp(search, "i"),
      },
      {
        "subcategory.label": new RegExp(search, "i"),
      },
      {
        "subcategory.route": new RegExp(search, "i"),
      },
      {
        "source.title": new RegExp(search, "i"),
      },
      {
        "source.sourceUrl": new RegExp(search, "i"),
      },
    ];
    if (query.$or) {
      query.$or = [...query.$or, ...queryArray];
    } else {
      query["$or"] = [...queryArray];
    }
  }
  if (category && category !== "undefined") {
    query["category.label"] = category;
  }
  if (subcategory && subcategory !== "undefined") {
    query["subcategory.label"] = subcategory;
  }
  if (
    categoryGroupInfo &&
    categoryGroupInfo.categories &&
    categoryGroupInfo.categories.length
  ) {
    const groupQuery = [];
    await categoryGroupInfo.categories.forEach((currentCategory) => {
      groupQuery.push({ "category.label": currentCategory.label });
      groupQuery.push({ "category.route": currentCategory.route });
    });
    if (groupQuery.length && query.$or) {
      query.$or = [...query.$or, ...groupQuery];
    } else if (groupQuery.length) {
      query["$or"] = [...groupQuery];
    }
  }
  if (fromDate && toDate) {
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    const startOfDay = new Date(startDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(endDate.setHours(23, 59, 59, 999));
    query["$and"] = [
      {
        createdAt: { $lte: endOfDay },
      },
      {
        createdAt: { $gte: startOfDay },
      },
    ];
  }

  return query;
};

module.exports = { getNewsOrQueries };
