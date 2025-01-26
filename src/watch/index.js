const NewsCollection = require("../DB/Modals/news");
const { updateStorage } = require("./utilities/index");

updateStorage();
const startChangeStream = async () => {
  try {
    const changeStream = NewsCollection.watch();

    console.log("Listening for changes in NewsCollection...");

    changeStream.on("change", (change) => {
      // insert, update, delete

      console.log("change.operationType ==>>", change.operationType);
      // switch (change.operationType) {
      //   case 'insert':
      //     console.log('Document Inserted:', change.fullDocument);
      //     break;
      //   case 'update':
      //     console.log('Document Updated:', change.updateDescription);
      //     break;
      //   case 'delete':
      //     console.log('Document Deleted:', change.documentKey);
      //     break;
      //   default:
      //     console.log('Other Change:', change);
      // }
    });
  } catch (error) {
    if (error.code === 40573) {
      console.error("Error: Change Streams require a MongoDB replica set.");
    } else {
      console.error("Unexpected error:", error.message);
    }
  }
};

startChangeStream();
