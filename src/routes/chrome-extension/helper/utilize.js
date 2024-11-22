const axios = require("axios");
const fs = require("fs");
const path = require("path");
const CategoriesCollection = require("../../../DB/Modals/categories");

const downloadImage = async (url, filePath) => {
    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'arraybuffer', // Ensure we get the raw binary data
        });

        // Write the binary data to a file
        fs.writeFileSync(filePath, response.data);




    } catch (error) {
        console.error('Error downloading the image:', error);
    }
}

const saveCategory = async (category, categoryLabel, subcategory, subcategoryLabel) => {
    let isExistCategoryAndSubcategory = null
    let isExistCategory = null
    let updateCategoryLabel = null
    let updateSubcategoryLabel = null
    // let updateCategory = null
    // let updateSubcategory = null


    if (categoryLabel) {
        if (subcategoryLabel) {
            isExistCategoryAndSubcategory = await CategoriesCollection.findOne({
                $and: [
                    {
                        $or: [
                            {
                                label: categoryLabel
                            }
                        ]
                    },
                    {
                        $or: [
                            {
                                "subCategories.label": subcategoryLabel
                            }
                        ]
                    },
                ]

            })


        } else {
            isExistCategory = await CategoriesCollection.findOne({
                $or: [
                    {
                        label: categoryLabel
                    }
                ]
            })


        }
    }
    if (isExistCategoryAndSubcategory) {
        updateCategoryLabel = categoryLabel
        updateSubcategoryLabel = subcategoryLabel
    } else if (isExistCategory) {
        if (subcategoryLabel) {
            const subCategoryInfo = {
                label: subcategoryLabel,
                route: subcategory
            }
            await CategoriesCollection.findOneAndUpdate({ _id: isExistCategory._id }, {
                $push: { subCategories: { $each: [subCategoryInfo] } }
            }, { new: true })
        } else {
            updateCategoryLabel = categoryLabel
        }
    } else if (category && categoryLabel) {
        const subCategoryInfo = {
            label: categoryLabel,
            route: category,
        }
        if (subcategory && subcategoryLabel) {
            subCategoryInfo["subCategories"] = [
                {
                    label: subcategoryLabel,
                    route: subcategory
                }
            ]
        }

        await CategoriesCollection.create(subCategoryInfo)
    }
}


// const sanitizeFileName = (fileName = "") => {
//     // Allow alphanumeric, '.', '-', '_', and all Bangla characters
//     return fileName.replace(/[^a-zA-Z0-9. _\-।\u0985-\u09B9\u09C0\u09C1\u09C2\u09C3\u09C4\u09C5\u09C6\u09C7\u09C8\u09C9\u09CA\u09CB\u09CC\u09CD\u09CE\u09D7\u09D8\u09D9\u09DA\u09DB\u09DC\u09DD\u09DE\u09DF\u09E0\u09E1\u09E2\u09E3]/g, '');
// };





module.exports = { downloadImage, saveCategory }