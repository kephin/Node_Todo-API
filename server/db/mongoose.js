const mongoose = require('mongoose');

// use the built-in Promise library
mongoose.Promise = global.Promise;

// mongoose maintain collections over time, so we don't have to use callback function as MongoClient did
mongoose.connect(process.env.MONGODB_URI);

module.exports = {
  mongoose,
};
