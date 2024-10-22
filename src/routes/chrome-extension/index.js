const router = require("express").Router()
const CollectedNewsCollection = require("../../DB/Modals/collectedNews")
const NewsCollection = require("../../DB/Modals/news")
const CategoriesCollection = require("../../DB/Modals/categories")
const getRandomNumber = require("../../shared/functions/getRandomNumber")
const { newsStoragePath } = require("../../shared/constants/variables")
const { downloadImage, saveCategory, sanitizeFileName } = require("./helper/utilize")
const getRandomWord = require("../../shared/utilize/getRandomWord")
const fs = require("fs")
const path = require("path")


router.get("/get-collected-news", async (req, res) => {
    try {
        const newsCount = await CollectedNewsCollection.countDocuments({})
        const skip = await getRandomNumber(Number(newsCount - 11), Number(newsCount - 1))
        const news = await CollectedNewsCollection.findOne({}).skip(skip)
        res.json({ data: news })
    } catch (error) {
        res.json({
            message: "Internal server error"
        })
    }
})
router.post("/send-news", async (req, res) => {
    try {
        const body = req.body
        const { _id, title, sourceUrl, category, categoryLabel, subcategory, subcategoryLabel, modifyTitle, modifyHtmlDescription, modifyDescription, images } = body

        if (!_id || !title || !modifyTitle || !modifyHtmlDescription || !modifyDescription) {
            console.log({
                _id, title, modifyTitle, modifyHtmlDescription, modifyDescription
            })
            console.log("hello from here")
            return res.json({
                message: "Something is wrong, please try again letter"
            })
        }

        const isExist = await NewsCollection.findOne({
            $or: [
                {
                    "source.title": title
                },
                {
                    "source.sourceUrl": sourceUrl
                }
            ]
        }).select("_id") 
 
        if (isExist) {
            await CollectedNewsCollection.findOneAndDelete({ _id })
            return res.json({
                message: "Something is wrong, please try again letter"
            })
        }

        const checkImagePathExist = async (imgPath) => {
            const extension = ".jpg"
            const sanitizeImgPath = sanitizeFileName(imgPath)
            let updatePath = `${sanitizeImgPath}${extension}`
            let fullPath = await path.join(newsStoragePath, updatePath)
            if (fs.existsSync(fullPath)) {
                return `${sanitizeImgPath} ${getRandomWord()}${extension}`
            }
            // sanitizeFileName
            return updatePath
        }
        const updateImageList = await Promise.all(images.map(async (imgInfo, index) => {
            const { src } = imgInfo
            let srcInput = index === 0 ? modifyTitle : `${modifyTitle} ${index}`
            const updatePath = await checkImagePathExist(srcInput)

            return {
                ...imgInfo,
                src: updatePath,
                sourceSrc: src
            }
        }))
      await  saveCategory(category, categoryLabel, subcategory, subcategoryLabel)
        const updateInfo = {
            title: modifyTitle,
            description: modifyDescription,
            htmlDescription: modifyHtmlDescription,
            category: categoryLabel || "অন্যান্য",
            // subcategory,
            images: [...updateImageList],
            source: {
                title: title,
                sourceUrl: sourceUrl
            },
        }
        if (subcategoryLabel) {
            updateInfo["subcategory"] = subcategoryLabel
        }
        const data = await NewsCollection.create(updateInfo)
        if (data) {
            await CollectedNewsCollection.findOneAndDelete({ _id })
            await Promise.all(updateImageList.map(async (imgInfo) => {
                try {
                    const { src, sourceSrc } = imgInfo
                    const imgDestinationPath = path.join(newsStoragePath, src)
                    await downloadImage(sourceSrc, imgDestinationPath)
                } catch (error) {
                    console.log("error ==>", error)
                }
            }))
        }

        res.json({ data: [] })
    } catch (error) {
        console.log("error ==>", error)
        res.json({
            message: "Internal server error"
        })
    }
})




module.exports = router