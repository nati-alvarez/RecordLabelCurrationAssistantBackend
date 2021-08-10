const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  topTen: {
    type: Array,
  }
});
//test
module.exports = mongoose.model("User", userSchema);


// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   idNum: {
//     type: Number,
//   },
//   name: {
//     type: String,
//   },
//   email: {
//     type: String,
//   },
//   avatar: {
//     type: String,
//   },
//   topTen: {
//     type: Array,
//   },
// });
// //test
// module.exports = mongoose.model("User", userSchema);