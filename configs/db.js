const mongoose = require("mongoose");
const language = require('../helpers/language/index');
//TODO set usr pass
const { mongoURI } = require('../configs/secret');

const connectDb = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(await language('server', 'mongo-db-connected'));
  } catch (err) {
    console.error('connect db: ' + err.message);
    process.exit(1);
  }
};

module.exports = connectDb;