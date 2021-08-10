
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  idNum: {
    type: Number,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  avatar: {
    type: String,
  },
  topTen: {
    type: Array,
  },
});
//test
module.exports = mongoose.model("User", userSchema);