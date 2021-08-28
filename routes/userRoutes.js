const express = require("express");

const router = express.Router();

const User = require("../models/user");

router.get("/test2", async (req, res) => {
  const data = req.session.access;
  console.log(data)
  try {

  } catch {
    res.status(500).json({message: err.message});
  }
});

router.get("/test", async (req, res) => {
  req.session.access = "test";
  req.session.save();
  console.log(req.session);
  try {
  } catch {
    res.status(500).json({message: err.message});
  }
});

// Getting all
router.get("/", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  try {
    const users = await User.find();
    res.json(users);
  } catch {
    res.status(500).json({message: err.message});
  }
});

// Getting One
router.get("/:id", getUserById, (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.json(res.user);
});

router.get("/:name", getUserByName, (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.json(res.user);
});

// Creating one
router.post("/", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  let user;
  user = await User.findOne({idNum: req.body.idNum});
  if (user?.idNum === req.body.idNum) {
    res.send({message: "user already exists in db"});
  } else {
    const user = new User({
      idNum: req.body.idNum,
      name: req.body.name,
    });
    try {
      const newUser = await user.save();
      res.status(201).json(newUser);
    } catch (err) {
      res.status(400).json({message: err.message});
    }
  }
});

// Updating One
router.patch("/:id", getUserById, async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  if (req.body.name != null) {
    res.user.name = req.body.name;
  }
  if (req.body.email != null) {
    res.user.email = req.body.email;
  }
  if (req.body.avatar != null) {
    res.user.avatar = req.body.avatar;
  }
  if (req.body.inLibrary != null) {
    if (req.body.add === true) {
      res.user.inLibrary.push(req.body.inLibrary);
    } else {
      console.log(res.user.inLibrary);
      let itemIndex = res.user.inLibrary.indexOf(req.body.inLibrary);
      console.log(itemIndex);
      res.user.inLibrary.splice(itemIndex, 1);
      console.log(res.user.inLibrary);
    }
  }
  if (req.body.topTen != null) {
    if (res.user.topTen.length >= 10) {
      res.user.topTen.pop();
    }
    res.user.topTen.push(req.body.topTen);
  }
  if (req.body.labels != null) {
    res.user.labels.push(req.body.labels);
  }

  try {
    const updatedUser = await res.user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({message: err.message});
  }
});

// Deleting One
router.delete("/:id", getUserById, async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  try {
    await res.user.remove();
    res.json({message: "deleted user"});
  } catch {
    res.send(500).json({message: err.message});
  }
});

async function getUserById(req, res, next) {
  let user;
  try {
    user = await User.findOne({idNum: req.params.id}).exec();
    if (user == null) {
      return res.status(404).json({message: "Cannot find User"});
    }
  } catch {
    return res.status(500).json;
  }
  res.user = user;
  next();
}

async function getUserByName(req, res, next) {
  let user;
  try {
    user = await User.findOne(req.params.name);
    if (user == null) {
      return res.status(404).json({message: "Cannot find User"});
    }
  } catch {
    return res.status(500).json({message: err.message});
  }

  res.user = user;
  next();
}

module.exports = router;
